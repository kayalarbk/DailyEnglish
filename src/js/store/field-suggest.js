// Bölüme uygun ama kullanıcının listesinde olmayan alanların önerisi.
//
// Sorun: alan listesi kullanıcının kendi seçimi ve günlük deste yalnız o
// listeden kuruluyor (`daily-session.js` → `resolveFieldIds`). Sonradan yazılan
// bir alan, kullanıcı onu elle eklemedikçe hiç görünmüyor — 1200 kartlık
// bölümsel içerik, tam da hizmet etmesi gereken öğrenciye ulaşmıyordu.
//
// Çözüm, listeyi kullanıcı adına DEĞİŞTİRMEK DEĞİL: neyin eklenebileceğini
// söyleyip kararı ona bırakmak. Kullanıcının seçtiği alanlar onun beyanıdır;
// sessizce büyütmek "senin adına da şunu seçtim" demektir.
//
// Sayı TAHMİN EDİLMEZ, sayılır. Bunun için aday alan dosyalarının inmesi
// gerekiyor; bu yüzden hesap arka planda yapılır ve öneri ancak hazır olunca
// çizilir (etiket ilerlemesindeki desenin aynısı). Dosyalar zaten service
// worker önbelleğinde olduğu için ilk ziyaretten sonra ağa çıkılmaz.

import { STORAGE_KEYS } from '../config.js';
import { read, write } from './storage.js';
import { getFieldCards, getFields, loadField } from '../data/repository.js';
import { getSelectedTags, matchesTagQuery } from './tags.js';

/**
 * Bir alanın önerilmeye değmesi için gereken en az kart sayısı.
 *
 * Eşiksiz hâlde Elektrik-Elektronik öğrencisine "Sağlık Bilimleri Dili" de
 * öneriliyordu — çünkü orada ona uyan 1 kart vardı. Alan listesine 1 kart için
 * bir satır eklemek kazanç değil kalabalıktır; günlük deste o alandan pratikte
 * hiç kart çekmez. Öneri, kullanıcının listesini büyütmeye değecek kadar
 * içerik olduğunda çıkmalı.
 */
const MIN_CARDS = 10;

/** Kullanıcının "şimdi değil" dediği alan id'leri. */
let dismissed = read(STORAGE_KEYS.fieldSuggestSeen, []);
if (!Array.isArray(dismissed)) dismissed = [];

/**
 * Son hesabın sonucu. Anahtar, hesabın hangi girdilerle yapıldığı:
 * sorgu ya da alan listesi değişirse hesap geçersizdir.
 * @type {{ key: string, fields: {id: string, name: string, count: number}[] }|null}
 */
let cached = null;
/** @type {Promise<void>|null} aynı anda ikinci bir yükleme başlamasın */
let building = null;

const keyOf = (interests, tags) => `${[...interests].sort().join(',')}|${[...tags].sort().join(',')}`;

/** Öneriyi geçilmiş sayılan alanlar dışındaki adaylar. */
function candidateIds(interests) {
  return getFields()
    .map((field) => field.id)
    .filter((id) => !interests.includes(id) && !dismissed.includes(id));
}

/**
 * Hesap bu girdiler için hazır mı? Hazır değilse arayüz öneriyi hiç çizmez —
 * yarım bir sayı göstermektense hiç göstermemek doğru.
 * @param {string[]} interests
 */
export function isSuggestionReady(interests) {
  return cached !== null && cached.key === keyOf(interests, getSelectedTags());
}

/**
 * Aday alanları indirir ve bölüme uyan kartları sayar.
 * Bölüm seçilmemişse öneri anlamsızdır (süzgeç yoksa "sana uygun" da yoktur).
 * @param {string[]} interests
 * @returns {Promise<void>}
 */
export function ensureSuggestion(interests) {
  const tags = getSelectedTags();
  const key = keyOf(interests, tags);

  if (cached?.key === key) return Promise.resolve();
  if (building) return building;

  if (tags.length === 0) {
    cached = { key, fields: [] };
    return Promise.resolve();
  }

  const ids = candidateIds(interests);
  if (ids.length === 0) {
    cached = { key, fields: [] };
    return Promise.resolve();
  }

  building = Promise.all(ids.map((id) => loadField(id).catch(() => null)))
    .then((fields) => {
      const rows = [];
      fields.forEach((field) => {
        if (!field) return; // inemeyen alan sessizce atlanır
        const count = getFieldCards(field.id).filter((card) => matchesTagQuery(card, tags)).length;
        if (count >= MIN_CARDS) rows.push({ id: field.id, name: field.name, count });
      });
      // En çok kart getiren üstte: kullanıcı ilk satırda en büyük kazancı görsün.
      rows.sort((a, b) => b.count - a.count);
      cached = { key, fields: rows };
    })
    .catch((error) => {
      // Öneri hesaplanamazsa banner hiç çıkmaz; uygulama çalışmaya devam eder.
      console.warn('Alan önerisi hesaplanamadı:', error);
    })
    .finally(() => {
      building = null;
    });

  return building;
}

/**
 * Hazır öneri: bölüme uyan kart taşıyan, listede olmayan alanlar.
 * Hazır değilse boş dizi döner.
 * @param {string[]} interests
 * @returns {{ id: string, name: string, count: number }[]}
 */
export function getSuggestion(interests) {
  return isSuggestionReady(interests) ? cached.fields : [];
}

/**
 * "Şimdi değil": bu alanlar bir daha önerilmez.
 * Alan id'leri tek tek saklanır, "kapattı" bayrağı değil — sonradan YENİ bir
 * alan eklenirse öneri yeniden çıkmalı, çünkü o alan hakkında kullanıcı henüz
 * bir şey söylemedi.
 * @param {string[]} fieldIds
 */
export function dismissSuggestion(fieldIds) {
  dismissed = [...new Set([...dismissed, ...fieldIds])];
  write(STORAGE_KEYS.fieldSuggestSeen, dismissed);
  cached = null;
}

/** Alan eklendikten sonra hesabı geçersiz kılar. */
export function resetSuggestion() {
  cached = null;
}
