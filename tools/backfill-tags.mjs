// Mevcut kartlara geriye dönük etiket atar: `npm run backfill -- --write`
//
// Kart metni ve id'si DEĞİŞMEZ; yalnız `tags` alanı eklenir. Bu yüzden
// `de_srs_v1` ilerlemesi etkilenmez — kayıt anahtarı kart id'sidir.
//
// Kural sırası: alan varsayılanı → kategori kuralı → anahtar sözcük kuralları.
// Sonrakiler öncekilerin üstüne EKLER, silmez.
//
// Tasarım ilkesi — eksik etiket, yanlış etiketten iyidir:
// Bir kural eşleşmezse alan boş bırakılır ve sayısı raporlanır. 800 karta
// zorlama bir `fn:` yazmak, mimarinin dayandığı ekseni zehirlerdi; boş kalan
// kart doğrulayıcıda uyarı üretir ve elle tamamlanacağı bellidir.

import { writeFile } from 'node:fs/promises';
import {
  allCards,
  listFieldFiles,
  loadFieldFile,
  loadManifest,
  loadTags,
} from './data-lib.mjs';

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
/**
 * Elle yazılmış etiketleri de ez.
 *
 * Varsayılan olarak `tags` alanı DOLU olan kart atlanır: yeni içerik partileri
 * etiketlerini elle ve düşünerek taşıyor, kural tabanlı atama onların yerini
 * alamaz. Aracı yeniden çalıştırmak sessizce el emeğini silmemeli.
 */
const FORCE = argv.includes('--force');
const SAMPLE = Number(argv.find((a) => a.startsWith('--sample='))?.split('=')[1] || 0);
const SEED = Number(argv.find((a) => a.startsWith('--seed='))?.split('=')[1] || 42);

// ------------------------------------------------------------------
// Kurallar
// ------------------------------------------------------------------

/**
 * Alan varsayılanları.
 *
 * `dom:` YALNIZ gerçekten bir disiplinin metni olan alanlara verilir. "Teknoloji"
 * kategorisindeki `restart a computer` günlük bilgisayar kullanımıdır,
 * bilgisayar bilimi değil; oraya `dom:cs` yazmak ekseni değersizleştirirdi.
 */
const FIELD_RULES = {
  'gunluk-rutin': { ctx: ['ctx:everyday'] },
  'is-hayati': { ctx: ['ctx:practice'] },
  egitim: { ctx: ['ctx:everyday'] },
  seyahat: { ctx: ['ctx:everyday'] },
  'saglik-spor': { ctx: ['ctx:everyday'] },
  'yemek-alisveris': { ctx: ['ctx:everyday'] },
  iliskiler: { ctx: ['ctx:everyday'] },
  'ev-doga': { ctx: ['ctx:everyday'] },
  'finans-para': { ctx: ['ctx:everyday'] },
  iletisim: { ctx: ['ctx:everyday'] },
  'medya-eglence': { ctx: ['ctx:everyday'] },
  'acil-guvenlik': { ctx: ['ctx:everyday'] },
  // Vatandaşın bürokrasiyle işi: pasaport yenilemek, kira sözleşmesi imzalamak.
  // Meslek icrası değil, gündelik hayatın resmî tarafı.
  'resmi-islemler': { ctx: ['ctx:everyday'] },
  'kisisel-gelisim': { ctx: ['ctx:everyday'] },

  // Disiplin alanları
  akademik: { ctx: ['ctx:paper'] },
  ekonomi: { dom: ['dom:economics'], ctx: ['ctx:practice'] },
  hukuk: { dom: ['dom:law'], ctx: ['ctx:practice'] },
  muhendislik: { dom: ['dom:engineering'], ctx: ['ctx:practice'] },
  tip: { dom: ['dom:medicine'], ctx: ['ctx:practice'] },
};

/** Kategori kuralları: "alanId/Kategori Adı". Alan varsayılanının üstüne ekler. */
const CATEGORY_RULES = {
  // NOT: gunluk-rutin kategorileri (Morning/Afternoon/...) BİLEREK fn: yazmıyor.
  // Kategori adı günün dilimini söylüyor ama kartın kendisi söylemez: "drink water"
  // ya da "floss teeth" bir zaman ifadesi değil, sabah yapılan bir eylem.
  // fn: ekseni akademik söylem işlevidir; kategori adı o işlevin kanıtı olamaz.

  // NOT: "egitim/Zaman ve Sayılar", "saglik-spor/Sağlık" ve "iliskiler/Duygular"
  // için kategori kuralı BİLEREK yok. Örneklemede görüldü ki bu kategoriler
  // karışık: zaman + sayı bir arada, sağlık kartlarının çoğu tanım değil eylem.
  // Kategori kuralı bunların hepsine aynı etiketi yazıyordu; anahtar sözcüklere
  // bırakmak daha az kart etiketliyor ama yanlış etiketlemiyor.
  'iletisim/Fikir ve Tartışma': { fn: ['fn:argue'] },

  'akademik/Makale ve Araştırma': { fn: ['fn:method'], ctx: ['ctx:paper'] },
  'akademik/Sunum ve Tartışma': { fn: ['fn:argue'], ctx: ['ctx:presentation'] },

  'ekonomi/Piyasa ve Finans': { fn: ['fn:change'] },
  'ekonomi/Şirket ve Yönetim': { fn: ['fn:method'] },
  'hukuk/Dava ve Mahkeme': { fn: ['fn:argue'] },
  'hukuk/Sözleşme ve Haklar': { fn: ['fn:define'] },
  'muhendislik/Teknik Terimler': { fn: ['fn:define'] },
  'muhendislik/Proje ve Üretim': { fn: ['fn:method'] },
  'tip/Klinik Dil': { fn: ['fn:method'] },
  'tip/Tanı ve Tedavi': { fn: ['fn:method'] },

  'is-hayati/Teknoloji': { fn: ['fn:method'] },
};

/**
 * Anahtar sözcük kuralları — YALNIZ `en` ve `tr` üzerinde çalışır.
 *
 * Örnek cümle (`enS`) bilerek dışarıda: örneklemede "leave a voicemail"
 * kartı, cümledeki "after the beep" yüzünden fn:time almıştı. Örnek cümle
 * kalıbın işlevini değil, o kalıbın bir kullanımını gösteriyor; tesadüfi
 * bir zaman zarfı kalıbı zaman kalıbı yapmaz.
 *
 * Çok anlamlı sözcükler listeden çıkarıldı: "call" (telefon etmek / adlandırmak),
 * TR "beklemek" (fiziksel bekleme / beklenti). Yakaladıklarından çok
 * yanlış etiketliyorlardı.
 */
/**
 * Türkçe sözcük başı sınırı.
 *
 * JS'de `\b` yalnız ASCII sözcük karakterlerini tanır; `ş ğ ı ö ü ç` sözcük
 * karakteri SAYILMAZ. Bu iki yönlü bozuyordu:
 *   1. "şartları" içindeki "art", ş'den sonra sahte sınır bulup /\bart/
 *      kuralına takılıyor ve "meet the requirements" kartına fn:change yazıyordu.
 *   2. "ölçmek" gibi Türkçe harfle BAŞLAYAN sözcükler /\bölç/ kuralına hiç
 *      uymuyordu — o kurallar hiç çalışmamıştı.
 * Çözüm: geriye bakışlı olumsuz sınır, Türkçe harfleri de sözcük karakteri sayar.
 */
const trRule = (pattern, tags) => ({
  re: new RegExp(`(?<![a-z0-9çğıöşü])(?:${pattern})`, 'i'),
  add: tags,
  onTr: true,
});

const KEYWORD_RULES = [
  // fn:change
  { re: /\b(increase|decrease|rise|fall|grow|drop|reduce|expand|shrink|improve|worsen|gain|lose|change|shift)\b/, add: ['fn:change'] },
  trRule('art[ıimt]|azal|yüksel|düş|büyü|küçül|değiş|geliş', ['fn:change']),

  // fn:cause
  { re: /\b(cause|lead to|result in|because|due to|affect|effect|impact|trigger|prevent)\b/, add: ['fn:cause'] },
  trRule('neden ol|yol aç|etkile|sebep', ['fn:cause']),

  // fn:compare
  { re: /\b(compare|than|similar|different|same as|unlike|instead of|rather than|prefer)\b/, add: ['fn:compare'] },
  // "yerine" çıkarıldı: "yerine oturtmak" konumsaldır, karşılaştırma değil.
  trRule('karşılaştır|kıyasla|benze|fark[ıl]|tercih et', ['fn:compare']),

  // fn:measure
  { re: /\b(measure|weigh|degree|temperature|size|length|width|height|speed|amount of|percent|meter|kilo|gram|litre|liter)\b/, add: ['fn:measure'] },
  trRule('ölç|tart[ım]|derece|sıcaklık|boyut|uzunluk|hız|ağırlık', ['fn:measure']),

  // fn:hypothesis
  { re: /\b(assume|expect|predict|guess|hope|plan to|intend|suppose)\b/, add: ['fn:hypothesis'] },
  trRule('varsay|tahmin|umut ed|planla|niyet', ['fn:hypothesis']),

  // fn:method
  { re: /\b(carry out|conduct|perform|prepare|set up|install|apply|follow|check|test|repair|build)\b/, add: ['fn:method'] },
  trRule('yürüt|gerçekleştir|hazırla|kur[muas]|uygula|takip et|kontrol et|test et|onar|inşa', ['fn:method']),

  // fn:argue
  { re: /\b(agree|disagree|argue|claim|discuss|opinion|suggest|refuse|accept|admit|deny|convince|persuade)\b/, add: ['fn:argue'] },
    // "katıl" çıkarıldı: katılmak hem "attend" hem "agree" demek.
  trRule('itiraz|tartış|iddia|fikir|öner|redd|kabul et|ikna', ['fn:argue']),

  // fn:hedge
  { re: /\b(seem|appear|tend to|likely|probably|maybe|perhaps|might|could be)\b/, add: ['fn:hedge'] },
  trRule('gibi görün|muhtemel|belki|olabilir', ['fn:hedge']),

  // fn:define
  { re: /\b(mean|refer to|define|describe|explain|stand for|be known as)\b/, add: ['fn:define'] },
  trRule('anlamına gel|tanımla|açıkla|betimle|denir', ['fn:define']),

  // fn:time
  { re: /\b(before|after|during|until|start|begin|finish|schedule|deadline|postpone|delay|on time|in advance)\b/, add: ['fn:time'] },
  trRule('önce|sonra|sırasında|başla|bitir|zamanında|program|ertele|süre', ['fn:time']),

  // fn:quantity
  { re: /\b(many|much|few|little|several|enough|amount|number of|quantity|total|average|half|double)\b/, add: ['fn:quantity'] },
  // "toplam" çıkarıldı: "toplamak" (bir araya getirmek) ile karışıyordu.
  trRule('çok|az[al]?ı|birkaç|yeterli|miktar|sayı|ortalama|yarım|iki kat', ['fn:quantity']),
];

/** İngilizce öbek fiil edatları — `type:phrasal` tespiti için. */
const PARTICLES = new Set([
  'up', 'out', 'off', 'down', 'in', 'on', 'over', 'away', 'back', 'through',
  'along', 'around', 'apart', 'aside', 'forward',
]);

/**
 * `dom:` anahtar sözcükleri — YALNIZ disiplin alanlarında uygulanır.
 * Günlük alanlarda "take medicine" kartına dom:medicine yazmak, o etiketi
 * tıp öğrencisi için işe yaramaz hâle getirirdi.
 */
const DOM_KEYWORDS = [
  { re: /\b(patient|doctor|hospital|symptom|diagnos|treat|prescri|nurse|surgery|clinic|therapy|vaccine|dose)\b/, add: ['dom:medicine'] },
  { re: /\b(cell|gene|organism|species|bacteria|virus|tissue|blood)\b/, add: ['dom:biology'] },
  { re: /\b(court|lawyer|contract|sue|legal|judge|trial|clause|verdict|appeal|liab)\b/, add: ['dom:law'] },
  { re: /\b(market|invest|profit|revenue|inflation|stock|supply|demand|tax|loan|asset|merger)\b/, add: ['dom:economics'] },
  { re: /\b(circuit|voltage|current|machine|engine|weld|assembl|blueprint|manufactur|tolerance|bearing)\b/, add: ['dom:engineering'] },
  { re: /\b(software|algorithm|database|server|network|source code|debug)\b/, add: ['dom:cs'] },
  { re: /\b(force|energy|wave|velocity|friction|thermal)\b/, add: ['dom:physics'] },
  { re: /\b(equation|calculat|ratio|coefficient|variable|derivative)\b/, add: ['dom:math'] },
];

const DISCIPLINE_FIELDS = new Set(['akademik', 'ekonomi', 'hukuk', 'muhendislik', 'tip']);

// ------------------------------------------------------------------
// Atama
// ------------------------------------------------------------------

function detectPhrasal(en) {
  const words = String(en).toLowerCase().split(/\s+/);
  if (words.length < 2) return false;
  // "wake up", "back up data", "carry out an experiment"
  return words.slice(1, 3).some((word) => PARTICLES.has(word.replace(/[^a-z]/g, '')));
}

/** @returns {string[]} kartın etiketleri (sıralı, tekrarsız) */
function tagsFor(card, fieldId, categoryName) {
  const out = new Set();
  const push = (rule) => {
    if (!rule) return;
    ['dom', 'fn', 'ctx', 'type'].forEach((axis) => (rule[axis] || []).forEach((tag) => out.add(tag)));
  };

  const fieldRule = FIELD_RULES[fieldId];
  const categoryRule = CATEGORY_RULES[`${fieldId}/${categoryName}`];

  push(fieldRule);
  // Kategori kendi ortamını söylüyorsa alan varsayılanı DÜŞER, üstüne eklenmez:
  // "Sunum ve Tartışma" kategorisindeki kart hem ctx:paper hem ctx:presentation
  // taşımamalı — kart sunumda geçiyor, makalede değil.
  if (categoryRule?.ctx?.length) {
    (fieldRule?.ctx || []).forEach((tag) => out.delete(tag));
  }
  push(categoryRule);

  const en = String(card.en || '').toLowerCase();
  const enS = String(card.enS || '').toLowerCase();
  const tr = String(card.tr || '').toLocaleLowerCase('tr');

  KEYWORD_RULES.forEach((rule) => {
    const haystack = rule.onTr ? tr : en;
    if (rule.re.test(haystack)) rule.add.forEach((tag) => out.add(tag));
  });

  if (DISCIPLINE_FIELDS.has(fieldId)) {
    DOM_KEYWORDS.forEach((rule) => {
      if (rule.re.test(`${en} ${enS}`)) rule.add.forEach((tag) => out.add(tag));
    });
  }

  if (detectPhrasal(card.en)) out.add('type:phrasal');

  // Eksen sırası sabit tutulsun: okurken ve diff alırken gürültü olmasın.
  const order = { dom: 0, fn: 1, ctx: 2, type: 3 };
  return [...out].sort((a, b) => {
    const axisDiff = order[a.split(':')[0]] - order[b.split(':')[0]];
    return axisDiff !== 0 ? axisDiff : a.localeCompare(b);
  });
}

// ------------------------------------------------------------------
// Örnekleme (tekrarlanabilir olsun diye sabit tohumlu)
// ------------------------------------------------------------------

function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function sample(items, count, seed) {
  const random = makeRandom(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// ------------------------------------------------------------------
// Ana akış
// ------------------------------------------------------------------

async function main() {
  const dictionary = await loadTags();
  const manifest = await loadManifest();
  const files = new Set(await listFieldFiles());

  const tagged = [];
  const stats = {
    total: 0,
    withDom: 0,
    withFn: 0,
    withCtx: 0,
    withType: 0,
    noFn: 0,
    noCtx: 0,
    empty: 0,
  };
  const tagUse = new Map();
  const perField = [];
  /** Elle yazıldığı için dokunulmayan kart sayısı. */
  let kept = 0;

  for (const meta of manifest) {
    if (!files.has(`${meta.id}.json`)) continue;
    const { file, field } = await loadFieldFile(`${meta.id}.json`);

    let fieldNoFn = 0;
    field.categories.forEach((category) => {
      (category.cards || []).forEach((card) => {
        const handWritten = Array.isArray(card.tags) && card.tags.length > 0;
        if (handWritten && !FORCE) {
          kept += 1;
          tagged.push({ card, field: field.id, category: category.name });
          stats.total += 1;
          const has = (axis) => card.tags.some((tag) => tag.startsWith(`${axis}:`));
          if (has('dom')) stats.withDom += 1;
          if (has('fn')) stats.withFn += 1;
          else {
            stats.noFn += 1;
            fieldNoFn += 1;
          }
          if (has('ctx')) stats.withCtx += 1;
          else stats.noCtx += 1;
          if (has('type')) stats.withType += 1;
          card.tags.forEach((tag) => tagUse.set(tag, (tagUse.get(tag) || 0) + 1));
          return;
        }

        const tags = tagsFor(card, field.id, category.name);
        card.tags = tags;

        stats.total += 1;
        const has = (axis) => tags.some((tag) => tag.startsWith(`${axis}:`));
        if (has('dom')) stats.withDom += 1;
        if (has('fn')) stats.withFn += 1;
        else {
          stats.noFn += 1;
          fieldNoFn += 1;
        }
        if (has('ctx')) stats.withCtx += 1;
        else stats.noCtx += 1;
        if (has('type')) stats.withType += 1;
        if (tags.length === 0) stats.empty += 1;

        tags.forEach((tag) => tagUse.set(tag, (tagUse.get(tag) || 0) + 1));
        tagged.push({ card, field: field.id, category: category.name });
      });
    });

    perField.push({ id: field.id, total: allCards(field).length, noFn: fieldNoFn });

    if (WRITE) {
      await writeFile(file, `${JSON.stringify(field, null, 2)}\n`, 'utf8');
    }
  }

  // Sözlükte olmayan etiket üretmiş olabilir miyiz?
  const unknown = [...tagUse.keys()].filter((tag) => !dictionary.ids.has(tag));
  if (unknown.length) {
    console.error(`✖  Kurallar tanımsız etiket üretti: ${unknown.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log(WRITE ? '✔ Etiketler dosyalara yazıldı.\n' : '(kuru çalışma — yazmak için --write)\n');
  console.log(`Kart              : ${stats.total}`);
  console.log(`  dom: taşıyan    : ${stats.withDom}`);
  console.log(`  fn:  taşıyan    : ${stats.withFn}   (eksik: ${stats.noFn})`);
  console.log(`  ctx: taşıyan    : ${stats.withCtx}   (eksik: ${stats.noCtx})`);
  console.log(`  type: taşıyan   : ${stats.withType}`);
  console.log(`  hiç etiketi yok : ${stats.empty}`);

  console.log('\nEtiket kullanımı:');
  [...tagUse.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => {
      const meta = dictionary.tags.find((item) => item.id === tag);
      console.log(`  ${tag.padEnd(22)} ${String(count).padStart(5)}  ${meta?.tr || ''}`);
    });

  const gaps = perField.filter((row) => row.noFn > 0).sort((a, b) => b.noFn - a.noFn);
  if (gaps.length) {
    console.log('\nfn: ekseni eksik kalan kartlar (alan bazında):');
    gaps.forEach((row) =>
      console.log(`  ${row.id.padEnd(18)} ${String(row.noFn).padStart(4)} / ${row.total}`)
    );
  }

  if (SAMPLE > 0) {
    console.log(`\n${'═'.repeat(78)}`);
    console.log(`ÖRNEKLEM (${SAMPLE} kart, tohum=${SEED} — aynı tohumla aynı örneklem gelir)`);
    console.log('═'.repeat(78));
    sample(tagged, SAMPLE, SEED).forEach((entry, index) => {
      const { card } = entry;
      console.log(
        `\n${String(index + 1).padStart(2)}. ${card.id}  [${card.level}]  ${entry.field}/${entry.category}`
      );
      console.log(`    "${card.en}" — ${card.tr}`);
      console.log(`    ${card.enS}`);
      console.log(`    → ${card.tags.length ? card.tags.join('  ') : '(etiket yok)'}`);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
