// ==================================================================
// Daily English — giriş noktası
// Tüm olay bağlamaları burada toplanır; ekran modülleri saf kalır.
// Savunmacı kodlama: eksik DOM elemanı tüm uygulamayı çökertmez.
// ==================================================================

import { el } from './dom.js';
import { loadManifest } from './data/repository.js';
import { hasChosenInterests } from './store/interests.js';
import { renderHeader } from './ui/header.js';
import { bindCardControls, renderCards } from './screens/cards.js';
import { backToField, refreshField } from './screens/field.js';
import { bindHome, goHome } from './screens/home.js';
import { currentScreen, showScreen } from './screens/navigation.js';
import { bindOnboarding, openOnboarding } from './screens/onboarding.js';
import { advanceQuiz, startQuiz } from './screens/quiz.js';

/** Geri butonunun her ekrandan nereye götürdüğü. */
const BACK_TARGETS = {
  field: goHome,
  cards: backToField,
  quiz: () => {
    renderCards();
    showScreen('cards');
  },
};

function bindChrome() {
  if (el.backBtn) {
    el.backBtn.onclick = () => BACK_TARGETS[currentScreen()]?.();
  }
}

function bindQuizControls() {
  if (el.quizBtn) el.quizBtn.onclick = startQuiz;
  if (el.quizNextBtn) el.quizNextBtn.onclick = advanceQuiz;
  if (el.quizRetryBtn) el.quizRetryBtn.onclick = startQuiz;
  if (el.quizBackBtn) {
    el.quizBackBtn.onclick = () => {
      refreshField();
      renderCards();
      showScreen('cards');
    };
  }
}

/** İlgi alanı seçimini açar; kaydedince anasayfaya döner. */
function editInterests() {
  openOnboarding(goHome);
}

async function start() {
  try {
    await loadManifest();
  } catch (error) {
    console.error(error);
    document.querySelector('main').innerHTML =
      '<p class="app-message">Kelime listesi yüklenemedi.<br>' +
      'Uygulamayı yerel bir sunucu üzerinden açtığından emin ol.</p>';
    return;
  }

  bindChrome();
  bindOnboarding();
  bindHome(editInterests);
  bindCardControls();
  bindQuizControls();
  renderHeader();

  if (hasChosenInterests()) {
    goHome();
  } else {
    openOnboarding(goHome);
  }
}

start();
