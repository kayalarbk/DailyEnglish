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
//
// Kalıplar (src/data/phrases/):
//   - manifest ↔ dosya örtüşmesi ve sayaç tutarlılığı
//   - id biçimi (ph_{kategori}_{3 hane}), benzersizlik, kesintisiz numara
//   - `register` değeri config.js'teki REGISTERS ile uyumlu mu
//   - zorunlu alanlar dolu mu, örnek cümle kalıbı içeriyor mu (uyarı)
//   - kalıplar arası tam tekrar (hata) ve yakın tekrar (uyarı)
//   - kelime korpusuyla örtüşme (bilgi — bkz. checkPhraseCardOverlap)
//
// Diyaloglar (src/data/dialogues/):
//   - manifest ↔ dosya örtüşmesi ve sayaç tutarlılığı
//   - `keyPhrases` içindeki her ph_* id'si kalıp verisinde GERÇEKTEN var mı (hata)
//   - her replikte `alternatives` var mı (hata)
//   - replik rolleri sahnenin `roles` listesiyle tutarlı mı, iki rol de
//     konuşuyor mu (hata)

import {
  CARD_FIELDS,
  CARD_REQUIRED,
  DIALOGUE_FIELDS,
  DIALOGUE_REQUIRED,
  DIALOGUE_ROLE_COUNT,
  LEVELS,
  LINE_FIELDS,
  LINE_REQUIRED,
  MIN_CATEGORY_CARDS,
  NEAR_DUPLICATE_THRESHOLD,
  PHRASE_FIELDS,
  PHRASE_REQUIRED,
  allCards,
  candidatePairs,
  isIntentionalPolysemy,
  levelCounts,
  listDialogueFiles,
  listFieldFiles,
  listPhraseFiles,
  loadDialogueFile,
  loadDialogueManifest,
  loadFieldFile,
  loadManifest,
  loadPhraseFile,
  loadPhraseManifest,
  loadPresets,
  loadTags,
  normalizeEn,
  tagsOfAxis,
} from './data-lib.mjs';
import { REGISTERS } from '../src/js/config.js';
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

// ==================================================================
// Kalıplar ve diyaloglar
//
// Bu iki modül 2026-07-29'da yazıldı ama doğrulayıcıya hiç bağlanmadı: her
// kontrol elle yapılıyordu. Buradaki hataların ortak özelliği SESSİZ olmaları —
// kırık bir `keyPhrases` referansı sahne özetinden kalıbı düşürür, `register`
// yazım hatası rozeti kaybeder, eksik `alternatives` konuşma modunda skoru
// sistematik olarak düşürür. Hiçbiri konsola bir şey yazmaz.
// ==================================================================

/**
 * Manifest kayıtları ile klasördeki dosyaların örtüşmesi.
 * @param {{id: string, file: string}[]} manifest
 * @param {string[]} files klasördeki dosya adları
 * @param {string} dir "src/data/phrases" gibi
 */
function checkManifestFiles(manifest, files, dir) {
  const manifestIds = manifest.map((entry) => entry.id);
  const fileIds = files.map((name) => name.replace(/\.json$/, ''));

  manifestIds
    .filter((id) => !fileIds.includes(id))
    .forEach((id) => fail(`${dir}: manifest'te "${id}" var ama ${dir}/${id}.json yok.`));
  fileIds
    .filter((id) => !manifestIds.includes(id))
    .forEach((id) => fail(`${dir}/${id}.json var ama manifest'te kayıtlı değil.`));

  if (new Set(manifestIds).size !== manifestIds.length) {
    fail(`${dir}: manifest'te tekrarlanan kategori id'si var.`);
  }

  manifest.forEach((entry) => {
    const where = `${dir}/manifest/${entry.id ?? '(id yok)'}`;
    ['id', 'name', 'icon', 'color', 'file'].forEach((key) => {
      if (!isFilledString(entry[key])) fail(`${where}: "${key}" boş veya eksik.`);
    });
    const expected = `${dir}/${entry.id}.json`;
    if (entry.file !== expected) {
      fail(`${where}: "file" alanı "${expected}" olmalı, "${entry.file}" yazıyor.`);
    }
  });

  return fileIds;
}

/**
 * Kalıp verisi.
 * @returns {Promise<{ phrases: {phrase: object, where: string}[], ids: Set<string> }>}
 */
async function checkPhrases() {
  const manifest = await loadPhraseManifest();
  const files = await listPhraseFiles();
  const dir = 'src/data/phrases';
  const fileIds = checkManifestFiles(manifest, files, dir);

  /** @type {{phrase: object, where: string}[]} */
  const collected = [];
  const seenIds = new Map();
  const registers = Object.keys(REGISTERS);

  for (const meta of manifest) {
    if (!fileIds.includes(meta.id)) continue;

    const { category } = await loadPhraseFile(`${meta.id}.json`);
    if (category.id !== meta.id) {
      fail(`${dir}/${meta.id}.json: dosya içindeki id "${category.id}", dosya adıyla uyuşmuyor.`);
    }
    if (!Array.isArray(category.phrases) || category.phrases.length === 0) {
      fail(`${dir}/${meta.id}.json: kalıp listesi boş.`);
      continue;
    }

    // Manifest sayacı elle tutuluyor (kalıplar `npm run sync` kapsamında değil),
    // bu yüzden tutarsızlık sessizce kalıcı olabilir: kategori ızgarasında
    // "25 kalıp" yazar, listede 24 çıkar.
    if (category.phrases.length !== meta.count) {
      fail(
        `${dir}/${meta.id}: manifest count ${meta.count}, dosyada ` +
          `${category.phrases.length} kalıp var.`
      );
    }

    const numbers = [];
    category.phrases.forEach((phrase, index) => {
      const where = `${meta.id}[${index}]`;

      PHRASE_REQUIRED.forEach((key) => {
        if (!isFilledString(phrase[key])) fail(`${where}: "${key}" boş veya eksik.`);
      });
      Object.keys(phrase).forEach((key) => {
        if (!PHRASE_FIELDS.includes(key)) warn(`${where}: bilinmeyen alan "${key}".`);
      });

      if (typeof phrase.id === 'string') {
        // Biçim: ph_{kısaltma}_{3 hane}. Kısaltma kategori id'sinin aynısı
        // olmak zorunda değil (`directions` → `ph_dir_001`), ama numara üç
        // haneli ve kesintisiz olmalı — yeni parti nereden devam edeceğini
        // ancak böyle bilir.
        const match = phrase.id.match(/^ph_[a-z]+_(\d{3})$/);
        if (!match) {
          fail(`${where}: id "${phrase.id}" — ph_{kategori}_{3 haneli sıra} biçiminde olmalı.`);
        } else {
          numbers.push(Number(match[1]));
        }
        if (seenIds.has(phrase.id)) {
          fail(`${where}: id "${phrase.id}" zaten ${seenIds.get(phrase.id)} içinde kullanılmış.`);
        } else {
          seenIds.set(phrase.id, where);
        }
      }

      // `category` alanı dosyayla tutarsızsa kalıp, ait olmadığı listede görünür.
      if (phrase.category !== meta.id) {
        fail(`${where}: "category" alanı "${meta.id}" olmalı, "${phrase.category}" yazıyor.`);
      }

      // Kullanım düzeyi rozetin kendisidir: tanınmayan bir değer sessizce
      // rozetsiz bir kalıp üretir ve "nerede kullanılamaz" bilgisi kaybolur.
      if (phrase.register && !registers.includes(phrase.register)) {
        fail(
          `${where}: geçersiz register "${phrase.register}" ` +
            `(${registers.join('/')} olmalı).`
        );
      }

      if (isFilledString(phrase.en) && isFilledString(phrase.example)) {
        if (!sentenceCoversPhrase(phrase.en, phrase.example)) {
          warn(`${where}: örnek "${phrase.en}" ile ilişkili görünmüyor.`);
        }
      }

      collected.push({ phrase, where: meta.id });
    });

    const sorted = [...numbers].sort((a, b) => a - b);
    const ok = sorted.length > 0 && sorted[0] === 1 && sorted.every((n, i) => n === i + 1);
    if (numbers.length > 0 && !ok) {
      fail(`${dir}/${meta.id}: kalıp numaraları 1..${numbers.length} aralığında kesintisiz değil.`);
    }
  }

  checkPhraseDuplicates(collected);
  return { phrases: collected, ids: new Set(seenIds.keys()) };
}

/**
 * Kalıplar arası tekrar. Kelime korpusuyla kıyas ayrı bir işlev
 * (`checkPhraseCardOverlap`) — orada ölçüt farklı.
 * @param {{phrase: object, where: string}[]} entries
 */
function checkPhraseDuplicates(entries) {
  const byText = new Map();
  entries.forEach((entry) => {
    const key = normalizeEn(entry.phrase.en);
    if (!key) return;
    if (!byText.has(key)) byText.set(key, []);
    byText.get(key).push(entry.phrase.id);
  });

  byText.forEach((ids, key) => {
    if (ids.length < 2) return;
    // Aynı cümle iki kez: aramada iki kez çıkar, favorilerde ve "öğrendim"
    // sayacında iki kez sayılır. Kullanım düzeyleri farklı olsa bile aynı
    // cümledir — düzey farkı tek kartın `usage` alanında anlatılır.
    fail(`Tekrar eden kalıp "${key}": ${ids.join(' · ')}`);
  });

  const phrases = entries.map((entry) => ({ ...entry.phrase }));
  for (const [a, b] of candidatePairs(phrases)) {
    const left = normalizeEn(a.en);
    const right = normalizeEn(b.en);
    if (left === right) continue;
    if (similarity(left, right) > NEAR_DUPLICATE_THRESHOLD) {
      warn(`Yakın tekrar (kalıp): "${a.en}" (${a.id}) ↔ "${b.en}" (${b.id}).`);
    }
  }
}

/**
 * Kalıp ↔ kelime kartı örtüşmesi — BİLGİ, hata ya da uyarı değil.
 *
 * Gerekçe: iki modül bilerek ayrı tutuluyor (bkz. Teknik Kararlar, "Kalıpta
 * 'öğrendim' SRS'e yazılmaz"). Kart ölçülen bir üretim birimi, kalıp ise
 * kullanım düzeyi ve tuzak notu taşıyan bir başvuru kaydı. `Calm down.`
 * ikisinde de olduğunda kullanıcı aynı şeyi iki kez öğrenmiyor: kartta
 * hatırlaması ölçülüyor, kalıpta "sinirli birine söylenince ters teper"
 * uyarısını okuyor. Birini silmek diğerinin sağlamadığı bir değeri yok eder.
 *
 * Yine de sayı görünür olmalı: örtüşme büyürse iki modül birbirinin kopyasına
 * dönüşüyor demektir ve o zaman karar yeniden verilmeli.
 *
 * @param {{phrase: object}[]} phrases
 * @param {{card: object}[]} cards
 */
function checkPhraseCardOverlap(phrases, cards) {
  const cardsByText = new Map();
  cards.forEach((entry) => {
    const key = normalizeEn(entry.card.en);
    if (key && !cardsByText.has(key)) cardsByText.set(key, entry.card.id);
  });

  const overlap = phrases
    .map((entry) => ({ id: entry.phrase.id, key: normalizeEn(entry.phrase.en) }))
    .filter((entry) => cardsByText.has(entry.key))
    .map((entry) => `${entry.id} ↔ ${cardsByText.get(entry.key)} ("${entry.key}")`);

  return overlap;
}

/**
 * Diyalog verisi. `phraseIds`: kalıp korpusunda gerçekten var olan id'ler.
 * @param {Set<string>} phraseIds
 */
async function checkDialogues(phraseIds) {
  const manifest = await loadDialogueManifest();
  const files = await listDialogueFiles();
  const dir = 'src/data/dialogues';
  const fileIds = checkManifestFiles(manifest, files, dir);

  const seenIds = new Map();
  let dialogueCount = 0;
  let lineCount = 0;

  for (const meta of manifest) {
    if (!fileIds.includes(meta.id)) continue;

    const { category } = await loadDialogueFile(`${meta.id}.json`);
    if (category.id !== meta.id) {
      fail(`${dir}/${meta.id}.json: dosya içindeki id "${category.id}", dosya adıyla uyuşmuyor.`);
    }
    if (!Array.isArray(category.dialogues) || category.dialogues.length === 0) {
      fail(`${dir}/${meta.id}.json: sahne listesi boş.`);
      continue;
    }
    if (category.dialogues.length !== meta.count) {
      fail(
        `${dir}/${meta.id}: manifest count ${meta.count}, dosyada ` +
          `${category.dialogues.length} sahne var.`
      );
    }

    category.dialogues.forEach((dialogue, index) => {
      const where = `${meta.id}[${index}]${dialogue.id ? ` ${dialogue.id}` : ''}`;
      dialogueCount += 1;

      DIALOGUE_REQUIRED.forEach((key) => {
        if (!isFilledString(dialogue[key])) fail(`${where}: "${key}" boş veya eksik.`);
      });
      Object.keys(dialogue).forEach((key) => {
        if (!DIALOGUE_FIELDS.includes(key)) warn(`${where}: bilinmeyen alan "${key}".`);
      });

      if (typeof dialogue.id === 'string') {
        if (!/^dlg_[a-z]+_\d{2}$/.test(dialogue.id)) {
          fail(`${where}: id "${dialogue.id}" — dlg_{kategori}_{2 haneli sıra} biçiminde olmalı.`);
        }
        if (seenIds.has(dialogue.id)) {
          fail(`${where}: id "${dialogue.id}" zaten ${seenIds.get(dialogue.id)} içinde.`);
        } else {
          seenIds.set(dialogue.id, where);
        }
      }

      if (dialogue.category !== meta.id) {
        fail(`${where}: "category" alanı "${meta.id}" olmalı, "${dialogue.category}" yazıyor.`);
      }
      if (dialogue.level && !LEVELS.includes(dialogue.level)) {
        fail(`${where}: geçersiz level "${dialogue.level}" (${LEVELS.join('/')} olmalı).`);
      }

      lineCount += checkDialogueLines(dialogue, where);
      checkKeyPhrases(dialogue, where, phraseIds);
    });
  }

  return { dialogueCount, lineCount };
}

/**
 * Sahnenin rolleri ve replikleri.
 * @returns {number} replik sayısı
 */
function checkDialogueLines(dialogue, where) {
  const roles = Array.isArray(dialogue.roles) ? dialogue.roles.filter(isFilledString) : [];

  // Kullanıcı iki rolden birini seçiyor; sahne motoru bunun üzerine kurulu.
  if (roles.length !== DIALOGUE_ROLE_COUNT) {
    fail(`${where}: sahnede ${DIALOGUE_ROLE_COUNT} rol olmalı, ${roles.length} var.`);
  }
  if (new Set(roles).size !== roles.length) {
    fail(`${where}: aynı rol adı iki kez yazılmış (${roles.join(' · ')}).`);
  }

  if (!Array.isArray(dialogue.lines) || dialogue.lines.length === 0) {
    fail(`${where}: replik listesi boş.`);
    return 0;
  }

  dialogue.lines.forEach((line, index) => {
    const at = `${where}/replik[${index}]`;

    LINE_REQUIRED.forEach((key) => {
      if (!isFilledString(line[key])) fail(`${at}: "${key}" boş veya eksik.`);
    });
    Object.keys(line).forEach((key) => {
      if (!LINE_FIELDS.includes(key)) warn(`${at}: bilinmeyen alan "${key}".`);
    });

    // Rol adı sahnenin listesinde yoksa o replik hiçbir tarafa düşmez:
    // kullanıcı rolünü seçtiğinde replik ne karşı tarafa okunur ne de ona
    // sorulur — sessizce yok olur.
    if (isFilledString(line.role) && roles.length > 0 && !roles.includes(line.role)) {
      fail(`${at}: "${line.role}" rolü sahnenin rolleri arasında yok (${roles.join(' · ')}).`);
    }

    // `alternatives` HER replikte olmalı: kullanıcı iki rolden hangisini
    // seçerse seçsin konuşma modu ölçülebilir kalmalı. Tek tarafa konsaydı
    // diğer rol seçildiğinde skor sistematik olarak düşük çıkardı
    // (bkz. Teknik Kararlar, "Her replikte alternatives").
    if (!Array.isArray(line.alternatives) || line.alternatives.length === 0) {
      fail(`${at}: "alternatives" eksik — o rol seçilirse konuşma skoru düşük çıkar.`);
    } else if (line.alternatives.some((option) => !isFilledString(option))) {
      fail(`${at}: "alternatives" içinde boş seçenek var.`);
    }
  });

  // Hiç konuşmayan bir rol, seçildiğinde kullanıcıya tek replik vermez.
  roles
    .filter((role) => !dialogue.lines.some((line) => line.role === role))
    .forEach((role) => fail(`${where}: "${role}" rolü hiç konuşmuyor.`));

  return dialogue.lines.length;
}

/**
 * `keyPhrases` referansları.
 *
 * Kırık referans HATADIR: sahne özeti "bu sahnenin kalıpları" başlığı altında
 * o kalıbı hiç göstermez ve bunu kimseye söylemez. İki modülü birbirine bağlayan
 * tek bağ bu; koptuğunda sahne, öğrettiği kalıbı geri veremez.
 */
function checkKeyPhrases(dialogue, where, phraseIds) {
  const ids = dialogue.keyPhrases;
  if (!Array.isArray(ids) || ids.length === 0) {
    warn(`${where}: "keyPhrases" boş — sahne özeti kalıp gösteremez.`);
    return;
  }

  ids.forEach((id) => {
    if (!phraseIds.has(id)) {
      fail(`${where}: "keyPhrases" içindeki "${id}" kalıp verisinde yok (kırık referans).`);
    }
  });

  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  [...new Set(duplicates)].forEach((id) => warn(`${where}: "${id}" keyPhrases'te iki kez.`));
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

  // Kalıp ve diyalog: kelime verisinden bağımsız iki modül, ama diyalog
  // kalıplara referans veriyor — bu yüzden sıra önemli, kalıp id'leri önce
  // toplanmalı.
  const { phrases, ids: phraseIds } = await checkPhrases();
  const { dialogueCount, lineCount } = await checkDialogues(phraseIds);
  const overlap = checkPhraseCardOverlap(phrases, everyCard);

  const levelLine = LEVELS.map((level) => `${level}: ${totals.levels[level]}`).join(' · ');
  console.log(`Alan: ${manifest.length} · Kart: ${totals.cards}`);
  console.log(`Seviye dağılımı: ${levelLine}`);
  console.log(`Kalıp: ${phrases.length} · Sahne: ${dialogueCount} · Replik: ${lineCount}`);
  if (overlap.length > 0) {
    // Bilgi satırı: hata da uyarı da değil (gerekçe checkPhraseCardOverlap'ta).
    console.log(`Kalıp ↔ kart örtüşmesi: ${overlap.length} — ${overlap.join(' · ')}`);
  }

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
