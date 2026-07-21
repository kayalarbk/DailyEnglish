// Uygulama genelinde kullanılan sabitler.

/** Alan listesini tanımlayan manifest dosyası. */
export const FIELDS_MANIFEST = 'src/data/fields/fields.json';

/** Bir quiz turundaki soru sayısı. */
export const QUIZ_LENGTH = 5;

/** localStorage anahtarları. */
export const STORAGE_KEYS = {
  learned: 'de_learned_v2', // öğrenilen kart id'leri (dizi)
  learnedLegacy: 'kartlar_learned_v1', // eski biçim: { "Kategori::kelime": true }
  interests: 'de_interests_v1', // seçili alan id'leri
  stats: 'de_stats_v1', // seri, XP, günlük hedef
};

/**
 * CEFR seviyeleri. Sıra hem filtre butonlarında hem özet çiplerinde kullanılır.
 * Kart verisinde seviye eksikse DEFAULT_LEVEL varsayılır.
 */
export const LEVELS = ['A1', 'A2', 'B1', 'B2'];
export const DEFAULT_LEVEL = 'A2';

/** Oyunlaştırma ayarları. */
export const GAMIFICATION = {
  /** Varsayılan günlük hedef (kelime). */
  defaultDailyGoal: 10,
  /** Bir kelimeyi "öğrendim" işaretlemenin puanı. */
  xpPerWord: 10,
  /** Quizde bir doğru cevabın puanı. */
  xpPerCorrectAnswer: 5,
  /** Seçilebilecek en az alan sayısı. */
  minInterests: 1,
};

/** Seslendirme (Web Speech API) ayarları. */
export const SPEECH = {
  lang: 'en-US',
  rate: 0.9,
};
