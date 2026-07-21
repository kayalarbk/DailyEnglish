// Manifest'i (src/data/fields/fields.json) alan dosyalarından yeniden üretir.
// Yeni bir parti eklendiğinde `npm run sync` çalıştır: wordCount'lar, kategori
// listeleri ve `file` yolları gerçek verilerden hesaplanır.
//
// Alanın adı/ikonu/rengi/açıklaması ve alan sırası korunur; manifest'te henüz
// kaydı olmayan dosyalar, kendi içindeki bilgilerle listenin sonuna eklenir.
// `--check` ile yalnızca fark olup olmadığı raporlanır (dosya yazılmaz).

import { writeFile } from 'node:fs/promises';
import {
  MANIFEST_PATH,
  allCards,
  listFieldFiles,
  loadFieldFile,
  loadManifest,
} from './data-lib.mjs';

const checkOnly = process.argv.includes('--check');

function entryFor(meta, field) {
  return {
    id: field.id,
    name: meta?.name ?? field.name,
    icon: meta?.icon ?? field.icon,
    color: meta?.color ?? field.color,
    description: meta?.description ?? field.description,
    file: `src/data/fields/${field.id}.json`,
    wordCount: allCards(field).length,
    categories: field.categories.map((category) => ({
      name: category.name,
      color: category.color ?? field.color,
      wordCount: (category.cards || []).length,
    })),
  };
}

async function main() {
  const manifest = await loadManifest();
  const files = await listFieldFiles();

  const byId = new Map(manifest.map((meta) => [meta.id, meta]));
  const order = [
    ...manifest.map((meta) => meta.id).filter((id) => files.includes(`${id}.json`)),
    ...files.map((name) => name.replace(/\.json$/, '')).filter((id) => !byId.has(id)),
  ];

  const fields = [];
  const added = [];
  for (const id of order) {
    const { field } = await loadFieldFile(`${id}.json`);
    if (!byId.has(id)) added.push(id);
    fields.push(entryFor(byId.get(id), field));
  }

  const removed = manifest.map((meta) => meta.id).filter((id) => !files.includes(`${id}.json`));
  const next = `${JSON.stringify({ fields }, null, 2)}\n`;
  const current = `${JSON.stringify({ fields: manifest }, null, 2)}\n`;

  added.forEach((id) => console.log(`+ ${id} manifest'e eklendi`));
  removed.forEach((id) => console.log(`- ${id} dosyası yok, manifest'ten çıkarıldı`));

  const total = fields.reduce((sum, field) => sum + field.wordCount, 0);
  console.log(`Alan: ${fields.length} · Kart: ${total}`);

  if (next === current) {
    console.log('Manifest zaten güncel.');
    return;
  }
  if (checkOnly) {
    console.error('Manifest güncel değil — `npm run sync` çalıştır.');
    process.exitCode = 1;
    return;
  }

  await writeFile(MANIFEST_PATH, next, 'utf8');
  console.log('Manifest güncellendi.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
