// Diyalog kayıtları: hangi sahne tamamlandı, hangi rolle, en iyi telaffuz skoru.
//
// Kayıt diyalog id'sine bağlıdır; metin düzeltilse bile tamamlanma korunur.
// Skor yalnız "konuş" modunda anlamlıdır — okuma ve hatırlama modunda ölçüm
// yapılmadığı için skor alanı boş bırakılır, sonradan doldurulabilir.

import { STORAGE_KEYS } from '../config.js';
import { read, write } from './storage.js';
import { dayKey } from '../utils.js';

/** @type {Record<string, {at: string, role: string, mode: string, score: number|null}>|null} */
let cache = null;

function load() {
  if (cache) return cache;
  const stored = read(STORAGE_KEYS.dialoguesDone, {});
  cache = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  return cache;
}

function persist() {
  write(STORAGE_KEYS.dialoguesDone, load());
}

/** @param {string} dialogueId */
export function isCompleted(dialogueId) {
  return Boolean(load()[dialogueId]);
}

/** @param {string} dialogueId */
export function getRecord(dialogueId) {
  return load()[dialogueId] || null;
}

/**
 * Sahne bitişini kaydeder. Aynı diyalog tekrar oynanırsa en iyi skor korunur —
 * ikinci deneme kötü geçtiyse ilk başarıyı silmek cesaret kırıcı olurdu.
 * @param {string} dialogueId
 * @param {{ role: string, mode: string, score?: number|null }} result
 * @returns {boolean} bu ilk tamamlama mı
 */
export function markCompleted(dialogueId, { role, mode, score = null }) {
  const records = load();
  const previous = records[dialogueId];
  const bestScore =
    score === null ? previous?.score ?? null : Math.max(score, previous?.score ?? 0);

  records[dialogueId] = { at: dayKey(), role, mode, score: bestScore };
  persist();
  return !previous;
}

export function countCompleted() {
  return Object.keys(load()).length;
}

/** Tamamlanmış ve skoru olan sahnelerin skor ortalaması; yoksa null. */
export function averageScore() {
  const scores = Object.values(load())
    .map((record) => record.score)
    .filter((score) => typeof score === 'number');
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}
