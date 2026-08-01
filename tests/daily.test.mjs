// store/daily.js — günün destesini kuran saf mantık.
//
// Bu dosya bilerek saf yazıldı (DOM, localStorage, tarih yok; `shuffle` bile
// enjekte edilebiliyor), test de bu yüzden bağımlılıksız yazılabiliyor.
// Sınanan davranışlar ürün kararlarıdır — bkz. PROGRESS.md "Teknik Kararlar":
// oran değil TAVAN, kırpılan tekrar ERTELENMEZ, gruplar arası round-robin.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDeck, buildRuns, buildSteps } from '../src/js/store/daily.js';

/** Testlerde karıştırma kapalı: sıra iddiaları belirli olsun. */
const noShuffle = (arr) => arr;
const TODAY = '2026-08-01';

/** n kart id'si: pre-001, pre-002, … */
const ids = (prefix, n, from = 1) =>
  Array.from({ length: n }, (_, i) => `${prefix}-${String(from + i).padStart(3, '0')}`);

/** Verilen id'leri aynı vade tarihiyle "görülmüş" yapar. */
const seenOn = (cardIds, due) =>
  Object.fromEntries(cardIds.map((id) => [id, { due, box: 2 }]));

test('tekrarlar yeni kartlardan ÖNCE alınır', () => {
  const { cardIds, stats } = buildDeck({
    cardIdsByGroup: { a: ids('a', 10) },
    progress: seenOn(ids('a', 4), '2026-07-30'),
    settings: { dailyGoal: 5, newPerDay: 5 },
    today: TODAY,
    shuffle: noShuffle,
  });

  assert.equal(stats.due, 4, 'vadesi gelen dört kartın hepsi alınmalı');
  assert.equal(stats.new, 1, 'kalan tek yere yeni kart girmeli');
  assert.deepEqual(cardIds.slice(0, 4), ids('a', 4));
});

test('yeni kart tavanı (newPerDay) hedefin altında kalabilir', () => {
  const { stats } = buildDeck({
    cardIdsByGroup: { a: ids('a', 50) },
    progress: {},
    settings: { dailyGoal: 20, newPerDay: 3 },
    today: TODAY,
    shuffle: noShuffle,
  });

  assert.equal(stats.due, 0);
  assert.equal(stats.new, 3, 'hedef 20 olsa da yeni kart tavanı 3');
  assert.equal(stats.total, 3, 'boşluk doldurulmaya çalışılmamalı');
});

test('newPerDay = 0 iken yalnız tekrar gelir', () => {
  const { stats } = buildDeck({
    cardIdsByGroup: { a: ids('a', 30) },
    progress: seenOn(ids('a', 2), '2026-07-31'),
    settings: { dailyGoal: 20, newPerDay: 0 },
    today: TODAY,
    shuffle: noShuffle,
  });

  assert.deepEqual([stats.due, stats.new, stats.total], [2, 0, 2]);
});

test('vadesi gelmemiş kart desteye girmez', () => {
  const { stats } = buildDeck({
    cardIdsByGroup: { a: ids('a', 5) },
    // Hepsi görülmüş ama vadeleri gelecekte.
    progress: seenOn(ids('a', 5), '2026-08-09'),
    settings: { dailyGoal: 20, newPerDay: 10 },
    today: TODAY,
    shuffle: noShuffle,
  });

  assert.deepEqual([stats.due, stats.new, stats.total], [0, 0, 0]);
});

test('en eski vade önce gelir — en çok unutulmaya yakın olan odur', () => {
  const { cardIds } = buildDeck({
    cardIdsByGroup: { a: ['yeni', 'orta', 'eski'] },
    progress: {
      yeni: { due: '2026-08-01' },
      orta: { due: '2026-07-25' },
      eski: { due: '2026-06-01' },
    },
    settings: { dailyGoal: 3, newPerDay: 0 },
    today: TODAY,
    shuffle: noShuffle,
  });

  assert.deepEqual(cardIds, ['eski', 'orta', 'yeni']);
});

test('gruplar arası round-robin: bir grup desteyi domine etmez', () => {
  const { cardIds, stats } = buildDeck({
    cardIdsByGroup: {
      buyuk: ids('buyuk', 100),
      kucuk: ids('kucuk', 2),
    },
    progress: {},
    settings: { dailyGoal: 6, newPerDay: 6 },
    today: TODAY,
    shuffle: noShuffle,
  });

  const kucuk = cardIds.filter((id) => id.startsWith('kucuk')).length;
  assert.equal(stats.total, 6);
  assert.equal(kucuk, 2, 'küçük grubun iki kartı da desteye girmeli');
});

test('kırpılan tekrarlar sayılır ama ERTELENMEZ', () => {
  const progress = seenOn(ids('a', 60), '2026-07-01');
  const before = JSON.parse(JSON.stringify(progress));

  const { stats } = buildDeck({
    cardIdsByGroup: { a: ids('a', 60) },
    progress,
    settings: { dailyGoal: 20, newPerDay: 5 },
    today: TODAY,
    shuffle: noShuffle,
  });

  assert.equal(stats.due, 20, 'tavan 20\'de kesmeli');
  assert.equal(stats.trimmedDue, 40, 'sığmayanlar sayılmalı');
  assert.deepEqual(
    progress,
    before,
    'KRİTİK: sığmayan kartların due alanına dokunulmamalı — vadeyi ileri atmak SRS ölçümünü yalanlardı'
  );
});

test('boş girdiler çökertmez', () => {
  const { cardIds, stats } = buildDeck({ today: TODAY, shuffle: noShuffle });
  assert.deepEqual(cardIds, []);
  assert.deepEqual(stats, { due: 0, new: 0, trimmedDue: 0, total: 0 });
});

test('dailyGoal negatif ya da kesirli gelse de deste tutarlı', () => {
  const { stats } = buildDeck({
    cardIdsByGroup: { a: ids('a', 10) },
    progress: {},
    settings: { dailyGoal: -5, newPerDay: 3.7 },
    today: TODAY,
    shuffle: noShuffle,
  });
  assert.equal(stats.total, 0, 'negatif hedef sıfıra çekilmeli');
});

// ------------------------------------------------------------------
// buildSteps / buildRuns
// ------------------------------------------------------------------

test('karışık modda kart başına TEK sunum olur', () => {
  const steps = buildSteps(['a', 'b', 'c', 'd'], 'mixed');
  assert.equal(steps.length, 4, 'aynı kart hem kart hem quiz olarak eklenmemeli');
  assert.deepEqual(
    steps.map((step) => step.form),
    ['card', 'quiz', 'card', 'quiz']
  );
});

test('tek biçimli modlar tüm adımları aynı biçimde üretir', () => {
  assert.ok(buildSteps(['a', 'b'], 'quiz').every((s) => s.form === 'quiz'));
  assert.ok(buildSteps(['a', 'b'], 'card').every((s) => s.form === 'card'));
});

test('quiz öbekleri quizBatch boyunda kesilir', () => {
  const steps = buildSteps(ids('q', 12), 'quiz');
  const runs = buildRuns(steps, 5);
  assert.deepEqual(runs.map((run) => run.cardIds.length), [5, 5, 2]);
  assert.deepEqual(runs.map((run) => run.start), [0, 5, 10]);
});

test('ardışık kart adımları tek öbekte toplanır', () => {
  const runs = buildRuns(buildSteps(ids('c', 7), 'card'), 5);
  assert.equal(runs.length, 1, 'flashcard öbeği quizBatch ile kesilmez');
  assert.equal(runs[0].cardIds.length, 7);
});

test('karışık modda öbekler biçim değiştikçe bölünür', () => {
  const runs = buildRuns(buildSteps(['a', 'b', 'c', 'd'], 'mixed'), 5);
  assert.deepEqual(
    runs.map((run) => `${run.form}:${run.cardIds.length}`),
    ['card:1', 'quiz:1', 'card:1', 'quiz:1']
  );
});
