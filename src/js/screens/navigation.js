// Ekran geçişleri.

import { el } from '../dom.js';
import { setBackVisible, setHeaderVisible } from '../ui/header.js';
import { renderTabBar } from '../ui/tabbar.js';

const screens = {
  onboarding: el.onboardingScreen,
  home: el.homeScreen,
  field: el.fieldScreen,
  cards: el.cardsScreen,
  quiz: el.quizScreen,
  'daily-summary': el.dailySummaryScreen,
  phrases: el.phrasesScreen,
  'phrase-list': el.phraseListScreen,
  dialogues: el.dialoguesScreen,
  'dialogue-setup': el.dialogueSetupScreen,
  'dialogue-play': el.dialoguePlayScreen,
};

/** Üst barın ve geri butonunun ekran bazında görünürlüğü. */
const CHROME = {
  onboarding: { header: false, back: false },
  home: { header: true, back: false },
  field: { header: true, back: true },
  cards: { header: true, back: true },
  quiz: { header: true, back: true },
  'daily-summary': { header: true, back: false },
  phrases: { header: true, back: false },
  'phrase-list': { header: true, back: true },
  dialogues: { header: true, back: false },
  'dialogue-setup': { header: true, back: true },
  'dialogue-play': { header: true, back: true },
};

let current = null;

/** @param {keyof typeof screens} name */
export function showScreen(name) {
  const target = screens[name];
  if (!target) return;

  Object.values(screens).forEach((screen) => screen?.classList.add('hidden'));
  target.classList.remove('hidden');

  // Ekran animasyonunu her geçişte yeniden tetikle.
  target.style.animation = 'none';
  void target.offsetWidth;
  target.style.animation = '';

  const chrome = CHROME[name];
  setHeaderVisible(chrome.header);
  setBackVisible(chrome.back);
  renderTabBar(name);

  current = name;
  window.scrollTo(0, 0);
}

export function currentScreen() {
  return current;
}
