// Günlük karma deste — oturum sürücüsü ve özet.
//
// Bu modül kart göstermez, soru sormaz, kutu oynatmaz. Yaptığı tek şey günün
// adım kuyruğunu yönetmek: sıradaki adımın biçimine göre kart ekranını ya da
// quiz turunu açar, kalınan yeri kaydeder ve gün bitince özeti çizer.
// Değerlendirme ve puanlama `cards.js` / `quiz.js` / `progress.js` / `stats.js`
// içinde kalır.

import { el } from '../dom.js';
import { DAILY } from '../config.js';
import {
  getCardsByIds,
  getFieldMeta,
  loadField,
} from '../data/repository.js';
import { buildDeck, buildRuns, buildSteps } from '../store/daily.js';
import {
  createSession,
  getDailySettings,
  getSession,
  isSessionComplete,
  recordResult,
  resolveFieldIds,
  saveSession,
  setSessionIndex,
  clearSession,
} from '../store/daily-session.js';
import { getInterests } from '../store/interests.js';
import { getAllRecords, migrateLegacyProgress } from '../store/progress.js';
import { getStats } from '../store/stats.js';
import { dayKey } from '../utils.js';
import { toast } from '../ui/toast.js';
import { openDailyDeck } from './cards.js';
import { startDailyQuizRound } from './quiz.js';
import { showScreen } from './navigation.js';

/** Oturum ekranından çıkınca anasayfayı tazelemek için (döngüsel import olmasın). */
let onSessionLeave = () => {};

/** @param {() => void} handler */
export function setDailyLeaveHandler(handler) {
  onSessionLeave = handler;
}

// ------------------------------------------------------------------
// Deste kurma
// ------------------------------------------------------------------

/**
 * Seçili alanların kart verisini indirir ve id listesini çıkarır.
 * @param {string[]} fieldIds
 * @returns {Promise<Record<string, string[]>>}
 */
async function loadCardIdsByField(fieldIds) {
  const fields = await Promise.all(fieldIds.map((id) => loadField(id)));
  /** @type {Record<string, string[]>} */
  const map = {};

  fields.forEach((field, index) => {
    // Eski biçimli ilerleme kayıtları ancak alan yüklendiğinde id'ye taşınabilir;
    // deste kurulmadan önce taşınmalı ki o kartlar "yeni" sanılmasın.
    migrateLegacyProgress(field);
    map[fieldIds[index]] = field.categories.flatMap((category) =>
      category.cards.map((card) => card.id)
    );
  });

  return map;
}

/** Bugünün destesini kurar ve kaydeder. */
async function buildTodaySession() {
  const settings = getDailySettings();
  const fieldIds = resolveFieldIds(getInterests());
  if (fieldIds.length === 0) return null;

  const cardIdsByField = await loadCardIdsByField(fieldIds);

  const { cardIds, stats } = buildDeck({
    cardIdsByField,
    progress: getAllRecords(),
    settings: { dailyGoal: getStats().dailyGoal, newPerDay: settings.newPerDay },
    today: dayKey(),
  });

  if (cardIds.length === 0) return null;

  const steps = buildSteps(cardIds, settings.mode);
  return saveSession(createSession(steps, stats, settings.mode));
}

// ------------------------------------------------------------------
// Oturumu sürme
// ------------------------------------------------------------------

/** Oturumun kart nesneleri; veri değişip kaybolan id'ler sessizce atlanır. */
function resolveSteps(session) {
  const cards = new Map(
    getCardsByIds(session.steps.map((step) => step.cardId)).map((card) => [card.id, card])
  );
  return session.steps
    .map((step, index) => ({ ...step, index, card: cards.get(step.cardId) }))
    .filter((step) => Boolean(step.card));
}

/**
 * Sıradaki adımı oynatır.
 * @param {object} session
 */
function playFrom(session) {
  if (isSessionComplete(session)) {
    renderSummary(session);
    return;
  }

  const resolved = resolveSteps(session);

  // Tüm kartlar veriden düşmüşse oturumu bitir; boş ekranda bırakma.
  if (resolved.length === 0) {
    session.index = session.steps.length;
    saveSession(session);
    renderSummary(session);
    return;
  }

  const runs = buildRuns(session.steps, DAILY.quizBatch);
  const run = runs.find(
    (item) => session.index >= item.start && session.index < item.start + item.cardIds.length
  );
  if (!run) {
    renderSummary(session);
    return;
  }

  const runCards = run.cardIds
    .map((cardId) => resolved.find((step) => step.cardId === cardId)?.card)
    .filter(Boolean);

  // Öbekteki bütün kartlar veriden düşmüşse öbeği atla.
  if (runCards.length === 0) {
    setSessionIndex(run.start + run.cardIds.length);
    playFrom(getSession());
    return;
  }

  const startIndex = Math.max(0, session.index - run.start);
  const total = session.steps.length;
  const poolCards = resolved.map((step) => step.card);

  const context = {
    offset: run.start,
    total,
    startIndex,
    onAdvance: (indexInRun) => setSessionIndex(run.start + indexInRun),
    onComplete: () => {
      setSessionIndex(run.start + run.cardIds.length);
      playFrom(getSession());
    },
  };

  if (run.form === 'quiz') {
    startDailyQuizRound(runCards, {
      ...context,
      pool: poolCards,
      onGrade: (card, correct) => recordResult(card.id, 'quiz', correct),
    });
    return;
  }

  openDailyDeck(runCards, {
    ...context,
    onGrade: (card, grade) => recordResult(card.id, 'card', grade !== 'again'),
  });
}

/**
 * "Bugüne Başla": oturum yoksa kurar, varsa kaldığı yerden sürdürür.
 * @param {HTMLButtonElement|null} [trigger] hazırlanırken devre dışı bırakılacak düğme
 */
export async function startDailySession(trigger = null) {
  const busyLabel = trigger?.textContent;
  if (trigger) {
    trigger.disabled = true;
    trigger.textContent = 'Hazırlanıyor…';
  }

  try {
    let session = getSession();
    if (!session) session = await buildTodaySession();

    if (!session) {
      toast('Bugün için kart bulunamadı', '🤔');
      return;
    }

    // Kart nesneleri gerekli: oturum yalnız id tutuyor, alanlar yüklenmemiş olabilir.
    await loadCardIdsByField(resolveFieldIds(getInterests()));
    playFrom(session);
  } catch (error) {
    console.error(error);
    toast('Günlük deste hazırlanamadı', '⚠️');
  } finally {
    if (trigger) {
      trigger.disabled = false;
      if (busyLabel) trigger.textContent = busyLabel;
    }
  }
}

/** Desteyi atıp yeniden kurar (ayarlar değişince ya da kullanıcı isteyince). */
export async function rebuildDailySession() {
  clearSession();
  const session = await buildTodaySession();
  if (!session) toast('Bugün için kart bulunamadı', '🤔');
  return session;
}

// ------------------------------------------------------------------
// Özet
// ------------------------------------------------------------------

/** Kart id'sinden alan id'si: "seyahat-004" → "seyahat". */
function fieldIdOf(cardId) {
  const cut = String(cardId).lastIndexOf('-');
  return cut === -1 ? cardId : cardId.slice(0, cut);
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  if (minutes === 0) return `${seconds} sn`;
  return `${minutes} dk ${String(seconds).padStart(2, '0')} sn`;
}

/** @param {object} session */
function renderSummary(session) {
  const results = session.results || [];
  const correct = results.filter((result) => result.correct).length;
  const wrong = results.length - correct;

  if (el.dailySummaryTitle) {
    el.dailySummaryTitle.textContent = wrong === 0 ? 'Günü tamamladın!' : 'Bugünlük bu kadar!';
  }
  if (el.dailySummaryEmoji) {
    el.dailySummaryEmoji.textContent = wrong === 0 ? '🏆' : '💪';
  }
  if (el.dailySummaryText) {
    el.dailySummaryText.textContent =
      `${results.length} kart çalıştın · ${correct} doğru, ${wrong} zorlandın.`;
  }
  if (el.dailySummaryTime) {
    const elapsed = Date.now() - (session.startedAt || session.built || Date.now());
    el.dailySummaryTime.textContent = `Süre: ${formatDuration(Math.max(0, elapsed))}`;
  }

  // Alan bazlı kırılım: hangi alanda zorlandığı tek bakışta görünsün.
  if (el.dailySummaryFields) {
    /** @type {Record<string, {correct: number, total: number}>} */
    const byField = {};
    results.forEach((result) => {
      const fieldId = fieldIdOf(result.cardId);
      byField[fieldId] = byField[fieldId] || { correct: 0, total: 0 };
      byField[fieldId].total += 1;
      if (result.correct) byField[fieldId].correct += 1;
    });

    const rows = Object.entries(byField)
      .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
      .map(([fieldId, count]) => {
        const meta = getFieldMeta(fieldId);
        const pct = Math.round((count.correct / count.total) * 100);
        return `
          <div class="summary-field">
            <span class="summary-field-icon" aria-hidden="true">${meta?.icon || '📘'}</span>
            <span class="summary-field-name">${meta?.name || fieldId}</span>
            <span class="progress-track">
              <span class="progress-fill" style="width:${pct}%"></span>
            </span>
            <span class="summary-field-count">${count.correct}/${count.total}</span>
          </div>`;
      });

    el.dailySummaryFields.innerHTML = rows.join('');
  }

  // Zorlanılan kartlar: 0. kutuya düştükleri için zaten bugün tekrar gelirler.
  const hardIds = results.filter((result) => !result.correct).map((result) => result.cardId);
  const hardCards = getCardsByIds(hardIds);

  if (el.dailySummaryHard) {
    el.dailySummaryHard.innerHTML = hardCards.length
      ? '<div class="result-mistakes-title">Zorlandığın kartlar</div>' +
        hardCards
          .map(
            (card) =>
              `<div class="mistake-item"><span class="mistake-en">${card.en}</span>` +
              `<span class="mistake-tr">${card.tr}</span></div>`
          )
          .join('')
      : '';
    el.dailySummaryHard.classList.toggle('hidden', hardCards.length === 0);
  }

  if (el.dailyRetryBtn) {
    el.dailyRetryBtn.classList.toggle('hidden', hardCards.length === 0);
    el.dailyRetryBtn.onclick = () => openExtraDeck(hardCards);
  }

  showScreen('daily-summary');
}

/**
 * Ekstra çalışma: özetten "bunları tekrar çalış" ya da anasayfadan "ekstra çalış".
 *
 * Günlük hedefi ikinci kez saymaz — `stats.js` bir kartı gün içinde bir kez
 * sayıyor; buraya paralel bir sayaç eklenmiyor.
 * @param {object[]} cards
 */
export function openExtraDeck(cards) {
  if (cards.length === 0) {
    toast('Ekstra çalışılacak kart yok', '🤔');
    return;
  }

  openDailyDeck(cards, {
    offset: 0,
    total: cards.length,
    onComplete: () => {
      onSessionLeave();
    },
  });
}

/** Anasayfadaki "Ekstra çalış": bugünün destesindeki kartları yeniden açar. */
export function startExtraSession() {
  const session = getSession();
  if (!session) return;
  openExtraDeck(getCardsByIds(session.steps.map((step) => step.cardId)));
}

export function bindDaily() {
  if (el.dailySummaryDoneBtn) el.dailySummaryDoneBtn.onclick = () => onSessionLeave();
}
