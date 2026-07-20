// Kısa bildirimler: XP kazanımı, seri, hedef tamamlama.

import { el } from '../dom.js';

const VISIBLE_MS = 2200;

/**
 * @param {string} message
 * @param {string} [icon]
 */
export function toast(message, icon = '✨') {
  if (!el.toastStack) return;

  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = `${icon} ${message}`;
  el.toastStack.appendChild(node);

  setTimeout(() => {
    node.classList.add('is-leaving');
    node.addEventListener('animationend', () => node.remove(), { once: true });
  }, VISIBLE_MS);
}
