// Kartlar ekranı: flashcard gösterimi ve değerlendirme.
//
// Değerlendirme kartın ÖN yüzünde, Türkçe karşılık görülmeden yapılır — ölçülmek
// istenen şey tanıma değil hatırlamadır. Kullanıcı cevaba önce bakarsa ("peek")
// "Kolay" seçeneği kapanır; kendi kendini kandırması kolay olmasın diye.

import { el, $ } from '../dom.js';
import { GRADES, LEVELS } from '../config.js';
import {
  cardLevel,
  findCategory,
  getFieldMeta,
  levelCounts,
  locateCard,
} from '../data/repository.js';
import { state } from '../state.js';
import {
  STATUS_LABELS,
  getCardStatus,
  getRecord,
  isPending,
  reviewCard,
} from '../store/progress.js';
import { getPreferredLevels } from '../store/profile.js';
import { recordReview } from '../store/stats.js';
import { dayKey, daysBetween, shuffleArray, speak } from '../utils.js';
import { renderHeader } from '../ui/header.js';
import { toast } from '../ui/toast.js';
import { showScreen } from './navigation.js';

/** @type {ReturnType<typeof reviewCard>|null} görüntülenen kartın son değerlendirmesi */
let lastResult = null;

/**
 * Günlük oturum bağlamı. Deste günün bir parçası olduğunda sayaç, oturumun
 * tamamını gösterir (7/20) ve değerlendirmeler dışarı bildirilir.
 * Değerlendirme, kutu geçişi ve dürüstlük kilidi aynen çalışır — burada
 * değişen tek şey ilerlemenin nereye raporlandığıdır.
 * @type {{offset: number, total: number, onGrade?: Function, onAdvance?: Function,
 *   onComplete?: Function}|null}
 */
let dailyContext = null;

/** Kart, geçerli seviye filtresine giriyor mu? ('fit' = testte belirlenen seviye) */
function matchesLevel(card) {
  if (state.level === 'all') return true;
  if (state.level === 'fit') return getPreferredLevels().includes(cardLevel(card));
  return cardLevel(card) === state.level;
}

/** Geçerli filtrelere (seviye + çalışma durumu) göre gösterilecek kartlar. */
export function visibleCards() {
  const today = dayKey();
  return state.deck.filter((card) => {
    if (!matchesLevel(card)) return false;
    // Değerlendirilen kart deste içinde kalır; aksi halde kart elinizin altından
    // kayar ve sıradaki karta atlamak yerine ekran zıplar.
    if (state.deckFilter === 'pending' && !isPending(card, today) && card !== currentCard()) {
      return false;
    }
    return true;
  });
}

/** Şu an ekranda olan kart (filtre değişimlerinde referans olarak kullanılır). */
function currentCard() {
  return state.deck[state.deckIndexRef] ?? null;
}

/** Bir sonraki tekrarın ne zaman olduğunu insan diline çevirir. */
function dueLabel(dueDay) {
  const days = daysBetween(dayKey(), dueDay);
  if (days <= 0) return 'bugün tekrar';
  if (days === 1) return 'yarın tekrar';
  return `${days} gün sonra tekrar`;
}

function renderEmptyState() {
  if (!el.deck) return;

  const pendingOnly = state.deckFilter === 'pending';
  const levelOnly = state.level !== 'all' && !pendingOnly;

  let emoji = '🏆';
  let title = 'Bu bölümü bitirdin!';
  let text = 'Filtreleri kapatıp tekrar göz atabilir ya da quiz ile pekiştirebilirsin.';

  if (levelOnly) {
    emoji = '🔍';
    title = `${state.level === 'fit' ? 'Sana uygun' : state.level} kartı kalmadı`;
    text = 'Bu seviyede gösterilecek kart yok. Başka bir seviye seçebilirsin.';
  } else if (pendingOnly) {
    emoji = '✅';
    title = 'Bugünlük tekrar bitti';
    text = 'Bu bölümde bugün çalışılacak kart kalmadı. Yarın yeni tekrarlar açılacak.';
  }

  el.deck.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-emoji" aria-hidden="true">${emoji}</div>
      <div class="empty-state-title">${title}</div>
      <p class="empty-state-text">${text}</p>
    </div>
  `;
  if (el.counter) el.counter.textContent = '0 / 0';
  if (el.deckFill) el.deckFill.style.width = '100%';
  if (el.gradeBar) el.gradeBar.innerHTML = '';
  if (el.prevBtn) el.prevBtn.disabled = true;
  if (el.nextBtn) el.nextBtn.disabled = true;
}

/**
 * Değerlendirmeyi işler: kaydı günceller, puanı yazar, cevabı açar.
 * @param {object} card
 * @param {'again'|'hard'|'good'} grade
 */
function handleGrade(card, grade) {
  if (lastResult) return; // aynı kart için tek değerlendirme

  const result = reviewCard(card, grade);
  const { xp, counted, goalJustReached, streakIncreased } = recordReview(card, grade, result);
  lastResult = result;

  // Cevabı göster: değerlendirme yapıldıktan sonra doğrusunu görmek öğrenmenin
  // parçasıdır; kart kendiliğinden arka yüzüne döner.
  state.flipped = true;

  if (xp > 0) toast(`+${xp} puan`, grade === 'again' ? '💪' : '⭐');
  if (result.justMastered) toast('Bu kelime artık kalıcı!', '🏆');
  else if (result.lapsed) toast('Baştan çalışacağız', '↺');
  if (streakIncreased) toast('Seri sürüyor!', '🔥');
  if (counted && goalJustReached) toast('Günlük hedef tamam!', '🎯');

  dailyContext?.onGrade?.(card, grade, result);

  renderHeader();
  renderCard();
}

/** Kartın altındaki değerlendirme çubuğu ya da değerlendirme sonrası özet. */
function renderGradeBar(card) {
  if (!el.gradeBar) return;
  el.gradeBar.innerHTML = '';

  if (lastResult) {
    const summary = document.createElement('div');
    summary.className = 'grade-result';
    summary.innerHTML = `
      <span class="grade-result-status status-${lastResult.status}">
        ${STATUS_LABELS[lastResult.status]}
      </span>
      <span class="grade-result-due">${dueLabel(lastResult.due)}</span>
    `;

    const isLast = state.cardIndex >= visibleCards().length - 1;
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn btn-primary btn-block';
    next.textContent = dailyContext && isLast ? 'Devam →' : 'Sonraki kart →';
    next.onclick = () => step(1);

    el.gradeBar.append(summary, next);
    return;
  }

  const hint = document.createElement('p');
  hint.className = 'grade-hint';
  hint.textContent = state.peeked
    ? 'Cevaba baktın — bu tekrar "kolay" sayılmıyor.'
    : 'Türkçesini açmadan önce: hatırlıyor musun?';
  el.gradeBar.appendChild(hint);

  const row = document.createElement('div');
  row.className = 'grade-row';

  Object.values(GRADES).forEach((grade) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `grade-btn grade-btn--${grade.id}`;
    // Cevabı görmüş kullanıcı "kolay" diyemez; hatırlama artık ölçülemez.
    btn.disabled = grade.id === 'good' && state.peeked;
    btn.innerHTML =
      `<span class="grade-btn-icon" aria-hidden="true">${grade.icon}</span>` +
      `<span class="grade-btn-label">${grade.label}</span>`;
    btn.onclick = () => handleGrade(card, grade.id);
    row.appendChild(btn);
  });

  el.gradeBar.appendChild(row);
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
  state.deckIndexRef = state.deck.indexOf(card);

  const status = getCardStatus(card);
  const record = getRecord(card);
  const level = cardLevel(card);

  // Günlük destede kartlar farklı alanlardan gelir; bağlam kartın id'sinden bulunur.
  const location = state.deckMode === 'daily'
    ? locateCard(card.id)
    : { fieldId: state.fieldId, categoryName: state.categoryName };
  const fieldId = location?.fieldId || state.fieldId;
  const sourceCategory = location?.categoryName || '';
  const color = findCategory(fieldId, sourceCategory)?.color
    || getFieldMeta(fieldId)?.color
    || '';

  const streak = record ? `${record.correct}/${record.seen} doğru` : 'ilk kez';

  el.deck.innerHTML = `
    <div class="card-inner" id="cardInner" role="button" tabindex="0"
         aria-label="Kartı çevir">
      <div class="face face-front" style="--card-color:${color}">
        <span class="card-tag">${sourceCategory || ''}</span>
        <span class="card-badges">
          <span class="level-badge level-${level.toLowerCase()}">${level}</span>
          <span class="status-badge status-${status}">${STATUS_LABELS[status]}</span>
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
        <span class="card-hint">${streak}</span>
      </div>
    </div>
  `;

  const inner = $('cardInner');
  if (!inner) return;
  if (state.flipped) inner.classList.add('is-flipped');

  const flip = () => {
    // Değerlendirmeden önceki ilk çevirme "cevaba bakma"dır ve kaydedilir.
    if (!state.flipped && !lastResult) {
      state.peeked = true;
      renderGradeBar(card);
    }
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

  renderGradeBar(card);

  // Günlük oturumda sayaç desteyi değil GÜNÜ gösterir; kart öbeği günün
  // ortasından bir dilim olabilir.
  const current = dailyContext ? dailyContext.offset + state.cardIndex + 1 : state.cardIndex + 1;
  const total = dailyContext ? dailyContext.total : cards.length;

  if (el.counter) el.counter.textContent = `${current} / ${total}`;
  if (el.deckFill) el.deckFill.style.width = `${Math.round((current / total) * 100)}%`;

  // Günlük oturum ileri yönlüdür: geri dönüp aynı kartı yeniden değerlendirmek
  // kutuyu ikinci kez oynatır ve günün ölçümünü bozardı.
  if (el.prevBtn) {
    el.prevBtn.disabled = Boolean(dailyContext) || state.cardIndex === 0;
    el.prevBtn.classList.toggle('hidden', Boolean(dailyContext));
  }
  if (el.nextBtn) el.nextBtn.disabled = !dailyContext && state.cardIndex === cards.length - 1;
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
  // 'fit' bir CEFR seviyesi değil; kapsamı aşağıda ayrıca kontrol edilir.
  if (state.level !== 'all' && state.level !== 'fit' && !present.includes(state.level)) {
    state.level = 'all';
  }

  const options = [{ value: 'all', label: 'Tümü', count: state.deck.length }];

  // Testteki seviyeye uyan kartlar için tek dokunuşluk kısayol.
  const preferred = getPreferredLevels();
  const fitCount = preferred.reduce((sum, level) => sum + (counts[level] || 0), 0);
  if (fitCount > 0 && fitCount < state.deck.length) {
    options.push({ value: 'fit', label: '⭐ Sana uygun', count: fitCount });
  } else if (state.level === 'fit') {
    state.level = 'all';
  }

  options.push(
    ...present.map((level) => ({ value: level, label: level, count: counts[level] }))
  );

  el.levelFilter.innerHTML = '';
  options.forEach(({ value, label, count }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'level-chip';
    btn.dataset.level = value;
    if (value !== 'all' && value !== 'fit') btn.classList.add(`level-${value.toLowerCase()}`);
    btn.classList.toggle('is-active', state.level === value);
    btn.setAttribute('aria-pressed', String(state.level === value));
    btn.innerHTML = `${label}<span class="level-chip-count">${count}</span>`;
    btn.onclick = () => {
      state.level = value;
      resetCardView();
      state.cardIndex = 0;
      renderCards();
    };
    el.levelFilter.appendChild(btn);
  });
}

/** Kartı ve araç çubuğunu birlikte çizer. */
export function renderCards() {
  const daily = state.deckMode === 'daily';

  if (el.cardsTitle) {
    el.cardsTitle.textContent = daily ? 'Bugünün destesi' : state.categoryName || '';
  }
  renderLevelFilter();

  if (el.filterBtn) {
    const pending = state.deckFilter === 'pending';
    el.filterBtn.classList.toggle('is-active', pending);
    el.filterBtn.textContent = pending ? 'Tümünü göster' : 'Bugün çalışılacaklar';
  }

  // Günlük destede araç çubuğu kapalı: deste zaten bugün için seçilmiş ve
  // sıralanmıştır; karıştırmak ya da filtrelemek o seçimi bozar. Quiz de
  // anlamsız kalır — kartlar farklı kategorilerden gelir.
  if (el.shuffleBtn) el.shuffleBtn.classList.toggle('hidden', daily);
  if (el.filterBtn) el.filterBtn.classList.toggle('hidden', daily);
  if (el.quizBtn) el.quizBtn.classList.toggle('hidden', daily);
  if (el.levelFilter && daily) el.levelFilter.classList.add('hidden');

  renderCard();
}

/** Kart görünümünü sıfırlar: çevrilmemiş, değerlendirilmemiş, bakılmamış. */
function resetCardView() {
  state.flipped = false;
  state.peeked = false;
  lastResult = null;
}

/**
 * Bir kategoriyi açar. Alan verisi bu noktada yüklenmiş olmalıdır.
 * @param {string} fieldId
 * @param {string} categoryName
 */
export function openCategory(fieldId, categoryName) {
  const category = findCategory(fieldId, categoryName);
  if (!category) return;

  dailyContext = null;
  state.fieldId = fieldId;
  state.categoryName = categoryName;
  state.deckMode = 'category';
  state.deck = [...category.cards];
  state.cardIndex = 0;
  state.deckIndexRef = 0;
  resetCardView();

  // Kategoride bekleyen kart varsa doğrudan onlarla başla: uygulamanın verdiği
  // söz "bugün ne çalışmalıyım" sorusuna cevap vermek.
  const today = dayKey();
  const pending = category.cards.filter((card) => isPending(card, today));
  state.deckFilter = pending.length > 0 ? 'pending' : 'all';

  // Testi çözen kullanıcı doğrudan kendi seviyesindeki kartlarla başlar.
  state.level = getPreferredLevels().length > 0 ? 'fit' : 'all';

  renderCards();
  showScreen('cards');
}

/**
 * Günlük destenin bir kart öbeğini açar.
 *
 * Deste seçimi, sıralaması ve oturum kaydı `screens/daily.js`'in işidir; bu
 * ekran yalnızca kartları gösterir ve mevcut değerlendirme akışını uygular.
 *
 * @param {object[]} cards öbekteki kart nesneleri
 * @param {{ offset: number, total: number, startIndex?: number,
 *   onGrade?: (card, grade, result) => void,
 *   onAdvance?: (indexInRun: number) => void,
 *   onComplete?: () => void }} context
 */
export function openDailyDeck(cards, context) {
  dailyContext = context;
  state.deckMode = 'daily';
  state.categoryName = null;
  state.fieldId = null;
  state.deck = [...cards];
  state.cardIndex = Math.min(Math.max(context.startIndex ?? 0, 0), Math.max(cards.length - 1, 0));
  state.deckIndexRef = state.cardIndex;
  state.deckFilter = 'all';
  state.level = 'all';
  resetCardView();

  renderCards();
  showScreen('cards');
}

function step(delta) {
  // Günlük oturumda son karttan sonrası günün bir sonraki adımıdır.
  if (dailyContext && delta > 0) {
    const cards = visibleCards();
    if (state.cardIndex + 1 >= cards.length) {
      dailyContext.onComplete?.();
      return;
    }
  }
  // Hedef kartı listede *önce* belirle: "bugün çalışılacaklar" filtresi açıkken
  // değerlendirilmiş kart listeden düşer ve aradaki indeksler kayar.
  const target = visibleCards()[state.cardIndex + delta];

  resetCardView();
  state.deckIndexRef = -1; // önceki kartın filtre muafiyeti sona erdi

  const cards = visibleCards();
  if (cards.length === 0) {
    renderCard();
    return;
  }

  const index = target ? cards.indexOf(target) : -1;
  state.cardIndex = index !== -1
    ? index
    : Math.min(Math.max(state.cardIndex + delta, 0), cards.length - 1);

  dailyContext?.onAdvance?.(state.cardIndex);
  renderCard();
}

export function bindCardControls() {
  if (el.prevBtn) el.prevBtn.onclick = () => step(-1);
  if (el.nextBtn) el.nextBtn.onclick = () => step(1);

  if (el.shuffleBtn) {
    el.shuffleBtn.onclick = () => {
      shuffleArray(state.deck);
      state.cardIndex = 0;
      resetCardView();
      renderCards();
      toast('Deste karıştırıldı', '🔀');
    };
  }

  if (el.filterBtn) {
    el.filterBtn.onclick = () => {
      state.deckFilter = state.deckFilter === 'pending' ? 'all' : 'pending';
      state.cardIndex = 0;
      resetCardView();
      renderCards();
    };
  }

  // Klavye ile gezinme ve değerlendirme (1/2/3)
  document.addEventListener('keydown', (event) => {
    if (el.cardsScreen?.classList.contains('hidden')) return;
    if (event.target.matches('input, select, textarea')) return;
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);

    const gradeByKey = { 1: 'again', 2: 'hard', 3: 'good' }[event.key];
    if (gradeByKey && !lastResult) {
      if (gradeByKey === 'good' && state.peeked) return;
      const card = visibleCards()[state.cardIndex];
      if (card) handleGrade(card, gradeByKey);
    }
  });
}

/** Quiz sonuçları SRS'i değiştirdiği için kart ekranına dönüşte tazelenir. */
export function refreshCardView() {
  resetCardView();
  renderCards();
}
