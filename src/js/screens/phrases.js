// Günlük Kalıplar: kategori ızgarası → kalıp listesi (kart içinde açılan detay).
//
// Kalıplar kelime kartlarından ayrı bir modüldür: burada deste, quiz ve tekrar
// kuyruğu yok. Amaç bir kalıbı bulmak, doğru ortamda kullanılıp kullanılmadığını
// görmek, sesletmek ve işaretlemek.

import { el } from '../dom.js';
import { PHRASE_RESULT_LIMIT, REGISTERS } from '../config.js';
import {
  getAllLoadedPhrases,
  getLoadedPhrases,
  getPhraseCategories,
  getPhraseCategoryMeta,
  getPhrasesByIds,
  loadAllPhrases,
  loadPhraseCategory,
  loadPhraseManifest,
  totalPhraseCount,
} from '../data/phrase-repository.js';
import { state } from '../state.js';
import {
  countFavorites,
  countLearned,
  countLearnedIn,
  getFavoriteIds,
  getLearnedIds,
  isFavorite,
  isLearned,
  toggleFavorite,
  toggleLearned,
} from '../store/phrases.js';
import { foldForSearch, speak } from '../utils.js';
import { toast } from '../ui/toast.js';
import { showScreen } from './navigation.js';

/** Manifest yalnız bir kez indirilir; ekran her açılışta yeniden denemez. */
let manifestReady = false;

const REGISTER_FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'formal', label: REGISTERS.formal.label },
  { id: 'neutral', label: REGISTERS.neutral.label },
  { id: 'informal', label: REGISTERS.informal.label },
];

/** innerHTML'e giren kullanıcı/veri metni için kaçış. */
function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==================================================================
// Kalıplar ana ekranı (kategori ızgarası)
// ==================================================================

function categoryTile(meta) {
  const learned = countLearnedIn(getLoadedPhrases(meta.id));
  const total = meta.count || 0;
  const pct = total ? Math.round((learned / total) * 100) : 0;

  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'phrase-tile';
  tile.style.setProperty('--row-color', meta.color);
  tile.innerHTML = `
    <span class="phrase-tile-icon" aria-hidden="true">${esc(meta.icon)}</span>
    <span class="phrase-tile-name">${esc(meta.name)}</span>
    <span class="phrase-tile-desc">${esc(meta.description)}</span>
    <span class="phrase-tile-meta">
      <span class="progress-track"><span class="progress-fill" style="width:${pct}%"></span></span>
      <span class="phrase-tile-count">${learned}/${total}</span>
    </span>
  `;
  tile.setAttribute('aria-label', `${meta.name}, ${total} kalıp, ${learned} tanesi öğrenildi`);
  tile.onclick = () => openPhraseCategory(meta.id);
  return tile;
}

/** Favoriler / öğrenilenler kısayolları. Boşken de görünür ama devre dışıdır. */
function renderCollectionChips() {
  if (!el.phraseCollections) return;

  const favorites = countFavorites();
  const learned = countLearned();

  el.phraseCollections.innerHTML = `
    <button type="button" class="chip" data-collection="favorites" ${favorites ? '' : 'disabled'}>
      ⭐ Favorilerim <span class="chip-count">${favorites}</span>
    </button>
    <button type="button" class="chip" data-collection="learned" ${learned ? '' : 'disabled'}>
      ✓ Öğrendiklerim <span class="chip-count">${learned}</span>
    </button>
  `;
}

function renderPhraseHome() {
  const categories = getPhraseCategories();

  if (el.phraseHomeSub) {
    const total = totalPhraseCount();
    const learned = countLearned();
    el.phraseHomeSub.textContent = learned
      ? `${total} kalıp · ${learned} tanesini öğrendin.`
      : `${total} gerçek hayat kalıbı. Bir kategori seç ya da ara.`;
  }

  renderCollectionChips();

  if (el.phraseCategoryGrid) {
    el.phraseCategoryGrid.innerHTML = '';
    categories.forEach((meta) => el.phraseCategoryGrid.appendChild(categoryTile(meta)));
  }
}

/** Kalıplar sekmesi. Manifest ilk açılışta indirilir. */
export async function openPhrases() {
  showScreen('phrases');

  if (manifestReady) {
    renderPhraseHome();
    return;
  }

  if (el.phraseCategoryGrid) {
    el.phraseCategoryGrid.innerHTML = '<p class="app-message">Yükleniyor…</p>';
  }

  try {
    await loadPhraseManifest();
    manifestReady = true;
    renderPhraseHome();
  } catch (error) {
    console.error(error);
    if (el.phraseCategoryGrid) {
      el.phraseCategoryGrid.innerHTML = '<p class="app-message">Kalıplar yüklenemedi.</p>';
    }
    toast('Kalıplar yüklenemedi', '⚠️');
  }
}

/** Kalıp listesinden ana ekrana dönüş (işaretler güncellensin diye yeniden çizer). */
export function backToPhrases() {
  renderPhraseHome();
  showScreen('phrases');
}

// ==================================================================
// Kalıp listesi
// ==================================================================

/** Geçerli moda göre kaynak liste. */
function sourcePhrases() {
  if (state.phraseMode === 'category') return getLoadedPhrases(state.phraseCategoryId);
  if (state.phraseMode === 'favorites') return getPhrasesByIds(getFavoriteIds());
  if (state.phraseMode === 'learned') return getPhrasesByIds(getLearnedIds());
  return getAllLoadedPhrases();
}

/** Listenin başlığı ve açıklaması. */
function listHeading() {
  if (state.phraseMode === 'favorites') {
    return { icon: '⭐', name: 'Favorilerim', desc: 'Yıldızladığın kalıplar.', color: 'var(--xp)' };
  }
  if (state.phraseMode === 'learned') {
    return { icon: '✓', name: 'Öğrendiklerim', desc: 'Öğrendim dediğin kalıplar.', color: 'var(--correct)' };
  }
  if (state.phraseMode === 'search') {
    return { icon: '🔍', name: 'Arama', desc: 'Tüm kategorilerde ara.', color: 'var(--brand)' };
  }
  const meta = getPhraseCategoryMeta(state.phraseCategoryId);
  return meta
    ? { icon: meta.icon, name: meta.name, desc: meta.description, color: meta.color }
    : { icon: '💬', name: 'Kalıplar', desc: '', color: 'var(--brand)' };
}

function matchesQuery(phrase, folded) {
  if (!folded) return true;
  const haystack = foldForSearch(
    `${phrase.en} ${phrase.tr} ${phrase.literal || ''} ${phrase.usage} ${(phrase.tags || []).join(' ')}`
  );
  return haystack.includes(folded);
}

function visiblePhrases() {
  const folded = foldForSearch(state.phraseQuery);
  return sourcePhrases().filter(
    (phrase) =>
      (state.phraseRegister === 'all' || phrase.register === state.phraseRegister) &&
      matchesQuery(phrase, folded)
  );
}

function phraseCardHtml(phrase) {
  const register = REGISTERS[phrase.register] || REGISTERS.neutral;
  const favorite = isFavorite(phrase.id);
  const learned = isLearned(phrase.id);
  const tags = (phrase.tags || [])
    .map((tag) => `<span class="phrase-tag">${esc(tag)}</span>`)
    .join('');

  return `
    <article class="phrase-card${learned ? ' is-learned' : ''}" data-id="${esc(phrase.id)}">
      <button type="button" class="phrase-card-main" data-action="expand"
              aria-expanded="false">
        <span class="phrase-card-top">
          <span class="register-badge register-${esc(phrase.register)}">${esc(register.label)}</span>
          ${learned ? '<span class="phrase-done" aria-hidden="true">✓</span>' : ''}
        </span>
        <span class="phrase-en">${esc(phrase.en)}</span>
        <span class="phrase-tr">${esc(phrase.tr)}</span>
        <span class="phrase-tr-veil">Türkçesini görmek için dokun</span>
      </button>

      <div class="phrase-detail" hidden>
        ${
          phrase.literal
            ? `<p class="phrase-literal"><span class="phrase-label">Birebir</span>${esc(phrase.literal)}</p>`
            : ''
        }
        <p class="phrase-usage">${esc(phrase.usage)}</p>
        <p class="phrase-example">${esc(phrase.example)}</p>
        ${tags ? `<div class="phrase-tags">${tags}</div>` : ''}
      </div>

      <div class="phrase-actions">
        <button type="button" class="phrase-btn" data-action="speak" aria-label="Seslendir">
          🔊 <span>Dinle</span>
        </button>
        <button type="button" class="phrase-btn" data-action="tr" aria-label="Türkçesini göster veya gizle">
          🇹🇷 <span>Türkçe</span>
        </button>
        <button type="button" class="phrase-btn${favorite ? ' is-on' : ''}" data-action="fav"
                aria-pressed="${favorite}" aria-label="Favorilere ekle">
          ${favorite ? '★' : '☆'} <span>Favori</span>
        </button>
        <button type="button" class="phrase-btn${learned ? ' is-on' : ''}" data-action="learn"
                aria-pressed="${learned}" aria-label="Öğrendim olarak işaretle">
          ✓ <span>${learned ? 'Öğrendim' : 'Öğrendim mi?'}</span>
        </button>
      </div>
    </article>
  `;
}

function renderRegisterFilter() {
  if (!el.phraseRegisterFilter) return;
  el.phraseRegisterFilter.innerHTML = REGISTER_FILTERS.map(
    (filter) =>
      `<button type="button" class="chip${
        state.phraseRegister === filter.id ? ' is-active' : ''
      }" data-register="${filter.id}">${filter.label}</button>`
  ).join('');
}

function renderPhraseList() {
  const heading = listHeading();
  const all = sourcePhrases();
  const visible = visiblePhrases();

  if (el.phraseListIcon) el.phraseListIcon.textContent = heading.icon;
  if (el.phraseListName) el.phraseListName.textContent = heading.name;
  if (el.phraseListDesc) el.phraseListDesc.textContent = heading.desc;
  if (el.phraseListHero) el.phraseListHero.style.setProperty('--hero-color', heading.color);

  if (el.phraseListStat) {
    const learned = countLearnedIn(all);
    el.phraseListStat.textContent = all.length
      ? `${visible.length} / ${all.length} kalıp · ${learned} öğrenildi`
      : '';
  }

  renderRegisterFilter();

  if (!el.phraseList) return;

  el.phraseList.classList.toggle('is-tr-hidden', !state.phraseShowTr);

  if (visible.length === 0) {
    el.phraseList.innerHTML = `<p class="app-message">${
      all.length === 0 ? 'Burada henüz kalıp yok.' : 'Aramanla eşleşen kalıp bulunamadı.'
    }</p>`;
    return;
  }

  const shown = visible.slice(0, PHRASE_RESULT_LIMIT);
  el.phraseList.innerHTML =
    shown.map(phraseCardHtml).join('') +
    (visible.length > shown.length
      ? `<p class="app-message">${visible.length - shown.length} sonuç daha var — aramayı daralt.</p>`
      : '');
}

/** Türkçe göster/gizle düğmesinin metnini durumla eşitler. */
function renderTrToggle() {
  if (!el.phraseTrToggle) return;
  el.phraseTrToggle.textContent = state.phraseShowTr ? '🇹🇷 Türkçe açık' : '🇹🇷 Türkçe gizli';
  el.phraseTrToggle.classList.toggle('is-active', !state.phraseShowTr);
  el.phraseTrToggle.setAttribute('aria-pressed', String(!state.phraseShowTr));
}

/** Liste ekranını açar; gereken veriyi indirir. */
async function openList(mode, categoryId = null) {
  state.phraseMode = mode;
  state.phraseCategoryId = categoryId;
  state.phraseQuery = '';
  state.phraseRegister = 'all';

  if (el.phraseSearchInput) el.phraseSearchInput.value = '';
  if (el.phraseList) el.phraseList.innerHTML = '<p class="app-message">Yükleniyor…</p>';
  renderTrToggle();
  showScreen('phrase-list');

  try {
    if (mode === 'category') await loadPhraseCategory(categoryId);
    else await loadAllPhrases();
    renderPhraseList();
  } catch (error) {
    console.error(error);
    if (el.phraseList) el.phraseList.innerHTML = '<p class="app-message">Kalıplar yüklenemedi.</p>';
    toast('Kalıplar yüklenemedi', '⚠️');
  }
}

export function openPhraseCategory(categoryId) {
  return openList('category', categoryId);
}

/** @param {'favorites'|'learned'|'search'} mode */
export function openPhraseCollection(mode) {
  return openList(mode);
}

// ==================================================================
// Etkileşim
// ==================================================================

/** Kart içi düğmeler: liste yeniden çizilmeden tek kart güncellenir. */
function handleListClick(event) {
  const actionBtn = event.target.closest('[data-action]');
  if (!actionBtn) return;

  const card = actionBtn.closest('.phrase-card');
  if (!card) return;

  const phraseId = card.dataset.id;
  const phrase = sourcePhrases().find((item) => item.id === phraseId);
  if (!phrase) return;

  switch (actionBtn.dataset.action) {
    case 'expand': {
      const detail = card.querySelector('.phrase-detail');
      const open = card.classList.toggle('is-open');
      if (detail) detail.hidden = !open;
      actionBtn.setAttribute('aria-expanded', String(open));
      // Türkçe gizliyken karta dokunmak önce karşılığı açar: hatırlamayı dener,
      // sonra kontrol eder.
      if (!state.phraseShowTr) card.classList.add('is-tr-shown');
      break;
    }

    case 'speak':
      speak(phrase.en);
      break;

    case 'tr':
      card.classList.toggle('is-tr-shown');
      break;

    case 'fav': {
      const on = toggleFavorite(phraseId);
      actionBtn.classList.toggle('is-on', on);
      actionBtn.setAttribute('aria-pressed', String(on));
      actionBtn.firstChild.textContent = on ? '★ ' : '☆ ';
      if (state.phraseMode === 'favorites' && !on) renderPhraseList();
      break;
    }

    case 'learn': {
      const on = toggleLearned(phraseId);
      card.classList.toggle('is-learned', on);
      actionBtn.classList.toggle('is-on', on);
      actionBtn.setAttribute('aria-pressed', String(on));
      const label = actionBtn.querySelector('span');
      if (label) label.textContent = on ? 'Öğrendim' : 'Öğrendim mi?';
      if (state.phraseMode === 'learned' && !on) renderPhraseList();
      else if (el.phraseListStat) {
        const all = sourcePhrases();
        el.phraseListStat.textContent =
          `${visiblePhrases().length} / ${all.length} kalıp · ${countLearnedIn(all)} öğrenildi`;
      }
      break;
    }

    default:
      break;
  }
}

export function bindPhrases() {
  if (el.phraseCollections) {
    el.phraseCollections.onclick = (event) => {
      const button = event.target.closest('[data-collection]');
      if (button && !button.disabled) openPhraseCollection(button.dataset.collection);
    };
  }

  if (el.phraseHomeSearchBtn) {
    el.phraseHomeSearchBtn.onclick = () => openPhraseCollection('search');
  }

  if (el.phraseSearchInput) {
    el.phraseSearchInput.oninput = () => {
      state.phraseQuery = el.phraseSearchInput.value;
      renderPhraseList();
    };
    // Formsuz alanda Enter'ın sayfayı yenilemesini engelle.
    el.phraseSearchInput.onkeydown = (event) => {
      if (event.key === 'Enter') event.preventDefault();
    };
  }

  if (el.phraseRegisterFilter) {
    el.phraseRegisterFilter.onclick = (event) => {
      const button = event.target.closest('[data-register]');
      if (!button) return;
      state.phraseRegister = button.dataset.register;
      renderPhraseList();
    };
  }

  if (el.phraseTrToggle) {
    el.phraseTrToggle.onclick = () => {
      state.phraseShowTr = !state.phraseShowTr;
      renderTrToggle();
      renderPhraseList();
    };
  }

  if (el.phraseList) el.phraseList.onclick = handleListClick;
}
