// Günlük deste ayarları modalı.
//
// Tanışma testine yeni bir adım eklenmedi: test zaten uzun ve kullanıcının
// ilk karşılaşması "ayar yap" olmamalı. Deste varsayılanlarla başlar, ayar
// anasayfadaki dişli ikonundan bulunur.

import { el } from '../dom.js';
import { DAILY, DAILY_MODES } from '../config.js';
import { getFields } from '../data/repository.js';
import { getDailySettings, setDailySettings } from '../store/daily-session.js';
import { getInterests } from '../store/interests.js';
import { getStats, setDailyGoal } from '../store/stats.js';

/** @type {(() => void)|null} modal kapanınca çağrılır (anasayfayı tazelemek için) */
let onClose = null;
/** @type {(() => Promise<void>)|null} "desteyi yenile" */
let onRebuild = null;

function chip(label, value, active) {
  return `<button type="button" class="option-chip${active ? ' is-active' : ''}"
    data-value="${value}">${label}</button>`;
}

function renderGoal() {
  if (!el.dailyGoalChips) return;
  const goal = getStats().dailyGoal;
  el.dailyGoalChips.innerHTML = DAILY.goalChoices
    .map((choice) => chip(`${choice}`, choice, choice === goal))
    .join('');
  if (el.dailyGoalCustom) el.dailyGoalCustom.value = String(goal);
}

function renderNewPerDay() {
  if (!el.dailyNewChips) return;
  const { newPerDay } = getDailySettings();
  el.dailyNewChips.innerHTML = DAILY.newPerDayChoices
    .map((choice) => chip(choice === 0 ? 'Kapalı' : `${choice}`, choice, choice === newPerDay))
    .join('');
}

function renderMode() {
  if (!el.dailyModeChips) return;
  const { mode } = getDailySettings();
  el.dailyModeChips.innerHTML = DAILY_MODES.map((option) =>
    chip(`${option.icon} ${option.label}`, option.id, option.id === mode)
  ).join('');
}

/**
 * Alan seçimi. Yalnız ilgi alanları listelenir — günlük deste, seçilmemiş bir
 * alandan kart getirmemeli. Hiçbiri seçili değilse hepsi kullanılır.
 */
function renderFields() {
  if (!el.dailyFieldChips) return;

  const interests = getInterests();
  const { fieldIds } = getDailySettings();
  const all = fieldIds.length === 0;

  el.dailyFieldChips.innerHTML = interests
    .map((id) => {
      const meta = getFields().find((field) => field.id === id);
      if (!meta) return '';
      const active = all || fieldIds.includes(id);
      return `<button type="button" class="option-chip${active ? ' is-active' : ''}"
        data-field="${id}"><span aria-hidden="true">${meta.icon}</span> ${meta.name}</button>`;
    })
    .join('');
}

function renderAll() {
  renderGoal();
  renderNewPerDay();
  renderMode();
  renderFields();
}

export function openDailySettings() {
  if (!el.dailySettingsModal) return;
  renderAll();
  el.dailySettingsModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  el.dailySettingsClose?.focus();
}

export function closeDailySettings() {
  if (!el.dailySettingsModal) return;
  el.dailySettingsModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  onClose?.();
}

/**
 * @param {{ onClose: () => void, onRebuild: () => Promise<void> }} handlers
 */
export function bindDailySettings(handlers) {
  onClose = handlers.onClose;
  onRebuild = handlers.onRebuild;

  if (el.dailySettingsBtn) el.dailySettingsBtn.onclick = openDailySettings;
  if (el.dailySettingsClose) el.dailySettingsClose.onclick = closeDailySettings;
  if (el.dailySettingsBackdrop) el.dailySettingsBackdrop.onclick = closeDailySettings;
  if (el.dailySettingsSave) el.dailySettingsSave.onclick = closeDailySettings;

  if (el.dailyGoalChips) {
    el.dailyGoalChips.onclick = (event) => {
      const button = event.target.closest('[data-value]');
      if (!button) return;
      setDailyGoal(Number(button.dataset.value));
      renderGoal();
    };
  }

  if (el.dailyGoalCustom) {
    el.dailyGoalCustom.onchange = () => {
      const value = Number(el.dailyGoalCustom.value);
      if (!Number.isFinite(value) || value < 1) {
        renderGoal();
        return;
      }
      setDailyGoal(Math.min(200, Math.round(value)));
      renderGoal();
    };
  }

  if (el.dailyNewChips) {
    el.dailyNewChips.onclick = (event) => {
      const button = event.target.closest('[data-value]');
      if (!button) return;
      setDailySettings({ newPerDay: Number(button.dataset.value) });
      renderNewPerDay();
    };
  }

  if (el.dailyModeChips) {
    el.dailyModeChips.onclick = (event) => {
      const button = event.target.closest('[data-value]');
      if (!button) return;
      setDailySettings({ mode: button.dataset.value });
      renderMode();
    };
  }

  if (el.dailyFieldChips) {
    el.dailyFieldChips.onclick = (event) => {
      const button = event.target.closest('[data-field]');
      if (!button) return;

      const interests = getInterests();
      const current = getDailySettings().fieldIds;
      // Boş liste "hepsi" demek; ilk dokunuşta somut listeye çevrilir ki
      // kullanıcı tek alanı çıkarabilsin.
      const base = current.length === 0 ? [...interests] : current;
      const id = button.dataset.field;
      const next = base.includes(id)
        ? base.filter((item) => item !== id)
        : [...base, id];

      // Hepsi seçiliyse yeniden "hepsi" durumuna dön: liste sabitlenmesin,
      // yeni bir alan eklendiğinde kendiliğinden desteye girsin.
      const all = interests.every((item) => next.includes(item));
      setDailySettings({ fieldIds: all ? [] : next });
      renderFields();
    };
  }

  if (el.dailyRebuildBtn) {
    el.dailyRebuildBtn.onclick = async () => {
      if (!window.confirm('Bugünün destesi yeniden kurulacak. İlerlemen sıfırlanır. Devam edilsin mi?')) {
        return;
      }
      el.dailyRebuildBtn.disabled = true;
      try {
        await onRebuild?.();
        closeDailySettings();
      } finally {
        el.dailyRebuildBtn.disabled = false;
      }
    };
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !el.dailySettingsModal?.classList.contains('hidden')) {
      closeDailySettings();
    }
  });
}
