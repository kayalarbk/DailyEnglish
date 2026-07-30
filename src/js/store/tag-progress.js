// Etiket bazlı ilerleme: "Fizik kelimeleri: %34".
//
// Alan ilerlemesi kart id'sinin önekinden, hiç kart verisi indirmeden
// hesaplanabiliyor (`progress.js`). Etiket ilerlemesi bunu yapamaz: etiket
// id'de değil kartın içinde durur, dolayısıyla alan dosyalarının yüklenmiş
// olması gerekir. Bu yüzden burada bir indeks tutuluyor ve arayüz onu HAZIRSA
// gösteriyor — anasayfanın açılışı 21 dosya indirmeyi beklemek zorunda değil.

import { getFieldCards, loadField } from '../data/repository.js';
import { getProgressForCards } from './progress.js';

/** @type {Map<string, object[]>} etiket -> o etiketi taşıyan kartlar */
let index = new Map();
/** İndekse hangi alanların girdiği; tekrar kurmaya gerek var mı bilmek için. */
let indexedFields = [];
/** @type {Promise<void>|null} aynı anda ikinci bir yükleme başlamasın */
let building = null;

function buildIndex(fieldIds) {
  const next = new Map();

  fieldIds.forEach((fieldId) => {
    getFieldCards(fieldId).forEach((card) => {
      (card.tags || []).forEach((tag) => {
        const list = next.get(tag);
        if (list) list.push(card);
        else next.set(tag, [card]);
      });
    });
  });

  index = next;
  indexedFields = [...fieldIds];
}

/** İndeks bu alan kümesi için hazır mı? */
export function isTagIndexReady(fieldIds) {
  if (indexedFields.length === 0) return false;
  return fieldIds.every((id) => indexedFields.includes(id));
}

/**
 * Alanları indirir ve etiket indeksini kurar.
 * Alan verisi repository'de önbelleklendiği için ikinci çağrı ağa çıkmaz.
 * @param {string[]} fieldIds
 */
export function ensureTagIndex(fieldIds) {
  if (isTagIndexReady(fieldIds)) return Promise.resolve();
  if (building) return building;

  building = Promise.all(fieldIds.map((id) => loadField(id)))
    .then(() => buildIndex(fieldIds))
    .catch((error) => {
      // İndeks kurulamazsa ilerleme bölümü gizli kalır; uygulama çalışmaya devam eder.
      console.warn('Etiket indeksi kurulamadı:', error);
    })
    .finally(() => {
      building = null;
    });

  return building;
}

/** Bir etiketi taşıyan kartlar (indeks hazır değilse boş). */
export function cardsWithTag(tagId) {
  return index.get(tagId) || [];
}

/**
 * Verilen etiketlerin ilerlemesi, kartı olanlar önce ve en düşük yüzde üstte.
 *
 * Sıralama bilinçli: kullanıcı "en çok nerede geridesin" sorusunun cevabını
 * listenin başında görsün. Hiç kartı olmayan etiket listelenmez — henüz
 * yazılmamış bir katmanı %0 diye göstermek yanıltıcı olur.
 *
 * @param {string[]} tagIds
 * @returns {{ tag: string, learned: number, total: number, pct: number,
 *   startedPct: number, due: number }[]}
 */
export function getTagProgress(tagIds) {
  return tagIds
    .map((tag) => ({ tag, ...getProgressForCards(cardsWithTag(tag)) }))
    .filter((row) => row.total > 0)
    .sort((a, b) => a.pct - b.pct || b.total - a.total);
}

/** Test ve alan seçimi değişince indeksi geçersiz kılmak için. */
export function resetTagIndex() {
  index = new Map();
  indexedFields = [];
}
