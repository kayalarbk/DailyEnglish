// Kalıplar için kullanıcı kaydı: favoriler ve "öğrendim" işaretleri.
//
// Kelime kartlarından farklı olarak burada aralıklı tekrar yok. Kalıp bir
// üretim birimi değil, bir başvuru kaynağı: kullanıcı onu tanıdığında işaretler,
// sonra listeden çıkarıp geri kalanlara odaklanır. Ölçüm iddiası taşımadığı için
// "öğrendim" burada bir beyandır — kelime tarafındaki SRS kaydına karışmaz.

import { STORAGE_KEYS } from '../config.js';
import { read, write } from './storage.js';

/** @type {{ favorites: Set<string>|null, learned: Set<string>|null }} */
const cache = { favorites: null, learned: null };

function load(kind) {
  if (cache[kind]) return cache[kind];
  const key = kind === 'favorites' ? STORAGE_KEYS.phraseFavorites : STORAGE_KEYS.phraseLearned;
  const stored = read(key, []);
  cache[kind] = new Set(Array.isArray(stored) ? stored : []);
  return cache[kind];
}

function persist(kind) {
  const key = kind === 'favorites' ? STORAGE_KEYS.phraseFavorites : STORAGE_KEYS.phraseLearned;
  write(key, [...load(kind)]);
}

function toggle(kind, phraseId) {
  const set = load(kind);
  const has = set.has(phraseId);
  if (has) set.delete(phraseId);
  else set.add(phraseId);
  persist(kind);
  return !has;
}

/** @returns {string[]} favori kalıp id'leri */
export function getFavoriteIds() {
  return [...load('favorites')];
}

/** @returns {string[]} öğrenildi işaretlenmiş kalıp id'leri */
export function getLearnedIds() {
  return [...load('learned')];
}

export function isFavorite(phraseId) {
  return load('favorites').has(phraseId);
}

export function isLearned(phraseId) {
  return load('learned').has(phraseId);
}

/** @returns {boolean} yeni durum: true = artık favori */
export function toggleFavorite(phraseId) {
  return toggle('favorites', phraseId);
}

/** @returns {boolean} yeni durum: true = artık öğrenildi */
export function toggleLearned(phraseId) {
  return toggle('learned', phraseId);
}

export function countFavorites() {
  return load('favorites').size;
}

export function countLearned() {
  return load('learned').size;
}

/**
 * Bir kalıp listesinde kaç tanesinin öğrenildiği.
 * @param {object[]} phrases
 */
export function countLearnedIn(phrases) {
  const learned = load('learned');
  return phrases.reduce((sum, phrase) => sum + (learned.has(phrase.id) ? 1 : 0), 0);
}
