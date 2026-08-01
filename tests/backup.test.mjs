// store/backup.js — verinin dışa/içe aktarılması.
//
// Bu katmanın bozulması sessizdir ve bedeli en yüksek olanıdır: kullanıcı
// yedeğini alır, dosyayı saklar, aylar sonra geri yüklemeye çalışır ve
// eksik/bozuk olduğunu ancak o zaman görür. Testler üç şeyi koruyor:
//   1. gidiş-dönüş tam olmalı (export → import → aynı veri)
//   2. bozuk dosya HİÇBİR anahtara dokunmamalı (yarım yazma yok)
//   3. anahtar listesi config.js'ten türemeli (elle kopyalanan liste eskir)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '../src/js/config.js';
import {
  BACKUP_KEYS,
  BACKUP_VERSION,
  backupFileName,
  exportData,
  importData,
  parseBackup,
} from '../src/js/store/backup.js';

/** localStorage taklidi — gerçek depo Node'da yok. */
function fakeStore(initial = {}) {
  const map = new Map(Object.entries(initial).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    map,
    read: (key) => (map.has(key) ? map.get(key) : null),
    write: (key, raw) => map.set(key, raw),
    remove: (key) => map.delete(key),
    /** Depodaki çözümlenmiş hâl — karşılaştırma için. */
    snapshot: () =>
      Object.fromEntries([...map.entries()].map(([k, v]) => [k, JSON.parse(v)])),
  };
}

const ORNEK = {
  [STORAGE_KEYS.srs]: {
    'gunluk-rutin-101': { box: 3, due: '2026-08-09', seen: 5, correct: 4, lapses: 1, last: '2026-08-02' },
  },
  [STORAGE_KEYS.stats]: { xp: 1240, streak: 12, dailyGoal: 20, todayCards: ['tip-004'] },
  [STORAGE_KEYS.interests]: ['gunluk-rutin', 'fen-muhendislik'],
  [STORAGE_KEYS.profile]: { roleId: 'ogrenci', presetId: 'elektrik', levelId: 'orta' },
  [STORAGE_KEYS.tags]: { presetId: 'elektrik', tags: ['dom:physics', 'ctx:lecture'] },
  [STORAGE_KEYS.phraseLearned]: ['ph_agree_001'],
  [STORAGE_KEYS.dialoguesDone]: { dlg_dir_01: { at: '2026-08-01', score: 88 } },
  [STORAGE_KEYS.dailySettings]: { newPerDay: 5, mode: 'mixed', fieldIds: [] },
  [STORAGE_KEYS.dailySession]: { day: '2026-08-02', index: 3, steps: [] },
  [STORAGE_KEYS.fieldSuggestSeen]: ['saglik-bilimleri'],
};

test('anahtar listesi config.js\'ten türer — elle kopyalanmaz', () => {
  const beklenen = Object.values(STORAGE_KEYS);
  assert.deepEqual(
    [...BACKUP_KEYS].sort(),
    [...beklenen].sort(),
    'yeni bir STORAGE_KEYS anahtarı yedeğe kendiliğinden girmeli'
  );
  // Eski biçim anahtarları da kapsanmalı: onlar henüz taşınmamış ilerlemedir.
  assert.ok(BACKUP_KEYS.includes(STORAGE_KEYS.learned));
  assert.ok(BACKUP_KEYS.includes(STORAGE_KEYS.learnedLegacy));
});

test('gidiş-dönüş: export → import → aynı veri', () => {
  const kaynak = fakeStore(ORNEK);
  const yedek = exportData({ store: kaynak });

  assert.equal(yedek.version, BACKUP_VERSION);
  assert.ok(yedek.exportedAt, 'dışa aktarma zamanı yazılmalı');

  const hedef = fakeStore();
  const sonuc = importData(JSON.stringify(yedek), { store: hedef });

  assert.equal(sonuc.ok, true);
  assert.deepEqual(hedef.snapshot(), ORNEK, 'geri yüklenen depo kaynağın aynısı olmalı');
  // SRS kaydı bit bit korunmalı: kutu ve vade kaybolursa ölçüm sıfırlanır.
  assert.equal(hedef.snapshot()[STORAGE_KEYS.srs]['gunluk-rutin-101'].box, 3);
});

test('depoda olmayan anahtar dosyaya hiç yazılmaz', () => {
  const kaynak = fakeStore({ [STORAGE_KEYS.interests]: ['tip'] });
  const yedek = exportData({ store: kaynak });
  assert.deepEqual(Object.keys(yedek.data), [STORAGE_KEYS.interests]);
});

test('bozuk JSON reddedilir ve HİÇBİR anahtara dokunulmaz', () => {
  const hedef = fakeStore(ORNEK);
  const once = hedef.snapshot();

  const sonuc = importData('{ bu bir json degil', { store: hedef });

  assert.equal(sonuc.ok, false);
  assert.match(sonuc.error, /JSON/);
  assert.deepEqual(hedef.snapshot(), once, 'reddedilen dosya depoyu değiştirmemeli');
});

test('sürüm uyuşmazlığı reddedilir', () => {
  const hedef = fakeStore(ORNEK);
  const once = hedef.snapshot();

  const gelecek = JSON.stringify({ version: 99, exportedAt: 'x', data: { [STORAGE_KEYS.srs]: {} } });
  const sonuc = importData(gelecek, { store: hedef });

  assert.equal(sonuc.ok, false);
  assert.match(sonuc.error, /sürüm/i);
  assert.deepEqual(hedef.snapshot(), once);
});

test('version alanı olmayan dosya reddedilir', () => {
  const sonuc = parseBackup(JSON.stringify({ data: { [STORAGE_KEYS.srs]: {} } }));
  assert.equal(sonuc.ok, false);
});

test('data bölümü olmayan dosya reddedilir', () => {
  const sonuc = parseBackup(JSON.stringify({ version: BACKUP_VERSION }));
  assert.equal(sonuc.ok, false);
  assert.match(sonuc.error, /data/);
});

test('bilinmeyen anahtar ATLANIR, depoya yazılmaz', () => {
  const hedef = fakeStore();
  const dosya = JSON.stringify({
    version: BACKUP_VERSION,
    exportedAt: '2026-08-02T10:00:00.000Z',
    data: {
      [STORAGE_KEYS.interests]: ['tip'],
      de_gelecek_surum_v9: { bir: 'şey' },
      rastgele_baska_uygulama: 42,
    },
  });

  const sonuc = importData(dosya, { store: hedef });

  assert.equal(sonuc.ok, true);
  assert.deepEqual(sonuc.skipped.sort(), ['de_gelecek_surum_v9', 'rastgele_baska_uygulama']);
  assert.deepEqual(hedef.snapshot(), { [STORAGE_KEYS.interests]: ['tip'] });
  assert.equal(hedef.map.has('de_gelecek_surum_v9'), false, 'tanınmayan anahtar depoya girmemeli');
});

test('yalnız tanınmayan anahtar içeren dosya reddedilir', () => {
  const sonuc = parseBackup(
    JSON.stringify({ version: BACKUP_VERSION, data: { baska_uygulama: 1 } })
  );
  assert.equal(sonuc.ok, false);
});

test('geri yükleme birleştirme değil: yedekte olmayan bilinen anahtar silinir', () => {
  const hedef = fakeStore(ORNEK);
  const dosya = JSON.stringify({
    version: BACKUP_VERSION,
    exportedAt: '2026-08-02T10:00:00.000Z',
    data: { [STORAGE_KEYS.interests]: ['seyahat'] },
  });

  const sonuc = importData(dosya, { store: hedef });

  assert.equal(sonuc.ok, true);
  assert.deepEqual(hedef.snapshot(), { [STORAGE_KEYS.interests]: ['seyahat'] });
  assert.ok(sonuc.cleared.includes(STORAGE_KEYS.srs), 'eski SRS kaydı kalmamalı');
});

test('boş dosya reddedilir', () => {
  assert.equal(parseBackup('').ok, false);
  assert.equal(parseBackup('   ').ok, false);
});

test('dizi ya da düz değer içeren dosya reddedilir', () => {
  assert.equal(parseBackup('[]').ok, false);
  assert.equal(parseBackup('"merhaba"').ok, false);
  assert.equal(parseBackup(JSON.stringify({ version: BACKUP_VERSION, data: [] })).ok, false);
});

test('dosya adı yerel güne göre kurulur', () => {
  const ad = backupFileName(new Date(2026, 7, 2, 13, 45));
  assert.equal(ad, 'daily-english-yedek-2026-08-02.json');
  assert.match(backupFileName(), /^daily-english-yedek-\d{4}-\d{2}-\d{2}\.json$/);
});
