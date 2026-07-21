// Öğrenme takibi.
// Anahtar artık kartın kalıcı id'si ("gunluk-rutin-101"). Kart metni değişse bile
// ilerleme korunur. Id'nin alan öneki sayesinde bir alandaki ilerleme, kart verisi
// indirilmeden yalnızca kayıtlı id'lerden hesaplanabilir.

import { STORAGE_KEYS } from '../config.js';
import { getFieldMeta } from '../data/repository.js';
import { read, write } from './storage.js';

/** @type {Set<string>} öğrenilmiş kart id'leri */
const learnedIds = new Set(read(STORAGE_KEYS.learned, []));

/** Eski biçimdeki ("Kategori::kelime") kayıtlar; alan yüklendikçe id'ye taşınır. */
let legacyMap = read(STORAGE_KEYS.learnedLegacy, {});

function persist() {
  write(STORAGE_KEYS.learned, [...learnedIds]);
}

export function isLearned(card) {
  return learnedIds.has(card?.id);
}

/**
 * Kartın öğrenildi durumunu tersine çevirir.
 * @returns {boolean} yeni durum (true ise yeni öğrenildi)
 */
export function toggleLearned(card) {
  if (!card?.id) return false;
  const next = !learnedIds.has(card.id);
  if (next) {
    learnedIds.add(card.id);
  } else {
    learnedIds.delete(card.id);
  }
  persist();
  return next;
}

/**
 * Eski "Kategori::kelime" kayıtlarını, alan ilk yüklendiğinde id'lere taşır.
 * Taşınan kayıtlar eski depodan silinir; eşleşmeyenler sonraki alanlar için kalır.
 * @param {object} field yüklenmiş alan verisi
 */
export function migrateLegacyProgress(field) {
  if (!field?.categories) return;
  const legacyKeys = Object.keys(legacyMap);
  if (legacyKeys.length === 0) return;

  let changed = false;
  field.categories.forEach((category) => {
    category.cards.forEach((card) => {
      const key = `${category.name}::${card.en}`;
      if (legacyMap[key]) {
        learnedIds.add(card.id);
        delete legacyMap[key];
        changed = true;
      }
    });
  });

  if (!changed) return;
  persist();
  if (Object.keys(legacyMap).length === 0) {
    legacyMap = {};
    write(STORAGE_KEYS.learnedLegacy, {});
  } else {
    write(STORAGE_KEYS.learnedLegacy, legacyMap);
  }
}

/**
 * Bir kategoride öğrenilen kart sayısı.
 * @param {object[]} cards kategori kartları
 */
export function countLearnedInCards(cards = []) {
  return cards.reduce((sum, card) => sum + (learnedIds.has(card.id) ? 1 : 0), 0);
}

/** Bir alanda öğrenilen kart sayısı (kart verisi gerekmez). */
export function countLearnedInField(fieldId) {
  const prefix = `${fieldId}-`;
  let count = 0;
  learnedIds.forEach((id) => {
    if (id.startsWith(prefix)) count++;
  });
  return count;
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
