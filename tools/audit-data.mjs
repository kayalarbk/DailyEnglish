// Veri envanteri: `npm run audit`.
//
// Doğrulayıcıdan (validate-data.mjs) farkı: bu araç hiçbir şeyi "hata" saymaz
// ve çıkış kodunu değiştirmez. Amacı karar vermek — hangi katman boş, hangi
// içerik tekrar ediyor, yeni parti nereye yazılmalı.
//
// Yakın tekrar ölçümü uygulamanın kendi `similarity()` fonksiyonunu kullanır;
// ikinci bir mesafe uygulaması yazmak, aynı işi iki farklı sonuçla yapmak olurdu.

import {
  LEVELS,
  NEAR_DUPLICATE_THRESHOLD,
  candidatePairs,
  enTokens as tokens,
  listFieldFiles,
  loadFieldFile,
  loadManifest,
  normalizeEn as normEn,
  normalizeTr as normTr,
} from './data-lib.mjs';
import { similarity } from '../src/js/utils.js';

const args = new Set(process.argv.slice(2));
const SHOW = Number(process.argv.find((a) => a.startsWith('--show='))?.split('=')[1] || 12);
const NEAR_THRESHOLD = NEAR_DUPLICATE_THRESHOLD;

// ------------------------------------------------------------------
// Akademik sinyaller (kaba sınıflandırma)
// ------------------------------------------------------------------

/**
 * AWL (Academic Word List) 1-4. alt listelerinden yoğunlaşmış kökler.
 * Tam liste değil; amacı "bu kart akademik metinde işe yarar mı" sorusuna
 * kaba bir cevap vermek. Eşleşme kök bazlı: "analy" → analyse/analysis/analytical.
 */
const AWL_STEMS = [
  'analy', 'approach', 'area', 'assess', 'assum', 'author', 'avail', 'benefit',
  'concept', 'consist', 'constitu', 'context', 'contract', 'creat', 'data',
  'defin', 'deriv', 'distribut', 'econom', 'environ', 'establish', 'estimat',
  'evident', 'export', 'factor', 'financ', 'formul', 'function', 'identif',
  'income', 'indicat', 'individual', 'interpret', 'involv', 'issue', 'labour',
  'legal', 'legislat', 'major', 'method', 'occur', 'percent', 'period',
  'policy', 'principle', 'proceed', 'process', 'requir', 'research', 'respons',
  'role', 'section', 'sector', 'signific', 'similar', 'source', 'specific',
  'structur', 'theor', 'vari', 'achiev', 'acquir', 'administrat', 'affect',
  'appropriat', 'aspect', 'categor', 'chapter', 'commiss', 'communit',
  'complex', 'comput', 'conclu', 'conduct', 'consequen', 'construct',
  'consum', 'credit', 'cultur', 'design', 'distinct', 'element', 'equat',
  'evaluat', 'featur', 'final', 'focus', 'impact', 'injur', 'institut',
  'invest', 'item', 'journal', 'maintain', 'normal', 'obtain', 'particip',
  'perceiv', 'positiv', 'potential', 'previous', 'primar', 'purchas', 'range',
  'region', 'regulat', 'relevant', 'resid', 'resourc', 'restrict', 'secur',
  'seek', 'select', 'site', 'strateg', 'survey', 'text', 'tradition',
  'transfer', 'alternativ', 'circumstan', 'comment', 'compensat', 'component',
  'consent', 'considerabl', 'constant', 'constrain', 'contribut', 'convers',
  'coordinat', 'core', 'corporat', 'correspond', 'criteria', 'deduc',
  'demonstrat', 'document', 'dominant', 'emphasi', 'ensur', 'exclud',
  'framework', 'fund', 'illustrat', 'immigrat', 'imply', 'initial', 'instanc',
  'interact', 'justif', 'layer', 'link', 'locat', 'maxim', 'minor', 'negat',
  'outcome', 'partner', 'philosoph', 'physical', 'proportion', 'publish',
  'react', 'register', 'reli', 'remov', 'scheme', 'sequenc', 'sex', 'shift',
  'specifi', 'sufficien', 'task', 'techni', 'valid', 'volume',
];

/** Örnek cümlede akademik/teknik bağlam işareti sayılan kelimeler. */
const CONTEXT_MARKERS = [
  'research', 'study', 'studies', 'data', 'result', 'results', 'experiment',
  'hypothesis', 'evidence', 'analysis', 'theory', 'method', 'sample',
  'figure', 'table', 'paper', 'article', 'journal', 'thesis', 'lecture',
  'laboratory', 'lab', 'measure', 'measurement', 'equation', 'variable',
  'patient', 'diagnosis', 'treatment', 'clinical', 'court', 'contract',
  'market', 'economy', 'circuit', 'engine', 'algorithm', 'software',
  'professor', 'university', 'exam', 'academic', 'scientific', 'findings',
];

/** Meslek/akademik olarak kurulmuş mevcut alanlar. */
const TECHNICAL_FIELDS = new Set(['akademik', 'ekonomi', 'hukuk', 'muhendislik', 'tip']);

function hasAwlStem(text) {
  const words = tokens(text);
  return words.some((word) => AWL_STEMS.some((stem) => word.startsWith(stem)));
}

function contextMarkerCount(sentence) {
  const words = new Set(tokens(sentence));
  return CONTEXT_MARKERS.filter((marker) => words.has(marker)).length;
}

/**
 * Kartın akademik/teknik bağlamda kullanılabilirliği.
 * - `technical`  meslek alanında duruyor
 * - `academic`   kalıbın kendisi akademik sözcük dağarcığından
 * - `possible`   kalıp genel ama örnek cümle akademik bağlamda geçiyor
 * - `everyday`   günlük dil
 */
function classify(card, fieldId) {
  if (TECHNICAL_FIELDS.has(fieldId)) return 'technical';
  if (hasAwlStem(card.en)) return 'academic';
  if (contextMarkerCount(card.enS) > 0) return 'possible';
  return 'everyday';
}

// ------------------------------------------------------------------
// Rapor yardımcıları
// ------------------------------------------------------------------

const line = (char = '─') => console.log(char.repeat(74));

function heading(number, title) {
  console.log('');
  line('━');
  console.log(`${number}. ${title}`);
  line('━');
}

function bar(value, total, width = 24) {
  const filled = total ? Math.round((value / total) * width) : 0;
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function listSample(items, render) {
  items.slice(0, SHOW).forEach((item) => console.log(`   ${render(item)}`));
  if (items.length > SHOW) console.log(`   … ve ${items.length - SHOW} tane daha`);
}

// ------------------------------------------------------------------
// Ana akış
// ------------------------------------------------------------------

async function main() {
  const manifest = await loadManifest();
  const files = new Set(await listFieldFiles());

  /** @type {{id,en,enS,tr,trS,level,field,fieldName,category}[]} */
  const cards = [];
  const fieldRows = [];

  for (const meta of manifest) {
    if (!files.has(`${meta.id}.json`)) continue;
    const { field } = await loadFieldFile(`${meta.id}.json`);

    const own = [];
    field.categories.forEach((category) => {
      (category.cards || []).forEach((card) => {
        const entry = {
          ...card,
          field: meta.id,
          fieldName: meta.name,
          category: category.name,
        };
        cards.push(entry);
        own.push(entry);
      });
    });

    fieldRows.push({ meta, field, cards: own });
  }

  // ---- 1. Alan / kategori dağılımı ----
  heading(1, 'Alan ve kategori dağılımı');
  console.log(
    `${'alan'.padEnd(18)} ${'kart'.padStart(5)}  ${LEVELS.map((l) => l.padStart(4)).join(' ')}   kategoriler`
  );
  line();

  fieldRows
    .slice()
    .sort((a, b) => b.cards.length - a.cards.length)
    .forEach(({ meta, field, cards: own }) => {
      const counts = LEVELS.map(
        (level) => own.filter((card) => card.level === level).length
      );
      const cats = field.categories
        .map((category) => `${category.name}:${(category.cards || []).length}`)
        .join(' ');
      console.log(
        `${meta.id.padEnd(18)} ${String(own.length).padStart(5)}  ` +
          `${counts.map((n) => String(n).padStart(4)).join(' ')}   ${cats}`
      );
    });

  line();
  const levelTotals = LEVELS.map((level) => cards.filter((c) => c.level === level).length);
  console.log(`${'TOPLAM'.padEnd(18)} ${String(cards.length).padStart(5)}  ` +
    `${levelTotals.map((n) => String(n).padStart(4)).join(' ')}`);
  console.log('');
  LEVELS.forEach((level, i) => {
    const n = levelTotals[i];
    console.log(`   ${level}  ${bar(n, cards.length)}  ${String(n).padStart(4)}  %${Math.round((n / cards.length) * 100)}`);
  });

  const thin = fieldRows.filter(({ cards: own }) => own.length < 40);
  if (thin.length) {
    console.log('\n   İnce alanlar (<40 kart): ' + thin.map(({ meta, cards: c }) => `${meta.id}(${c.length})`).join(', '));
  }

  // ---- 2. Çapraz alan tam metin tekrarı ----
  heading(2, 'Tam metin tekrarları (normalize: küçük harf, baştaki artikel/"to" atılmış)');
  const byEn = new Map();
  cards.forEach((card) => {
    const key = normEn(card.en);
    if (!key) return;
    if (!byEn.has(key)) byEn.set(key, []);
    byEn.get(key).push(card);
  });

  const dupeGroups = [...byEn.entries()].filter(([, group]) => group.length > 1);
  const crossField = dupeGroups.filter(
    ([, group]) => new Set(group.map((c) => c.field)).size > 1
  );
  const sameField = dupeGroups.filter(
    ([, group]) => new Set(group.map((c) => c.field)).size === 1
  );

  console.log(`   Tekrar eden grup: ${dupeGroups.length}`);
  console.log(`     · çapraz alan : ${crossField.length}`);
  console.log(`     · alan içi    : ${sameField.length}`);
  if (crossField.length) {
    console.log('');
    listSample(crossField, ([key, group]) =>
      `"${key}" → ${group.map((c) => `${c.field}/${c.id}`).join(' · ')}`
    );
  }
  if (sameField.length) {
    console.log('');
    listSample(sameField, ([key, group]) =>
      `[alan içi] "${key}" → ${group.map((c) => c.id).join(' · ')}`
    );
  }

  // ---- 3. Yakın tekrarlar ----
  heading(3, `Yakın tekrarlar (similarity > %${NEAR_THRESHOLD}, uygulamanın kendi ölçümü)`);

  // Aday çiftleri ortak katmandan gelir (data-lib.mjs): en az bir anlamlı
  // sözcüğü paylaşan kartlar. Doğrulayıcı da aynı elemeyi kullanıyor ki iki
  // araç aynı soruya iki farklı cevap vermesin.
  let compared = 0;
  const near = [];
  for (const [left, right] of candidatePairs(cards)) {
    compared += 1;
    const ln = normEn(left.en);
    const rn = normEn(right.en);
    if (ln === rn) continue; // 2. bölümde raporlandı

    const score = similarity(ln, rn);
    if (score > NEAR_THRESHOLD) near.push({ left, right, score });
  }

  near.sort((a, b) => b.score - a.score);
  const nearCross = near.filter((pair) => pair.left.field !== pair.right.field);
  console.log(`   Karşılaştırılan çift: ${compared}`);
  console.log(`   Yakın çift: ${near.length}  (çapraz alan: ${nearCross.length})`);
  if (near.length) {
    console.log('');
    listSample(near, ({ left, right, score }) =>
      `%${score}  "${left.en}" (${left.id}) ↔ "${right.en}" (${right.id})`
    );
  }

  // ---- 4. Aynı Türkçe karşılık ----
  heading(4, 'Aynı Türkçe karşılığı taşıyan farklı kartlar');
  const byTr = new Map();
  cards.forEach((card) => {
    const key = normTr(card.tr);
    if (!key) return;
    if (!byTr.has(key)) byTr.set(key, []);
    byTr.get(key).push(card);
  });

  const trGroups = [...byTr.entries()].filter(([, group]) => group.length > 1);
  console.log(`   Grup: ${trGroups.length}`);
  if (trGroups.length) {
    console.log('');
    listSample(trGroups, ([key, group]) =>
      `"${key}" → ${group.map((c) => `${c.en} (${c.id})`).join(' · ')}`
    );
  }

  // ---- 5. Örnek cümle sorunları ----
  heading(5, 'Örnek cümle sorunları');
  const missing = cards.filter((card) => !String(card.enS || '').trim());
  const echo = cards.filter((card) => {
    const en = normEn(card.en);
    const sentence = normEn(card.enS);
    if (!en || !sentence) return false;
    // Cümle kalıbın kendisinden ibaret ya da yalnız bir-iki sözcük fazlası.
    return sentence === en || (sentence.startsWith(en) && tokens(card.enS).length - tokens(card.en).length <= 1);
  });
  const shortSentence = cards.filter((card) => tokens(card.enS).length <= 3);
  const trMissing = cards.filter((card) => !String(card.trS || '').trim());

  console.log(`   Örnek cümlesi boş        : ${missing.length}`);
  console.log(`   Kalıbı tekrar eden cümle : ${echo.length}`);
  console.log(`   Çok kısa cümle (≤3 kel.) : ${shortSentence.length}`);
  console.log(`   Türkçe cümlesi boş       : ${trMissing.length}`);
  if (echo.length) {
    console.log('');
    listSample(echo, (card) => `${card.id}  "${card.en}" → "${card.enS}"`);
  }

  // ---- 6. Akademik kullanılabilirlik ----
  heading(6, 'Akademik/teknik bağlamda kullanılabilirlik (kaba sınıflandırma)');
  const buckets = { technical: [], academic: [], possible: [], everyday: [] };
  cards.forEach((card) => buckets[classify(card, card.field)].push(card));

  const labels = {
    technical: 'Meslek alanında duruyor',
    academic: 'Kalıbın kendisi akademik sözcük',
    possible: 'Genel kalıp, örnek cümle akademik bağlamda',
    everyday: 'Günlük dil',
  };

  Object.entries(buckets).forEach(([key, group]) => {
    console.log(
      `   ${key.padEnd(10)} ${bar(group.length, cards.length)} ` +
        `${String(group.length).padStart(4)}  %${String(Math.round((group.length / cards.length) * 100)).padStart(2)}  ${labels[key]}`
    );
  });

  const usable = buckets.technical.length + buckets.academic.length;
  console.log('');
  console.log(`   Akademik katmanda doğrudan işe yarayan: ${usable} kart (%${Math.round((usable / cards.length) * 100)})`);
  console.log(`   Kenarda duran (possible)              : ${buckets.possible.length} kart`);

  if (buckets.academic.length) {
    console.log('\n   Akademik sözcük taşıyan genel kartlardan örnekler:');
    listSample(buckets.academic, (card) => `${card.field}/${card.id}  "${card.en}" — ${card.tr}`);
  }

  // Alan bazında akademik yoğunluk: hangi alan etiketlenirken ne kadar iş çıkarır
  console.log('\n   Alan bazında akademik/teknik oran:');
  fieldRows
    .map(({ meta, cards: own }) => {
      const n = own.filter((card) => ['technical', 'academic'].includes(classify(card, card.field))).length;
      return { id: meta.id, n, total: own.length, pct: own.length ? Math.round((n / own.length) * 100) : 0 };
    })
    .sort((a, b) => b.pct - a.pct)
    .forEach((row) => {
      console.log(`     ${row.id.padEnd(18)} ${bar(row.n, row.total, 16)} ${String(row.n).padStart(3)}/${String(row.total).padEnd(4)} %${row.pct}`);
    });

  // ---- Özet ----
  console.log('');
  line('━');
  console.log('ÖZET');
  line('━');
  console.log(`   Kart: ${cards.length} · Alan: ${fieldRows.length} · Kategori: ${fieldRows.reduce((s, f) => s + f.field.categories.length, 0)}`);
  console.log(`   Tam tekrar: ${dupeGroups.length} grup (çapraz ${crossField.length}) · Yakın: ${near.length} çift`);
  console.log(`   Aynı TR: ${trGroups.length} grup · Cümle sorunu: ${echo.length + missing.length}`);
  console.log(`   Akademik katman: ${usable}/${cards.length} (%${Math.round((usable / cards.length) * 100)})`);
  console.log('');

  if (args.has('--help')) {
    console.log('Kullanım: npm run audit -- --show=25   (örnek listelerinin uzunluğu)');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
