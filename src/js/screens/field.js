// Alan detayı: alanın içindeki kategoriler.

import { el } from '../dom.js';
import { getFieldMeta, loadField } from '../data/repository.js';
import { state } from '../state.js';
import { countLearnedInCategory, getFieldProgress } from '../store/progress.js';
import { toast } from '../ui/toast.js';
import { openCategory } from './cards.js';
import { showScreen } from './navigation.js';

function renderHero(meta) {
  const { learned, total, pct } = getFieldProgress(meta.id);

  if (el.fieldHero) el.fieldHero.style.setProperty('--hero-color', meta.color);
  if (el.fieldHeroIcon) el.fieldHeroIcon.textContent = meta.icon;
  if (el.fieldHeroName) el.fieldHeroName.textContent = meta.name;
  if (el.fieldHeroDesc) el.fieldHeroDesc.textContent = meta.description;
  if (el.fieldHeroFill) el.fieldHeroFill.style.width = `${pct}%`;
  if (el.fieldHeroStat) el.fieldHeroStat.textContent = `${learned}/${total} · %${pct}`;
}

function categoryRow(meta, category) {
  const total = category.cards.length;
  const learned = Math.min(countLearnedInCategory(category.name), total);
  const pct = total ? Math.round((learned / total) * 100) : 0;

  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'category-row';
  row.style.setProperty('--row-color', category.color || meta.color);
  row.innerHTML = `
    <span class="category-row-body">
      <span class="category-row-name">${category.name}</span>
      <span class="category-row-meta">
        <span class="progress-track"><span class="progress-fill" style="width:${pct}%"></span></span>
        <span class="category-row-count">${learned}/${total}</span>
      </span>
    </span>
    ${pct === 100 ? '<span class="category-row-medal" aria-hidden="true">🏅</span>' : ''}
  `;
  row.setAttribute('aria-label', `${category.name}, ${learned} / ${total} öğrenildi`);
  row.onclick = () => openCategory(meta.id, category.name);
  return row;
}

/**
 * Alanı açar; kart verisi henüz indirilmemişse indirir.
 * @param {string} fieldId
 */
export async function openField(fieldId) {
  const meta = getFieldMeta(fieldId);
  if (!meta) return;

  state.fieldId = fieldId;
  renderHero(meta);
  if (el.categoryList) el.categoryList.innerHTML = '<p class="app-message">Yükleniyor…</p>';
  showScreen('field');

  try {
    const field = await loadField(fieldId);
    renderCategories(meta, field);
  } catch (error) {
    if (el.categoryList) {
      el.categoryList.innerHTML = '<p class="app-message">Kelimeler yüklenemedi.</p>';
    }
    toast('Kelimeler yüklenemedi', '⚠️');
    console.error(error);
  }
}

function renderCategories(meta, field) {
  if (!el.categoryList) return;
  el.categoryList.innerHTML = '';
  field.categories.forEach((category) => {
    el.categoryList.appendChild(categoryRow(meta, category));
  });
}

/** Alan ekranını yeniden çizer (kartlardan dönüşte ilerleme güncellensin diye). */
export function refreshField() {
  const meta = getFieldMeta(state.fieldId);
  if (!meta) return;
  renderHero(meta);

  // Alan zaten yüklü olduğu için loadField önbellekten döner.
  loadField(state.fieldId)
    .then((field) => renderCategories(meta, field))
    .catch(() => {});
}

/** Kartlar ekranından alan ekranına dönüş. */
export function backToField() {
  refreshField();
  showScreen('field');
}
