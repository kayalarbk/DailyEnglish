// Kartlar ekranı: flashcard gösterimi ve kontrolleri.

import { el, $ } from '../dom.js';
import { findCategory, getFieldMeta } from '../data/repository.js';
import { state } from '../state.js';
import { isLearned, toggleLearned } from '../store/progress.js';
import { recordWordLearned } from '../store/stats.js';
import { shuffleArray, speak } from '../utils.js';
import { renderHeader } from '../ui/header.js';
import { toast } from '../ui/toast.js';
import { showScreen } from './navigation.js';

/** Geçerli filtreye göre gösterilecek kartlar. */
function visibleCards() {
  if (!state.onlyUnlearned) return state.deck;
  return state.deck.filter((card) => !isLearned(state.categoryName, card));
}

function renderEmptyState() {
  if (!el.deck) return;
  el.deck.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-emoji" aria-hidden="true">🏆</div>
      <div class="empty-state-title">Bu bölümü bitirdin!</div>
      <p class="empty-state-text">
        Filtreyi kapatıp tekrar göz atabilir ya da quiz ile pekiştirebilirsin.
      </p>
    </div>
  `;
  if (el.counter) el.counter.textContent = '0 / 0';
  if (el.deckFill) el.deckFill.style.width = '100%';
  if (el.prevBtn) el.prevBtn.disabled = true;
  if (el.nextBtn) el.nextBtn.disabled = true;
}

function handleLearnClick(card) {
  const nowLearned = toggleLearned(state.categoryName, card);

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
  const learned = isLearned(state.categoryName, card);
  const color = findCategory(state.fieldId, state.categoryName)?.color
    || getFieldMeta(state.fieldId)?.color
    || '';

  el.deck.innerHTML = `
    <div class="card-inner" id="cardInner" role="button" tabindex="0"
         aria-label="Kartı çevir">
      <div class="face face-front" style="--card-color:${color}">
        <span class="card-tag">${state.categoryName}</span>
        ${learned ? '<span class="card-badge">✓ Öğrenildi</span>' : ''}
        <div class="word-en">${card.en}</div>
        <p class="sentence-en">${card.enS}</p>
        <button class="speak-btn" id="speakBtn" type="button">🔊 Dinle</button>
        <span class="card-hint">dokun ve çevir</span>
      </div>
      <div class="face face-back" style="--card-color:${color}">
        <span class="card-tag">Türkçe</span>
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

/** Kartı ve araç çubuğunu birlikte çizer. */
export function renderCards() {
  if (el.cardsTitle) el.cardsTitle.textContent = state.categoryName || '';
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
