// Günlük destenin ayarları ve gün içinde saklanan oturumu.
//
// Deste günde bir kez kurulur ve saklanır. Sayfa her yenilendiğinde yeniden
// karılsaydı kullanıcı aynı günün içinde farklı kartlarla karşılaşır, "şunu
// bitiriyorum" hissi kaybolurdu. Oturum bu yüzden kart id'lerini ve kalınan
// yeri birlikte tutar.

import { DAILY, STORAGE_KEYS } from '../config.js';
import { dayKey } from '../utils.js';
import { read, remove, write } from './storage.js';

// ------------------------------------------------------------------
// Ayarlar
// ------------------------------------------------------------------

const DEFAULT_SETTINGS = {
  /** @type {string[]} boş = ilgi alanlarının tamamı (interests.js'ten miras) */
  fieldIds: [],
  newPerDay: DAILY.defaultNewPerDay,
  /** @type {'card'|'quiz'|'mixed'} */
  mode: DAILY.defaultMode,
};

/**
 * Günlük deste ayarları.
 * `dailyGoal` bilerek burada yok — deste boyu `stats.dailyGoal`'den okunur.
 */
export function getDailySettings() {
  const stored = read(STORAGE_KEYS.dailySettings, {});
  const settings = { ...DEFAULT_SETTINGS, ...(stored || {}) };
  if (!Array.isArray(settings.fieldIds)) settings.fieldIds = [];
  if (!DAILY.newPerDayChoices.includes(settings.newPerDay)) {
    settings.newPerDay = Math.max(0, Number(settings.newPerDay) || 0);
  }
  if (!['card', 'quiz', 'mixed'].includes(settings.mode)) {
    settings.mode = DEFAULT_SETTINGS.mode;
  }
  return settings;
}

/** @param {Partial<typeof DEFAULT_SETTINGS>} patch */
export function setDailySettings(patch) {
  const next = { ...getDailySettings(), ...patch };
  write(STORAGE_KEYS.dailySettings, next);
  return next;
}

/**
 * Destenin kurulacağı alanlar. Ayarda seçim yoksa ilgi alanları miras alınır —
 * kullanıcıya alan seçimini ikinci kez sormanın anlamı yok.
 * @param {string[]} interests
 */
export function resolveFieldIds(interests) {
  const chosen = getDailySettings().fieldIds.filter((id) => interests.includes(id));
  return chosen.length > 0 ? chosen : interests;
}

// ------------------------------------------------------------------
// Oturum
// ------------------------------------------------------------------

/**
 * @typedef {object} DailySession
 * @property {string} day YYYY-MM-DD — bugüne eşit değilse oturum atılır
 * @property {{cardId: string, form: 'card'|'quiz'}[]} steps
 * @property {number} index sıradaki adım
 * @property {number} built kuruluş zamanı (ms)
 * @property {number} startedAt ilk kartın açıldığı an (ms)
 * @property {{due: number, new: number, trimmedDue: number, total: number}} stats
 * @property {{cardId: string, form: string, correct: boolean}[]} results
 * @property {'card'|'quiz'|'mixed'} mode
 */

/** @returns {DailySession|null} bugüne ait oturum; yoksa ya da eskiyse null */
export function getSession() {
  const session = read(STORAGE_KEYS.dailySession, null);
  if (!session || typeof session !== 'object') return null;
  if (session.day !== dayKey()) return null;
  if (!Array.isArray(session.steps)) return null;
  return session;
}

/** @param {DailySession} session */
export function saveSession(session) {
  write(STORAGE_KEYS.dailySession, session);
  return session;
}

export function clearSession() {
  remove(STORAGE_KEYS.dailySession);
}

/**
 * Yeni oturum nesnesi kurar (kaydetmez).
 * @param {{cardId: string, form: 'card'|'quiz'}[]} steps
 * @param {object} stats
 * @param {'card'|'quiz'|'mixed'} mode
 */
export function createSession(steps, stats, mode) {
  const now = Date.now();
  return {
    day: dayKey(),
    steps,
    index: 0,
    built: now,
    startedAt: now,
    stats,
    results: [],
    mode,
  };
}

/** Oturumda kalınan yeri günceller. */
export function setSessionIndex(index) {
  const session = getSession();
  if (!session) return null;
  session.index = Math.max(0, Math.min(index, session.steps.length));
  return saveSession(session);
}

/**
 * Bir kartın sonucunu kaydeder (özet ekranı için).
 * Aynı kart iki kez gelirse son sonuç geçerli olur; deste kurucusu tekrar
 * üretmez ama "ekstra çalış" turunda aynı kart yeniden gelebilir.
 * @param {string} cardId
 * @param {'card'|'quiz'} form
 * @param {boolean} correct
 */
export function recordResult(cardId, form, correct) {
  const session = getSession();
  if (!session) return null;

  const existing = session.results.findIndex((result) => result.cardId === cardId);
  const entry = { cardId, form, correct };
  if (existing === -1) session.results.push(entry);
  else session.results[existing] = entry;

  return saveSession(session);
}

/** Oturum bitti mi? */
export function isSessionComplete(session = getSession()) {
  return Boolean(session) && session.index >= session.steps.length;
}
