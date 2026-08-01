// utils.js — saf yardımcılar: gün anahtarı, benzerlik, arama katlama.
//
// Bu fonksiyonlar sessizce bozulabilecek türden: `dayKey` yanlışsa bütün SRS
// bir gün kayar, `foldForSearch` bozulursa Türkçe arama çalışmaz ve kimse
// hata mesajı görmez. Testleri bu yüzden değerli.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  bestSimilarity,
  dayKey,
  daysBetween,
  foldForSearch,
  levenshtein,
  normalizeAnswer,
  similarity,
} from '../src/js/utils.js';

// ------------------------------------------------------------------
// Gün anahtarı — SRS'in zaman ekseni
// ------------------------------------------------------------------

test('dayKey YEREL günü verir, UTC değil', () => {
  // Yerel saatle 23:30; UTC'ye çevrilseydi ertesi güne geçebilirdi.
  const gece = new Date(2026, 7, 1, 23, 30, 0);
  assert.equal(dayKey(gece), '2026-08-01');

  const sabah = new Date(2026, 7, 1, 0, 15, 0);
  assert.equal(dayKey(sabah), '2026-08-01', 'gecenin ilk saatleri de aynı gün olmalı');
});

test('daysBetween iki gün anahtarı arasındaki farkı verir', () => {
  assert.equal(daysBetween('2026-08-01', '2026-08-01'), 0);
  assert.equal(daysBetween('2026-08-01', '2026-08-08'), 7);
  assert.equal(daysBetween('2026-08-08', '2026-08-01'), -7, 'geriye doğru negatif');
});

test('daysBetween ay ve yıl sınırını doğru geçer', () => {
  assert.equal(daysBetween('2026-01-31', '2026-02-01'), 1);
  assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
});

test('addDays SRS aralıklarını doğru üretir', () => {
  // SRS.intervals = [0, 1, 3, 7, 16, 35]
  assert.equal(addDays(0, '2026-08-01'), '2026-08-01', '0. kutu aynı gün');
  assert.equal(addDays(1, '2026-08-01'), '2026-08-02');
  assert.equal(addDays(7, '2026-08-01'), '2026-08-08');
  assert.equal(addDays(35, '2026-08-01'), '2026-09-05');
});

test('addDays artık yılı ve ay sonunu atlar', () => {
  assert.equal(addDays(1, '2028-02-28'), '2028-02-29', '2028 artık yıl');
  assert.equal(addDays(1, '2026-02-28'), '2026-03-01', '2026 değil');
});

test('addDays / daysBetween birbirinin tersi', () => {
  for (const gun of [0, 1, 3, 7, 16, 35]) {
    assert.equal(daysBetween('2026-08-01', addDays(gun, '2026-08-01')), gun);
  }
});

// ------------------------------------------------------------------
// Türkçe arama katlama
// ------------------------------------------------------------------

test('foldForSearch Türkçe harfleri katlar — klavye düzeni engel olmasın', () => {
  assert.equal(foldForSearch('hesabı'), foldForSearch('hesabi'));
  assert.equal(foldForSearch('ÇALIŞMAK'), foldForSearch('calismak'));
  assert.equal(foldForSearch('göz'), foldForSearch('goz'));
  assert.equal(foldForSearch('şüphe'), foldForSearch('suphe'));
});

test('foldForSearch büyük İ ve ı ayrımını da katlar', () => {
  assert.equal(foldForSearch('İstanbul'), foldForSearch('istanbul'));
  assert.equal(foldForSearch('ILIK'), foldForSearch('ilik'));
});

test('foldForSearch farklı sözcükleri birbirine karıştırmaz', () => {
  assert.notEqual(foldForSearch('kar'), foldForSearch('kart'));
});

// ------------------------------------------------------------------
// Yazma modu / konuşma skoru
// ------------------------------------------------------------------

test('normalizeAnswer noktalama ve büyük harfi eler', () => {
  assert.equal(normalizeAnswer('  Wake UP!  '), normalizeAnswer('wake up'));
  assert.equal(normalizeAnswer("don't"), 'dont');
});

test('levenshtein bilinen mesafeleri verir', () => {
  assert.equal(levenshtein('kitten', 'kitten'), 0);
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('', 'abc'), 3);
  assert.equal(levenshtein('abc', ''), 3);
});

test('similarity 0-100 aralığında ve simetrik', () => {
  assert.equal(similarity('wake up', 'wake up'), 100);
  assert.equal(similarity('', ''), 100);
  const a = similarity('exert a force', 'exert force');
  const b = similarity('exert force', 'exert a force');
  assert.equal(a, b, 'benzerlik simetrik olmalı');
  assert.ok(a > 0 && a < 100);
});

test('similarity tek harf hatasını "neredeyse doğru" sayar, alakasızı saymaz', () => {
  const yakin = similarity('makeup', 'makup');
  const uzak = similarity('makeup', 'elephant');
  assert.ok(yakin > 80, `tek harf hatası yüksek benzerlik vermeli (${yakin})`);
  assert.ok(uzak < 40, `alakasız sözcük düşük olmalı (${uzak})`);
});

test('similarity büyük harf ve noktalamaya takılmaz', () => {
  assert.equal(similarity("I'll have a latte", 'ill have a latte'), 100);
});

test('bestSimilarity alternatiflerin en iyisini seçer', () => {
  const said = 'can i get a medium latte please';
  const kabul = ["I'll have a medium latte", 'Can I get a medium latte, please?'];
  assert.equal(bestSimilarity(said, kabul), 100, 'alternatiflerden biri birebir tutmalı');
});

test('bestSimilarity boş listede 0 döner', () => {
  assert.equal(bestSimilarity('herhangi bir şey', []), 0);
});
