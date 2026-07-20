// Anasayfa: günlük hedef, seri ve seçili alanların ilerlemesi.

import { el } from '../dom.js';
import { getFieldMeta, getFields } from '../data/repository.js';
import { getInterests } from '../store/interests.js';
import { getFieldProgress } from '../store/progress.js';
import { getStats, setDailyGoal } from '../store/stats.js';
import { renderHeader } from '../ui/header.js';
import { openField } from './field.js';
import { showScreen } from './navigation.js';

/** Hedef halkasının çevresi: 2πr, r = 52. */
const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

function greetingForHour(hour) {
  if (hour < 6) return 'İyi geceler';
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

function renderGreeting(stats) {
  if (el.greetingTitle) el.greetingTitle.textContent = greetingForHour(new Date().getHours());

  if (!el.greetingSub) return;
  if (stats.goalReached) {
    el.greetingSub.textContent = 'Bugünün hedefini tamamladın. Devam edebilirsin!';
  } else if (stats.streak > 0) {
    el.greetingSub.textContent = `${stats.streak} günlük serini sürdür.`;
  } else {
    el.greetingSub.textContent = 'Bugün birkaç kelime öğrenmeye ne dersin?';
  }
}

function renderGoal(stats) {
  if (el.goalCount) el.goalCount.textContent = stats.todayCount;
  if (el.goalTotal) el.goalTotal.textContent = `/ ${stats.dailyGoal}`;
  if (el.goalSelect) el.goalSelect.value = String(stats.dailyGoal);

  if (el.goalRingFill) {
    const offset = RING_CIRCUMFERENCE * (1 - stats.goalPct / 100);
    el.goalRingFill.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    el.goalRingFill.style.strokeDashoffset = String(offset);
    el.goalRingFill.parentElement?.parentElement?.classList.toggle(
      'is-complete',
      stats.goalReached
    );
  }

  if (el.goalText) {
    const remaining = Math.max(0, stats.dailyGoal - stats.todayCount);
    el.goalText.textContent = stats.goalReached
      ? 'Hedef tamam! 🎉 Fazlası her zaman iyidir.'
      : `${remaining} kelime kaldı.`;
  }
}

/** Bir alan satırı oluşturur. */
function fieldRow(meta, { muted = false } = {}) {
  const { learned, total, pct } = getFieldProgress(meta.id);

  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'field-row';
  row.style.setProperty('--row-color', meta.color);
  row.innerHTML = `
    <span class="field-row-icon" aria-hidden="true">${meta.icon}</span>
    <span class="field-row-body">
      <span class="field-row-name">
        ${meta.name}
        ${pct === 100 ? '<span class="field-row-done">✓ tamam</span>' : ''}
      </span>
      <span class="field-row-meta">
        ${
          muted
            ? `<span class="field-row-pct">${total} kelime</span>`
            : `<span class="progress-track"><span class="progress-fill" style="width:${pct}%"></span></span>
               <span class="field-row-pct">%${pct}</span>`
        }
      </span>
    </span>
  `;
  row.setAttribute(
    'aria-label',
    muted ? `${meta.name}, ${total} kelime` : `${meta.name}, ${learned} / ${total} öğrenildi`
  );
  row.onclick = () => openField(meta.id);
  return row;
}

function renderFieldLists() {
  const interests = getInterests();

  if (el.homeFieldList) {
    el.homeFieldList.innerHTML = '';
    interests.forEach((id) => {
      const meta = getFieldMeta(id);
      if (meta) el.homeFieldList.appendChild(fieldRow(meta));
    });
  }

  const others = getFields().filter((field) => !interests.includes(field.id));
  if (el.exploreHead) el.exploreHead.classList.toggle('hidden', others.length === 0);
  if (el.exploreFieldList) {
    el.exploreFieldList.innerHTML = '';
    others.forEach((meta) => el.exploreFieldList.appendChild(fieldRow(meta, { muted: true })));
  }
}

/** Devam edilecek alan: seçili alanlar içinde en az ilerlenmiş, bitmemiş olan. */
function nextFieldId() {
  const candidates = getInterests()
    .map((id) => ({ id, ...getFieldProgress(id) }))
    .filter((field) => field.total > 0);

  if (candidates.length === 0) return null;
  const unfinished = candidates.filter((field) => field.pct < 100);
  const pool = unfinished.length > 0 ? unfinished : candidates;
  return pool.reduce((best, field) => (field.pct < best.pct ? field : best)).id;
}

export function renderHome() {
  const stats = getStats();
  renderGreeting(stats);
  renderGoal(stats);
  renderFieldLists();
  renderHeader();

  if (el.continueBtn) {
    const target = nextFieldId();
    el.continueBtn.disabled = !target;
    el.continueBtn.textContent = stats.todayCount > 0 ? 'Devam Et' : 'Bugüne Başla';
  }
}

export function goHome() {
  renderHome();
  showScreen('home');
}

/**
 * @param {() => void} onEditInterests "Düzenle" tıklandığında çağrılır
 */
export function bindHome(onEditInterests) {
  if (el.continueBtn) {
    el.continueBtn.onclick = () => {
      const target = nextFieldId();
      if (target) openField(target);
    };
  }

  if (el.editInterestsBtn) el.editInterestsBtn.onclick = onEditInterests;

  if (el.goalSelect) {
    el.goalSelect.onchange = () => {
      setDailyGoal(Number(el.goalSelect.value));
      renderHome();
    };
  }
}
