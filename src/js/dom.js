// DOM referansları.
// Savunmacı kodlama: her referans null olabilir, kullanım öncesi kontrol edilir.

/** @param {string} id */
export const $ = (id) => document.getElementById(id);

export const el = {
  // Üst bar
  topBar: $('topBar'),
  backBtn: $('backBtn'),
  streakChip: $('streakChip'),
  streakValue: $('streakValue'),
  xpChip: $('xpChip'),
  xpValue: $('xpValue'),

  // Ekranlar
  onboardingScreen: $('onboarding-screen'),
  homeScreen: $('home-screen'),
  fieldScreen: $('field-screen'),
  cardsScreen: $('cards-screen'),
  quizScreen: $('quiz-screen'),

  // İlgi alanı seçimi
  interestGrid: $('interestGrid'),
  interestCount: $('interestCount'),
  interestSaveBtn: $('interestSaveBtn'),

  // Anasayfa
  greetingTitle: $('greetingTitle'),
  greetingSub: $('greetingSub'),
  goalRingFill: $('goalRingFill'),
  goalCount: $('goalCount'),
  goalTotal: $('goalTotal'),
  goalText: $('goalText'),
  goalSelect: $('goalSelect'),
  continueBtn: $('continueBtn'),
  editInterestsBtn: $('editInterestsBtn'),
  homeFieldList: $('homeFieldList'),
  exploreHead: $('exploreHead'),
  exploreFieldList: $('exploreFieldList'),

  // Alan detayı
  fieldHero: $('fieldHero'),
  fieldHeroIcon: $('fieldHeroIcon'),
  fieldHeroName: $('fieldHeroName'),
  fieldHeroDesc: $('fieldHeroDesc'),
  fieldHeroFill: $('fieldHeroFill'),
  fieldHeroStat: $('fieldHeroStat'),
  categoryList: $('categoryList'),

  // Kartlar
  cardsTitle: $('cardsTitle'),
  shuffleBtn: $('shuffleBtn'),
  filterBtn: $('filterBtn'),
  quizBtn: $('quizBtn'),
  deckFill: $('deckFill'),
  counter: $('counter'),
  deck: $('deck'),
  prevBtn: $('prevBtn'),
  nextBtn: $('nextBtn'),

  // Quiz
  quizQuestionArea: $('quiz-question-area'),
  quizResultArea: $('quiz-result-area'),
  quizFill: $('quizFill'),
  quizProgress: $('quizProgress'),
  quizSentence: $('quizSentence'),
  quizHint: $('quizHint'),
  quizOptions: $('quizOptions'),
  quizNextBtn: $('quizNextBtn'),
  quizResultEmoji: $('quizResultEmoji'),
  quizResultTitle: $('quizResultTitle'),
  quizResultText: $('quizResultText'),
  quizResultXp: $('quizResultXp'),
  quizMistakes: $('quizMistakes'),
  quizRetryBtn: $('quizRetryBtn'),
  quizBackBtn: $('quizBackBtn'),

  // Bildirimler
  toastStack: $('toastStack'),
};
