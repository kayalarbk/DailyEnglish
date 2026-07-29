// Diyalog verisine erişim katmanı.
// Kalıplarla aynı desen: manifest bir kez, kategori dosyaları ilk kullanımda.

import { DIALOGUES_MANIFEST } from '../config.js';

/** @type {{id, name, icon, color, file, count}[]} */
let manifest = [];

/** Yüklenmiş kategorilerin diyalogları: kategori id -> dialogue[] */
const loadedCategories = new Map();

export async function loadDialogueManifest() {
  if (manifest.length > 0) return manifest;

  const response = await fetch(DIALOGUES_MANIFEST);
  if (!response.ok) throw new Error(`Diyalog listesi yüklenemedi (${response.status})`);
  const json = await response.json();
  manifest = json.categories;
  return manifest;
}

export function getDialogueCategories() {
  return manifest;
}

export function getDialogueCategoryMeta(id) {
  return manifest.find((category) => category.id === id) || null;
}

export function totalDialogueCount() {
  return manifest.reduce((sum, category) => sum + (category.count || 0), 0);
}

/** @param {string} id kategori id'si */
export async function loadDialogueCategory(id) {
  if (loadedCategories.has(id)) return loadedCategories.get(id);

  const meta = getDialogueCategoryMeta(id);
  if (!meta) throw new Error(`Bilinmeyen diyalog kategorisi: ${id}`);

  const response = await fetch(meta.file);
  if (!response.ok) throw new Error(`"${meta.name}" yüklenemedi (${response.status})`);

  const json = await response.json();
  loadedCategories.set(id, json.dialogues);
  return json.dialogues;
}

/**
 * Tüm diyaloglar. Liste ekranı hepsini birden gösterdiği için açılışta indirilir;
 * dosyalar küçük ve sayı sabit (30) olduğundan tek seferlik maliyet kabul edilebilir.
 */
export async function loadAllDialogues() {
  await Promise.all(manifest.map((category) => loadDialogueCategory(category.id)));
  return getAllLoadedDialogues();
}

export function getAllLoadedDialogues() {
  return manifest.flatMap((category) => loadedCategories.get(category.id) || []);
}

/** @param {string} dialogueId */
export function findDialogue(dialogueId) {
  return getAllLoadedDialogues().find((dialogue) => dialogue.id === dialogueId) || null;
}
