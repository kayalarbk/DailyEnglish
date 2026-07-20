// Kullanıcının seçtiği ilgi alanları.

import { STORAGE_KEYS } from '../config.js';
import { read, write } from './storage.js';

/** @type {string[]} */
let interests = read(STORAGE_KEYS.interests, []);

/** Seçili alan id'leri. */
export function getInterests() {
  return [...interests];
}

/** Kullanıcı daha önce alan seçmiş mi? (onboarding gerekli mi) */
export function hasChosenInterests() {
  return interests.length > 0;
}

export function isInterested(fieldId) {
  return interests.includes(fieldId);
}

/** @param {string[]} fieldIds */
export function setInterests(fieldIds) {
  interests = [...fieldIds];
  write(STORAGE_KEYS.interests, interests);
}
