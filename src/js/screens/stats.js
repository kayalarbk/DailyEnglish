// İstatistik ekranı: kutu dağılımı, son 14 günün çalışması, en çok unutulanlar.
//
// Kullanıcı ilerlemesini şimdiye kadar yalnız alan yüzdeleri olarak görüyordu
// ("Günlük Rutin %38"). O sayı ne kadar borç biriktiğini, hangi kelimenin
// sürekli unutulduğunu ve düzenli çalışıp çalışmadığını göstermiyor — SRS'in
// biriktirdiği bilginin çoğu kullanıcıya hiç ulaşmıyordu.
//
// Ekran ANASAYFADAKİ BİR KARTTAN açılır; sekme çubuğuna dördüncü sekme
// EKLENMEDİ. Üç sekme uygulamanın üç bölümü demek (kelime · kalıp · diyalog);
// istatistik bir bölüm değil, kelime bölümünün üzerine bakış.
//
// Üç bölümün ikisi kayıtlardan anında hesaplanır (kutu dağılımı, geçmiş);
// üçüncüsü kart METNİ gerektirir ve bu yüzden arka planda yüklenir — ekran
// açılışı 29 dosyanın inmesini beklemez (tag-progress'teki desenin aynısı).

import { el } from '../dom.js';
import { SRS } from '../config.js';
import { getFieldMeta, getCardsByIds, loadField } from '../data/repository.js';
import { getInterests } from '../store/interests.js';
import { getBoxDistribution, getMostLapsed, STATUS_LABELS } from '../store/progress.js';
import { getHistory, getStats, historyDayCount } from '../store/stats.js';
import { showScreen } from './navigation.js';

/** Grafikte gösterilecek gün sayısı. */
const HISTORY_DAYS = 14;

/** Listelenecek en çok unutulan kart sayısı. */
const LAPSE_LIMIT = 10;

/**
 * Kart metni hangi alanlar için hazır. Alan listesi değişirse kapsam da
 * değişir; bir bayrak yerine liste tutulması bu yüzden — yeni eklenen alanın
 * kartları "zaten yüklendi" sanılmamalı (tag-progress'te aynı desen).
 * @type {string[]}
 */
let loadedFields = [];
/** @type {Promise<void>|null} aynı anda ikinci bir yükleme başlamasın */
let loading = null;

const cardsReadyFor = (fieldIds) =>
  fieldIds.length === 0 || fieldIds.every((id) => loadedFields.includes(id));

const escapeHtml = (text) =>
  String(text ?? '').replace(/[&<>"]/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]
  );

/**
 * Kutu dağılımı: Yeni · Öğreniliyor · Pekişti · Kalıcı.
 *
 * Yatay çubuklar CSS ile çiziliyor; grafik kütüphanesi eklemek bağımlılıksız
 * kalma kararını dört sayı uğruna bozmak olurdu.
 */
function renderBoxes() {
  if (!el.statsBoxes) return;

  const interests = getInterests();
  const counts = getBoxDistribution(interests);

  if (counts.total === 0) {
    el.statsBoxes.innerHTML =
      '<p class="stats-empty">Henüz alan seçmemişsin. Anasayfadan bir alan ekleyince ' +
      'dağılım burada görünecek.</p>';
    return;
  }

  const rows = [
    { key: 'new', value: counts.new },
    { key: 'learning', value: counts.learning },
    { key: 'familiar', value: counts.familiar },
    { key: 'mastered', value: counts.mastered },
  ];

  el.statsBoxes.innerHTML = rows
    .map((row) => {
      const pct = counts.total ? Math.round((row.value / counts.total) * 100) : 0;
      return `
      <div class="stats-bar-row">
        <span class="stats-bar-name">${STATUS_LABELS[row.key]}</span>
        <span class="stats-bar-track">
          <span class="stats-bar-fill is-${row.key}" style="width:${pct}%"></span>
        </span>
        <span class="stats-bar-value">${row.value}</span>
      </div>`;
    })
    .join('');

  if (el.statsBoxesNote) {
    const studied = counts.total - counts.new;
    el.statsBoxesNote.textContent =
      studied === 0
        ? `${counts.total} kartın hiçbiri çalışılmadı`
        : `${studied} / ${counts.total} kart çalışıldı · ` +
          `kalıcı sayılmak için ${SRS.masteredBox}. kutu gerekiyor`;
  }
}

/**
 * Son 14 günün çalışılan kart sayısı.
 *
 * Kayıt bugün başlıyor: geriye dönük veri UYDURULMADI (bkz. store/stats.js).
 * Bu yüzden ilk günlerde grafiğin çoğu boş olacak ve bunu gizlemek yerine
 * açıkça söylüyoruz — sahte bir dolu grafik, kullanıcının kendi geçmişi
 * hakkında yalan söylerdi.
 */
function renderHistory() {
  if (!el.statsHistory) return;

  const days = getHistory(HISTORY_DAYS);
  const max = Math.max(...days.map((day) => day.count), getStats().dailyGoal, 1);
  const total = days.reduce((sum, day) => sum + day.count, 0);

  el.statsHistory.innerHTML = days
    .map((day) => {
      const height = Math.round((day.count / max) * 100);
      const label = new Date(`${day.day}T00:00:00`).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
      });
      return `
      <div class="stats-day${day.isToday ? ' is-today' : ''}"
           title="${label}: ${day.count} kart">
        <span class="stats-day-bar" style="height:${Math.max(height, day.count > 0 ? 6 : 2)}%"></span>
        <span class="stats-day-label">${day.day.slice(8)}</span>
      </div>`;
    })
    .join('');

  if (el.statsHistoryNote) {
    if (total === 0) {
      el.statsHistoryNote.textContent =
        historyDayCount() === 0
          ? 'Grafik bugünden itibaren dolar — geçmiş kayıt tutulmaya yeni başlandı.'
          : 'Son 14 günde hiç çalışılmamış.';
    } else {
      el.statsHistoryNote.textContent =
        `${HISTORY_DAYS} günde ${total} kart · günde ortalama ` +
        `${Math.round((total / HISTORY_DAYS) * 10) / 10}`;
    }
  }
}

/**
 * En çok unutulanlar: `lapses` en yüksek kartlar, alan adıyla.
 *
 * Kart metni kayıtlarda yok, alan dosyalarında. Ekran bu yüzden önce
 * kayıtlardan listeyi kurar, metin gelene kadar "yükleniyor" der ve hazır
 * olunca kendini tazeler.
 */
function renderLapses() {
  if (!el.statsLapses) return;

  const interests = getInterests();
  const rows = getMostLapsed(interests, LAPSE_LIMIT);

  if (rows.length === 0) {
    el.statsLapses.innerHTML =
      '<p class="stats-empty">Henüz unuttuğun kart yok. Tekrarlarda bir kartı ' +
      '"Hatırlamadım" dediğinde burada görünür.</p>';
    return;
  }

  if (!cardsReadyFor(interests)) {
    el.statsLapses.innerHTML = '<p class="stats-empty">Kelimeler yükleniyor…</p>';
    ensureCards(interests).then(() => {
      // Sonsuz döngü yok: ikinci geçişte kapsam hazır, bu dal çalışmaz.
      if (cardsReadyFor(interests)) renderStats();
    });
    return;
  }

  const cards = new Map(getCardsByIds(rows.map((row) => row.id)).map((card) => [card.id, card]));

  el.statsLapses.innerHTML = rows
    .map((row) => {
      const card = cards.get(row.id);
      const fieldId = row.id.replace(/-\d+$/, '');
      const fieldName = getFieldMeta(fieldId)?.name || fieldId;
      // Kart veriden kaldırılmış olabilir; kayıt duruyor ama metni yok.
      const en = card ? escapeHtml(card.en) : row.id;
      const tr = card ? escapeHtml(card.tr) : 'kart veriden kaldırılmış';
      return `
      <div class="stats-lapse-row">
        <span class="stats-lapse-body">
          <span class="stats-lapse-en">${en}</span>
          <span class="stats-lapse-tr">${tr}</span>
          <span class="stats-lapse-field">${escapeHtml(fieldName)}</span>
        </span>
        <span class="stats-lapse-count" title="${row.lapses} kez unutuldu">
          ${row.lapses}×
        </span>
      </div>`;
    })
    .join('');
}

/** Alan dosyalarını arka planda indirir (kart metinleri için). */
function ensureCards(fieldIds) {
  if (cardsReadyFor(fieldIds)) return Promise.resolve();
  if (loading) return loading;

  loading = Promise.all(fieldIds.map((id) => loadField(id)))
    .then(() => {
      loadedFields = [...new Set([...loadedFields, ...fieldIds])];
    })
    .catch((error) => {
      // Metin gelmezse liste id'lerle çizilir; ekran çalışmaya devam eder.
      console.warn('İstatistik için kart verisi yüklenemedi:', error);
    })
    .finally(() => {
      loading = null;
    });

  return loading;
}

export function renderStats() {
  const stats = getStats();

  if (el.statsSummary) {
    el.statsSummary.innerHTML = `
      <div class="stats-tile">
        <span class="stats-tile-value">${stats.streak}</span>
        <span class="stats-tile-label">günlük seri</span>
      </div>
      <div class="stats-tile">
        <span class="stats-tile-value">${stats.xp.toLocaleString('tr-TR')}</span>
        <span class="stats-tile-label">puan</span>
      </div>
      <div class="stats-tile">
        <span class="stats-tile-value">${stats.todayCount}</span>
        <span class="stats-tile-label">bugün çalışılan</span>
      </div>`;
  }

  renderBoxes();
  renderHistory();
  renderLapses();
}

export function openStats() {
  renderStats();
  showScreen('stats');
}

