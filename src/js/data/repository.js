// Kelime verisine erişim katmanı.
// Manifest açılışta bir kez yüklenir; alan dosyaları ilk kullanımda getirilir.

import { FIELDS_MANIFEST } from '../config.js';

/** @type {{id, name, icon, color, description, file, wordCount, categories}[]} */
let manifest = [];

/** Yüklenmiş alanların kart verisi: id -> field */
const loadedFields = new Map();

/** Manifest'i yükler. Uygulama açılışında bir kez çağrılır. */
export async function loadManifest() {
  const response = await fetch(FIELDS_MANIFEST);
  if (!response.ok) throw new Error(`Alan listesi yüklenemedi (${response.status})`);
  const json = await response.json();
  manifest = json.fields;
  return manifest;
}

/** Tüm alanların özet bilgisi (kart verisi olmadan). */
export function getFields() {
  return manifest;
}

/** @param {string} id */
export function getFieldMeta(id) {
  return manifest.find((field) => field.id === id) || null;
}

/** Verilen alanların toplam kelime sayısı. */
export function countWords(fieldIds) {
  return fieldIds.reduce((sum, id) => sum + (getFieldMeta(id)?.wordCount || 0), 0);
}

/** Bir alanın kategori adları. */
export function getCategoryNames(fieldId) {
  return (getFieldMeta(fieldId)?.categories || []).map((category) => category.name);
}

/**
 * Alanın kart verisini getirir; ilk çağrıda ağdan indirir, sonrasında önbellekten verir.
 * @param {string} id
 */
export async function loadField(id) {
  if (loadedFields.has(id)) return loadedFields.get(id);

  const meta = getFieldMeta(id);
  if (!meta) throw new Error(`Bilinmeyen alan: ${id}`);

  const response = await fetch(meta.file);
  if (!response.ok) throw new Error(`"${meta.name}" yüklenemedi (${response.status})`);

  const field = await response.json();
  loadedFields.set(id, field);
  return field;
}

/** Önbellekteki alan verisi; henüz yüklenmemişse null. */
export function getLoadedField(id) {
  return loadedFields.get(id) || null;
}

/** Bir alandaki kategoriyi ada göre bulur (alan yüklenmiş olmalı). */
export function findCategory(fieldId, categoryName) {
  const field = getLoadedField(fieldId);
  if (!field) return null;
  return field.categories.find((category) => category.name === categoryName) || null;
}
