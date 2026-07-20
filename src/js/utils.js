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
