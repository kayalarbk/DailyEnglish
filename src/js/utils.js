// Genel amaçlı yardımcılar.

import { SPEECH } from './config.js';

/**
 * Diziyi yerinde karıştırır (Fisher-Yates) ve aynı diziyi döndürür.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Yerel saate göre YYYY-MM-DD. Gün sınırı kullanıcının saat diliminde geçer;
 * UTC kullanılırsa akşam çalışan kullanıcı ertesi güne yazılırdı.
 * @param {Date} [date]
 */
export function dayKey(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * İki gün anahtarı arasındaki tam gün farkı (toDay - fromDay).
 * @param {string} fromDay YYYY-MM-DD
 * @param {string} toDay YYYY-MM-DD
 */
export function daysBetween(fromDay, toDay) {
  const diff = new Date(`${toDay}T00:00:00`) - new Date(`${fromDay}T00:00:00`);
  return Math.round(diff / 86400000);
}

/**
 * Bir gün anahtarına gün ekler.
 * @param {number} days
 * @param {string} [fromDay] varsayılan: bugün
 * @returns {string} YYYY-MM-DD
 */
export function addDays(days, fromDay = dayKey()) {
  const date = new Date(`${fromDay}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

/**
 * Metni karşılaştırma için sadeleştirir: küçük harf, noktalama ve fazla boşluk yok.
 * Yazma modunda "Don't  worry!" ile "dont worry" eşit sayılır.
 * @param {string} text
 */
export function normalizeAnswer(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Türkçe harflerin arama sırasındaki sade karşılıkları. */
const SEARCH_FOLD = {
  ı: 'i', İ: 'i', I: 'i', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g',
  ü: 'u', Ü: 'u', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c', â: 'a', î: 'i', û: 'u',
};

/**
 * Metni arama için sadeleştirir: Türkçe harfler sade karşılıklarına iner.
 * Kullanıcı "nasil" yazınca "nasıl" da bulunur; klavye düzeni engel olmaz.
 * @param {string} text
 */
export function foldForSearch(text) {
  return String(text)
    .replace(/[ıİIşŞğĞüÜöÖçÇâîû]/g, (char) => SEARCH_FOLD[char] || char)
    .toLowerCase()
    .trim();
}

/**
 * Verilen metni İngilizce olarak seslendirir.
 * Desteklenmeyen tarayıcılarda sessizce hiçbir şey yapmaz.
 * @param {string} text
 */
export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH.lang;
    utterance.rate = SPEECH.rate;
    window.speechSynthesis.speak(utterance);
  } catch {
    /* desteklenmeyen tarayıcıda sessizce geç */
  }
}

/**
 * Metni belirli bir sesle seslendirir ve bitince geri çağırır.
 *
 * Diyalog modunda replikler sırayla okunduğu için bitişi bilmek gerekiyor.
 * Seslendirme yoksa ya da ses motoru `onend` vermezse, okuma süresi metin
 * uzunluğundan tahmin edilerek sahne yine de ilerler — sessiz bir tarayıcıda
 * diyalog kilitlenmemeli.
 *
 * @param {string} text
 * @param {{ voice?: SpeechSynthesisVoice|null, pitch?: number, onEnd?: () => void }} [options]
 * @returns {() => void} seslendirmeyi iptal eden fonksiyon
 */
export function speakLine(text, { voice = null, pitch = 1, onEnd } = {}) {
  // Okuma süresi tahmini: ~13 karakter/saniye + kısa bir kuyruk.
  const estimate = Math.min(9000, 600 + String(text).length * 75);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onEnd?.();
  };

  let timer = setTimeout(finish, estimate);

  try {
    if (!('speechSynthesis' in window)) return () => clearTimeout(timer);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang || SPEECH.lang;
    utterance.rate = SPEECH.rate;
    utterance.pitch = pitch;
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      clearTimeout(timer);
      finish();
    };
    utterance.onerror = () => {
      clearTimeout(timer);
      finish();
    };
    window.speechSynthesis.speak(utterance);
  } catch {
    /* seslendirme yoksa zamanlayıcı akışı sürdürür */
  }

  return () => {
    clearTimeout(timer);
    timer = null;
    done = true;
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* yoksay */
    }
  };
}

/** Tarayıcıdaki İngilizce sesler. Liste geç dolabildiği için her çağrıda okunur. */
export function englishVoices() {
  try {
    if (!('speechSynthesis' in window)) return [];
    return (window.speechSynthesis.getVoices() || []).filter((voice) =>
      /^en[-_]/i.test(voice.lang || '')
    );
  } catch {
    return [];
  }
}

/**
 * İki karakter dizisi arasındaki Levenshtein düzenleme mesafesi.
 * Yalnız iki satır tutulur; uzun cümlelerde de bellek sabit kalır.
 */
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  let current = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    [previous, current] = [current, previous];
  }

  return previous[b.length];
}

/**
 * İki cümlenin yüzde olarak benzerliği (0–100).
 * Karşılaştırma normalize edilmiş metin üzerinde yapılır: büyük/küçük harf,
 * noktalama ve fazla boşluk fark etmez — ölçülen telaffuz/sözcük seçimidir.
 * @returns {number} 0–100
 */
export function similarity(a, b) {
  const left = normalizeAnswer(a);
  const right = normalizeAnswer(b);
  if (!left && !right) return 100;
  const longest = Math.max(left.length, right.length);
  if (longest === 0) return 0;
  return Math.round((1 - levenshtein(left, right) / longest) * 100);
}

/**
 * Söylenen cümleyi beklenen replik ve kabul edilen alternatiflerle karşılaştırır;
 * en yüksek benzerliği döndürür. Kullanıcı "I'll have a latte" derken metinde
 * "Can I get a latte" yazıyorsa cezalandırılmamalı.
 * @param {string} said
 * @param {string[]} accepted
 */
export function bestSimilarity(said, accepted) {
  return accepted.reduce((best, option) => Math.max(best, similarity(said, option)), 0);
}
