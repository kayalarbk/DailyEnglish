// Yazma modunda yakın cevap toleransı.
//
// İlke PROGRESS'ten geliyor: "yazma modu bir dil sınavıdır, imla sınavı
// değil" (Teknik Kararlar, 3 kelime / 20 karakter sınırı aynı gerekçeyle
// konmuştu). "makup" yazan kullanıcı "makeup"ı hatırlamıştır; tek harf
// yüzünden kartı sıfırlamak ÖLÇÜLEN ŞEYİ değiştirir ve kullanıcıyı haftalar
// geri atar.
//
// Buradaki testler kuralın iki ucunu birden koruyor: yakın cevap kutuyu
// İLERLETMEMELİ ama SIFIRLAMAMALI da. İkisinden biri bozulursa hiçbir ekran
// hata vermez, yalnızca SRS sessizce yanlış ölçer.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SRS } from '../src/js/config.js';
import { answerCloseness } from '../src/js/utils.js';
import { reviewCard } from '../src/js/store/progress.js';
import { dayKey, addDays } from '../src/js/utils.js';

let sayac = 0;
const kart = () => ({ id: `yazma-${++sayac}`, en: 'x', tr: 'y' });

/** Quiz'in yazma sorusundaki eşleme (screens/quiz.js ile aynı kural). */
const gradeOf = (kind) => (kind === 'exact' ? 'good' : kind === 'near' ? 'hard' : 'again');

// ------------------------------------------------------------------
// Kural: mesafe eşiği uzunluğa göre değişir
// ------------------------------------------------------------------

test('tam doğru cevap "exact"tir', () => {
  assert.equal(answerCloseness('makeup', 'makeup'), 'exact');
  assert.equal(answerCloseness('  Make-up! ', 'makeup'), 'exact', 'normalize edilir');
  assert.equal(answerCloseness('CALM DOWN', 'calm down'), 'exact');
});

test('uzun cevapta 1-2 harf hatası "near"', () => {
  assert.equal(answerCloseness('makup', 'makeup'), 'near', 'eksik harf');
  assert.equal(answerCloseness('makeupp', 'makeup'), 'near', 'fazla harf');
  assert.equal(answerCloseness('mekeup', 'makeup'), 'near', 'yanlış harf');
  assert.equal(answerCloseness('caml down', 'calm down'), 'near', 'harf yer değiştirmesi');
  assert.equal(answerCloseness('acomodation', 'accommodation'), 'near', 'iki eksik harf');
});

test('kısa cevapta eşik 1 harf — anlam tamamen değişebilir', () => {
  assert.equal(answerCloseness('cut', 'cat'), 'near', '3 harf, 1 fark');
  assert.equal(answerCloseness('cot', 'cat'), 'near');
  // İki harf farkı kısa sözcükte artık başka bir kelimedir.
  assert.equal(answerCloseness('dog', 'cat'), 'wrong');
  assert.equal(answerCloseness('hit', 'hat'), 'near');
  assert.equal(answerCloseness('sit', 'hat'), 'wrong');
});

test('alakasız cevap "wrong"', () => {
  assert.equal(answerCloseness('banana', 'makeup'), 'wrong');
  assert.equal(answerCloseness('take a break', 'calm down'), 'wrong');
  assert.equal(answerCloseness('', 'makeup'), 'wrong', 'boş cevap doğru sayılmaz');
});

test('uzun cevapta ÜÇ harf hatası artık "wrong" — tolerans sınırsız değil', () => {
  assert.equal(answerCloseness('mkp', 'makeup'), 'wrong', '3 eksik harf');
  assert.equal(answerCloseness('mak', 'makeup'), 'wrong', 'yarım yazılmış cevap');
});

// ------------------------------------------------------------------
// Kuralın SRS'e yansıması
// ------------------------------------------------------------------

test('KRİTİK: yakın cevap kutuyu İLERLETMEZ ama SIFIRLAMAZ', () => {
  const c = kart();
  reviewCard(c, 'good');
  reviewCard(c, 'good');
  reviewCard(c, 'good'); // kutu 3

  const r = reviewCard(c, gradeOf(answerCloseness('makup', 'makeup')));

  assert.equal(r.previousBox, 3);
  assert.equal(r.box, 3, 'imla hatası kutuyu ilerletmemeli');
  assert.notEqual(r.box, 0, 'ama sıfırlamamalı da: hatırlama gerçekleşti');
  assert.equal(r.lapsed, false, 'unutma sayacı artmamalı');
  assert.equal(r.due, addDays(SRS.intervals[3], dayKey()), 'vade kendi kutusundan hesaplanır');
});

test('tam doğru cevap kutuyu ilerletir (davranış değişmedi)', () => {
  const c = kart();
  reviewCard(c, 'good');
  reviewCard(c, 'good'); // kutu 2

  const r = reviewCard(c, gradeOf(answerCloseness('makeup', 'makeup')));
  assert.equal(r.box, 3);
});

test('alakasız cevap kutuyu SIFIRLAR ve kart aynı gün geri gelir', () => {
  const c = kart();
  reviewCard(c, 'good');
  reviewCard(c, 'good');
  reviewCard(c, 'good'); // kutu 3

  const r = reviewCard(c, gradeOf(answerCloseness('banana', 'makeup')));

  assert.equal(r.box, 0);
  assert.equal(r.lapsed, true);
  assert.equal(r.due, dayKey(), '0. kutu aynı gün');
});

test('yakın cevap kartı kalıcı YAPAMAZ (bir üst kutuya taşımadığı için)', () => {
  const c = kart();
  // masteredBox'ın bir altına kadar çık.
  for (let i = 0; i < SRS.masteredBox - 1; i++) reviewCard(c, 'good');

  const r = reviewCard(c, gradeOf(answerCloseness('makup', 'makeup')));
  assert.equal(r.box, SRS.masteredBox - 1);
  assert.equal(r.justMastered, false, 'imlası eksik cevap kalıcılık kanıtı değil');
});

test('hiç çalışılmamış kartta yakın cevap 1. kutuyu açar, 0da bırakmaz', () => {
  const c = kart();
  const r = reviewCard(c, gradeOf(answerCloseness('cut', 'cat')));
  assert.equal(r.wasNew, true);
  assert.equal(r.box, 1, '"zor" davranışı: en az 1. kutu');
});
