// Kullanıcının etiket sorgusu: hangi bölümü seçti, hangi etiketlerle çalışıyor.
//
// `interests.js` (seçili ALANLAR) bilerek yerinde bırakıldı ve bu depo onun
// yanına eklendi. İkisi farklı soruları cevaplıyor:
//   interests → hangi kart havuzundan çalışılacak (anasayfa ızgarası, alan
//               detayı, günlük destenin kaynağı)
//   tags      → o havuzun içinden neyin öne çıkacağı (süzgeç)
// Tek bir depoya indirgenseydi, alanı etiketten türetmek için onboarding'in
// 19 alan dosyasını indirmesi gerekirdi; test şu an hiç kart verisi yüklemiyor.

import { STORAGE_KEYS } from '../config.js';
import { read, write } from './storage.js';

const EMPTY = { presetId: null, tags: [] };

let query = { ...EMPTY, ...read(STORAGE_KEYS.tags, {}) };
if (!Array.isArray(query.tags)) query.tags = [];

/** Etiket sorgusu (salt okunur kopya). */
export function getTagQuery() {
  return { presetId: query.presetId, tags: [...query.tags] };
}

/** Seçili etiketler. Boş dizi = süzgeç yok, her kart geçerli. */
export function getSelectedTags() {
  return [...query.tags];
}

/** Kullanıcı bir bölüm seçmiş mi? */
export function hasTagQuery() {
  return query.tags.length > 0;
}

/**
 * @param {{ presetId?: string|null, tags?: string[] }} next
 */
export function setTagQuery(next) {
  query = {
    presetId: next.presetId ?? null,
    tags: [...new Set(next.tags ?? [])],
  };
  write(STORAGE_KEYS.tags, query);
  return getTagQuery();
}

/** Tek bir etiketi açıp kapatır (ince ayar ekranı). */
export function toggleTag(tagId) {
  const tags = new Set(query.tags);
  const on = !tags.has(tagId);
  if (on) tags.add(tagId);
  else tags.delete(tagId);
  setTagQuery({ presetId: query.presetId, tags: [...tags] });
  return on;
}

export function isTagSelected(tagId) {
  return query.tags.includes(tagId);
}

/**
 * Kart, geçerli sorguya uyuyor mu?
 *
 * Eksenler arasında VE, eksen içinde VEYA çalışır: kullanıcı "fizik VEYA
 * matematik" ve "laboratuvar VEYA makale" dediğinde ikisini de sağlayan kartlar
 * gelir. Sorguda hiç bulunmayan eksen kısıt getirmez — bölüm demetinde `type:`
 * yok diye tüm kartlar elenmemeli.
 *
 * KRİTİK: kartın hiç etiketi olmayan ekseni onu ELEMEZ.
 *
 * Akademik çekirdeğin tamamı bilerek `dom:` etiketi taşımaz — "give rise to"
 * fizikte de hukukta da aynı işi görür. Eksik etiket "bu eksende uymuyor"
 * sayılsaydı, mühendislik öğrencisinin sorgusu 50 çekirdek kartının sıfırını
 * getirirdi; yani mimarinin en yüksek getirili katmanı, tam da hizmet etmesi
 * gereken kullanıcıdan gizlenirdi. Etiketin yokluğu KARŞITLIK değil
 * NÖTRLÜK'tür: alansız kart her alana yazılır.
 *
 * Bu, sorguyu gevşetmez: `dom:medicine` taşıyan kart `dom:physics` sorgusunda
 * yine elenir, `ctx:everyday` taşıyan kart `ctx:paper` sorgusunda yine elenir.
 * Yalnızca "hiçbir şey söylemeyen" eksen görmezden gelinir.
 *
 * @param {object} card
 * @param {string[]} [selected] varsayılan: kullanıcının sorgusu
 */
export function matchesTagQuery(card, selected = query.tags) {
  if (selected.length === 0) return true;

  const cardTags = card?.tags || [];
  const axes = new Set(selected.map((tag) => tag.split(':')[0]));

  return [...axes].every((axis) => {
    const onAxis = cardTags.filter((tag) => tag.startsWith(`${axis}:`));
    if (onAxis.length === 0) return true; // nötr: bu eksende iddiası yok

    const wanted = selected.filter((tag) => tag.startsWith(`${axis}:`));
    return wanted.some((tag) => onAxis.includes(tag));
  });
}

/**
 * Sorguya uyan kartları süzer; hiç kart kalmazsa süzgeci uygulamadan tümünü
 * döndürür. Kullanıcıyı boş desteyle baş başa bırakmak, biraz alakasız kart
 * göstermekten kötüdür — özellikle akademik içerik henüz yazılmamışken.
 * @param {object[]} cards
 * @returns {{ cards: object[], filtered: boolean }}
 */
export function applyTagQuery(cards) {
  if (query.tags.length === 0) return { cards, filtered: false };
  const matched = cards.filter((card) => matchesTagQuery(card));
  return matched.length > 0 ? { cards: matched, filtered: true } : { cards, filtered: false };
}
