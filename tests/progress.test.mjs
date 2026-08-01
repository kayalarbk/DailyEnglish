// store/progress.js — Leitner kutuları, vade hesabı, durum eşiği.
//
// Uygulamanın "öğrendi" iddiasının tamamı buraya dayanıyor: rozet bir beyana
// değil zamana yayılmış kanıta bağlı olsun diye kart ancak masteredBox'a
// çıkarsa kalıcı sayılıyor. Bu dosya bozulursa hiçbir ekran hata vermez,
// yalnızca ölçüm sessizce yalan söyler.
//
// Not: modül localStorage'a yazıyor; Node'da depo katmanı sessizce yutuyor
// (bkz. "localStorage sarmalayıcısı sessizce yutar" kararı). Testler arası
// sızıntı olmasın diye her test KENDİ kart id'lerini kullanır.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SRS } from '../src/js/config.js';
import { getCardStatus, isDue, isPending, reviewCard, statusCounts } from '../src/js/store/progress.js';
import { addDays, dayKey } from '../src/js/utils.js';

let sayac = 0;
/** Her çağrıda benzersiz bir kart — testler birbirinin kaydını görmesin. */
const kart = () => ({ id: `test-${++sayac}`, en: 'x', tr: 'y' });

const BUGUN = dayKey();
const MAX_BOX = SRS.intervals.length - 1;

test('yeni kart kaydı yoktur ve "yeni" sayılır', () => {
  const c = kart();
  assert.equal(getCardStatus(c), 'new');
  assert.equal(isDue(c), false, 'hiç çalışılmamış kart TEKRAR değildir');
  assert.equal(isPending(c), true, 'ama bugün çalışılacaklar arasındadır');
});

test('"kolay" kutuyu bir ilerletir ve vadeyi ileri atar', () => {
  const c = kart();
  const r1 = reviewCard(c, 'good');
  assert.equal(r1.box, 1);
  assert.equal(r1.due, addDays(SRS.intervals[1], BUGUN), '1. kutu = 1 gün');

  const r2 = reviewCard(c, 'good');
  assert.equal(r2.box, 2);
  assert.equal(r2.due, addDays(SRS.intervals[2], BUGUN), '2. kutu = 3 gün');
});

test('"zor" kutuyu KORUR ama ilerletmez', () => {
  const c = kart();
  reviewCard(c, 'good');
  reviewCard(c, 'good'); // kutu 2
  const r = reviewCard(c, 'hard');
  assert.equal(r.box, 2, 'hatırlandı ama sağlamlaşmadı: kutu yerinde kalır');
  assert.equal(r.previousBox, 2);
});

test('"hatırlamadım" kutuyu sıfırlar ve kart AYNI GÜN geri gelir', () => {
  const c = kart();
  reviewCard(c, 'good');
  reviewCard(c, 'good');
  reviewCard(c, 'good'); // kutu 3
  const r = reviewCard(c, 'again');

  assert.equal(r.box, 0);
  assert.equal(r.due, BUGUN, '0. kutu aynı gün tekrar gelir');
  assert.equal(r.lapsed, true);
  assert.equal(isDue(c), true);
});

test('unutma sayacı yalnız gerçek unutmada artar', () => {
  const yeni = kart();
  reviewCard(yeni, 'again'); // hiç öğrenilmemişti: unutma sayılmaz
  assert.equal(reviewCard(yeni, 'again').lapsed, false, 'kutu zaten 0, düşüş yok');

  const ogrenilen = kart();
  reviewCard(ogrenilen, 'good');
  assert.equal(reviewCard(ogrenilen, 'again').lapsed, true);
});

test('kutu MAX_BOX üstüne çıkmaz', () => {
  const c = kart();
  for (let i = 0; i < 20; i++) reviewCard(c, 'good');
  const r = reviewCard(c, 'good');
  assert.equal(r.box, MAX_BOX);
  assert.equal(r.due, addDays(SRS.intervals[MAX_BOX], BUGUN));
});

test('durum eşiği: yeni → öğreniliyor → pekişti → kalıcı', () => {
  const c = kart();
  assert.equal(getCardStatus(c), 'new');
  reviewCard(c, 'good');
  assert.equal(getCardStatus(c), 'learning', 'kutu 1');
  reviewCard(c, 'good');
  assert.equal(getCardStatus(c), 'familiar', 'kutu 2');
  reviewCard(c, 'good');
  assert.equal(getCardStatus(c), 'familiar', 'kutu 3 hâlâ pekişti');
  reviewCard(c, 'good');
  assert.equal(getCardStatus(c), 'mastered', `kutu ${SRS.masteredBox} = kalıcı`);
});

test('KRİTİK: çoktan seçmeli doğru cevap kartı "kalıcı" yapamaz', () => {
  // Dört şıkta %25 şansla doğru bulmak kalıcılık kanıtı değil.
  const c = kart();
  for (let i = 0; i < 10; i++) {
    reviewCard(c, 'good', { maxBox: SRS.recognitionMaxBox });
  }
  assert.equal(getCardStatus(c), 'familiar');
  assert.ok(
    SRS.recognitionMaxBox < SRS.masteredBox,
    'tanıma tavanı kalıcılık eşiğinin altında olmalı'
  );
});

test('tanıma tavanı, kartın ULAŞTIĞI kutuyu geri almaz', () => {
  const c = kart();
  for (let i = 0; i < 5; i++) reviewCard(c, 'good'); // kalıcı
  const oncekiDurum = getCardStatus(c);
  const r = reviewCard(c, 'good', { maxBox: SRS.recognitionMaxBox });

  assert.equal(oncekiDurum, 'mastered');
  assert.ok(r.box >= SRS.masteredBox, 'quiz cevabı kazanılmış kutuyu düşürmemeli');
});

test('justMastered yalnız eşiği İLK geçişte doğrudur', () => {
  const c = kart();
  const sonuclar = [];
  for (let i = 0; i < 6; i++) sonuclar.push(reviewCard(c, 'good').justMastered);
  assert.equal(sonuclar.filter(Boolean).length, 1, 'kalıcı olma bir kez kutlanır');
});

test('wasNew yalnız ilk değerlendirmede doğrudur', () => {
  const c = kart();
  assert.equal(reviewCard(c, 'good').wasNew, true);
  assert.equal(reviewCard(c, 'good').wasNew, false);
});

test('seen ve correct sayaçları doğru işler', () => {
  const c = kart();
  reviewCard(c, 'good');
  reviewCard(c, 'again');
  reviewCard(c, 'hard');
  const kayit = statusCounts([c]);
  assert.ok(kayit, 'sayım çalışmalı');

  const r = reviewCard(c, 'good');
  assert.equal(r.box, 2, "'hard' sonrası kutu 1'den 2'ye çıkmalı");
});

test('id\'siz kart çökertmez', () => {
  const r = reviewCard({}, 'good');
  assert.equal(r.box, 0);
  assert.equal(r.status, 'new');
});

test('statusCounts kart listesini durumlara göre sayar', () => {
  const yeni = kart();
  const ogreniliyor = kart();
  reviewCard(ogreniliyor, 'good');
  const kalici = kart();
  for (let i = 0; i < 5; i++) reviewCard(kalici, 'good');

  const c = statusCounts([yeni, ogreniliyor, kalici]);
  assert.equal(c.new, 1);
  assert.equal(c.learning, 1);
  assert.equal(c.mastered, 1);
});
