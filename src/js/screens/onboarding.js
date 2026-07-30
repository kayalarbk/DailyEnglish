// Tanışma testi ve alan seçimi.
//
// İki modda çalışır:
//   'quiz'   → bölüm → seviye → amaç → alanlar (ilk açılış)
//   'fields' → yalnızca alan seçimi (sonradan alan eklemek/çıkarmak için)
//
// Adım sayısı BİLEREK dört: bölüm listesi 38 seçeneğe çıktı ama yeni bir adım
// eklenmedi. Grup çipleri ve bölüm listesi aynı ekranda duruyor, "ince ayar"
// da o ekranın içinde açılıyor. Test zaten uzun; kırk kutucuklu bir ızgara ya
// da beşinci bir adım kullanıcıyı kaçırırdı.
//
// Test sonucu profile store'una, alanlar interests'e, etiket sorgusu tags
// store'una yazılır; üçü bağımsızdır.

import { GAMIFICATION, GOALS, LEVEL_CHOICES } from '../config.js';
import { el } from '../dom.js';
import { getFields } from '../data/repository.js';
import {
  getAxes,
  getGroups,
  getPreset,
  getPresetsOfGroup,
  getTagsOfAxis,
  tagLabel,
} from '../data/tag-repository.js';
import { getInterests, setInterests } from '../store/interests.js';
import {
  getGoalContexts,
  getProfile,
  getRecommendedFields,
  setProfile,
} from '../store/profile.js';
import { getSelectedTags, setTagQuery } from '../store/tags.js';
import { showScreen } from './navigation.js';

const STEPS = {
  level: {
    title: 'İngilizcen ne durumda?',
    sub: 'Kartları seviyene göre süzebilelim. Sonradan değiştirebilirsin.',
    multi: false,
    options: () => LEVEL_CHOICES,
  },
  goal: {
    title: 'Neye odaklanmak istiyorsun?',
    sub: 'Birden fazla seçebilirsin.',
    multi: true,
    options: () => GOALS,
  },
};

const wizard = {
  /** @type {('dept'|'level'|'goal'|'fields')[]} */
  steps: [],
  index: 0,
  /** @type {string|null} açık bölüm grubu */
  groupId: null,
  /** @type {string|null} seçili bölüm */
  presetId: null,
  /** @type {Set<string>} bölümden gelen, kullanıcının düzenleyebildiği etiketler */
  tags: new Set(),
  /** ince ayar açık mı */
  tuneOpen: false,
  /** @type {string|null} */
  levelId: null,
  /** @type {Set<string>} */
  goalIds: new Set(),
  /** @type {Set<string>} seçili alanlar */
  selection: new Set(),
  /** @type {string[]} öneri rozetini alan alanlar */
  recommended: [],
  /** @type {(() => void)|null} */
  onDone: null,
  /** alan listesi öneriyle bir kez dolduruldu mu */
  seeded: false,
};

const stepName = () => wizard.steps[wizard.index];

function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderProgress() {
  if (!el.wizardSteps) return;
  el.wizardSteps.classList.toggle('hidden', wizard.steps.length < 2);
  el.wizardSteps.innerHTML = wizard.steps
    .map((_, index) => {
      const state = index < wizard.index ? 'is-done' : index === wizard.index ? 'is-active' : '';
      return `<span class="wizard-step ${state}"></span>`;
    })
    .join('');
}

/** Tek/çok seçimli adımların kartları (seviye, amaç). */
function renderOptions(step) {
  if (!el.wizardOptions) return;
  el.wizardOptions.classList.remove('hidden');
  el.interestGrid?.classList.add('hidden');
  el.wizardDeptStep?.classList.add('hidden');
  el.wizardOptions.innerHTML = '';

  const selected = (id) => (step.multi ? wizard.goalIds.has(id) : wizard.levelId === id);

  step.options().forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-card';
    button.classList.toggle('is-selected', selected(option.id));
    button.setAttribute('aria-pressed', String(selected(option.id)));
    button.innerHTML = `
      <span class="option-icon" aria-hidden="true">${option.icon}</span>
      <span class="option-body">
        <span class="option-label">${esc(option.label)}</span>
        ${option.hint ? `<span class="option-hint">${esc(option.hint)}</span>` : ''}
      </span>
      <span class="option-check" aria-hidden="true">✓</span>
    `;
    button.onclick = () => {
      if (step.multi) {
        wizard.goalIds.has(option.id)
          ? wizard.goalIds.delete(option.id)
          : wizard.goalIds.add(option.id);
        render();
        return;
      }
      wizard.levelId = option.id;
      // Tek seçimli adımlarda seçim doğrudan ilerletir: test kısa hissettirir.
      render();
      next();
    };
    el.wizardOptions.appendChild(button);
  });
}

// ------------------------------------------------------------------
// Bölüm adımı
// ------------------------------------------------------------------

function renderGroups() {
  if (!el.wizardGroups) return;
  el.wizardGroups.innerHTML = getGroups()
    .map(
      (group) =>
        `<button type="button" class="dept-group${
          wizard.groupId === group.id ? ' is-active' : ''
        }" data-group="${esc(group.id)}">
          <span aria-hidden="true">${group.icon}</span> ${esc(group.tr)}
        </button>`
    )
    .join('');
}

function renderPresets() {
  if (!el.wizardPresets) return;

  const presets = wizard.groupId ? getPresetsOfGroup(wizard.groupId) : [];
  if (presets.length === 0) {
    el.wizardPresets.innerHTML = '<p class="app-message">Yukarıdan bir grup seç.</p>';
    return;
  }

  el.wizardPresets.innerHTML = presets
    .map((preset) => {
      const active = wizard.presetId === preset.id;
      // Rozet olarak yalnız bilgi alanları: kullanıcı "bu bölüm neyi kapsıyor"
      // sorusunun cevabını görsün, on bir etiketin listesini değil.
      const doms = preset.tags
        .filter((tag) => tag.startsWith('dom:'))
        .map((tag) => `<span class="dept-tag">${esc(tagLabel(tag))}</span>`)
        .join('');
      return `
        <button type="button" class="dept-item${active ? ' is-selected' : ''}"
                data-preset="${esc(preset.id)}" aria-pressed="${active}">
          <span class="dept-item-name">${esc(preset.tr)}</span>
          <span class="dept-item-tags">${doms || '<span class="dept-tag">Genel</span>'}</span>
          <span class="option-check" aria-hidden="true">✓</span>
        </button>`;
    })
    .join('');
}

/** İnce ayar: seçili etiketler eksende gruplanmış hâlde açılıp kapanır. */
function renderTune() {
  if (!el.wizardTuneToggle || !el.wizardTune) return;

  const hasPreset = Boolean(wizard.presetId);
  el.wizardTuneToggle.classList.toggle('hidden', !hasPreset);
  el.wizardTune.classList.toggle('hidden', !hasPreset || !wizard.tuneOpen);
  el.wizardTuneToggle.setAttribute('aria-expanded', String(wizard.tuneOpen));
  if (el.wizardTuneCount) el.wizardTuneCount.textContent = `${wizard.tags.size} etiket`;

  // Panel kapalıyken içerik de temizlenir: erken dönülürse kapalı panelde eski
  // çipler kalır ve "kapalı ama dolu" gibi kafa karıştırıcı bir durum oluşur.
  if (!hasPreset || !wizard.tuneOpen) {
    el.wizardTune.innerHTML = '';
    return;
  }

  // `type:` ekseni kullanıcıya gösterilmiyor: kelime tipi bir tercih değil,
  // kartın yapısal özelliği. Seçtirmek kullanıcıya anlamsız bir soru sormak olur.
  el.wizardTune.innerHTML = getAxes()
    .filter((axis) => axis.id !== 'type')
    .map((axis) => {
      const chips = getTagsOfAxis(axis.id)
        .map(
          (tag) =>
            `<button type="button" class="option-chip${
              wizard.tags.has(tag.id) ? ' is-active' : ''
            }" data-tag="${esc(tag.id)}" title="${esc(tag.aciklama)}">${esc(tag.tr)}</button>`
        )
        .join('');
      return `
        <div class="dept-tune-axis">
          <div class="setup-label">${esc(axis.tr)}</div>
          <div class="option-chips">${chips}</div>
        </div>`;
    })
    .join('');
}

function renderDept() {
  el.wizardOptions?.classList.add('hidden');
  el.interestGrid?.classList.add('hidden');
  el.wizardDeptStep?.classList.remove('hidden');

  renderGroups();
  renderPresets();
  renderTune();
}

/** Bölüm seçilince etiketler o demetten gelir; kullanıcı sonra düzenleyebilir. */
function selectPreset(presetId) {
  const preset = getPreset(presetId);
  if (!preset) return;
  wizard.presetId = presetId;
  wizard.tags = new Set(preset.tags);
  renderDept();
  renderFooter();
}

// ------------------------------------------------------------------
// Alan seçimi
// ------------------------------------------------------------------

function renderFields() {
  if (!el.interestGrid) return;
  el.wizardOptions?.classList.add('hidden');
  el.wizardDeptStep?.classList.add('hidden');
  el.interestGrid.classList.remove('hidden');

  wizard.recommended = getRecommendedFields({
    presetId: wizard.presetId,
    profileId: getProfile().profileId,
    goalIds: [...wizard.goalIds],
  });

  // Önerileri yalnızca bir kez uygula; kullanıcı sonra kaldırabilsin.
  if (!wizard.seeded) {
    wizard.recommended.forEach((id) => wizard.selection.add(id));
    wizard.seeded = true;
  }

  // Önerilen alanlar öneri sırasıyla listenin başında dursun.
  const rank = (id) => {
    const index = wizard.recommended.indexOf(id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  const fields = [...getFields()].sort((a, b) => rank(a.id) - rank(b.id));

  el.interestGrid.innerHTML = '';
  fields.forEach((field) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'field-tile';
    tile.style.setProperty('--tile-color', field.color);
    tile.setAttribute('aria-pressed', String(wizard.selection.has(field.id)));
    tile.classList.toggle('is-selected', wizard.selection.has(field.id));

    tile.innerHTML = `
      <span class="field-tile-check" aria-hidden="true">✓</span>
      ${wizard.recommended.includes(field.id) ? '<span class="field-tile-tag">önerilen</span>' : ''}
      <span class="field-tile-icon" aria-hidden="true">${field.icon}</span>
      <span class="field-tile-name">${esc(field.name)}</span>
      <span class="field-tile-count">${field.wordCount} kelime</span>
    `;
    tile.onclick = () => {
      wizard.selection.has(field.id)
        ? wizard.selection.delete(field.id)
        : wizard.selection.add(field.id);
      render();
    };
    el.interestGrid.appendChild(tile);
  });
}

// ------------------------------------------------------------------
// Kabuk
// ------------------------------------------------------------------

function renderFooter() {
  const name = stepName();
  const isFields = name === 'fields';
  const enough = wizard.selection.size >= GAMIFICATION.minInterests;

  if (el.interestCount) {
    if (isFields) {
      el.interestCount.textContent = enough
        ? `${wizard.selection.size} alan seçildi`
        : 'En az bir alan seç';
    } else if (name === 'goal') {
      el.interestCount.textContent = wizard.goalIds.size > 0 ? '' : 'Dilersen boş bırakabilirsin';
    } else if (name === 'dept') {
      el.interestCount.textContent = wizard.presetId ? '' : 'Bölümünü seç';
    } else {
      el.interestCount.textContent = '';
    }
  }

  if (el.interestSaveBtn) {
    el.interestSaveBtn.textContent = isFields ? 'Hazırım' : 'Devam';
    // Bölüm adımı kendiliğinden ilerlemiyor: kullanıcı isterse ince ayar yapsın.
    el.interestSaveBtn.disabled =
      (isFields && !enough) || (name === 'dept' && !wizard.presetId);
  }
  if (el.wizardBackBtn) {
    el.wizardBackBtn.classList.toggle('hidden', wizard.index === 0);
  }
}

function render() {
  const name = stepName();
  const step = STEPS[name];

  if (el.wizardTitle) {
    el.wizardTitle.textContent = step
      ? step.title
      : name === 'dept'
        ? 'Ne okuyorsun?'
        : 'Hangi alanlarda çalışacaksın?';
  }
  if (el.wizardSub) {
    el.wizardSub.textContent = step
      ? step.sub
      : name === 'dept'
        ? 'Bölümüne göre hangi kelimelerin öne çıkacağını ayarlayalım.'
        : 'Önerdiklerimizi değiştirebilir, istediğin zaman yenilerini ekleyebilirsin.';
  }

  renderProgress();
  if (step) renderOptions(step);
  else if (name === 'dept') renderDept();
  else renderFields();
  renderFooter();
}

function next() {
  if (wizard.index < wizard.steps.length - 1) {
    wizard.index += 1;
    render();
    window.scrollTo(0, 0);
    return;
  }
  finish();
}

function back() {
  if (wizard.index === 0) return;
  wizard.index -= 1;
  render();
}

function finish() {
  if (wizard.selection.size < GAMIFICATION.minInterests) return;

  if (wizard.steps.includes('dept')) {
    setProfile({
      presetId: wizard.presetId,
      levelId: wizard.levelId,
      goalIds: [...wizard.goalIds],
    });

    // Amaç seçimleri kullanım ortamını ağırlıklandırır: bölüm "hangi alan",
    // amaç "hangi ortam" der. İkisi birleşip etiket sorgusunu oluşturur.
    const tags = new Set(wizard.tags);
    getGoalContexts([...wizard.goalIds]).forEach((tag) => tags.add(tag));
    setTagQuery({ presetId: wizard.presetId, tags: [...tags] });
  }

  setInterests([...wizard.selection]);
  wizard.onDone?.();
}

/**
 * Testi ya da alan seçimini açar.
 * @param {() => void} done kaydedildiğinde çağrılır
 * @param {{ mode?: 'quiz'|'fields' }} [options]
 */
export function openOnboarding(done, { mode = 'quiz' } = {}) {
  const saved = getProfile();

  wizard.onDone = done;
  wizard.steps = mode === 'quiz' ? ['dept', 'level', 'goal', 'fields'] : ['fields'];
  wizard.index = 0;
  wizard.presetId = saved.presetId;
  // İlk açılışta hiçbir grup seçili olmasa liste boş görünür ve kullanıcı önce
  // bir çipe basması gerektiğini anlamayabilir. İlk grup açık gelsin.
  wizard.groupId =
    (saved.presetId ? getPreset(saved.presetId)?.grup : null) ?? getGroups()[0]?.id ?? null;
  wizard.tags = new Set(getSelectedTags());
  wizard.tuneOpen = false;
  wizard.levelId = saved.levelId;
  wizard.goalIds = new Set(saved.goalIds);
  wizard.selection = new Set(getInterests());
  // Alan seçimine doğrudan girildiyse öneri uygulanmaz; mevcut seçim korunur.
  wizard.seeded = mode !== 'quiz';

  render();
  showScreen('onboarding');
}

export function bindOnboarding() {
  if (el.interestSaveBtn) {
    el.interestSaveBtn.onclick = () => {
      if (stepName() === 'fields') finish();
      else next();
    };
  }
  if (el.wizardBackBtn) el.wizardBackBtn.onclick = back;

  if (el.wizardGroups) {
    el.wizardGroups.onclick = (event) => {
      const button = event.target.closest('[data-group]');
      if (!button) return;
      wizard.groupId = button.dataset.group;
      renderDept();
    };
  }

  if (el.wizardPresets) {
    el.wizardPresets.onclick = (event) => {
      const button = event.target.closest('[data-preset]');
      if (button) selectPreset(button.dataset.preset);
    };
  }

  if (el.wizardTuneToggle) {
    el.wizardTuneToggle.onclick = () => {
      wizard.tuneOpen = !wizard.tuneOpen;
      renderTune();
    };
  }

  if (el.wizardTune) {
    el.wizardTune.onclick = (event) => {
      const button = event.target.closest('[data-tag]');
      if (!button) return;
      const tag = button.dataset.tag;
      wizard.tags.has(tag) ? wizard.tags.delete(tag) : wizard.tags.add(tag);
      renderTune();
    };
  }
}
