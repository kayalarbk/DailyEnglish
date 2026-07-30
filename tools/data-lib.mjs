// Veri araçlarının ortak yükleme katmanı (validate + sync burayı kullanır).
// Bağımlılıksız: yalnızca Node standart kütüphanesi.

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const FIELDS_DIR = join(ROOT, 'src', 'data', 'fields');
export const MANIFEST_PATH = join(FIELDS_DIR, 'fields.json');
export const TAGS_PATH = join(ROOT, 'src', 'data', 'tags.json');
export const PRESETS_PATH = join(ROOT, 'src', 'data', 'presets.json');

/** Uygulamanın tanıdığı seviyeler (src/js/config.js ile aynı olmalı). */
export const LEVELS = ['A1', 'A2', 'B1', 'B2'];

/** Bir kartta BULUNMASI ZORUNLU alanlar (hepsi dolu metin olmalı). */
export const CARD_REQUIRED = ['id', 'en', 'enS', 'tr', 'trS', 'level'];

/**
 * Zorunlu olmayan ama tanınan alanlar.
 * `tags` bir dizidir; zorunlu listeye konulamaz çünkü oradaki kontrol
 * "dolu metin mi" diye bakıyor.
 */
export const CARD_OPTIONAL = ['tags'];

/** Kartta görülebilecek tüm alanlar; bunun dışındakiler uyarı üretir. */
export const CARD_FIELDS = [...CARD_REQUIRED, ...CARD_OPTIONAL];

/** Yakın tekrar uyarısının eşiği (similarity 0-100 döndürür). */
export const NEAR_DUPLICATE_THRESHOLD = 90;

/** Bir kategoride bulunması beklenen asgari kart sayısı (altı uyarı üretir). */
export const MIN_CATEGORY_CARDS = 12;

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function loadManifest() {
  const json = await readJson(MANIFEST_PATH);
  return json.fields;
}

/** fields.json dışındaki tüm alan dosyalarının adları (id sırasıyla değil, alfabetik). */
export async function listFieldFiles() {
  const entries = await readdir(FIELDS_DIR);
  return entries.filter((name) => name.endsWith('.json') && name !== 'fields.json').sort();
}

/** Bir alan dosyasını okur; { file, field } döner. */
export async function loadFieldFile(name) {
  const file = join(FIELDS_DIR, name);
  return { name, file, field: await readJson(file) };
}

/** Alandaki tüm kartlar (kategori sırasıyla). */
export function allCards(field) {
  return (field.categories || []).flatMap((category) => category.cards || []);
}

/** Kart listesinin seviye dağılımı. */
export function levelCounts(cards) {
  const counts = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  cards.forEach((card) => {
    if (card.level in counts) counts[card.level]++;
  });
  return counts;
}

// ------------------------------------------------------------------
// Etiket sözlüğü
// ------------------------------------------------------------------

/** `src/data/tags.json` — etiketlerin tek doğruluk kaynağı. */
export async function loadTags() {
  const json = await readJson(TAGS_PATH);
  return {
    axes: json.axes || [],
    tags: json.tags || [],
    ids: new Set((json.tags || []).map((tag) => tag.id)),
    byAxis: (json.axes || []).reduce((acc, axis) => {
      acc[axis.id] = (json.tags || []).filter((tag) => tag.eksen === axis.id);
      return acc;
    }, {}),
  };
}

/** `src/data/presets.json` — bölüm → etiket demetleri. */
export async function loadPresets() {
  const json = await readJson(PRESETS_PATH);
  return { groups: json.groups || [], presets: json.presets || [] };
}

/** Bir kartın belirli eksendeki etiketleri: axisOf(card, 'dom') → ['dom:math'] */
export function tagsOfAxis(card, axis) {
  return (card.tags || []).filter((tag) => tag.startsWith(`${axis}:`));
}

// ------------------------------------------------------------------
// Metin karşılaştırma (audit ve validate ortak kullanır)
// ------------------------------------------------------------------

/** Karşılaştırma için sadeleştirme: küçük harf, baştaki artikel/"to" atılır. */
export function normalizeEn(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/^(to|a|an|the)\s+/, '')
    .replace(/[^a-z0-9\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeTr(text) {
  return String(text || '')
    .toLocaleLowerCase('tr')
    .replace(/[^\wçğıöşü\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'and', 'or',
  'be', 'is', 'are', 'was', 'were', 'get', 'got', 'go', 'do', 'have', 'has',
  'it', 'my', 'your', 'his', 'her', 'up', 'out', 'off', 'down', 'over',
]);

export const enTokens = (text) => normalizeEn(text).split(' ').filter(Boolean);

/**
 * Karşılaştırılmaya değer kart çiftleri: en az bir anlamlı sözcüğü paylaşanlar.
 *
 * Bütün kartları ikişerli karşılaştırmak (1349² / 2 ≈ 900 bin çift) gereksiz;
 * ortak sözcüğü olmayan iki kalıp benzerlik eşiğini zaten aşamaz. Bu eleme
 * karşılaştırma sayısını yüzde bir mertebesine indiriyor.
 *
 * @param {object[]} cards
 * @returns {Generator<[object, object]>}
 */
export function* candidatePairs(cards) {
  const byToken = new Map();
  cards.forEach((card, index) => {
    new Set(enTokens(card.en).filter((word) => !STOPWORDS.has(word))).forEach((word) => {
      if (!byToken.has(word)) byToken.set(word, []);
      byToken.get(word).push(index);
    });
  });

  const seen = new Set();
  for (const indexes of byToken.values()) {
    for (let i = 0; i < indexes.length; i++) {
      for (let j = i + 1; j < indexes.length; j++) {
        const [a, b] = indexes[i] < indexes[j] ? [indexes[i], indexes[j]] : [indexes[j], indexes[i]];
        const key = `${a}:${b}`;
        if (seen.has(key)) continue;
        seen.add(key);
        yield [cards[a], cards[b]];
      }
    }
  }
}

/**
 * İki kart kasıtlı anlam kaymasıysa tekrar sayılmaz.
 *
 * `type:polysemy` kartlarının varlık sebebi aynı sözcüğün farklı alanda farklı
 * anlama gelmesi — "current" hem elektrik akımı hem güncel demek. Muafiyet
 * yalnız İKİSİ de polysemy işaretliyse ve bilgi alanları farklıysa geçerli;
 * yoksa etiket, gerçek tekrarı gizlemenin bahanesine dönüşür.
 */
export function isIntentionalPolysemy(a, b) {
  const aTags = a.tags || [];
  const bTags = b.tags || [];
  if (!aTags.includes('type:polysemy') || !bTags.includes('type:polysemy')) return false;

  const aDoms = new Set(tagsOfAxis(a, 'dom'));
  const bDoms = new Set(tagsOfAxis(b, 'dom'));
  if (aDoms.size === 0 || bDoms.size === 0) return false;
  return [...aDoms].every((tag) => !bDoms.has(tag));
}
