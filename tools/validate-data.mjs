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

import {
  CARD_FIELDS,
  LEVELS,
  allCards,
  levelCounts,
  listFieldFiles,
  loadFieldFile,
  loadManifest,
} from './data-lib.mjs';

const errors = [];
const warnings = [];

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

function checkCards(field, seenIds) {
  const fieldId = field.id;
  const numbers = [];
  const enSeen = new Map();

  field.categories.forEach((category) => {
    if (!isFilledString(category.name)) fail(`${fieldId}: adı olmayan kategori var.`);
    if (!isFilledString(category.color)) {
      warn(`${fieldId}/${category.name}: kategori rengi yok, alan rengi kullanılacak.`);
    }
    if (!Array.isArray(category.cards) || category.cards.length === 0) {
      fail(`${fieldId}/${category.name}: kart listesi boş.`);
      return;
    }

    category.cards.forEach((card, index) => {
      const where = `${fieldId}/${category.name}[${index}]`;

      CARD_FIELDS.forEach((key) => {
        if (!isFilledString(card[key])) fail(`${where}: "${key}" boş veya eksik.`);
      });
      Object.keys(card).forEach((key) => {
        if (!CARD_FIELDS.includes(key)) warn(`${where}: bilinmeyen alan "${key}".`);
      });

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
        const key = card.en.trim().toLowerCase();
        if (enSeen.has(key)) {
          warn(`${where}: "${card.en}" aynı alanda ${enSeen.get(key)} içinde de var.`);
        } else {
          enSeen.set(key, where);
        }
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

async function main() {
  const manifest = await loadManifest();
  const files = await listFieldFiles();

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
    const counts = levelCounts(cards);
    LEVELS.forEach((level) => {
      totals.levels[level] += counts[level];
    });
  }

  const levelLine = LEVELS.map((level) => `${level}: ${totals.levels[level]}`).join(' · ');
  console.log(`Alan: ${manifest.length} · Kart: ${totals.cards}`);
  console.log(`Seviye dağılımı: ${levelLine}`);

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
