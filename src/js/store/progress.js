// Öğrenme takibi — aralıklı tekrar (Leitner).
//
// Kart başına tek bir "öğrenildi" bayrağı yerine bir tekrar kaydı tutulur:
// hangi kutuda olduğu, ne zaman tekrar edileceği ve geçmiş başarı sayıları.
// Bir kart ancak SRS.masteredBox kutusuna çıkarsa (yani ~2 hafta arayla
// hatırlanmayı sürdürürse) "öğrenildi" sayılır — böylece rozet bir beyana
// değil, zamana yayılmış kanıta dayanır.
//
// Anahtar, kartın kalıcı id'sidir ("gunluk-rutin-101"). Kart metni değişse bile
// ilerleme korunur. Id'nin alan öneki sayesinde bir alandaki ilerleme, kart
// verisi indirilmeden yalnızca kayıtlardan hesaplanabilir.

import { SRS, STORAGE_KEYS } from '../config.js';
import { getFieldMeta } from '../data/repository.js';
import { addDays, dayKey } from '../utils.js';
import { read, remove, write } from './storage.js';

/**
 * @typedef {object} SrsRecord
 * @property {number} box kutu sırası (0 = yeni/unutulmuş)
 * @property {string} due bir sonraki tekrar günü (YYYY-MM-DD)
 * @property {number} seen kaç kez değerlendirildi
 * @property {number} correct kaç kez hatırlandı
 * @property {number} lapses kaç kez unutuldu (kutu sıfırlandı)
 * @property {string} last son değerlendirme günü
 */

/** @type {Record<string, SrsRecord>} */
let records = read(STORAGE_KEYS.srs, {});

/** Eski biçimdeki ("Kategori::kelime") kayıtlar; alan yüklendikçe id'ye taşınır. */
let legacyMap = read(STORAGE_KEYS.learnedLegacy, {});

const MAX_BOX = SRS.intervals.length - 1;

function persist() {
  write(STORAGE_KEYS.srs, records);
}

/** Kutuya karşılık gelen tekrar günü. */
function dueForBox(box) {
  return addDays(SRS.intervals[Math.min(box, MAX_BOX)] ?? 0);
}

// ------------------------------------------------------------------
// Eski sürümlerden taşıma
// ------------------------------------------------------------------

/**
 * `de_learned_v2` (id dizisi) kayıtlarını SRS kayıtlarına taşır.
 * Kullanıcı o kartları bir kez öğrendiğini işaretlemişti; sıfırdan başlatmak
 * haksızlık olurdu. Orta kutuya, bugün tekrar edilecek şekilde açılırlar —
 * ilk tekrar gerçek durumu ortaya çıkarır.
 */
function migrateFlatLearned() {
  const legacyIds = read(STORAGE_KEYS.learned, null);
  if (!Array.isArray(legacyIds)) return;

  const today = dayKey();
  legacyIds.forEach((id) => {
    if (!id || records[id]) return;
    records[id] = {
      box: SRS.migrationBox,
      due: today,
      seen: 1,
      correct: 1,
      lapses: 0,
      last: today,
    };
  });

  persist();
  remove(STORAGE_KEYS.learned);
}

migrateFlatLearned();

/**
 * Daha eski "Kategori::kelime" kayıtlarını, alan ilk yüklendiğinde id'lere taşır.
 * Taşınan kayıtlar eski depodan silinir; eşleşmeyenler sonraki alanlar için kalır.
 * @param {object} field yüklenmiş alan verisi
 */
export function migrateLegacyProgress(field) {
  if (!field?.categories) return;
  if (Object.keys(legacyMap).length === 0) return;

  const today = dayKey();
  let changed = false;

  field.categories.forEach((category) => {
    category.cards.forEach((card) => {
      const key = `${category.name}::${card.en}`;
      if (!legacyMap[key]) return;
      if (!records[card.id]) {
        records[card.id] = {
          box: SRS.migrationBox,
          due: today,
          seen: 1,
          correct: 1,
          lapses: 0,
          last: today,
        };
      }
      delete legacyMap[key];
      changed = true;
    });
  });

  if (!changed) return;
  persist();
  if (Object.keys(legacyMap).length === 0) {
    legacyMap = {};
    write(STORAGE_KEYS.learnedLegacy, {});
  } else {
    write(STORAGE_KEYS.learnedLegacy, legacyMap);
  }
}

// ------------------------------------------------------------------
// Okuma
// ------------------------------------------------------------------

/** @returns {SrsRecord|null} kartın tekrar kaydı; hiç çalışılmadıysa null */
export function getRecord(card) {
  return records[card?.id] || null;
}

/**
 * Tüm tekrar kayıtları (kart id -> kayıt), salt okunur amaçlı.
 * Günlük deste kurucusu hangi kartın yeni hangisinin vadesi geldiğini bilmek
 * için ham kayıtlara ihtiyaç duyar; saf kalabilmesi adına bu modülü değil,
 * verisini alır.
 * @returns {Record<string, SrsRecord>}
 */
export function getAllRecords() {
  return records;
}

/**
 * Kartın durumu.
 * - `new`       hiç değerlendirilmedi
 * - `learning`  0-1. kutu (taze ya da yeni unutulmuş)
 * - `familiar`  2-3. kutu (pekişiyor)
 * - `mastered`  masteredBox ve üstü (kalıcı)
 * @returns {'new'|'learning'|'familiar'|'mastered'}
 */
export function getCardStatus(card) {
  const record = getRecord(card);
  if (!record) return 'new';
  if (record.box >= SRS.masteredBox) return 'mastered';
  if (record.box >= 2) return 'familiar';
  return 'learning';
}

/** Durumların arayüzde kullanılan etiketleri. */
export const STATUS_LABELS = {
  new: 'Yeni',
  learning: 'Öğreniliyor',
  familiar: 'Pekişti',
  mastered: 'Kalıcı',
};

/** Kartın tekrar günü geldi mi? Hiç çalışılmamış kart "tekrar" değil, yenidir. */
export function isDue(card, today = dayKey()) {
  const record = getRecord(card);
  return Boolean(record) && record.due <= today;
}

/** Bugün çalışılacak kartlar: tekrar günü gelmiş olanlar + hiç görülmemişler. */
export function isPending(card, today = dayKey()) {
  const record = getRecord(card);
  return !record || record.due <= today;
}

// ------------------------------------------------------------------
// Yazma
// ------------------------------------------------------------------

/**
 * Bir değerlendirmeyi kaydeder ve kartı kutular arasında taşır.
 *
 * @param {object} card
 * @param {'again'|'hard'|'good'} grade
 * @param {{ maxBox?: number }} [options] `maxBox`: bu değerlendirmenin
 *   taşıyabileceği en üst kutu (çoktan seçmeli quiz için SRS.recognitionMaxBox).
 * @returns {{ box: number, previousBox: number, wasNew: boolean,
 *   justMastered: boolean, lapsed: boolean, due: string, status: string }}
 */
export function reviewCard(card, grade, { maxBox = MAX_BOX } = {}) {
  const id = card?.id;
  if (!id) {
    return {
      box: 0, previousBox: 0, wasNew: false, justMastered: false,
      lapsed: false, due: dayKey(), status: 'new',
    };
  }

  const today = dayKey();
  const existing = records[id];
  const previousBox = existing?.box ?? 0;
  const wasNew = !existing;
  const wasMastered = previousBox >= SRS.masteredBox;

  let box = previousBox;
  if (grade === 'again') {
    box = 0;
  } else if (grade === 'hard') {
    // Kutuyu korur ama ilerletmez: hatırlandı, henüz sağlamlaşmadı.
    box = Math.max(previousBox, 1);
  } else {
    box = Math.min(previousBox + 1, MAX_BOX);
  }

  // Tanımaya dayalı doğru cevap kartı belli bir kutunun üstüne taşıyamaz —
  // ama kartın hâlihazırda ulaştığı kutuyu da geri almaz.
  box = Math.min(box, Math.max(maxBox, previousBox));

  const record = {
    box,
    due: dueForBox(box),
    seen: (existing?.seen ?? 0) + 1,
    correct: (existing?.correct ?? 0) + (grade === 'again' ? 0 : 1),
    lapses: (existing?.lapses ?? 0) + (grade === 'again' && previousBox > 0 ? 1 : 0),
    last: today,
  };

  records[id] = record;
  persist();

  return {
    box,
    previousBox,
    wasNew,
    justMastered: !wasMastered && box >= SRS.masteredBox,
    lapsed: grade === 'again' && previousBox > 0,
    due: record.due,
    status: getCardStatus(card),
  };
}

// ------------------------------------------------------------------
// Toplamlar
// ------------------------------------------------------------------

/** Bir kart listesinin durum dağılımı. */
export function statusCounts(cards = []) {
  const counts = { new: 0, learning: 0, familiar: 0, mastered: 0 };
  cards.forEach((card) => {
    counts[getCardStatus(card)]++;
  });
  return counts;
}

/** Bir kategoride tekrar günü gelmiş kart adedi (yeni kartlar sayılmaz). */
export function countDueInCards(cards = []) {
  const today = dayKey();
  return cards.reduce((sum, card) => sum + (isDue(card, today) ? 1 : 0), 0);
}

/** Alan id'sine göre kayıtlarda dolaşır (kart verisi gerekmez). */
function forEachRecordInField(fieldId, callback) {
  const prefix = `${fieldId}-`;
  Object.keys(records).forEach((id) => {
    if (id.startsWith(prefix)) callback(id, records[id]);
  });
}

/** Bir alanda kalıcı sayılan kart adedi (kart verisi gerekmez). */
export function countLearnedInField(fieldId) {
  let count = 0;
  forEachRecordInField(fieldId, (_id, record) => {
    if (record.box >= SRS.masteredBox) count++;
  });
  return count;
}

/**
 * Bir alanda tekrar günü gelmiş kart adedi.
 * Hiç görülmemiş kartlar sayılmaz — onlar "yeni", tekrar borcu değil.
 */
export function countDueInField(fieldId) {
  const today = dayKey();
  let count = 0;
  forEachRecordInField(fieldId, (_id, record) => {
    if (record.due <= today) count++;
  });
  return count;
}

/** Tekrar günü gelmiş kart id'leri; alan id'sine göre gruplanır. */
export function getDueIdsByField(fieldIds) {
  const today = dayKey();
  /** @type {Record<string, string[]>} */
  const grouped = {};
  fieldIds.forEach((fieldId) => {
    const ids = [];
    forEachRecordInField(fieldId, (id, record) => {
      if (record.due <= today) ids.push(id);
    });
    if (ids.length > 0) grouped[fieldId] = ids;
  });
  return grouped;
}

/** Seçili alanlarda toplam tekrar borcu. */
export function countDue(fieldIds) {
  return fieldIds.reduce((sum, id) => sum + countDueInField(id), 0);
}

/**
 * Herhangi bir kart kümesinin ilerleme özeti.
 *
 * Alan ilerlemesi (`getFieldProgress`) kart id'sinin alan önekinden hesaplanır
 * ve kart verisi indirilmeden çalışır — o ucuz yol bilerek korunuyor. Etiket
 * ilerlemesi ("Fizik kelimeleri: %34") aynı yolu kullanamaz, çünkü etiket
 * id'de değil kartın kendisinde durur. Bu fonksiyon kart NESNELERİ alır;
 * çağıran hangi kümeyi sorduğuna kendisi karar verir.
 *
 * @param {object[]} cards
 * @returns {{ learned: number, started: number, total: number, pct: number,
 *   startedPct: number, due: number }}
 */
export function getProgressForCards(cards = []) {
  const today = dayKey();
  let learned = 0;
  let started = 0;
  let due = 0;

  cards.forEach((card) => {
    const record = records[card?.id];
    if (!record) return;
    started += 1;
    if (record.box >= SRS.masteredBox) learned += 1;
    if (record.due <= today) due += 1;
  });

  const total = cards.length;
  return {
    learned,
    started,
    total,
    pct: total ? Math.round((learned / total) * 100) : 0,
    startedPct: total ? Math.round((started / total) * 100) : 0,
    due,
  };
}

/**
 * Bir alanın ilerleme özeti.
 * `learned` kalıcı kartları, `started` çalışılmaya başlanmışları sayar; ilerleme
 * çubuğu ikisini birlikte gösterebilsin diye ikisi de döner.
 * @returns {{ learned: number, started: number, total: number, pct: number,
 *   startedPct: number, due: number }}
 */
export function getFieldProgress(fieldId) {
  const total = getFieldMeta(fieldId)?.wordCount || 0;

  let learned = 0;
  let started = 0;
  forEachRecordInField(fieldId, (_id, record) => {
    started++;
    if (record.box >= SRS.masteredBox) learned++;
  });

  learned = Math.min(learned, total);
  started = Math.min(started, total);

  return {
    learned,
    started,
    total,
    pct: total ? Math.round((learned / total) * 100) : 0,
    startedPct: total ? Math.round((started / total) * 100) : 0,
    due: countDueInField(fieldId),
  };
}

