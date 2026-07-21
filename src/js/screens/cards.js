// Kartlar ekranı: flashcard gösterimi ve kontrolleri.

import { el, $ } from '../dom.js';
import { LEVELS } from '../config.js';
import { cardLevel, findCategory, getFieldMeta, levelCounts } from '../data/repository.js';
import { state } from '../state.js';
import { isLearned, toggleLearned } from '../store/progress.js';
import { recordWordLearned } from '../store/stats.js';
import { shuffleArray, speak } from '../utils.js';
import { renderHeader } from '../ui/header.js';
import { toast } from '../ui/toast.js';
import { showScreen } from './navigation.js';

/** Geçerli filtrelere (seviye + öğrenilme durumu) göre gösterilecek kartlar. */
export function visibleCards() {
  return state.deck.filter((card) => {
    if (state.level !== 'all' && cardLevel(card) !== state.level) return false;
    if (state.onlyUnlearned && isLearned(card)) return false;
    return true;
  });
}

function renderEmptyState() {
  if (!el.deck) return;

  // Seviye filtresi yüzünden boşsa "bitirdin" demek yanıltıcı olur.
  const levelOnly = state.level !== 'all' && !state.onlyUnlearned;
  const emoji = levelOnly ? '🔍' : '🏆';
  const title = levelOnly ? `${state.level} kartı kalmadı` : 'Bu bölümü bitirdin!';
  const text = levelOnly
    ? 'Bu seviyede gösterilecek kart yok. Başka bir seviye seçebilirsin.'
    : 'Filtreleri kapatıp tekrar göz atabilir ya da quiz ile pekiştirebilirsin.';

  el.deck.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-emoji" aria-hidden="true">${emoji}</div>
      <div class="empty-state-title">${title}</div>
      <p class="empty-state-text">${text}</p>
    </div>
  `;
  if (el.counter) el.counter.textContent = '0 / 0';
  if (el.deckFill) el.deckFill.style.width = '100%';
  if (el.prevBtn) el.prevBtn.disabled = true;
  if (el.nextBtn) el.nextBtn.disabled = true;
}

function handleLearnClick(card) {
  const nowLearned = toggleLearned(card);

  if (nowLearned) {
    const { goalJustReached, streakIncreased } = recordWordLearned();
    toast('+10 puan', '⭐');
    if (streakIncreased) toast('Seri sürüyor!', '🔥');
    if (goalJustReached) toast('Günlük hedef tamam!', '🎯');
  }

  renderHeader();
  renderCards();
}

function renderCard() {
  if (!el.deck) return;

  const cards = visibleCards();
  if (cards.length === 0) {
    renderEmptyState();
    return;
  }

  state.cardIndex = Math.min(Math.max(state.cardIndex, 0), cards.length - 1);

  const card = cards[state.cardIndex];
  const learned = isLearned(card);
  const level = cardLevel(card);
  const color = findCategory(state.fieldId, state.categoryName)?.color
    || getFieldMeta(state.fieldId)?.color
    || '';

  el.deck.innerHTML = `
    <div class="card-inner" id="cardInner" role="button" tabindex="0"
         aria-label="Kartı çevir">
      <div class="face face-front" style="--card-color:${color}">
        <span class="card-tag">${state.categoryName}</span>
        <span class="card-badges">
          <span class="level-badge level-${level.toLowerCase()}">${level}</span>
          ${learned ? '<span class="card-badge">✓ Öğrenildi</span>' : ''}
        </span>
        <div class="word-en">${card.en}</div>
        <p class="sentence-en">${card.enS}</p>
        <button class="speak-btn" id="speakBtn" type="button">🔊 Dinle</button>
        <span class="card-hint">dokun ve çevir</span>
      </div>
      <div class="face face-back" style="--card-color:${color}">
        <span class="card-tag">Türkçe</span>
        <span class="card-badges">
          <span class="level-badge level-${level.toLowerCase()}">${level}</span>
        </span>
        <div class="word-tr">${card.tr}</div>
        <p class="sentence-tr">${card.trS}</p>
        <button class="learn-btn ${learned ? 'is-learned' : ''}" id="learnBtn" type="button">
          ${learned ? '✓ Öğrenildi' : 'Öğrendim'}
        </button>
      </div>
    </div>
  `;

  const inner = $('cardInner');
  if (!inner) return;
  if (state.flipped) inner.classList.add('is-flipped');

  const flip = () => {
    state.flipped = !state.flipped;
    inner.classList.toggle('is-flipped');
  };

  inner.onclick = (event) => {
    if (event.target.closest('button')) return;
    flip();
  };
  inner.onkeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      flip();
    }
  };

  const speakBtn = $('speakBtn');
  if (speakBtn) {
    speakBtn.onclick = (event) => {
      event.stopPropagation();
      speak(`${card.en}. ${card.enS}`);
    };
  }

  const learnBtn = $('learnBtn');
  if (learnBtn) {
    learnBtn.onclick = (event) => {
      event.stopPropagation();
      handleLearnClick(card);
    };
  }

  if (el.counter) el.counter.textContent = `${state.cardIndex + 1} / ${cards.length}`;
  if (el.deckFill) {
    el.deckFill.style.width = `${Math.round(((state.cardIndex + 1) / cards.length) * 100)}%`;
  }
  if (el.prevBtn) el.prevBtn.disabled = state.cardIndex === 0;
  if (el.nextBtn) el.nextBtn.disabled = state.cardIndex === cards.length - 1;
}

/**
 * Seviye filtresi butonlarını çizer.
 * Yalnızca destede gerçekten bulunan seviyeler gösterilir; tek seviye varsa
 * filtre satırı tamamen gizlenir.
 */
function renderLevelFilter() {
  if (!el.levelFilter) return;

  const counts = levelCounts(state.deck);
  const present = LEVELS.filter((level) => counts[level] > 0);

  el.levelFilter.classList.toggle('hidden', present.length < 2);
  if (present.length < 2) {
    if (state.level !== 'all') state.level = 'all';
    return;
  }

  // Filtrelenen seviye destede yoksa (kategori değişimi) filtreyi sıfırla.
  if (state.level !== 'all' && !present.includes(state.level)) state.level = 'all';

  const options = [{ value: 'all', label: 'Tümü', count: state.deck.length }].concat(
    present.map((level) => ({ value: level, label: level, count: counts[level] }))
  );

  el.levelFilter.innerHTML = '';
  options.forEach(({ value, label, count }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'level-chip';
    btn.dataset.level = value;
    if (value !== 'all') btn.classList.add(`level-${value.toLowerCase()}`);
    btn.classList.toggle('is-active', state.level === value);
    btn.setAttribute('aria-pressed', String(state.level === value));
    btn.innerHTML = `${label}<span class="level-chip-count">${count}</span>`;
    btn.onclick = () => {
      state.level = value;
      state.cardIndex = 0;
      state.flipped = false;
      renderCards();
    };
    el.levelFilter.appendChild(btn);
  });
}

/** Kartı ve araç çubuğunu birlikte çizer. */
export function renderCards() {
  if (el.cardsTitle) el.cardsTitle.textContent = state.categoryName || '';
  renderLevelFilter();
  if (el.filterBtn) {
    el.filterBtn.classList.toggle('is-active', state.onlyUnlearned);
    el.filterBtn.textContent = state.onlyUnlearned
      ? 'Tümünü göster'
      : 'Sadece öğrenilmeyenler';
  }
  renderCard();
}

/**
 * Bir kategoriyi açar. Alan verisi bu noktada yüklenmiş olmalıdır.
 * @param {string} fieldId
 * @param {string} categoryName
 */
export function openCategory(fieldId, categoryName) {
  const category = findCategory(fieldId, categoryName);
  if (!category) return;

  state.fieldId = fieldId;
  state.categoryName = categoryName;
  state.deck = [...category.cards];
  state.cardIndex = 0;
  state.flipped = false;
  state.onlyUnlearned = false;
  state.level = 'all';

  renderCards();
  showScreen('cards');
}

function step(delta) {
  const cards = visibleCards();
  const next = state.cardIndex + delta;
  if (next < 0 || next >= cards.length) return;
  state.cardIndex = next;
  state.flipped = false;
  renderCard();
}

export function bindCardControls() {
  if (el.prevBtn) el.prevBtn.onclick = () => step(-1);
  if (el.nextBtn) el.nextBtn.onclick = () => step(1);

  if (el.shuffleBtn) {
    el.shuffleBtn.onclick = () => {
      shuffleArray(state.deck);
      state.cardIndex = 0;
      state.flipped = false;
      renderCards();
      toast('Deste karıştırıldı', '🔀');
    };
  }

  if (el.filterBtn) {
    el.filterBtn.onclick = () => {
      state.onlyUnlearned = !state.onlyUnlearned;
      state.cardIndex = 0;
      state.flipped = false;
      renderCards();
    };
  }

  // Klavye ile gezinme
  document.addEventListener('keydown', (event) => {
    if (el.cardsScreen?.classList.contains('hidden')) return;
    if (event.target.matches('input, select, textarea')) return;
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
}
