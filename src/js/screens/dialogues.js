// Diyalog / canlandırma modu.
//
// Üç ekran: liste → rol ve mod seçimi → sahne (mesajlaşma arayüzü + özet).
// Sahne durumu modül içinde tutulur; ekranlar arası gezinme `state`e karışmaz
// çünkü bir anda yalnızca tek bir sahne oynanabilir.

import { el } from '../dom.js';
import { DIALOGUE, DIALOGUE_MODES, LEVELS } from '../config.js';
import {
  getAllLoadedDialogues,
  loadAllDialogues,
  loadDialogueManifest,
  totalDialogueCount,
} from '../data/dialogue-repository.js';
import { getPhrasesByIds, loadAllPhrases, loadPhraseManifest } from '../data/phrase-repository.js';
import { countCompleted, getRecord, isCompleted, markCompleted } from '../store/dialogues.js';
import { addXp } from '../store/stats.js';
import { bestSimilarity, englishVoices, speakLine } from '../utils.js';
import { renderHeader } from '../ui/header.js';
import { toast } from '../ui/toast.js';
import { showScreen } from './navigation.js';

/** Konuşma tanıma yalnız bazı tarayıcılarda var; yoksa "Konuş" modu hiç görünmez. */
const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
export const speechRecognitionSupported = Boolean(RecognitionCtor);

let dataReady = false;

/** Liste filtresi (ekran içi, kalıcı değil). */
let levelFilter = 'all';

/** Oynanan sahnenin durumu. */
const scene = {
  /** @type {object|null} */
  dialogue: null,
  userRole: null,
  partnerRole: null,
  mode: 'read',
  /** sırada okunacak replik */
  index: 0,
  /** konuş modunda alınan skorlar */
  scores: [],
  /** @type {(() => void)|null} devam eden seslendirmeyi iptal eder */
  cancelSpeak: null,
  /** @type {any} */
  recognition: null,
  /** @type {number|null} */
  listenTimer: null,
  /** @type {number|null} replikler arası geçiş zamanlayıcısı */
  advanceTimer: null,
  /**
   * Sahne çalıştırma numarası.
   *
   * Seslendirme geri çağrıları eşzamansızdır: sahne durdurulduktan ya da
   * yeniden başlatıldıktan sonra da tetiklenebilirler. Her `startScene` bu
   * sayacı artırır; eski çağrılar kendi numaralarının geçersizleştiğini görüp
   * çekilir. Aksi hâlde iki `playNext` zinciri aynı anda ilerler ve
   * `scene.index`i iki kat artırarak kullanıcının sırasını atlar.
   */
  run: 0,
};

function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==================================================================
// Liste ekranı
// ==================================================================

function dialogueRow(dialogue) {
  const done = isCompleted(dialogue.id);
  const record = getRecord(dialogue.id);

  const row = document.createElement('button');
  row.type = 'button';
  row.className = `dialogue-row${done ? ' is-done' : ''}`;
  row.innerHTML = `
    <span class="dialogue-row-body">
      <span class="dialogue-row-title">
        ${esc(dialogue.title)}
        ${done ? '<span class="dialogue-row-done" aria-hidden="true">✓</span>' : ''}
      </span>
      <span class="dialogue-row-tr">${esc(dialogue.titleTr)}</span>
      <span class="dialogue-row-meta">
        <span class="level-badge level-${dialogue.level.toLowerCase()}">${dialogue.level}</span>
        <span class="dialogue-row-count">${dialogue.lines.length} replik</span>
        ${
          record?.score !== null && record?.score !== undefined
            ? `<span class="dialogue-row-score">🎙️ %${record.score}</span>`
            : ''
        }
      </span>
    </span>
    <span class="dialogue-row-go" aria-hidden="true">›</span>
  `;
  row.setAttribute(
    'aria-label',
    `${dialogue.title} — ${dialogue.titleTr}, ${dialogue.level}, ${dialogue.lines.length} replik` +
      (done ? ', tamamlandı' : '')
  );
  row.onclick = () => openDialogueSetup(dialogue.id);
  return row;
}

function renderLevelFilter() {
  if (!el.dialogueLevelFilter) return;
  const all = getAllLoadedDialogues();
  const options = [
    { id: 'all', label: 'Tümü', count: all.length },
    ...LEVELS.map((level) => ({
      id: level,
      label: level,
      count: all.filter((dialogue) => dialogue.level === level).length,
    })),
  ].filter((option) => option.count > 0);

  el.dialogueLevelFilter.innerHTML = options
    .map(
      (option) =>
        `<button type="button" class="chip${
          levelFilter === option.id ? ' is-active' : ''
        }" data-level="${option.id}">${option.label}
          <span class="chip-count">${option.count}</span>
        </button>`
    )
    .join('');
}

function renderDialogueList() {
  const all = getAllLoadedDialogues();
  const visible =
    levelFilter === 'all' ? all : all.filter((dialogue) => dialogue.level === levelFilter);

  if (el.dialogueHomeSub) {
    const done = countCompleted();
    el.dialogueHomeSub.textContent = done
      ? `${totalDialogueCount()} sahne · ${done} tanesini oynadın.`
      : `${totalDialogueCount()} sahne. Bir rol seç ve konuşmayı sen sürdür.`;
  }

  renderLevelFilter();

  if (!el.dialogueList) return;
  el.dialogueList.innerHTML = '';

  if (visible.length === 0) {
    el.dialogueList.innerHTML = '<p class="app-message">Bu seviyede sahne yok.</p>';
    return;
  }

  visible.forEach((dialogue) => el.dialogueList.appendChild(dialogueRow(dialogue)));
}

export async function openDialogues() {
  // Liste ekranına varmak sahneyi terk etmektir. Sekme çubuğundan da buraya
  // gelinebildiği için durdurma çağrısı girişin kendisinde durur.
  stopScene();
  showScreen('dialogues');

  if (dataReady) {
    renderDialogueList();
    return;
  }

  if (el.dialogueList) el.dialogueList.innerHTML = '<p class="app-message">Yükleniyor…</p>';

  try {
    await loadDialogueManifest();
    await loadAllDialogues();
    dataReady = true;
    renderDialogueList();
  } catch (error) {
    console.error(error);
    if (el.dialogueList) {
      el.dialogueList.innerHTML = '<p class="app-message">Diyaloglar yüklenemedi.</p>';
    }
    toast('Diyaloglar yüklenemedi', '⚠️');
  }
}

/** Devam eden seslendirmeyi/mikrofonu durdurur. Bölümden ayrılırken çağrılır. */
export function stopDialogueScene() {
  stopScene();
}

/** Sahneden ya da hazırlıktan listeye dönüş. */
export function backToDialogues() {
  stopScene();
  renderDialogueList();
  showScreen('dialogues');
}

// ==================================================================
// Hazırlık ekranı: rol ve mod seçimi
// ==================================================================

function renderSetup() {
  const dialogue = scene.dialogue;
  if (!dialogue) return;

  if (el.dialogueSetupTitle) el.dialogueSetupTitle.textContent = dialogue.title;
  if (el.dialogueSetupTitleTr) el.dialogueSetupTitleTr.textContent = dialogue.titleTr;
  if (el.dialogueSetupContext) el.dialogueSetupContext.textContent = dialogue.context;
  if (el.dialogueSetupLevel) {
    el.dialogueSetupLevel.className = `level-badge level-${dialogue.level.toLowerCase()}`;
    el.dialogueSetupLevel.textContent = dialogue.level;
  }
  if (el.dialogueSetupCount) {
    el.dialogueSetupCount.textContent = `${dialogue.lines.length} replik`;
  }

  if (el.dialogueRoles) {
    el.dialogueRoles.innerHTML = dialogue.roles
      .map((role) => {
        const lines = dialogue.lines.filter((line) => line.role === role).length;
        return `<button type="button" class="role-btn${
          scene.userRole === role ? ' is-active' : ''
        }" data-role="${esc(role)}">
            <span class="role-btn-name">${esc(role)}</span>
            <span class="role-btn-lines">${lines} replik senin</span>
          </button>`;
      })
      .join('');
  }

  if (el.dialogueModes) {
    // Tarayıcı desteklemiyorsa "Konuş" hiç listelenmez — sessiz geri düşüş.
    const modes = DIALOGUE_MODES.filter(
      (mode) => mode.id !== 'speak' || speechRecognitionSupported
    );
    el.dialogueModes.innerHTML = modes
      .map(
        (mode) =>
          `<button type="button" class="mode-btn${
            scene.mode === mode.id ? ' is-active' : ''
          }" data-mode="${mode.id}">
            <span class="mode-btn-icon" aria-hidden="true">${mode.icon}</span>
            <span class="mode-btn-label">${mode.label}</span>
            <span class="mode-btn-hint">${mode.hint}</span>
          </button>`
      )
      .join('');
  }

  if (el.dialogueStartBtn) el.dialogueStartBtn.disabled = !scene.userRole;
}

export function openDialogueSetup(dialogueId) {
  const dialogue = getAllLoadedDialogues().find((item) => item.id === dialogueId);
  if (!dialogue) return;

  stopScene();
  scene.dialogue = dialogue;
  scene.userRole = dialogue.roles[0];
  scene.partnerRole = dialogue.roles[1];
  // Desteklenmeyen tarayıcıda seçili mod "konuş"ta kalmasın.
  if (scene.mode === 'speak' && !speechRecognitionSupported) scene.mode = 'read';

  renderSetup();
  showScreen('dialogue-setup');
}

/** Hazırlık ekranından sahneye dönüş yolu (özet ekranındaki "Rolü değiştir"). */
export function backToSetup() {
  stopScene();
  renderSetup();
  showScreen('dialogue-setup');
}

// ==================================================================
// Sahne
// ==================================================================

/** Rol başına ses: iki farklı ses varsa ayrılır, yoksa perde farkıyla ayrışır. */
function voiceForRole(role) {
  const voices = englishVoices();
  const index = scene.dialogue?.roles.indexOf(role) ?? 0;
  if (voices.length >= 2) return { voice: voices[index % voices.length], pitch: 1 };
  return { voice: voices[0] || null, pitch: index === 0 ? 1 : 1.25 };
}

function bubble(line, side) {
  const node = document.createElement('div');
  node.className = `bubble bubble--${side}`;
  node.innerHTML = `
    <div class="bubble-role">${esc(line.role)}</div>
    <div class="bubble-en">${esc(line.en)}</div>
    <div class="bubble-tr" hidden>${esc(line.tr)}</div>
    <div class="bubble-actions">
      <button type="button" class="bubble-btn" data-bubble="speak" aria-label="Seslendir">🔊</button>
      <button type="button" class="bubble-btn" data-bubble="tr" aria-label="Türkçesini göster">🇹🇷</button>
    </div>
  `;
  node.querySelector('[data-bubble="speak"]').onclick = () => {
    const { voice, pitch } = voiceForRole(line.role);
    speakLine(line.en, { voice, pitch });
  };
  node.querySelector('[data-bubble="tr"]').onclick = () => {
    const tr = node.querySelector('.bubble-tr');
    tr.hidden = !tr.hidden;
  };
  return node;
}

function appendBubble(line, side) {
  if (!el.dialogueThread) return;
  el.dialogueThread.appendChild(bubble(line, side));
  el.dialogueThread.scrollTop = el.dialogueThread.scrollHeight;
}

function setTurnPanel(html) {
  if (!el.dialogueTurn) return;
  el.dialogueTurn.innerHTML = html;
  el.dialogueTurn.scrollIntoView({ block: 'nearest' });
}

function renderProgress() {
  const total = scene.dialogue?.lines.length || 0;
  const pct = total ? Math.round((scene.index / total) * 100) : 0;
  if (el.dialogueFill) el.dialogueFill.style.width = `${pct}%`;
  if (el.dialogueCounter) {
    el.dialogueCounter.textContent = `${Math.min(scene.index + 1, total)} / ${total}`;
  }
}

/**
 * Sahneyi tamamen durdurur: seslendirme, mikrofon ve beklemedeki replik geçişi.
 * Ekrandan ayrılırken ve yeniden başlatırken şart — biri bile atlanırsa eski
 * zincir arka planda çalışmaya devam eder.
 */
function stopScene() {
  // Numarayı ilerlet: uçuşta olan geri çağrılar artık geçersiz.
  scene.run += 1;

  scene.cancelSpeak?.();
  scene.cancelSpeak = null;

  if (scene.advanceTimer) {
    clearTimeout(scene.advanceTimer);
    scene.advanceTimer = null;
  }

  if (scene.listenTimer) {
    clearTimeout(scene.listenTimer);
    scene.listenTimer = null;
  }

  if (scene.recognition) {
    try {
      scene.recognition.onresult = null;
      scene.recognition.onerror = null;
      scene.recognition.onend = null;
      scene.recognition.abort();
    } catch {
      /* zaten durmuş olabilir */
    }
    scene.recognition = null;
  }
}

/** Kullanıcının repliğini onaylayıp sıradaki replike geçer. */
function commitUserLine(line) {
  appendBubble(line, 'user');
  scene.index += 1;
  renderProgress();
  playNext();
}

function acceptedAnswers(line) {
  return [line.en, ...(line.alternatives || [])];
}

// ---- Kullanıcı sırası: üç mod ----

function promptRead(line) {
  setTurnPanel(`
    <div class="turn-card">
      <div class="turn-label">Senin sıran — oku</div>
      <p class="turn-en">${esc(line.en)}</p>
      <p class="turn-tr">${esc(line.tr)}</p>
      <button type="button" class="btn btn-primary btn-block" data-turn="continue">Devam</button>
    </div>
  `);
}

function promptRecall(line, revealed = false) {
  setTurnPanel(`
    <div class="turn-card">
      <div class="turn-label">Senin sıran — İngilizcesi nasıldı?</div>
      <p class="turn-tr turn-tr--lead">${esc(line.tr)}</p>
      ${revealed ? `<p class="turn-en">${esc(line.en)}</p>` : ''}
      ${
        revealed
          ? '<button type="button" class="btn btn-primary btn-block" data-turn="continue">Devam</button>'
          : '<button type="button" class="btn btn-primary btn-block" data-turn="reveal">Cevabı gör</button>'
      }
    </div>
  `);
}

function scoreClass(score) {
  if (score >= DIALOGUE.goodScore) return 'is-good';
  if (score >= DIALOGUE.weakScore) return 'is-ok';
  return 'is-weak';
}

function promptSpeak(line, result = null) {
  const heard = result
    ? `<p class="turn-heard"><span class="turn-heard-label">Duyulan</span>${esc(result.said)}</p>`
    : '';
  const score = result
    ? `<div class="turn-score ${scoreClass(result.score)}">%${result.score}
         <span>${
           result.score >= DIALOGUE.goodScore
             ? 'çok iyi'
             : result.score >= DIALOGUE.weakScore
               ? 'yaklaştın'
               : 'tekrar dene'
         }</span>
       </div>`
    : '';

  setTurnPanel(`
    <div class="turn-card">
      <div class="turn-label">Senin sıran — söyle</div>
      <p class="turn-tr turn-tr--lead">${esc(line.tr)}</p>
      ${result ? `<p class="turn-en">${esc(line.en)}</p>` : ''}
      ${score}
      ${heard}
      <div class="turn-actions">
        <button type="button" class="btn btn-primary" data-turn="listen">
          🎙️ ${result ? 'Tekrar söyle' : 'Konuş'}
        </button>
        ${
          result
            ? '<button type="button" class="btn btn-ghost" data-turn="continue">Devam</button>'
            : '<button type="button" class="btn btn-ghost" data-turn="skip">Geç</button>'
        }
      </div>
    </div>
  `);
}

function promptListening(line) {
  setTurnPanel(`
    <div class="turn-card is-listening">
      <div class="turn-label">Dinliyorum…</div>
      <p class="turn-tr turn-tr--lead">${esc(line.tr)}</p>
      <div class="mic-pulse" aria-hidden="true">🎙️</div>
      <button type="button" class="btn btn-ghost btn-block" data-turn="stop">Durdur</button>
    </div>
  `);
}

function startListening(line) {
  if (!speechRecognitionSupported) return;

  stopScene();
  promptListening(line);

  const recognition = new RecognitionCtor();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  scene.recognition = recognition;

  let settled = false;
  const settle = (said) => {
    if (settled) return;
    settled = true;
    if (scene.listenTimer) clearTimeout(scene.listenTimer);
    scene.listenTimer = null;
    scene.recognition = null;

    if (!said) {
      promptSpeak(line);
      return;
    }
    const score = bestSimilarity(said, acceptedAnswers(line));
    scene.scores.push(score);
    promptSpeak(line, { said, score });
  };

  recognition.onresult = (event) => {
    const alternatives = [...(event.results[0] || [])].map((item) => item.transcript);
    // Tanıyıcının kendi alternatifleri arasından en iyi eşleşeni al: motor
    // "a medium latte"yi "8 medium latte" diye yazabiliyor.
    const accepted = acceptedAnswers(line);
    const best = alternatives.reduce(
      (winner, said) => {
        const score = bestSimilarity(said, accepted);
        return score > winner.score ? { said, score } : winner;
      },
      { said: alternatives[0] || '', score: -1 }
    );
    settle(best.said);
  };

  recognition.onerror = () => settle(null);
  recognition.onend = () => settle(null);

  scene.listenTimer = setTimeout(() => {
    try {
      recognition.stop();
    } catch {
      /* yoksay */
    }
    settle(null);
  }, DIALOGUE.listenTimeout);

  try {
    recognition.start();
  } catch {
    settle(null);
  }
}

function promptUser(line) {
  if (scene.mode === 'recall') return promptRecall(line);
  if (scene.mode === 'speak') return promptSpeak(line);
  return promptRead(line);
}

/**
 * Sıradaki repliği oynatır; karşı tarafınki kendiliğinden seslendirilir.
 * @param {number} run başlatıldığı sahne numarası — eskimişse hiçbir şey yapmaz
 */
function playNext(run = scene.run) {
  if (run !== scene.run) return;

  const dialogue = scene.dialogue;
  if (!dialogue) return;

  renderProgress();

  if (scene.index >= dialogue.lines.length) {
    finishScene();
    return;
  }

  const line = dialogue.lines[scene.index];

  if (line.role === scene.userRole) {
    promptUser(line);
    return;
  }

  appendBubble(line, 'partner');
  setTurnPanel('<div class="turn-waiting">…</div>');

  const { voice, pitch } = voiceForRole(line.role);
  scene.cancelSpeak = speakLine(line.en, {
    voice,
    pitch,
    onEnd: () => {
      if (run !== scene.run) return;
      scene.cancelSpeak = null;
      scene.index += 1;
      scene.advanceTimer = setTimeout(() => {
        scene.advanceTimer = null;
        playNext(run);
      }, DIALOGUE.linePause);
    },
  });
}

export function startScene() {
  const dialogue = scene.dialogue;
  if (!dialogue || !scene.userRole) return;

  stopScene();
  scene.partnerRole = dialogue.roles.find((role) => role !== scene.userRole) || dialogue.roles[0];
  scene.index = 0;
  scene.scores = [];

  if (el.dialogueThread) el.dialogueThread.innerHTML = '';
  if (el.dialoguePlayArea) el.dialoguePlayArea.classList.remove('hidden');
  if (el.dialogueSummaryArea) el.dialogueSummaryArea.classList.add('hidden');
  if (el.dialoguePlayTitle) el.dialoguePlayTitle.textContent = dialogue.title;
  if (el.dialoguePlayRole) {
    el.dialoguePlayRole.textContent = `${scene.userRole} rolündesin`;
  }

  showScreen('dialogue-play');
  playNext();
}

// ==================================================================
// Özet
// ==================================================================

async function renderKeyPhrases(dialogue) {
  if (!el.dialogueSummaryPhrases) return;

  const ids = dialogue.keyPhrases || [];
  if (ids.length === 0) {
    el.dialogueSummaryPhrases.innerHTML = '';
    return;
  }

  el.dialogueSummaryPhrases.innerHTML = '<p class="app-message">Kalıplar yükleniyor…</p>';

  try {
    await loadPhraseManifest();
    await loadAllPhrases();
    const phrases = getPhrasesByIds(ids);
    el.dialogueSummaryPhrases.innerHTML = phrases
      .map(
        (phrase) => `
          <div class="summary-phrase">
            <span class="summary-phrase-en">${esc(phrase.en)}</span>
            <span class="summary-phrase-tr">${esc(phrase.tr)}</span>
          </div>`
      )
      .join('');
  } catch (error) {
    console.error(error);
    el.dialogueSummaryPhrases.innerHTML = '';
  }
}

function finishScene() {
  const dialogue = scene.dialogue;
  if (!dialogue) return;

  stopScene();

  const scores = scene.scores;
  const average = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;

  const firstTime = markCompleted(dialogue.id, {
    role: scene.userRole,
    mode: scene.mode,
    score: average,
  });

  // Diyalog XP verir ama günlük hedefi ilerletmez: hedef "çalışılan kart"
  // sayar ve ölçüsü kelime tekrarıdır. Sahne oynamak onu şişirmemeli.
  if (firstTime) {
    addXp(DIALOGUE.xpPerDialogue);
    renderHeader();
    toast(`Sahne tamamlandı · +${DIALOGUE.xpPerDialogue} XP`, '🎭');
  }

  if (el.dialoguePlayArea) el.dialoguePlayArea.classList.add('hidden');
  if (el.dialogueSummaryArea) el.dialogueSummaryArea.classList.remove('hidden');
  if (el.dialogueSummaryTitle) el.dialogueSummaryTitle.textContent = dialogue.title;
  if (el.dialogueSummaryText) {
    el.dialogueSummaryText.textContent =
      `${scene.userRole} rolüyle ${dialogue.lines.length} repliklik sahneyi bitirdin.`;
  }

  if (el.dialogueSummaryScore) {
    const show = average !== null;
    el.dialogueSummaryScore.classList.toggle('hidden', !show);
    if (show) {
      el.dialogueSummaryScore.className = `summary-score ${scoreClass(average)}`;
      el.dialogueSummaryScore.innerHTML =
        `<span class="summary-score-value">%${average}</span>` +
        `<span class="summary-score-label">ortalama telaffuz · ${scores.length} replik</span>`;
    }
  }

  renderKeyPhrases(dialogue);
  window.scrollTo(0, 0);
}

// ==================================================================
// Bağlamalar
// ==================================================================

/** Sahnedeki tek tıklama dinleyicisi: panel her seferinde yeniden çizildiği için. */
function handleTurnClick(event) {
  const button = event.target.closest('[data-turn]');
  if (!button) return;

  const dialogue = scene.dialogue;
  const line = dialogue?.lines[scene.index];
  if (!line) return;

  switch (button.dataset.turn) {
    case 'continue':
      commitUserLine(line);
      break;
    case 'reveal':
      promptRecall(line, true);
      break;
    case 'listen':
      startListening(line);
      break;
    case 'stop':
      stopScene();
      promptSpeak(line);
      break;
    case 'skip':
      commitUserLine(line);
      break;
    default:
      break;
  }
}

export function bindDialogues() {
  if (el.dialogueLevelFilter) {
    el.dialogueLevelFilter.onclick = (event) => {
      const button = event.target.closest('[data-level]');
      if (!button) return;
      levelFilter = button.dataset.level;
      renderDialogueList();
    };
  }

  if (el.dialogueRoles) {
    el.dialogueRoles.onclick = (event) => {
      const button = event.target.closest('[data-role]');
      if (!button) return;
      scene.userRole = button.dataset.role;
      renderSetup();
    };
  }

  if (el.dialogueModes) {
    el.dialogueModes.onclick = (event) => {
      const button = event.target.closest('[data-mode]');
      if (!button) return;
      scene.mode = button.dataset.mode;
      renderSetup();
    };
  }

  if (el.dialogueStartBtn) el.dialogueStartBtn.onclick = startScene;
  if (el.dialogueTurn) el.dialogueTurn.onclick = handleTurnClick;
  if (el.dialogueReplayBtn) el.dialogueReplayBtn.onclick = startScene;
  if (el.dialogueChangeRoleBtn) el.dialogueChangeRoleBtn.onclick = backToSetup;
  if (el.dialogueFinishBtn) el.dialogueFinishBtn.onclick = backToDialogues;
}
