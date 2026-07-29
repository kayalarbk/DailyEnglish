// Anasayfa: günlük hedef, seri ve seçili alanların ilerlemesi.

import { el } from '../dom.js';
import { getFieldMeta, getFields } from '../data/repository.js';
import { getInterests, setInterests } from '../store/interests.js';
import { getLevelChoice, getProfileMeta, getRecommendedFields } from '../store/profile.js';
import { countDue, getFieldProgress } from '../store/progress.js';
import { getStats, setDailyGoal } from '../store/stats.js';
import { getDailySettings, getSession, isSessionComplete } from '../store/daily-session.js';
import { countLearned as countLearnedPhrases } from '../store/phrases.js';
import { countCompleted as countCompletedDialogues } from '../store/dialogues.js';
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

/**
 * Profil çipi: "🛠️ Mühendislik · İdare ederim" — dokununca test yeniden açılır.
 * Testi hiç çözmemiş kullanıcıya (eski sürümden gelenlere) çağrı olarak görünür.
 */
function renderProfileChip() {
  if (!el.profileChip) return;
  el.profileChip.classList.remove('hidden');

  const meta = getProfileMeta();
  if (!meta) {
    el.profileChip.classList.add('is-empty');
    el.profileChip.innerHTML =
      '<span aria-hidden="true">🎯</span> Seni tanıyalım' +
      '<span class="profile-chip-edit" aria-hidden="true">testi çöz</span>';
    return;
  }

  const level = getLevelChoice();
  el.profileChip.classList.remove('is-empty');
  el.profileChip.innerHTML =
    `<span aria-hidden="true">${meta.icon}</span> ${meta.label}` +
    (level ? `<span class="profile-chip-level">${level.label}</span>` : '') +
    '<span class="profile-chip-edit" aria-hidden="true">değiştir</span>';
}

function renderGreeting(stats) {
  if (el.greetingTitle) el.greetingTitle.textContent = greetingForHour(new Date().getHours());

  if (!el.greetingSub) return;

  // Tekrar borcu her şeyin önüne geçer: unutma eğrisi bekleyeni affetmiyor.
  const due = countDue(getInterests());
  if (due > 0) {
    el.greetingSub.textContent = `${due} kart tekrarını bekliyor.`;
    return;
  }

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
    const mastered = stats.todayMastered > 0
      ? ` Bugün ${stats.todayMastered} kelime kalıcı oldu.`
      : '';
    el.goalText.textContent = stats.goalReached
      ? `Hedef tamam! 🎉${mastered}`
      : `${remaining} kart kaldı.${mastered}`;
  }
}

/**
 * Günün destesi kartı — uygulamanın tek giriş noktası.
 *
 * Eski "Bugünün tekrarı" kartının yerini alır; ikinci bir giriş eklenmedi çünkü
 * iki ayrı "başla" düğmesi kullanıcıyı hangisinin doğru olduğuna karar vermek
 * zorunda bırakırdı.
 *
 * Kart üç hâlde olur: henüz kurulmamış · yarım kalmış · tamamlanmış.
 * Deste kurulmadan kırılım (kaç tekrar / kaç yeni) bilinemez, çünkü yeni kart
 * saymak bütün alan dosyalarını indirmeyi gerektirir. Kurulmamış hâlde bu
 * yüzden yalnız tekrar borcu gösterilir — o, kayıtlardan ucuza sayılabiliyor.
 */
function renderDailyCard() {
  if (!el.dailyCard) return;

  const session = getSession();
  const goal = getStats().dailyGoal;

  const setNote = (text) => {
    if (!el.dailyNote) return;
    el.dailyNote.textContent = text || '';
    el.dailyNote.classList.toggle('hidden', !text);
  };

  // --- Henüz kurulmamış ---
  if (!session) {
    const due = countDue(getInterests());
    // Destenin gerçek boyu tavanların küçüğüdür: hedef, ama en fazla
    // "bekleyen tekrar + günlük yeni kart hakkı". Yeni kullanıcıya "20 kart"
    // vaat edip 5 kart vermek sözü tutmamak olurdu.
    const expected = Math.min(goal, due + getDailySettings().newPerDay);

    if (el.dailyTitle) el.dailyTitle.textContent = 'Bugüne Başla';
    if (el.dailyText) {
      if (expected === 0) {
        el.dailyText.textContent =
          'Bugünlük her şey tamam. Yeni kart tavanını ayarlardan artırabilirsin.';
      } else if (due > 0) {
        el.dailyText.textContent =
          `${due} kart tekrarını bekliyor. Bugün için ${expected} kartlık bir deste hazırlayalım.`;
      } else {
        el.dailyText.textContent =
          `Tekrar borcun yok. ${expected} yeni kartla başlayalım.`;
      }
    }
    if (el.dailyStartBtn) el.dailyStartBtn.disabled = expected === 0;
    if (el.dailyProgress) el.dailyProgress.classList.add('hidden');
    if (el.dailyBreakdown) el.dailyBreakdown.innerHTML = '';
    setNote('');
    if (el.dailyStartBtn) {
      el.dailyStartBtn.textContent = 'Başla';
      el.dailyStartBtn.classList.remove('hidden');
    }
    if (el.dailyExtraBtn) el.dailyExtraBtn.classList.add('hidden');
    return;
  }

  const total = session.steps.length;
  const done = Math.min(session.index, total);
  const complete = isSessionComplete(session);

  if (el.dailyProgress) el.dailyProgress.classList.remove('hidden');
  if (el.dailyFill) {
    el.dailyFill.style.width = `${total ? Math.round((done / total) * 100) : 0}%`;
  }
  if (el.dailyProgressLabel) el.dailyProgressLabel.textContent = `${done} / ${total}`;

  if (el.dailyBreakdown) {
    const parts = [];
    if (session.stats?.due) parts.push(`<span class="daily-chip is-due">${session.stats.due} tekrar</span>`);
    if (session.stats?.new) parts.push(`<span class="daily-chip is-new">${session.stats.new} yeni</span>`);
    el.dailyBreakdown.innerHTML = parts.join('');
  }

  // Desteye sığmayan tekrarlar ERTELENMEDİ, sadece bugün gösterilmiyor.
  // Kullanıcı birikmeyi görsün ama panik etmesin diye küçük bir not.
  setNote(session.stats?.trimmedDue ? `+${session.stats.trimmedDue} tekrar yarına kaldı` : '');

  // --- Tamamlanmış ---
  if (complete) {
    if (el.dailyTitle) el.dailyTitle.textContent = 'Bugünü tamamladın ✓';
    if (el.dailyText) el.dailyText.textContent = 'Yarın yeni bir deste hazır olacak.';
    if (el.dailyStartBtn) el.dailyStartBtn.classList.add('hidden');
    if (el.dailyExtraBtn) el.dailyExtraBtn.classList.remove('hidden');
    return;
  }

  // --- Yarım kalmış ---
  if (el.dailyTitle) el.dailyTitle.textContent = 'Bugüne Devam Et';
  if (el.dailyText) {
    el.dailyText.textContent = `${total - done} kart kaldı.`;
  }
  if (el.dailyStartBtn) {
    el.dailyStartBtn.textContent = 'Devam et';
    el.dailyStartBtn.disabled = false;
    el.dailyStartBtn.classList.remove('hidden');
  }
  if (el.dailyExtraBtn) el.dailyExtraBtn.classList.add('hidden');
}

/** Bir alan satırı oluşturur. `muted` keşfet listesi içindir. */
function fieldRow(meta, { muted = false, recommended = false } = {}) {
  const { learned, total, pct, startedPct, due } = getFieldProgress(meta.id);

  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'field-row';
  row.style.setProperty('--row-color', meta.color);
  // İki katmanlı çubuk: soluk kısım çalışılmaya başlananlar, dolu kısım kalıcılar.
  row.innerHTML = `
    <span class="field-row-icon" aria-hidden="true">${meta.icon}</span>
    <span class="field-row-body">
      <span class="field-row-name">
        ${meta.name}
        ${pct === 100 ? '<span class="field-row-done">✓ tamam</span>' : ''}
        ${due > 0 ? `<span class="field-row-due">${due} tekrar</span>` : ''}
        ${recommended ? '<span class="field-row-tag">sana uygun</span>' : ''}
      </span>
      <span class="field-row-meta">
        ${
          muted
            ? `<span class="field-row-pct">${total} kelime</span>`
            : `<span class="progress-track">
                 <span class="progress-ghost" style="width:${startedPct}%"></span>
                 <span class="progress-fill" style="width:${pct}%"></span>
               </span>
               <span class="field-row-pct">%${pct}</span>`
        }
      </span>
    </span>
  `;
  row.setAttribute(
    'aria-label',
    muted
      ? `${meta.name}, ${total} kelime`
      : `${meta.name}, ${learned} / ${total} kalıcı` +
        (due > 0 ? `, ${due} kart tekrar bekliyor` : '')
  );
  row.onclick = () => openField(meta.id);
  if (!muted) return row;

  // Keşfet satırları: alanı açmadan doğrudan listeye eklemek için "+" düğmesi.
  const wrap = document.createElement('div');
  wrap.className = 'field-row-wrap';
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'field-add-btn';
  add.textContent = '+ Ekle';
  add.setAttribute('aria-label', `${meta.name} alanını ekle`);
  add.onclick = () => {
    setInterests([...getInterests(), meta.id]);
    renderHome();
    toast(`${meta.name} eklendi`, '➕');
  };
  wrap.append(row, add);
  return wrap;
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

  // Keşfet: profile göre önerilenler üstte.
  const recommended = getRecommendedFields();
  const rank = (id) => {
    const index = recommended.indexOf(id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  const others = getFields()
    .filter((field) => !interests.includes(field.id))
    .sort((a, b) => rank(a.id) - rank(b.id));

  if (el.exploreHead) el.exploreHead.classList.toggle('hidden', others.length === 0);
  if (el.exploreFieldList) {
    el.exploreFieldList.innerHTML = '';
    others.forEach((meta) =>
      el.exploreFieldList.appendChild(
        fieldRow(meta, { muted: true, recommended: recommended.includes(meta.id) })
      )
    );
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

/**
 * Kalıp ve diyalog kısayolları.
 * Sayılar yalnız yerel kayıttan okunur — anasayfa bu iki modülün veri
 * dosyalarını indirmek zorunda kalmasın, açılış hızlı olsun.
 */
function renderModuleCards() {
  const phrases = countLearnedPhrases();
  const dialogues = countCompletedDialogues();

  if (el.homePhrasesMeta) {
    el.homePhrasesMeta.textContent = phrases
      ? `${phrases} kalıp öğrendin`
      : 'Gerçek hayat ifadeleri';
  }
  if (el.homeDialoguesMeta) {
    el.homeDialoguesMeta.textContent = dialogues
      ? `${dialogues} sahne oynadın`
      : 'Rol yaparak konuş';
  }
}

export function renderHome() {
  const stats = getStats();
  renderProfileChip();
  renderGreeting(stats);
  renderDailyCard();
  renderGoal(stats);
  renderModuleCards();
  renderFieldLists();
  renderHeader();

  // Alan bazlı çalışma duruyor ama artık ikincil: günün destesi ana giriş.
  // Etiketi "Bugüne Başla" kalsaydı iki düğme aynı şeyi vaat ederdi.
  if (el.continueBtn) {
    const target = nextFieldId();
    el.continueBtn.disabled = !target;
    el.continueBtn.textContent = 'Alan seçerek çalış';
  }
}

export function goHome() {
  renderHome();
  showScreen('home');
}

/**
 * @param {() => void} onEditInterests alan ekle/çıkar bağlantısı
 * @param {() => void} onRetakeQuiz profil çipi (testi yeniden çöz)
 * @param {{ onPhrases?: () => void, onDialogues?: () => void,
 *   onDaily?: (trigger: HTMLButtonElement) => void, onExtra?: () => void }} [modules]
 */
export function bindHome(onEditInterests, onRetakeQuiz, modules = {}) {
  if (el.homePhrasesBtn && modules.onPhrases) el.homePhrasesBtn.onclick = modules.onPhrases;
  if (el.homeDialoguesBtn && modules.onDialogues) {
    el.homeDialoguesBtn.onclick = modules.onDialogues;
  }
  if (el.dailyStartBtn && modules.onDaily) {
    el.dailyStartBtn.onclick = () => modules.onDaily(el.dailyStartBtn);
  }
  if (el.dailyExtraBtn && modules.onExtra) el.dailyExtraBtn.onclick = modules.onExtra;

  if (el.continueBtn) {
    el.continueBtn.onclick = () => {
      const target = nextFieldId();
      if (target) openField(target);
    };
  }

  if (el.editInterestsBtn) el.editInterestsBtn.onclick = onEditInterests;
  if (el.profileChip) el.profileChip.onclick = onRetakeQuiz;

  if (el.goalSelect) {
    el.goalSelect.onchange = () => {
      setDailyGoal(Number(el.goalSelect.value));
      renderHome();
    };
  }
}
