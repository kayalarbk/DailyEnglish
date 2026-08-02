// Oyunlaştırma durumu: seri (streak), XP ve günlük hedef.
//
// Günlük hedef "bugün kaç kart değerlendirdin"i sayar, "kaç kart öğrendim
// dedin"i değil. Bir kelimeyi kalıcı hale getirmek günler sürdüğü için günlük
// ölçüm birimi tekrardır; kalıcılık ayrıca `progress.js` tarafında izlenir.
// Aynı kart gün içinde iki kez çalışılırsa sayaç bir kez artar — yoksa aynı
// kartı tekrar tekrar işaretleyerek hedef şişirilebilirdi.

import { GAMIFICATION, GRADES, STORAGE_KEYS } from '../config.js';
import { addDays, dayKey, daysBetween } from '../utils.js';
import { read, write } from './storage.js';

const DEFAULTS = {
  xp: 0,
  streak: 0,
  /** @type {string|null} son çalışılan gün (YYYY-MM-DD) */
  lastStudyDay: null,
  /** @type {string[]} bugün değerlendirilen kart id'leri */
  todayCards: [],
  /** todayCards'ın ait olduğu gün */
  todayDay: null,
  /** bugün kalıcı kutusuna çıkan kart sayısı */
  todayMastered: 0,
  /**
   * Geçmiş günlerin çalışma sayısı: { 'YYYY-MM-DD': kart }.
   *
   * Gün değiştiğinde `todayCards`'ın uzunluğu buraya yazılır. GERİYE DÖNÜK
   * veri üretilmez: bu kayıt tutulmaya başlamadan önceki günler bilinmiyor ve
   * uydurulan bir sayı istatistik ekranını yalancı yapardı. Grafik bugünden
   * itibaren dolar.
   */
  history: {},
  dailyGoal: GAMIFICATION.defaultDailyGoal,
};

/**
 * Geçmişte tutulacak gün sayısı. 14 günlük grafik için 90 fazlasıyla yeter;
 * sınırsız büyüyen bir kayıt localStorage kotasını yavaşça doldurur.
 */
const HISTORY_LIMIT = 90;

let stats = { ...DEFAULTS, ...read(STORAGE_KEYS.stats, {}) };

// Geçmişi olmayan eski kayıt: boş nesneyle başlar (geriye dönük veri uydurulmaz).
if (!stats.history || typeof stats.history !== 'object' || Array.isArray(stats.history)) {
  stats.history = {};
}

// Eski sürüm sayısal bir `todayCount` tutuyordu; id listesine çevrilemez ama
// günün sayısı korunsun diye yer tutucu id'lerle taşınır.
if (Array.isArray(stats.todayCards) === false) {
  const previous = Number(stats.todayCount) || 0;
  stats.todayCards = Array.from({ length: previous }, (_, i) => `legacy-${i}`);
}
delete stats.todayCount;

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
    // Biten günü geçmişe yaz. Sıfır çalışılan gün kaydedilmez: grafikte
    // "kayıt yok" ile "çalışılmadı" aynı görünür (boş sütun) ve boş günü
    // saklamak yalnız yer kaplar.
    if (stats.todayDay && stats.todayCards.length > 0) {
      stats.history[stats.todayDay] = stats.todayCards.length;
      trimHistory();
      persist();
    }

    stats.todayDay = today;
    stats.todayCards = [];
    stats.todayMastered = 0;
  }

  // Dün de bugün de çalışılmadıysa seri kopmuştur.
  if (stats.lastStudyDay && daysBetween(stats.lastStudyDay, today) > 1) {
    stats.streak = 0;
  }
}

/** Geçmişi en eski kayıtlardan budar. */
function trimHistory() {
  const days = Object.keys(stats.history).sort();
  if (days.length <= HISTORY_LIMIT) return;
  days.slice(0, days.length - HISTORY_LIMIT).forEach((day) => {
    delete stats.history[day];
  });
}

/**
 * Son N günün çalışma geçmişi, eskiden yeniye ve BOŞ GÜNLER DÂHİL.
 *
 * Boş günlerin dizide yer alması önemli: grafik "çalışılmayan gün"ü göstermeli,
 * yoksa üç günde bir çalışan kullanıcının çubukları yan yana gelir ve düzenli
 * çalışıyormuş gibi görünür.
 *
 * Bugünün sayısı `history`den değil canlı sayaçtan gelir — gün henüz bitmedi.
 *
 * @param {number} [days]
 * @returns {{ day: string, count: number, isToday: boolean }[]}
 */
export function getHistory(days = 14) {
  refreshForToday();
  const today = stats.todayDay || dayKey();

  return Array.from({ length: days }, (_, i) => {
    const day = addDays(i - (days - 1), today);
    const isToday = day === today;
    return {
      day,
      count: isToday ? stats.todayCards.length : stats.history[day] || 0,
      isToday,
    };
  });
}

/** Geçmişte kayıtlı gün sayısı (bugün hariç) — "veri var mı" sorusu için. */
export function historyDayCount() {
  return Object.keys(stats.history).length;
}

/** Güncel istatistikler (salt okunur kopya). */
export function getStats() {
  refreshForToday();
  const todayCount = stats.todayCards.length;
  const goalPct = stats.dailyGoal
    ? Math.min(100, Math.round((todayCount / stats.dailyGoal) * 100))
    : 0;
  return {
    ...stats,
    todayCards: [...stats.todayCards],
    todayCount,
    goalPct,
    goalReached: todayCount >= stats.dailyGoal,
  };
}

/** XP ekler. Quiz doğru cevabı gibi tekrar dışı kazanımlar için. */
export function addXp(amount) {
  refreshForToday();
  stats.xp += amount;
  persist();
}

/**
 * Bir kart değerlendirildiğinde çağrılır: günlük sayacı, seriyi ve XP'yi günceller.
 *
 * @param {object} card
 * @param {'again'|'hard'|'good'} grade
 * @param {{ justMastered?: boolean }} [result] `reviewCard` sonucu
 * @returns {{ xp: number, counted: boolean, goalJustReached: boolean,
 *   streakIncreased: boolean }}
 */
export function recordReview(card, grade, { justMastered = false } = {}) {
  refreshForToday();
  const today = stats.todayDay;
  const wasGoalReached = stats.todayCards.length >= stats.dailyGoal;

  let streakIncreased = false;
  if (stats.lastStudyDay !== today) {
    const gap = stats.lastStudyDay ? daysBetween(stats.lastStudyDay, today) : null;
    stats.streak = gap === 1 ? stats.streak + 1 : 1;
    stats.lastStudyDay = today;
    streakIncreased = true;
  }

  // Aynı kart gün içinde tekrar çalışılırsa hedef sayacı artmaz; puan yine verilir
  // çünkü ikinci tekrar da gerçek bir çalışmadır.
  const id = card?.id;
  const counted = Boolean(id) && !stats.todayCards.includes(id);
  if (counted) stats.todayCards.push(id);

  let xp = GRADES[grade]?.xp ?? 0;
  if (justMastered) {
    xp += GAMIFICATION.xpPerMastered;
    stats.todayMastered += 1;
  }
  stats.xp += xp;
  persist();

  return {
    xp,
    counted,
    streakIncreased,
    goalJustReached:
      counted && !wasGoalReached && stats.todayCards.length >= stats.dailyGoal,
  };
}

/** Günlük hedefi değiştirir. */
export function setDailyGoal(goal) {
  stats.dailyGoal = Math.max(1, goal);
  persist();
}
