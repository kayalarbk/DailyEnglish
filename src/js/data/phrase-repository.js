// Günlük kalıp verisine erişim katmanı.
// Kelime verisiyle aynı desen: manifest açılışta bir kez, kategori dosyaları
// ilk kullanımda indirilir ve önbellekte tutulur.

import { PHRASES_MANIFEST } from '../config.js';

/** @type {{id, name, icon, color, description, file, count}[]} */
let manifest = [];

/** Yüklenmiş kategorilerin kalıpları: kategori id -> phrase[] */
const loadedCategories = new Map();

/** Manifest'i yükler. Kalıplar ekranı ilk açıldığında çağrılır. */
export async function loadPhraseManifest() {
  if (manifest.length > 0) return manifest;

  const response = await fetch(PHRASES_MANIFEST);
  if (!response.ok) throw new Error(`Kalıp listesi yüklenemedi (${response.status})`);
  const json = await response.json();
  manifest = json.categories;
  return manifest;
}

/** Tüm kategorilerin özet bilgisi (kalıp verisi olmadan). */
export function getPhraseCategories() {
  return manifest;
}

/** @param {string} id */
export function getPhraseCategoryMeta(id) {
  return manifest.find((category) => category.id === id) || null;
}

/** Manifest'e göre toplam kalıp sayısı — dosyaları indirmeden bilinir. */
export function totalPhraseCount() {
  return manifest.reduce((sum, category) => sum + (category.count || 0), 0);
}

/**
 * Bir kategorinin kalıplarını getirir; ilk çağrıda indirir.
 * @param {string} id
 * @returns {Promise<object[]>}
 */
export async function loadPhraseCategory(id) {
  if (loadedCategories.has(id)) return loadedCategories.get(id);

  const meta = getPhraseCategoryMeta(id);
  if (!meta) throw new Error(`Bilinmeyen kalıp kategorisi: ${id}`);

  const response = await fetch(meta.file);
  if (!response.ok) throw new Error(`"${meta.name}" yüklenemedi (${response.status})`);

  const json = await response.json();
  loadedCategories.set(id, json.phrases);
  return json.phrases;
}

/**
 * Tüm kategorileri indirir. Arama ve favoriler ekranı bütün veriye ihtiyaç duyar;
 * dosyalar küçük olduğu için tek seferde alınır ve bir daha indirilmez.
 */
export async function loadAllPhrases() {
  await Promise.all(manifest.map((category) => loadPhraseCategory(category.id)));
  return getAllLoadedPhrases();
}

/** Önbellekteki kategorinin kalıpları; henüz yüklenmemişse boş dizi. */
export function getLoadedPhrases(id) {
  return loadedCategories.get(id) || [];
}

/** Yüklenmiş tüm kalıplar, manifest sırasıyla. */
export function getAllLoadedPhrases() {
  return manifest.flatMap((category) => getLoadedPhrases(category.id));
}

/** Tek bir kalıbı id'sinden bulur (yüklenmiş kategoriler içinde). */
export function findPhrase(phraseId) {
  for (const phrases of loadedCategories.values()) {
    const found = phrases.find((phrase) => phrase.id === phraseId);
    if (found) return found;
  }
  return null;
}

/**
 * Verilen id'lere karşılık gelen kalıplar. Bulunamayanlar atlanır —
 * veri güncellenmiş, kalıp kaldırılmış olabilir.
 * @param {string[]} phraseIds
 */
export function getPhrasesByIds(phraseIds) {
  const wanted = new Set(phraseIds);
  return getAllLoadedPhrases().filter((phrase) => wanted.has(phrase.id));
}
