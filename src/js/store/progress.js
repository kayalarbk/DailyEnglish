// Öğrenme takibi.
// Anahtar biçimi "Kategori::kelime" olduğu için bir alandaki ilerleme,
// kart verisi indirilmeden yalnızca kategori adlarından hesaplanabilir.

import { STORAGE_KEYS } from '../config.js';
import { getCategoryNames, getFieldMeta } from '../data/repository.js';
import { read, write } from './storage.js';

let learnedMap = read(STORAGE_KEYS.learned, {});

function cardKey(categoryName, card) {
  return `${categoryName}::${card.en}`;
}

export function isLearned(categoryName, card) {
  return !!learnedMap[cardKey(categoryName, card)];
}

/**
 * Kartın öğrenildi durumunu tersine çevirir.
 * @returns {boolean} yeni durum (true ise yeni öğrenildi)
 */
export function toggleLearned(categoryName, card) {
  const key = cardKey(categoryName, card);
  const next = !learnedMap[key];
  if (next) {
    learnedMap[key] = true;
  } else {
    delete learnedMap[key];
  }
  write(STORAGE_KEYS.learned, learnedMap);
  return next;
}

/** Bir kategoride öğrenilen kelime sayısı. */
export function countLearnedInCategory(categoryName) {
  const prefix = `${categoryName}::`;
  return Object.keys(learnedMap).filter((key) => key.startsWith(prefix)).length;
}

/** Bir alanda öğrenilen kelime sayısı (kart verisi gerekmez). */
export function countLearnedInField(fieldId) {
  return getCategoryNames(fieldId).reduce(
    (sum, name) => sum + countLearnedInCategory(name),
    0
  );
}

/**
 * Bir alanın ilerleme özeti.
 * @returns {{ learned: number, total: number, pct: number }}
 */
export function getFieldProgress(fieldId) {
  const total = getFieldMeta(fieldId)?.wordCount || 0;
  const learned = Math.min(countLearnedInField(fieldId), total);
  return { learned, total, pct: total ? Math.round((learned / total) * 100) : 0 };
}

/** Seçili alanların birleşik ilerleme özeti. */
export function getOverallProgress(fieldIds) {
  return fieldIds.reduce(
    (acc, id) => {
      const { learned, total } = getFieldProgress(id);
      acc.learned += learned;
      acc.total += total;
      acc.pct = acc.total ? Math.round((acc.learned / acc.total) * 100) : 0;
      return acc;
    },
    { learned: 0, total: 0, pct: 0 }
  );
}
