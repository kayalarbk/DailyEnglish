// Service worker'ın önbellek listesini proje dosyalarından üretir.
//
// Neden araç? Liste elle tutulursa yeni bir veri dosyası eklendiğinde
// unutulur ve uygulama çevrimdışıyken o dosyayı bulamaz — hata da sessiz olur.
// `npm run sync:sw` listeyi yeniden yazar, `--check` yalnız fark olup olmadığını
// bildirir (CI ya da commit öncesi kontrol için).

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SW_PATH = join(ROOT, 'sw.js');
const START = '// >>> ASSETS (üretilmiştir: npm run sync:sw)';
const END = '// <<< ASSETS';

/** Önbelleğe girmeyecek klasör ve dosyalar. */
const SKIP_DIRS = new Set(['.git', 'node_modules', 'tools', 'docs', '.vscode']);
const SKIP_FILES = new Set(['sw.js', 'package.json', 'PROGRESS.md', 'README.md', '.gitignore', '.editorconfig']);
const KEEP_EXT = /\.(html|css|js|json|webmanifest|svg|png|woff2)$/;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (KEEP_EXT.test(entry.name) && !SKIP_FILES.has(entry.name)) files.push(full);
  }
  return files;
}

const files = (await walk(ROOT))
  .map((file) => relative(ROOT, file).split('\\').join('/'))
  .sort();

// './' kökü ayrıca eklenir: adres çubuğuna klasör adı yazan kullanıcı da
// çevrimdışı açabilsin.
const list = ['./', ...files];
const block = `${START}\nconst ASSETS = [\n${list
  .map((path) => `  '${path}',`)
  .join('\n')}\n];\n${END}`;

const current = await readFile(SW_PATH, 'utf8');
const pattern = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END}`);

if (!pattern.test(current)) {
  console.error(`sw.js içinde "${START}" bloğu bulunamadı.`);
  process.exit(1);
}

const next = current.replace(pattern, block);

if (process.argv.includes('--check')) {
  if (next !== current) {
    console.error('sw.js önbellek listesi güncel değil. `npm run sync:sw` çalıştır.');
    process.exit(1);
  }
  console.log(`sw.js güncel (${list.length} dosya).`);
} else {
  await writeFile(SW_PATH, next, 'utf8');
  console.log(`sw.js güncellendi: ${list.length} dosya önbelleğe alınacak.`);
}
