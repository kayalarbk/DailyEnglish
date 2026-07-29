// Anasayfa: günlük hedef, seri ve seçili alanların ilerlemesi.

import { el } from '../dom.js';
import { getCardsByIds, getFieldMeta, getFields, loadField } from '../data/repository.js';
import { getInterests, setInterests } from '../store/interests.js';
import { getLevelChoice, getProfileMeta, getRecommendedFields } from '../store/profile.js';
import {
  countDue,
  getDueIdsByField,
  getFieldProgress,
  migrateLegacyProgress,
} from '../store/progress.js';
import { getStats, setDailyGoal } from '../store/stats.js';
import { countLearned as countLearnedPhrases } from '../store/phrases.js';
import { countCompleted as countCompletedDialogues } from '../store/dialogues.js';
import { shuffleArray } from '../utils.js';
import { renderHeader } from '../ui/header.js';
import { toast } from '../ui/toast.js';
import { openReviewDeck } from './cards.js';
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
 * Tekrar kuyruğu kartı: bugün vadesi gelmiş kartların sayısı.
 * Kuyruk boşsa kart gizlenir — "borcun yok" mesajı yeni kelimeye yönlendirir.
 */
function renderDueCard() {
  if (!el.dueCard) return;

  const due = getDueIdsByField(getInterests());
  const count = Object.values(due).reduce((sum, ids) => sum + ids.length, 0);

  el.dueCard.classList.toggle('hidden', count === 0);
  if (count === 0) return;

  const fieldCount = Object.keys(due).length;
  if (el.dueCount) el.dueCount.textContent = String(count);
  if (el.dueText) {
    el.dueText.textContent =
      fieldCount > 1
        ? `${fieldCount} alandan toplandı. Unutmadan önce yakala.`
        : 'Unutma eğrisi bugün bu kartlardan geçiyor.';
  }
  if (el.dueStartBtn) el.dueStartBtn.disabled = false;
}

/**
 * Tekrar seansını başlatır: vadesi gelmiş kartların alanlarını indirir,
 * hepsini tek bir destede toplar ve kartlar ekranını açar.
 */
async function startReviewSession() {
  const grouped = getDueIdsByField(getInterests());
  const fieldIds = Object.keys(grouped);
  if (fieldIds.length === 0) return;

  if (el.dueStartBtn) {
    el.dueStartBtn.disabled = true;
    el.dueStartBtn.textContent = 'Hazırlanıyor…';
  }

  try {
    const fields = await Promise.all(fieldIds.map((id) => loadField(id)));
    fields.forEach(migrateLegacyProgress);

    const allIds = fieldIds.flatMap((id) => grouped[id]);
    const cards = shuffleArray(getCardsByIds(allIds));

    if (cards.length === 0) {
      toast('Tekrar edilecek kart bulunamadı', '🤔');
      return;
    }
    openReviewDeck(cards);
  } catch (error) {
    console.error(error);
    toast('Tekrar listesi yüklenemedi', '⚠️');
  } finally {
    if (el.dueStartBtn) {
      el.dueStartBtn.disabled = false;
      el.dueStartBtn.textContent = 'Tekrara başla';
    }
  }
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
  renderDueCard();
  renderGoal(stats);
  renderModuleCards();
  renderFieldLists();
  renderHeader();

  if (el.continueBtn) {
    const target = nextFieldId();
    el.continueBtn.disabled = !target;
    el.continueBtn.textContent = stats.todayCount > 0 ? 'Devam Et' : 'Bugüne Başla';
  }
}

export function goHome() {
  renderHome();
  showScreen('home');
}

/**
 * @param {() => void} onEditInterests alan ekle/çıkar bağlantısı
 * @param {() => void} onRetakeQuiz profil çipi (testi yeniden çöz)
 * @param {{ onPhrases?: () => void, onDialogues?: () => void }} [modules] kısayol kartları
 */
export function bindHome(onEditInterests, onRetakeQuiz, modules = {}) {
  if (el.homePhrasesBtn && modules.onPhrases) el.homePhrasesBtn.onclick = modules.onPhrases;
  if (el.homeDialoguesBtn && modules.onDialogues) {
    el.homeDialoguesBtn.onclick = modules.onDialogues;
  }

  if (el.continueBtn) {
    el.continueBtn.onclick = () => {
      const target = nextFieldId();
      if (target) openField(target);
    };
  }

  if (el.dueStartBtn) el.dueStartBtn.onclick = startReviewSession;
  if (el.editInterestsBtn) el.editInterestsBtn.onclick = onEditInterests;
  if (el.profileChip) el.profileChip.onclick = onRetakeQuiz;

  if (el.goalSelect) {
    el.goalSelect.onchange = () => {
      setDailyGoal(Number(el.goalSelect.value));
      renderHome();
    };
  }
}
