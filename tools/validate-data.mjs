// Veri doğrulama: yeni bir kelime partisi eklendiğinde `npm run validate` ile çalıştır.
// Hata (✖) bulursa çıkış kodu 1 olur; uyarılar (⚠) yalnızca bilgilendirir.
//
// Kontroller:
//   - manifest ile alan dosyaları birebir örtüşüyor mu (eksik/fazla dosya)
//   - manifest alanları eksiksiz, `file` yolu doğru, renk/ikon dolu mu
//   - alan id'leri benzersiz ve hiçbiri diğerinin öneki değil
//     (ilerleme takibi kart id'sinin alan önekine dayanıyor)
//   - kart şeması tam, metinler boş değil
//   - kart id'si {alanId}-{3 haneli sıra} biçiminde, 1'den başlayıp kesintisiz
//   - kart id'leri hem alan içinde hem tüm projede benzersiz
//   - level değeri A1/A2/B1/B2
//   - manifest'teki wordCount'lar gerçek kart sayılarıyla uyumlu
//   - etiketler tags.json'da tanımlı mı (tanımsız etiket hatadır)
//   - etiketli kartlarda en az bir fn: ve bir ctx: var mı (uyarı)
//   - projede tam metin tekrarı (hata) ve yakın tekrar (uyarı)
//   - kategori başına asgari kart sayısı (uyarı)

import {
  CARD_FIELDS,
  CARD_REQUIRED,
  LEVELS,
  MIN_CATEGORY_CARDS,
  NEAR_DUPLICATE_THRESHOLD,
  allCards,
  candidatePairs,
  isIntentionalPolysemy,
  levelCounts,
  listFieldFiles,
  loadFieldFile,
  loadManifest,
  loadPresets,
  loadTags,
  normalizeEn,
  tagsOfAxis,
} from './data-lib.mjs';
import { similarity } from '../src/js/utils.js';

const errors = [];
const warnings = [];

/** Etiket sözlüğü; main() içinde doldurulur. */
let tagDictionary = { ids: new Set(), axes: [] };

/** Etiketi hiç olmayan kartlar tek tek değil, toplu bildirilir. */
let untaggedCount = 0;

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const isFilledString = (value) => typeof value === 'string' && value.trim() !== '';

/** "someone / something / oneself" gibi yer tutucular cümlede geçmez, göz ardı edilir. */
const PLACEHOLDERS = new Set([
  'someone',
  'somebody',
  'something',
  'somewhere',
  'oneself',
  "one's",
  'sb',
  'sth',
]);

const words = (text) =>
  text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z']/g, ''))
    .filter(Boolean);

/**
 * Örnek cümle, kalıbın en az bir içerik kelimesini (çekim farklarına toleranslı)
 * barındırıyor mu? Quiz'in boşluk sorusu bu eşleşmeye dayanıyor.
 */
function sentenceCoversPhrase(phrase, sentence) {
  const stem = (word) => word.slice(0, 4);
  const targets = words(phrase).filter((word) => !PLACEHOLDERS.has(word));
  if (targets.length === 0) return true;

  const tokens = words(sentence);
  return targets.some((target) =>
    tokens.some((token) => token.startsWith(stem(target)) || target.startsWith(stem(token)))
  );
}

function checkManifestEntry(meta, expectedFile) {
  const where = `manifest/${meta.id ?? '(id yok)'}`;

  ['id', 'name', 'icon', 'color', 'description', 'file'].forEach((key) => {
    if (!isFilledString(meta[key])) fail(`${where}: "${key}" boş veya eksik.`);
  });

  if (meta.file !== expectedFile) {
    fail(`${where}: "file" alanı "${expectedFile}" olmalı, "${meta.file}" yazıyor.`);
  }
  if (!Array.isArray(meta.categories) || meta.categories.length === 0) {
    fail(`${where}: kategori listesi boş.`);
  }
}

/**
 * Alan id'lerinden biri diğerinin öneki olamaz: ilerleme, kart id'sinin
 * "{alanId}-" önekiyle sayıldığı için "ev" ve "ev-doga" birbirine karışırdı.
 */
function checkIdPrefixes(ids) {
  ids.forEach((a) => {
    ids.forEach((b) => {
      if (a !== b && b.startsWith(`${a}-`)) {
        fail(`Alan id çakışması: "${a}" id'si "${b}" id'sinin öneki (ilerleme sayımı bozulur).`);
      }
    });
  });
}

/**
 * Kartın etiketleri: sözlükte tanımlı mı, eksenleri eksik mi?
 * Etiketi hiç olmayan kart hata değildir — geriye dönük etiketleme
 * (backfill-tags.mjs) tamamlanana kadar mevcut veri etiketsiz kalabilir.
 */
function checkTags(card, where) {
  if (!('tags' in card)) {
    untaggedCount += 1;
    return;
  }

  if (!Array.isArray(card.tags)) {
    fail(`${where}: "tags" bir dizi olmalı.`);
    return;
  }
  if (card.tags.length === 0) {
    untaggedCount += 1;
    return;
  }

  const unknown = card.tags.filter((tag) => !tagDictionary.ids.has(tag));
  unknown.forEach((tag) =>
    fail(`${where}: "${tag}" etiketi src/data/tags.json içinde tanımlı değil.`)
  );

  const duplicates = card.tags.filter((tag, i) => card.tags.indexOf(tag) !== i);
  [...new Set(duplicates)].forEach((tag) => warn(`${where}: "${tag}" etiketi iki kez yazılmış.`));

  // Zorunlu eksenler: kart hangi işlevi görüyor ve nerede karşımıza çıkıyor?
  //
  // `muaf` listesi olan eksende, kartın etiketleri o listeyle SINIRLIYSA kural
  // aranmaz: yalnız günlük hayatta geçen bir kalıptan akademik söylem işlevi
  // beklemek anlamsız (bkz. tags.json/fn açıklaması).
  tagDictionary.axes
    .filter((axis) => axis.zorunlu)
    .forEach((axis) => {
      if (tagsOfAxis(card, axis.id).length > 0) return;

      const exempt = axis.muaf || [];
      if (exempt.length > 0) {
        const ctxTags = tagsOfAxis(card, 'ctx');
        if (ctxTags.length > 0 && ctxTags.every((tag) => exempt.includes(tag))) return;
      }

      warn(`${where}: "${axis.id}:" ekseninden etiket yok (${axis.tr}).`);
    });
}

function checkCards(field, seenIds) {
  const fieldId = field.id;
  const numbers = [];

  field.categories.forEach((category) => {
    if (!isFilledString(category.name)) fail(`${fieldId}: adı olmayan kategori var.`);
    if (!isFilledString(category.color)) {
      warn(`${fieldId}/${category.name}: kategori rengi yok, alan rengi kullanılacak.`);
    }
    if (!Array.isArray(category.cards) || category.cards.length === 0) {
      fail(`${fieldId}/${category.name}: kart listesi boş.`);
      return;
    }
    if (category.cards.length < MIN_CATEGORY_CARDS) {
      warn(
        `${fieldId}/${category.name}: ${category.cards.length} kart — ` +
          `kategori başına en az ${MIN_CATEGORY_CARDS} kart beklenir ` +
          '(quiz dört şık üretmekte ve deste kurmakta zorlanır).'
      );
    }

    category.cards.forEach((card, index) => {
      const where = `${fieldId}/${category.name}[${index}]`;

      CARD_REQUIRED.forEach((key) => {
        if (!isFilledString(card[key])) fail(`${where}: "${key}" boş veya eksik.`);
      });
      Object.keys(card).forEach((key) => {
        if (!CARD_FIELDS.includes(key)) warn(`${where}: bilinmeyen alan "${key}".`);
      });

      checkTags(card, where);

      if (card.level && !LEVELS.includes(card.level)) {
        fail(`${where}: geçersiz level "${card.level}" (${LEVELS.join('/')} olmalı).`);
      }

      if (typeof card.id === 'string') {
        const match = card.id.match(new RegExp(`^${fieldId}-(\\d{3})$`));
        if (!match) {
          fail(`${where}: id "${card.id}" — {alanId}-{3 haneli sıra} biçiminde olmalı.`);
        } else {
          numbers.push(Number(match[1]));
        }
        if (seenIds.has(card.id)) {
          fail(`${where}: id "${card.id}" zaten ${seenIds.get(card.id)} içinde kullanılmış.`);
        } else {
          seenIds.set(card.id, where);
        }
      }

      if (isFilledString(card.en)) {
        // Tekrar denetimi alan içinden proje geneline taşındı (checkDuplicates):
        // artık uyarı değil hata ve alanlar arasını da kapsıyor.
        if (isFilledString(card.enS) && !sentenceCoversPhrase(card.en, card.enS)) {
          warn(
            `${where}: örnek cümle "${card.en}" ile ilişkili görünmüyor ` +
              '(quiz boşluk sorusu anlamsız olur).'
          );
        }
      }
    });
  });

  // Sıra numaraları 1..n olmalı: boşluk veya tekrar, sonraki partilerde
  // yeni kart eklerken hangi numaradan devam edileceğini belirsizleştirir.
  const sorted = [...numbers].sort((a, b) => a - b);
  const expected = sorted.length > 0 && sorted[0] === 1 && sorted.every((n, i) => n === i + 1);
  if (numbers.length > 0 && !expected) {
    fail(`${fieldId}: kart numaraları 1..${numbers.length} aralığında kesintisiz değil.`);
  }
}

function checkCounts(meta, field) {
  const cards = allCards(field);
  if (meta.wordCount !== cards.length) {
    fail(
      `${meta.id}: manifest wordCount ${meta.wordCount}, dosyadaki kart sayısı ${cards.length}. ` +
        '`npm run sync` ile düzeltebilirsin.'
    );
  }

  const byName = new Map(field.categories.map((c) => [c.name, (c.cards || []).length]));
  (meta.categories || []).forEach((category) => {
    if (!byName.has(category.name)) {
      fail(`${meta.id}: manifest'teki "${category.name}" kategorisi dosyada yok.`);
      return;
    }
    if (byName.get(category.name) !== category.wordCount) {
      fail(
        `${meta.id}/${category.name}: manifest wordCount ${category.wordCount}, ` +
          `dosyada ${byName.get(category.name)} kart var.`
      );
    }
  });
  byName.forEach((_, name) => {
    if (!(meta.categories || []).some((category) => category.name === name)) {
      fail(`${meta.id}: dosyadaki "${name}" kategorisi manifest'te yok.`);
    }
  });
}

/**
 * Proje genelinde tekrar denetimi.
 *
 * Tam metin tekrarı hatadır: iki karta ayrı ilerleme kaydı açılır, quiz
 * seçeneklerinde ikisi birden çıkar ve kullanıcı aynı şeyi iki kez öğrenmeye
 * çalışır. Yakın tekrar uyarıdır — bazen gerçekten iki ayrı kalıptır
 * ("trim the hedge" / "trim the hedges" değil ama "look after" / "look at" öyle).
 *
 * @param {{card: object, where: string}[]} entries
 */
function checkDuplicates(entries) {
  const byText = new Map();

  entries.forEach((entry) => {
    const key = normalizeEn(entry.card.en);
    if (!key) return;
    if (!byText.has(key)) byText.set(key, []);
    byText.get(key).push(entry);
  });

  byText.forEach((group, key) => {
    if (group.length < 2) return;

    // Kasıtlı anlam kayması: aynı sözcük, farklı alanda farklı anlam.
    const allPolysemy = group.every((entry, i) =>
      group.every((other, j) => i === j || isIntentionalPolysemy(entry.card, other.card))
    );
    if (allPolysemy) return;

    fail(
      `Tekrar eden kalıp "${key}": ` +
        group.map((entry) => `${entry.card.id} (${entry.where})`).join(' · ')
    );
  });

  const cards = entries.map((entry) => entry.card);
  for (const [a, b] of candidatePairs(cards)) {
    const left = normalizeEn(a.en);
    const right = normalizeEn(b.en);
    if (left === right) continue; // yukarıda hata olarak raporlandı
    if (isIntentionalPolysemy(a, b)) continue;
    if (similarity(left, right) > NEAR_DUPLICATE_THRESHOLD) {
      warn(`Yakın tekrar: "${a.en}" (${a.id}) ↔ "${b.en}" (${b.id}).`);
    }
  }
}

/**
 * Bölüm demetleri (presets.json) tutarlı mı?
 *
 * Onboarding'in tamamı bu dosyadan besleniyor: bir etiket yanlış yazılırsa
 * kullanıcı bölümünü seçer, sorgu hiçbir kartla eşleşmez ve deste boş gelir —
 * hata çalışma anında ve sessizce ortaya çıkar. Burada yakalamak ucuz.
 */
function checkPresets({ groups, presets }, fieldIds) {
  const groupIds = new Set(groups.map((group) => group.id));
  const seen = new Set();

  groups.forEach((group) => {
    if (!isFilledString(group.id) || !isFilledString(group.tr) || !isFilledString(group.icon)) {
      fail(`presets/grup "${group.id ?? '(id yok)'}": id, tr ve icon dolu olmalı.`);
    }
  });

  presets.forEach((preset) => {
    const where = `presets/${preset.id ?? '(id yok)'}`;

    if (!isFilledString(preset.id) || !isFilledString(preset.tr)) {
      fail(`${where}: id ve tr dolu olmalı.`);
      return;
    }
    if (seen.has(preset.id)) fail(`${where}: bölüm id'si tekrar ediyor.`);
    seen.add(preset.id);

    if (!groupIds.has(preset.grup)) fail(`${where}: bilinmeyen grup "${preset.grup}".`);

    const tags = preset.tags || [];
    tags
      .filter((tag) => !tagDictionary.ids.has(tag))
      .forEach((tag) => fail(`${where}: "${tag}" etiketi tags.json'da yok.`));

    if (!tags.some((tag) => tag.startsWith('fn:'))) warn(`${where}: hiç fn: etiketi yok.`);
    if (!tags.some((tag) => tag.startsWith('ctx:'))) warn(`${where}: hiç ctx: etiketi yok.`);

    (preset.fields || []).forEach((id) => {
      if (!fieldIds.includes(id)) fail(`${where}: "${id}" diye bir alan yok.`);
    });
    if ((preset.fields || []).length === 0) {
      warn(`${where}: önerilen alan yok — kullanıcı boş anasayfayla karşılaşır.`);
    }
  });

  // Hiçbir bölümün seçmediği etiket, kullanıcıya asla ulaşmaz.
  const used = new Set(presets.flatMap((preset) => preset.tags || []));
  tagDictionary.tags
    .filter((tag) => tag.eksen !== 'type' && !used.has(tag.id))
    .forEach((tag) => warn(`tags.json: "${tag.id}" hiçbir bölüm demetinde geçmiyor.`));
}

/**
 * Kart, geçerli bir etiket sorgusuyla eşleşiyor mu?
 * `store/tags.js`'teki `matchesTagQuery` ile aynı kural: eksen içinde VEYA,
 * eksenler arası VE, kartın etiketi olmayan eksen kısıt getirmez.
 */
function cardMatchesQuery(card, selected) {
  const cardTags = card.tags || [];
  const axes = new Set(selected.map((tag) => tag.split(':')[0]));
  return [...axes].every((axis) => {
    const onAxis = cardTags.filter((tag) => tag.startsWith(`${axis}:`));
    if (onAxis.length === 0) return true;
    return selected.filter((tag) => tag.startsWith(`${axis}:`)).some((tag) => onAxis.includes(tag));
  });
}

/**
 * Hiçbir bölüm demetiyle eşleşmeyen AKADEMİK kart var mı?
 *
 * Böyle bir kart uygulamada hiçbir bölüm sorgusuna düşmez ama hata da vermez:
 * yazılır, doğrulamayı geçer ve sessizce ölü kalır. `fn:time` + yalnız
 * `ctx:lab` taşıyan iki kart tam da böyle kaybolmuştu.
 *
 * Yalnız günlük hayat kartları (`ctx:everyday`) kapsam dışı: onlar bölüm
 * sorgusunun hedefi değil, genel havuzdur. Bölüm seçmiş kullanıcıya günlük
 * kart gelmemesi kusur değil, süzgecin işini yapmasıdır — kontrolü onlara da
 * uygulamak 68 satırlık gürültü üretip gerçek boşlukları gömüyordu.
 *
 * @param {{card: object, where: string}[]} entries
 * @param {object[]} presets
 */
function checkTagReach(entries, presets) {
  const queries = presets.map((preset) => preset.tags || []).filter((tags) => tags.length > 0);
  if (queries.length === 0) return;

  const isEverydayOnly = (card) => {
    const ctx = (card.tags || []).filter((tag) => tag.startsWith('ctx:'));
    return ctx.length > 0 && ctx.every((tag) => tag === 'ctx:everyday');
  };

  const unreachable = entries.filter(
    (entry) =>
      (entry.card.tags || []).length > 0 &&
      !isEverydayOnly(entry.card) &&
      !queries.some((tags) => cardMatchesQuery(entry.card, tags))
  );

  unreachable.forEach((entry) =>
    warn(
      `${entry.card.id}: etiketleri (${(entry.card.tags || []).join(' ')}) hiçbir bölüm ` +
        'demetiyle eşleşmiyor — bu kart hiçbir kullanıcıya görünmez.'
    )
  );
}

async function main() {
  tagDictionary = await loadTags();
  const presetData = await loadPresets();
  const manifest = await loadManifest();
  const files = await listFieldFiles();

  checkPresets(presetData, manifest.map((meta) => meta.id));

  const manifestIds = manifest.map((meta) => meta.id);
  const fileIds = files.map((name) => name.replace(/\.json$/, ''));

  manifestIds
    .filter((id) => !fileIds.includes(id))
    .forEach((id) => fail(`manifest'te "${id}" var ama src/data/fields/${id}.json yok.`));
  fileIds
    .filter((id) => !manifestIds.includes(id))
    .forEach((id) => fail(`src/data/fields/${id}.json var ama manifest'te kayıtlı değil.`));

  new Set(manifestIds).size === manifestIds.length || fail("manifest'te tekrarlanan alan id'si var.");
  checkIdPrefixes(manifestIds);

  const seenIds = new Map();
  const totals = { cards: 0, levels: Object.fromEntries(LEVELS.map((l) => [l, 0])) };
  /** @type {{card: object, where: string}[]} tekrar denetimi için tüm kartlar */
  const everyCard = [];

  for (const meta of manifest) {
    if (!fileIds.includes(meta.id)) continue;

    const { field } = await loadFieldFile(`${meta.id}.json`);
    checkManifestEntry(meta, `src/data/fields/${meta.id}.json`);

    if (field.id !== meta.id) {
      fail(`${meta.id}.json: dosya içindeki id "${field.id}", dosya adıyla uyuşmuyor.`);
    }
    if (!Array.isArray(field.categories) || field.categories.length === 0) {
      fail(`${meta.id}.json: kategori listesi boş.`);
      continue;
    }

    checkCards(field, seenIds);
    checkCounts(meta, field);

    const cards = allCards(field);
    totals.cards += cards.length;
    cards.forEach((card) => everyCard.push({ card, where: meta.id }));
    const counts = levelCounts(cards);
    LEVELS.forEach((level) => {
      totals.levels[level] += counts[level];
    });
  }

  checkDuplicates(everyCard);
  checkTagReach(everyCard, presetData.presets);

  const levelLine = LEVELS.map((level) => `${level}: ${totals.levels[level]}`).join(' · ');
  console.log(`Alan: ${manifest.length} · Kart: ${totals.cards}`);
  console.log(`Seviye dağılımı: ${levelLine}`);

  const tagged = totals.cards - untaggedCount;
  console.log(`Etiketli kart: ${tagged}/${totals.cards} · Sözlük: ${tagDictionary.ids.size} etiket`);
  if (untaggedCount > 0) {
    warn(`${untaggedCount} kartta etiket yok (backfill-tags.mjs ile atanacak).`);
  }

  warnings.forEach((message) => console.warn(`⚠  ${message}`));
  errors.forEach((message) => console.error(`✖  ${message}`));

  if (errors.length > 0) {
    console.error(`\n${errors.length} hata bulundu.`);
    process.exitCode = 1;
    return;
  }
  console.log(warnings.length > 0 ? `\nHata yok (${warnings.length} uyarı).` : '\nHer şey yolunda.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
