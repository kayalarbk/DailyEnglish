// Alt sekme çubuğu: Ana sayfa · Kalıplar · Diyalog.
//
// Sekme yalnız görünümü yönetir; hangi ekranın açılacağına main.js karar verir.
// Böylece bu modül ekran modüllerine bağlanmaz ve döngüsel import oluşmaz.

import { el } from '../dom.js';

/** Hangi ekran hangi sekmeye ait. Listede olmayan ekranda çubuk gizlenir. */
const TAB_OF_SCREEN = {
  home: 'home',
  field: 'home',
  cards: 'home',
  quiz: 'home',
  'daily-summary': 'home',
  phrases: 'phrases',
  'phrase-list': 'phrases',
  dialogues: 'dialogues',
  'dialogue-setup': 'dialogues',
  'dialogue-play': 'dialogues',
};

/**
 * Çubuğu ekran adına göre günceller.
 * Tanışma testinde (onboarding) çubuk gizlenir: kullanıcı akışı bölünmemeli.
 * @param {string} screenName
 */
export function renderTabBar(screenName) {
  if (!el.tabBar) return;

  const active = TAB_OF_SCREEN[screenName];
  const visible = Boolean(active);

  el.tabBar.classList.toggle('hidden', !visible);
  document.body.classList.toggle('has-tab-bar', visible);

  el.tabBar.querySelectorAll('[data-tab]').forEach((button) => {
    const isActive = button.dataset.tab === active;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

/**
 * @param {Record<'home'|'phrases'|'dialogues', () => void>} handlers
 */
export function bindTabBar(handlers) {
  if (!el.tabBar) return;
  el.tabBar.onclick = (event) => {
    const button = event.target.closest('[data-tab]');
    if (!button) return;
    handlers[button.dataset.tab]?.();
  };
}
