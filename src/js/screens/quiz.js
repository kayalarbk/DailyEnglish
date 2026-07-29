// Quiz ekranı.
//
// Üç soru tipi: 'blank' (boşluk doldurma), 'meaning' (Türkçe anlamdan İngilizce
// kelime seçme) ve 'type' (Türkçeden İngilizceyi yazma). Karışık sırayla gelir.
//
// Quiz artık yalnız puan vermez, tekrar kayıtlarını da günceller: doğru cevap
// kartı bir üst kutuya taşır, yanlış cevap sıfırlar. Çoktan seçmeli sorular
// kartı SRS.recognitionMaxBox kutusunun üstüne çıkaramaz — dört şıkta şansla
// doğru bulmak kalıcılık kanıtı değildir. Yazarak verilen doğru cevapta böyle
// bir tavan yoktur.

import { GAMIFICATION, QUIZ_LENGTH, SRS } from '../config.js';
import { el } from '../dom.js';
import { cardLevel, findCategory } from '../data/repository.js';
import { state } from '../state.js';
import { reviewCard } from '../store/progress.js';
import { addXp, recordReview } from '../store/stats.js';
import { normalizeAnswer, shuffleArray, speak } from '../utils.js';
import { renderHeader } from '../ui/header.js';
import { toast } from '../ui/toast.js';
import { visibleCards } from './cards.js';
import { showScreen } from './navigation.js';

const quiz = {
  /** @type {{ card: object, type: 'blank'|'meaning'|'type' }[]} */
  questions: [],
  index: 0,
  score: 0,
  answered: false,
  /** @type {object[]} yanlış yapılan kartlar */
  mistakes: [],
  /** @type {object[]} bu turda kalıcı kutusuna ulaşan kartlar */
  mastered: [],
  earnedXp: 0,
};

/** @type {object[]} çeldiricilerin çekildiği havuz (aktif filtreye göre) */
let quizPool = [];

/**
 * Günlük oturum bağlamı. Quiz turu günün bir dilimi olduğunda ilerleme sayacı
 * günü gösterir ve tur bitince sonuç ekranı yerine oturuma dönülür.
 * @type {{offset: number, total: number, onGrade?: Function,
 *   onAdvance?: Function, onComplete?: Function}|null}
 */
let dailyContext = null;

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

/**
 * Kart yazma sorusuna uygun mu? Uzun öbekleri yazdırmak imla sınavına döner;
 * üretim testi kısa kelime ve kalıplarla sınırlı tutulur. Veri setindeki
 * kalıpların çoğu üç sözcüklü ("set the agenda") olduğu için sınır uzunlukta.
 */
function isTypeable(card) {
  const text = card.en.trim();
  return text.split(/\s+/).length <= 3 && text.length <= 20;
}

/**
 * Verilen kartlarla bir quiz turu kurar ve ekranı açar.
 * @param {object[]} cards soru sorulacak kartlar
 * @param {object[]} pool çeldiricilerin çekileceği havuz (en az 4 kart olmalı)
 * @param {number} [startIndex]
 */
function beginQuiz(cards, pool, startIndex = 0) {
  // Soru tiplerini sırayla dağıt: boşluk · anlam · yazma.
  const rotation = ['blank', 'meaning', 'type'];
  quiz.questions = cards.map((card, i) => {
    const type = rotation[i % rotation.length];
    return { card, type: type === 'type' && !isTypeable(card) ? 'meaning' : type };
  });
  shuffleArray(quiz.questions);

  quizPool = pool;
  quiz.index = Math.min(Math.max(startIndex, 0), Math.max(quiz.questions.length - 1, 0));
  quiz.score = 0;
  quiz.mistakes = [];
  quiz.mastered = [];
  quiz.earnedXp = 0;

  el.quizQuestionArea?.classList.remove('hidden');
  el.quizResultArea?.classList.add('hidden');

  showScreen('quiz');
  renderQuizQuestion();
}

/** Aktif kategoriden bir quiz turu başlatır. */
export function startQuiz() {
  const category = findCategory(state.fieldId, state.categoryName);
  if (!category) return;

  dailyContext = null;

  // Kartlar ekranındaki seviye filtresi quizde de geçerli; seçenek üretmek için
  // en az 4 kart gerektiğinden yetersiz kalırsa tüm kategoriye düşülür.
  const filtered = visibleCards();
  const source = filtered.length >= 4 ? filtered : category.cards;
  const pool = shuffleArray([...source]);
  beginQuiz(pool.slice(0, Math.min(QUIZ_LENGTH, pool.length)), pool);
}

/**
 * Günlük oturumun bir quiz turunu başlatır.
 *
 * Soru tipleri, çeldirici seçimi, `recognitionMaxBox` tavanı ve yazma sorusu
 * kuralları kategori quiziyle birebir aynıdır — değişen tek şey kartların
 * nereden geldiği ve turun nereye döndüğüdür.
 *
 * @param {object[]} cards turun kartları
 * @param {{ pool?: object[], offset: number, total: number, startIndex?: number,
 *   onGrade?: (card, correct) => void, onAdvance?: (i: number) => void,
 *   onComplete?: () => void }} context
 */
export function startDailyQuizRound(cards, context) {
  if (cards.length === 0) {
    context.onComplete?.();
    return;
  }

  dailyContext = context;

  // Çeldirici havuzu turdan geniş olmalı: dört şık üretmek için en az 4 kart.
  const pool = (context.pool?.length ?? 0) >= 4 ? [...context.pool] : [...cards];
  beginQuiz(cards, shuffleArray(pool), context.startIndex ?? 0);
}

function renderQuizQuestion() {
  if (!el.quizSentence || !el.quizOptions) return;
  quiz.answered = false;

  const { card, type } = quiz.questions[quiz.index];

  // Günlük oturumda sayaç turu değil günü gösterir.
  const current = dailyContext ? dailyContext.offset + quiz.index + 1 : quiz.index + 1;
  const total = dailyContext ? dailyContext.total : quiz.questions.length;

  if (el.quizProgress) el.quizProgress.textContent = `${current} / ${total}`;
  if (el.quizFill) {
    el.quizFill.style.width = `${Math.round(((current - 1) / total) * 100)}%`;
  }

  if (type === 'blank') {
    el.quizSentence.textContent = buildBlankSentence(card);
    if (el.quizHint) {
      el.quizHint.textContent = `İpucu: ${card.trS}`;
      el.quizHint.classList.remove('hidden');
    }
  } else if (type === 'type') {
    el.quizSentence.textContent = `"${card.tr}" — İngilizcesini yaz`;
    if (el.quizHint) {
      el.quizHint.textContent = `İpucu: ${card.trS}`;
      el.quizHint.classList.remove('hidden');
    }
  } else {
    el.quizSentence.textContent = `"${card.tr}" anlamına gelen kelime hangisi?`;
    el.quizHint?.classList.add('hidden');
  }

  el.quizNextBtn?.classList.add('hidden');

  if (type === 'type') {
    renderTypeAnswer(card);
    return;
  }

  el.quizTypeForm?.classList.add('hidden');
  el.quizOptions.classList.remove('hidden');
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
}

/** Yazma sorusunun giriş alanını hazırlar. */
function renderTypeAnswer(card) {
  el.quizOptions.innerHTML = '';
  el.quizOptions.classList.add('hidden');
  el.quizTypeForm?.classList.remove('hidden');
  el.quizTypeFeedback?.classList.add('hidden');

  if (el.quizTypeInput) {
    el.quizTypeInput.value = '';
    el.quizTypeInput.disabled = false;
    el.quizTypeInput.className = 'quiz-type-input';
    el.quizTypeInput.focus();
  }
  if (el.quizTypeSubmit) el.quizTypeSubmit.disabled = false;
}

/** Yazma sorusunun cevabını değerlendirir. */
export function submitTypedAnswer() {
  if (quiz.answered) return;
  const question = quiz.questions[quiz.index];
  if (!question || question.type !== 'type') return;

  const typed = el.quizTypeInput?.value ?? '';
  if (!normalizeAnswer(typed)) return; // boş cevap gönderilmez

  quiz.answered = true;
  const correct = normalizeAnswer(typed) === normalizeAnswer(question.card.en);

  if (el.quizTypeInput) {
    el.quizTypeInput.disabled = true;
    el.quizTypeInput.classList.add(correct ? 'is-correct' : 'is-wrong');
  }
  if (el.quizTypeSubmit) el.quizTypeSubmit.disabled = true;

  if (el.quizTypeFeedback) {
    el.quizTypeFeedback.classList.remove('hidden');
    el.quizTypeFeedback.className = `quiz-type-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
    el.quizTypeFeedback.textContent = correct
      ? `Doğru — ${question.card.en}`
      : `Doğrusu: ${question.card.en}`;
  }

  speak(question.card.en);
  // Yazarak bilmek üretimdir; tanıma tavanı uygulanmaz.
  applyQuizResult(question.card, correct, { recognition: false });

  if (correct) {
    setTimeout(advanceQuiz, CORRECT_DELAY_MS);
  } else {
    el.quizNextBtn?.classList.remove('hidden');
  }
}

/**
 * Quiz cevabını tekrar kaydına ve istatistiklere işler.
 * @param {object} card
 * @param {boolean} correct
 * @param {{ recognition: boolean }} options tanıma sorusuysa kutu tavanı uygulanır
 */
function applyQuizResult(card, correct, { recognition }) {
  const grade = correct ? 'good' : 'again';
  const result = reviewCard(card, grade, {
    maxBox: recognition ? SRS.recognitionMaxBox : undefined,
  });

  // Tekrar puanı (ve kalıcılık ikramiyesi) stats tarafından hesaplanır; quiz
  // yalnız doğru cevap primini ekler.
  const { xp } = recordReview(card, grade, result);
  quiz.earnedXp += xp;

  if (correct) {
    quiz.score++;
    quiz.earnedXp += GAMIFICATION.xpPerCorrectAnswer;
    addXp(GAMIFICATION.xpPerCorrectAnswer);
  } else {
    quiz.mistakes.push(card);
  }

  if (result.justMastered) {
    quiz.mastered.push(card);
    toast('Bir kelime daha kalıcı!', '🏆');
  }

  dailyContext?.onGrade?.(card, correct);

  renderHeader();
}

function handleAnswer(btn, chosen, correctCard) {
  if (quiz.answered) return;
  quiz.answered = true;

  const allBtns = el.quizOptions.querySelectorAll('.quiz-option');
  allBtns.forEach((option) => option.classList.add('is-locked'));
  speak(correctCard.en);

  if (chosen.en === correctCard.en) {
    btn.classList.add('is-correct');
    applyQuizResult(correctCard, true, { recognition: true });
    setTimeout(advanceQuiz, CORRECT_DELAY_MS);
    return;
  }

  btn.classList.add('is-wrong');
  applyQuizResult(correctCard, false, { recognition: true });
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
    // Günlük oturumda tur sonu bir "sonuç" değil, günün bir sonraki adımıdır;
    // özet gün bitince tek seferde gösterilir.
    if (dailyContext) {
      const done = dailyContext;
      dailyContext = null;
      done.onComplete?.();
      return;
    }
    showResult();
    return;
  }

  dailyContext?.onAdvance?.(quiz.index);
  renderQuizQuestion();
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
    const mastered = quiz.mastered.length;
    el.quizResultText.textContent =
      `${total} soruda ${quiz.score} doğru.` +
      (mastered > 0 ? ` ${mastered} kelime kalıcı oldu.` : '');
  }
  if (el.quizResultXp) el.quizResultXp.textContent = `+${quiz.earnedXp} puan`;
  if (el.quizFill) el.quizFill.style.width = '100%';

  if (!el.quizMistakes) return;
  if (quiz.mistakes.length === 0) {
    el.quizMistakes.innerHTML = '';
    el.quizMistakes.classList.add('hidden');
    return;
  }

  // Yanlış yapılan kartlar 0. kutuya düştüğü için yarın değil bugün tekrar gelir.
  el.quizMistakes.classList.remove('hidden');
  el.quizMistakes.innerHTML =
    '<div class="result-mistakes-title">Bu kelimeler tekrar kuyruğuna alındı</div>' +
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
