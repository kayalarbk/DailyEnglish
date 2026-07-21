// Quiz ekranı.
// İki soru tipi: 'blank' (boşluk doldurma) ve 'meaning' (Türkçe anlamdan
// İngilizce kelime seçme). Karışık sırayla gelir.

import { GAMIFICATION, QUIZ_LENGTH } from '../config.js';
import { el } from '../dom.js';
import { cardLevel, findCategory } from '../data/repository.js';
import { state } from '../state.js';
import { addXp } from '../store/stats.js';
import { shuffleArray, speak } from '../utils.js';
import { renderHeader } from '../ui/header.js';
import { visibleCards } from './cards.js';
import { showScreen } from './navigation.js';

const quiz = {
  /** @type {{ card: object, type: 'blank'|'meaning' }[]} */
  questions: [],
  index: 0,
  score: 0,
  answered: false,
  /** @type {object[]} yanlış yapılan kartlar */
  mistakes: [],
  earnedXp: 0,
};

/** @type {object[]} çeldiricilerin çekildiği havuz (aktif filtreye göre) */
let quizPool = [];

const BLANK = '_______';
const CORRECT_DELAY_MS = 900;

/**
 * Kartın örnek cümlesinde hedef kelimeyi boşlukla değiştirir.
 * Çekim farklarını (get -> got gibi) tolere eden kademeli eşleşme uygular.
 */
function buildBlankSentence(card) {
  const sentence = card.enS;
  const phrase = card.en;
  const lowerSentence = sentence.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();

  // 1) Tam öbek eşleşmesi
  const idx = lowerSentence.indexOf(lowerPhrase);
  if (idx !== -1) {
    return sentence.slice(0, idx) + BLANK + sentence.slice(idx + phrase.length);
  }

  // 2) Son kelimeye göre eşleşme (çekim farkları: get -> got vb.)
  const phraseWords = phrase.split(' ');
  const lastWord = phraseWords[phraseWords.length - 1].toLowerCase();
  const tokens = sentence.split(/(\s+)/);

  const tryMatch = (exact) => {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const core = token.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ']/g, '');
      if (!core) continue;
      const coreLower = core.toLowerCase();
      const isMatch = exact ? coreLower === lastWord : coreLower.includes(lastWord);
      if (isMatch) {
        tokens[i] = token.replace(core, BLANK);
        return tokens.join('');
      }
    }
    return null;
  };

  const exactMatch = tryMatch(true);
  if (exactMatch) return exactMatch;
  const looseMatch = tryMatch(false);
  if (looseMatch) return looseMatch;

  // 3) Son çare: cümledeki son kelimeyi boşluk yap
  const fallback = sentence.split(' ');
  const lastIdx = fallback.length - 1;
  fallback[lastIdx] = fallback[lastIdx].replace(/[a-zA-Zçğıöşü]+/, BLANK);
  return fallback.join(' ');
}

/**
 * Doğru kart dışındaki üç çeldirici.
 * Aynı seviyedekiler önceliklidir; yetmezse diğer seviyelerden tamamlanır.
 */
function getDistractors(cards, correctCard) {
  const others = cards.filter((card) => card.en !== correctCard.en);
  const level = cardLevel(correctCard);
  const sameLevel = shuffleArray(others.filter((card) => cardLevel(card) === level));
  const rest = shuffleArray(others.filter((card) => cardLevel(card) !== level));
  return [...sameLevel, ...rest].slice(0, 3);
}

/** Aktif kategoriden bir quiz turu başlatır. */
export function startQuiz() {
  const category = findCategory(state.fieldId, state.categoryName);
  if (!category) return;

  // Kartlar ekranındaki seviye filtresi quizde de geçerli; seçenek üretmek için
  // en az 4 kart gerektiğinden yetersiz kalırsa tüm kategoriye düşülür.
  const filtered = visibleCards();
  const source = filtered.length >= 4 ? filtered : category.cards;
  const pool = shuffleArray([...source]);
  const selected = pool.slice(0, Math.min(QUIZ_LENGTH, pool.length));

  // Soru tiplerini karışık ata: yarısı blank, yarısı meaning
  quiz.questions = selected.map((card, i) => ({
    card,
    type: i % 2 === 0 ? 'blank' : 'meaning',
  }));
  shuffleArray(quiz.questions);

  quizPool = pool;
  quiz.index = 0;
  quiz.score = 0;
  quiz.mistakes = [];
  quiz.earnedXp = 0;

  el.quizQuestionArea?.classList.remove('hidden');
  el.quizResultArea?.classList.add('hidden');

  showScreen('quiz');
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (!el.quizSentence || !el.quizOptions) return;
  quiz.answered = false;

  const { card, type } = quiz.questions[quiz.index];

  if (el.quizProgress) {
    el.quizProgress.textContent = `${quiz.index + 1} / ${quiz.questions.length}`;
  }
  if (el.quizFill) {
    el.quizFill.style.width = `${Math.round((quiz.index / quiz.questions.length) * 100)}%`;
  }

  if (type === 'blank') {
    el.quizSentence.textContent = buildBlankSentence(card);
    if (el.quizHint) {
      el.quizHint.textContent = `İpucu: ${card.trS}`;
      el.quizHint.classList.remove('hidden');
    }
  } else {
    el.quizSentence.textContent = `"${card.tr}" anlamına gelen kelime hangisi?`;
    el.quizHint?.classList.add('hidden');
  }

  const options = shuffleArray([card, ...getDistractors(quizPool, card)]);
  el.quizOptions.innerHTML = '';
  options.forEach((option) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option';
    btn.textContent = option.en;
    btn.onclick = () => handleAnswer(btn, option, card);
    el.quizOptions.appendChild(btn);
  });

  el.quizNextBtn?.classList.add('hidden');
}

function handleAnswer(btn, chosen, correctCard) {
  if (quiz.answered) return;
  quiz.answered = true;

  const allBtns = el.quizOptions.querySelectorAll('.quiz-option');
  allBtns.forEach((option) => option.classList.add('is-locked'));
  speak(correctCard.en);

  if (chosen.en === correctCard.en) {
    btn.classList.add('is-correct');
    quiz.score++;
    quiz.earnedXp += GAMIFICATION.xpPerCorrectAnswer;
    addXp(GAMIFICATION.xpPerCorrectAnswer);
    renderHeader();
    setTimeout(advanceQuiz, CORRECT_DELAY_MS);
    return;
  }

  btn.classList.add('is-wrong');
  quiz.mistakes.push(correctCard);
  allBtns.forEach((option) => {
    if (option.textContent === correctCard.en) {
      option.classList.add('is-correct');
    } else if (option !== btn) {
      option.classList.add('is-muted');
    }
  });
  el.quizNextBtn?.classList.remove('hidden');
}

export function advanceQuiz() {
  quiz.index++;
  if (quiz.index >= quiz.questions.length) {
    showResult();
  } else {
    renderQuizQuestion();
  }
}

function showResult() {
  el.quizQuestionArea?.classList.add('hidden');
  el.quizResultArea?.classList.remove('hidden');

  const total = quiz.questions.length;
  const ratio = total ? quiz.score / total : 0;

  let emoji = '💪';
  let title = 'İyi deneme!';
  if (ratio === 1) {
    emoji = '🏆';
    title = 'Kusursuz!';
  } else if (ratio >= 0.6) {
    emoji = '🎉';
    title = 'Tebrikler!';
  }

  if (el.quizResultEmoji) el.quizResultEmoji.textContent = emoji;
  if (el.quizResultTitle) el.quizResultTitle.textContent = title;
  if (el.quizResultText) {
    el.quizResultText.textContent = `${total} soruda ${quiz.score} doğru.`;
  }
  if (el.quizResultXp) el.quizResultXp.textContent = `+${quiz.earnedXp} puan`;
  if (el.quizFill) el.quizFill.style.width = '100%';

  if (!el.quizMistakes) return;
  if (quiz.mistakes.length === 0) {
    el.quizMistakes.innerHTML = '';
    el.quizMistakes.classList.add('hidden');
    return;
  }
  el.quizMistakes.classList.remove('hidden');
  el.quizMistakes.innerHTML =
    '<div class="result-mistakes-title">Tekrar çalışman gereken kelimeler</div>' +
    quiz.mistakes
      .map(
        (card) =>
          `<div class="mistake-item"><span class="mistake-en">${card.en}` +
          `<span class="level-badge level-${cardLevel(card).toLowerCase()}">` +
          `${cardLevel(card)}</span></span>` +
          `<span class="mistake-tr">${card.tr}</span></div>`
      )
      .join('');
}
