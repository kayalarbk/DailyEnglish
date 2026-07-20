// İlgi alanı seçim ekranı.
// Hem ilk açılışta hem de "Düzenle" ile sonradan kullanılır.

import { GAMIFICATION } from '../config.js';
import { el } from '../dom.js';
import { getFields } from '../data/repository.js';
import { getInterests, setInterests } from '../store/interests.js';
import { showScreen } from './navigation.js';

/** @type {Set<string>} ekranda seçili tutulan alanlar */
let selection = new Set();

/** @type {(() => void)|null} kaydedildikten sonra çağrılır */
let onDone = null;

function updateFooter() {
  const count = selection.size;
  const enough = count >= GAMIFICATION.minInterests;

  if (el.interestCount) {
    el.interestCount.textContent = enough
      ? `${count} alan seçildi`
      : 'En az bir alan seç';
  }
  if (el.interestSaveBtn) el.interestSaveBtn.disabled = !enough;
}

function toggle(fieldId, tile) {
  if (selection.has(fieldId)) {
    selection.delete(fieldId);
  } else {
    selection.add(fieldId);
  }
  tile.classList.toggle('is-selected', selection.has(fieldId));
  tile.setAttribute('aria-pressed', String(selection.has(fieldId)));
  updateFooter();
}

/**
 * Seçim ekranını çizer ve gösterir.
 * @param {() => void} done kaydedildiğinde çağrılacak geri dönüş
 */
export function openOnboarding(done) {
  onDone = done;
  selection = new Set(getInterests());

  if (el.interestGrid) {
    el.interestGrid.innerHTML = '';
    getFields().forEach((field) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'field-tile';
      tile.style.setProperty('--tile-color', field.color);
      tile.setAttribute('aria-pressed', String(selection.has(field.id)));
      if (selection.has(field.id)) tile.classList.add('is-selected');

      tile.innerHTML = `
        <span class="field-tile-check" aria-hidden="true">✓</span>
        <span class="field-tile-icon" aria-hidden="true">${field.icon}</span>
        <span class="field-tile-name">${field.name}</span>
        <span class="field-tile-count">${field.wordCount} kelime</span>
      `;
      tile.onclick = () => toggle(field.id, tile);
      el.interestGrid.appendChild(tile);
    });
  }

  updateFooter();
  showScreen('onboarding');
}

export function bindOnboarding() {
  if (!el.interestSaveBtn) return;
  el.interestSaveBtn.onclick = () => {
    if (selection.size < GAMIFICATION.minInterests) return;
    setInterests([...selection]);
    onDone?.();
  };
}
