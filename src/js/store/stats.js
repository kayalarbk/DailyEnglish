// Oyunlaştırma durumu: seri (streak), XP ve günlük hedef.

import { GAMIFICATION, STORAGE_KEYS } from '../config.js';
import { read, write } from './storage.js';

const DEFAULTS = {
  xp: 0,
  streak: 0,
  /** @type {string|null} son çalışılan gün (YYYY-MM-DD) */
  lastStudyDay: null,
  /** bugün öğrenilen kelime sayısı */
  todayCount: 0,
  /** todayCount'un ait olduğu gün */
  todayDay: null,
  dailyGoal: GAMIFICATION.defaultDailyGoal,
};

let stats = { ...DEFAULTS, ...read(STORAGE_KEYS.stats, {}) };

/** Yerel saate göre YYYY-MM-DD. */
function dayKey(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function daysBetween(fromDay, toDay) {
  const diff = new Date(`${toDay}T00:00:00`) - new Date(`${fromDay}T00:00:00`);
  return Math.round(diff / 86400000);
}

function persist() {
  write(STORAGE_KEYS.stats, stats);
}

/**
 * Gün değiştiyse günlük sayacı sıfırlar, seri koptuysa seriyi düşürür.
 * Her okuma öncesi çağrılır; gece yarısını geçen sekmelerde de doğru sonuç verir.
 */
function refreshForToday() {
  const today = dayKey();

  if (stats.todayDay !== today) {
    stats.todayDay = today;
    stats.todayCount = 0;
  }

  // Dün de bugün de çalışılmadıysa seri kopmuştur.
  if (stats.lastStudyDay && daysBetween(stats.lastStudyDay, today) > 1) {
    stats.streak = 0;
  }
}

/** Güncel istatistikler (salt okunur kopya). */
export function getStats() {
  refreshForToday();
  const goalPct = stats.dailyGoal
    ? Math.min(100, Math.round((stats.todayCount / stats.dailyGoal) * 100))
    : 0;
  return { ...stats, goalPct, goalReached: stats.todayCount >= stats.dailyGoal };
}

/** XP ekler. Kelime öğrenme ve doğru quiz cevabı için kullanılır. */
export function addXp(amount) {
  refreshForToday();
  stats.xp += amount;
  persist();
}

/**
 * Bir kelime öğrenildiğinde çağrılır: günlük sayacı, seriyi ve XP'yi günceller.
 * @returns {{ goalJustReached: boolean, streakIncreased: boolean }}
 */
export function recordWordLearned() {
  refreshForToday();
  const today = stats.todayDay;
  const wasGoalReached = stats.todayCount >= stats.dailyGoal;

  let streakIncreased = false;
  if (stats.lastStudyDay !== today) {
    const gap = stats.lastStudyDay ? daysBetween(stats.lastStudyDay, today) : null;
    stats.streak = gap === 1 ? stats.streak + 1 : 1;
    stats.lastStudyDay = today;
    streakIncreased = true;
  }

  stats.todayCount += 1;
  stats.xp += GAMIFICATION.xpPerWord;
  persist();

  return {
    streakIncreased,
    goalJustReached: !wasGoalReached && stats.todayCount >= stats.dailyGoal,
  };
}

/** Günlük hedefi değiştirir. */
export function setDailyGoal(goal) {
  stats.dailyGoal = Math.max(1, goal);
  persist();
}
