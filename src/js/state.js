// Ekranlar arası paylaşılan gezinme durumu.
// Modüller arası döngüsel bağımlılığı önlemek için tek bir nesne üzerinden taşınır.

export const state = {
  /** @type {string|null} açık alanın id'si */
  fieldId: null,
  /** @type {string|null} açık kategorinin adı */
  categoryName: null,
  /** @type {object[]} kartlar ekranındaki geçerli deste (karıştırılabilir) */
  deck: [],
  /** görüntülenen kartın destedeki sırası */
  cardIndex: 0,
  /** kart arka yüzü açık mı */
  flipped: false,
  /** sadece öğrenilmemiş kartları göster */
  onlyUnlearned: false,
};
