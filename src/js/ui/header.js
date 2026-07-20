// Üst bar: seri ve XP göstergeleri.

import { el } from '../dom.js';
import { getStats } from '../store/stats.js';

let lastXp = null;
let lastStreak = null;

function bump(node) {
  if (!node) return;
  node.classList.remove('is-bumped');
  void node.offsetWidth; // animasyonu yeniden tetiklemek için reflow
  node.classList.add('is-bumped');
}

/** Göstergeleri günceller; değer arttıysa kısa bir animasyon oynatır. */
export function renderHeader() {
  const { xp, streak } = getStats();

  if (el.xpValue) el.xpValue.textContent = xp;
  if (el.streakValue) el.streakValue.textContent = streak;

  if (lastXp !== null && xp > lastXp) bump(el.xpChip);
  if (lastStreak !== null && streak > lastStreak) bump(el.streakChip);

  lastXp = xp;
  lastStreak = streak;
}

/** Üst barı gösterir/gizler (onboarding sırasında gizli). */
export function setHeaderVisible(visible) {
  if (el.topBar) el.topBar.classList.toggle('hidden', !visible);
}

/** Geri butonunu gösterir/gizler (anasayfada gizli). */
export function setBackVisible(visible) {
  if (el.backBtn) el.backBtn.classList.toggle('hidden', !visible);
}
