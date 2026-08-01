// Uygulama genelinde kullanılan sabitler.

/** Alan listesini tanımlayan manifest dosyası. */
export const FIELDS_MANIFEST = 'src/data/fields/fields.json';

/** Günlük kalıp kategorilerini tanımlayan manifest dosyası. */
export const PHRASES_MANIFEST = 'src/data/phrases/phrases.json';

/** Diyalog kategorilerini tanımlayan manifest dosyası. */
export const DIALOGUES_MANIFEST = 'src/data/dialogues/dialogues.json';

/**
 * Etiket sözlüğü ve bölüm demetleri.
 *
 * Bu dosyalar `config.js` içine gömülmez: sözlük tek doğruluk kaynağıdır ve
 * araçlar (validate, backfill) da aynı dosyayı okur. İki yerde tutulan bir
 * liste er geç ayrışır.
 */
export const TAGS_MANIFEST = 'src/data/tags.json';
export const PRESETS_MANIFEST = 'src/data/presets.json';

/** Bir quiz turundaki soru sayısı. */
export const QUIZ_LENGTH = 5;

/** localStorage anahtarları. */
export const STORAGE_KEYS = {
  srs: 'de_srs_v1', // kart id -> tekrar kaydı { box, due, seen, correct, lapses }
  learned: 'de_learned_v2', // eski biçim: öğrenilen kart id'leri (dizi) — SRS'e taşınır
  learnedLegacy: 'kartlar_learned_v1', // daha eski biçim: { "Kategori::kelime": true }
  interests: 'de_interests_v1', // seçili alan id'leri
  stats: 'de_stats_v1', // seri, XP, günlük hedef
  profile: 'de_profile_v1', // tanışma testinin sonucu
  phraseFavorites: 'de_phrase_fav_v1', // favori kalıp id'leri (dizi)
  phraseLearned: 'de_phrase_learned_v1', // öğrenildi işaretlenen kalıp id'leri (dizi)
  dialoguesDone: 'de_dialogue_done_v1', // diyalog id -> { at, role, mode, score }
  dailySettings: 'de_daily_settings_v1', // günlük deste ayarları
  dailySession: 'de_daily_session_v1', // bugünün destesi ve kaldığı yer
  tags: 'de_tags_v1', // etiket sorgusu: { presetId, tags: [] }
  fieldSuggestSeen: 'de_field_suggest_v1', // önerisi görülüp geçilen alan id'leri (dizi)
};

/**
 * Günlük karma deste ("Bugüne Başla").
 *
 * Deste boyu buraya yazılmaz: `stats.dailyGoal` kullanılır. İki ayrı günlük
 * hedef sayısı olsaydı anasayfadaki hedef halkası ile deste sayacı farklı
 * şeyler söylerdi.
 */
export const DAILY = {
  /** Günde en fazla kaç yeni kart tanıtılsın. */
  defaultNewPerDay: 5,
  /** @type {'card'|'quiz'|'mixed'} */
  defaultMode: 'mixed',
  /** Seçilebilecek yeni kart tavanları. */
  newPerDayChoices: [0, 3, 5, 10],
  /** Seçilebilecek günlük hedefler (hedef halkasıyla ortak). */
  goalChoices: [5, 10, 20, 30, 50],
  /** Karışık modda bir quiz turunun en fazla soru sayısı. */
  quizBatch: 5,
};

/** Günlük destenin çalışma tipleri. */
export const DAILY_MODES = [
  { id: 'card', label: 'Kart', icon: '🗂️', hint: 'Yalnız flashcard' },
  { id: 'quiz', label: 'Quiz', icon: '🎯', hint: 'Yalnız soru' },
  { id: 'mixed', label: 'Karışık', icon: '🔀', hint: 'Kart ve soru dönüşümlü' },
];

/**
 * Diyalog (canlandırma) modu ayarları.
 */
export const DIALOGUE = {
  /** Karşı tarafın replikleri arasındaki nefes payı (ms). */
  linePause: 450,
  /** Konuşma tanıma bu eşiğin üstünde "başarılı" sayılır. */
  goodScore: 75,
  /** Bu eşiğin altı "tekrar dene" olarak işaretlenir. */
  weakScore: 50,
  /** Mikrofon en fazla bu kadar bekler (ms) — tanıma takılırsa sahne kilitlenmesin. */
  listenTimeout: 12000,
  /** Sahne tamamlandığında verilen puan. */
  xpPerDialogue: 15,
};

/** Kullanıcının repliğini nasıl vereceği. `speech` desteklenmeyen tarayıcıda gizlenir. */
export const DIALOGUE_MODES = [
  {
    id: 'read',
    label: 'Oku',
    icon: '📖',
    hint: 'Replik yazılı gelir, sen okursun.',
  },
  {
    id: 'recall',
    label: 'Hatırla',
    icon: '🧠',
    hint: 'Sadece Türkçesi gösterilir; İngilizcesini sen bulursun.',
  },
  {
    id: 'speak',
    label: 'Konuş',
    icon: '🎙️',
    hint: 'Mikrofona söylersin, benzerlik puanı alırsın.',
  },
];

/**
 * Kalıpların kullanım düzeyi (register).
 *
 * Bir kalıbın nerede kullanılamayacağını bilmek, ne anlama geldiğini bilmek
 * kadar önemli: "What's up?" doğru cümledir ama iş görüşmesinde yanlıştır.
 * Bu yüzden düzey listede rozet olarak hep görünür.
 */
export const REGISTERS = {
  formal: { id: 'formal', label: 'Resmî', hint: 'İş, resmî yazışma, tanımadığın kişiler' },
  neutral: { id: 'neutral', label: 'Nötr', hint: 'Her ortamda güvenli' },
  informal: { id: 'informal', label: 'Samimi', hint: 'Arkadaşlar, günlük hayat' },
};

/** Kalıp listesinde arama sonuçlarının üst sınırı (uzun listede kaydırma yorucu). */
export const PHRASE_RESULT_LIMIT = 80;

/**
 * CEFR seviyeleri. Sıra hem filtre butonlarında hem özet çiplerinde kullanılır.
 * Kart verisinde seviye eksikse DEFAULT_LEVEL varsayılır.
 */
export const LEVELS = ['A1', 'A2', 'B1', 'B2'];
export const DEFAULT_LEVEL = 'A2';

/**
 * Aralıklı tekrar (Leitner) ayarları.
 *
 * Kart bir kutuda durur; her doğru hatırlama onu bir üst kutuya taşır ve bir
 * sonraki tekrar o kutunun gün aralığı kadar ertelenir. Hatırlanamayan kart
 * 0. kutuya düşer. Böylece "öğrendim" bir beyan değil, zamana dayanmış bir
 * sonuç olur.
 */
export const SRS = {
  /** Kutu -> bir sonraki tekrara kaç gün. 0. kutu aynı gün tekrar gelir. */
  intervals: [0, 1, 3, 7, 16, 35],
  /** Bu kutudan itibaren kart "kalıcı" (öğrenilmiş) sayılır. */
  masteredBox: 4,
  /**
   * Çoktan seçmeli doğru cevabın taşıyabileceği en üst kutu. Dört şıkta %25
   * şansla doğru bulunabildiği için tanıma tek başına kalıcılığa yetmez;
   * son adımı ancak kart üzerinde "kolay" demek ya da yazarak bilmek açar.
   */
  recognitionMaxBox: 3,
  /** Eski sürümde "öğrendim" işaretlenmiş kartların taşınacağı kutu. */
  migrationBox: 2,
};

/** Kart değerlendirme seçenekleri (ön yüzde, cevabı görmeden). */
export const GRADES = {
  again: { id: 'again', label: 'Hatırlamadım', icon: '↺', xp: 2 },
  hard: { id: 'hard', label: 'Zor hatırladım', icon: '~', xp: 6 },
  good: { id: 'good', label: 'Kolay', icon: '✓', xp: 10 },
};

/** Oyunlaştırma ayarları. */
export const GAMIFICATION = {
  /** Varsayılan günlük hedef (tekrar sayısı). */
  defaultDailyGoal: 10,
  /** Quizde bir doğru cevabın puanı. */
  xpPerCorrectAnswer: 5,
  /** Bir kartın "kalıcı" kutusuna ilk kez ulaşmasının ek puanı. */
  xpPerMastered: 25,
  /** Seçilebilecek en az alan sayısı. */
  minInterests: 1,
};

/**
 * ESKİ tanışma testinin 1. adımı: kaba meslek grubu.
 *
 * Yerini `src/data/presets.json` içindeki ayrıntılı bölüm listesi aldı; bu
 * tablo yalnız GERİYE DÖNÜK uyumluluk için duruyor. Eski sürümde test çözmüş
 * kullanıcının profil çipi boş kalmasın ve alan önerisi çalışmaya devam etsin
 * diye siliniyor değil (bkz. store/profile.js).
 * @deprecated yeni kod `presets.json` kullanır
 */
export const PROFILES = [
  {
    id: 'muhendislik',
    label: 'Mühendislik',
    icon: '🛠️',
    hint: 'Teknik terimler, proje ve üretim dili',
    fields: ['muhendislik', 'akademik', 'is-hayati'],
  },
  {
    id: 'tip',
    label: 'Tıp & Sağlık',
    icon: '🩺',
    hint: 'Klinik dil, hasta iletişimi, tanı ve tedavi',
    fields: ['tip', 'saglik-spor', 'akademik'],
  },
  {
    id: 'ekonomi',
    label: 'Ekonomi & İşletme',
    icon: '📈',
    hint: 'Piyasa, yatırım, şirket ve yönetim dili',
    fields: ['ekonomi', 'finans-para', 'is-hayati'],
  },
  {
    id: 'hukuk',
    label: 'Hukuk',
    icon: '⚖️',
    hint: 'Dava, sözleşme ve resmi dil',
    fields: ['hukuk', 'resmi-islemler', 'iletisim'],
  },
  {
    id: 'bilisim',
    label: 'Yazılım & Bilişim',
    icon: '💻',
    hint: 'Teknoloji, ürün ve ekip dili',
    fields: ['is-hayati', 'muhendislik', 'akademik'],
  },
  {
    id: 'genel',
    label: 'Genel / Diğer',
    icon: '🎒',
    hint: 'Günlük hayatın her alanından',
    fields: ['gunluk-rutin', 'iletisim', 'egitim'],
  },
];

/** Tanışma testi — 2. adım: seviye. `levels`: "sana uygun" filtresinin kapsamı. */
export const LEVEL_CHOICES = [
  {
    id: 'baslangic',
    label: 'Yeni başlıyorum',
    icon: '🌱',
    hint: 'Temel kelimeler ve kısa cümleler',
    levels: ['A1', 'A2'],
  },
  {
    id: 'orta',
    label: 'İdare ederim',
    icon: '🚶',
    hint: 'Günlük konuşmayı takip edebiliyorum',
    levels: ['A2', 'B1'],
  },
  {
    id: 'ileri',
    label: 'İyi seviyedeyim',
    icon: '🚀',
    hint: 'Deyimler ve mesleki dil istiyorum',
    levels: ['B1', 'B2'],
  },
];

/**
 * Tanışma testi — 3. adım: amaç (çoklu seçim).
 * `fields`: önerilen alanlar. `ctx`: bu amacın öne çıkardığı kullanım ortamları
 * (etiket sorgusuna eklenir — bölüm "hangi alan", amaç "hangi ortam" der).
 */
export const GOALS = [
  {
    id: 'gunluk', label: 'Günlük konuşma', icon: '💬',
    fields: ['gunluk-rutin', 'iletisim'], ctx: ['ctx:everyday'],
  },
  {
    id: 'is', label: 'İş & kariyer', icon: '💼',
    fields: ['is-hayati', 'iletisim'], ctx: ['ctx:practice', 'ctx:presentation'],
  },
  {
    id: 'akademik', label: 'Akademik & sınav', icon: '📚',
    fields: ['akademik', 'egitim'], ctx: ['ctx:paper', 'ctx:exam', 'ctx:lecture'],
  },
  {
    id: 'seyahat', label: 'Seyahat', icon: '✈️',
    fields: ['seyahat', 'yemek-alisveris'], ctx: ['ctx:everyday'],
  },
  {
    id: 'sosyal', label: 'Sosyal hayat', icon: '❤️',
    fields: ['iliskiler', 'medya-eglence'], ctx: ['ctx:everyday'],
  },
];

/** Seslendirme (Web Speech API) ayarları. */
export const SPEECH = {
  lang: 'en-US',
  rate: 0.9,
};
