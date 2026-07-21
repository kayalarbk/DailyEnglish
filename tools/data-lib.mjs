// Veri araçlarının ortak yükleme katmanı (validate + sync burayı kullanır).
// Bağımlılıksız: yalnızca Node standart kütüphanesi.

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const FIELDS_DIR = join(ROOT, 'src', 'data', 'fields');
export const MANIFEST_PATH = join(FIELDS_DIR, 'fields.json');

/** Uygulamanın tanıdığı seviyeler (src/js/config.js ile aynı olmalı). */
export const LEVELS = ['A1', 'A2', 'B1', 'B2'];

/** Bir kartta bulunması gereken alanlar. */
export const CARD_FIELDS = ['id', 'en', 'enS', 'tr', 'trS', 'level'];

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function loadManifest() {
  const json = await readJson(MANIFEST_PATH);
  return json.fields;
}

/** fields.json dışındaki tüm alan dosyalarının adları (id sırasıyla değil, alfabetik). */
export async function listFieldFiles() {
  const entries = await readdir(FIELDS_DIR);
  return entries.filter((name) => name.endsWith('.json') && name !== 'fields.json').sort();
}

/** Bir alan dosyasını okur; { file, field } döner. */
export async function loadFieldFile(name) {
  const file = join(FIELDS_DIR, name);
  return { name, file, field: await readJson(file) };
}

/** Alandaki tüm kartlar (kategori sırasıyla). */
export function allCards(field) {
  return (field.categories || []).flatMap((category) => category.cards || []);
}

/** Kart listesinin seviye dağılımı. */
export function levelCounts(cards) {
  const counts = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  cards.forEach((card) => {
    if (card.level in counts) counts[card.level]++;
  });
  return counts;
}
