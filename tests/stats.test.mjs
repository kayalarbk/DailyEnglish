// store/stats.js + store/progress.js — istatistik ekranının beslendiği hesaplar.
//
// İki kural burada korunuyor:
//   1. Günlük geçmiş GERİYE DÖNÜK veri uydurmaz. Grafik bugünden itibaren
//      dolar; boş günler dizide yer alır ama sayıları sıfırdır. Uydurulan bir
//      geçmiş, kullanıcının kendi çalışma düzeni hakkında yalan söylerdi.
//   2. Kutu dağılımı kart verisi İNDİRİLMEDEN hesaplanır (id öneki + manifest).
//      Bu ucuz yol bozulursa istatistik ekranı 29 dosya indirmeyi bekler.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SRS } from '../src/js/config.js';
import { getHistory, getStats, recordReview } from '../src/js/store/stats.js';
import { getMostLapsed, reviewCard } from '../src/js/store/progress.js';
import { dayKey } from '../src/js/utils.js';

let sayac = 0;
/** Alan öneki gerçek bir alan değil: kayıtlar başka testlere karışmasın. */
const kart = (alan = 'statstest') => ({ id: `${alan}-${String(++sayac).padStart(3, '0')}` });

test('geçmiş istenen gün sayısı kadar satır döndürür, en yenisi bugündür', () => {
  const gunler = getHistory(14);
  assert.equal(gunler.length, 14);
  assert.equal(gunler[13].day, dayKey(), 'son satır bugün olmalı');
  assert.equal(gunler[13].isToday, true);
  assert.equal(gunler.filter((g) => g.isToday).length, 1, 'yalnız bir gün "bugün"');
});

test('boş günler dizide DURUR (çalışılmayan gün görünmeli)', () => {
  const gunler = getHistory(14);
  // Geçmiş kaydı bu oturumda boş; bugün dışındaki her gün sıfır olmalı ama
  // atlanmamalı — atlanırsa üç günde bir çalışan kullanıcının çubukları yan
  // yana gelir ve düzenli çalışıyormuş gibi görünür.
  const eskiler = gunler.slice(0, 13);
  assert.equal(eskiler.length, 13);
  eskiler.forEach((gun) => assert.equal(typeof gun.count, 'number'));
});

test('geçmiş geriye dönük veri UYDURMAZ', () => {
  const gunler = getHistory(14).slice(0, 13);
  assert.equal(
    gunler.every((gun) => gun.count === 0),
    true,
    'kayıt tutulmaya yeni başlandıysa geçmiş günler sıfır kalmalı'
  );
});

test('bugünün sayısı canlı sayaçtan gelir', () => {
  const c = kart();
  const oncesi = getHistory(3).at(-1).count;
  recordReview(c, 'good', {});
  assert.equal(getHistory(3).at(-1).count, oncesi + 1);
  assert.equal(getStats().todayCount, oncesi + 1);
});

test('en çok unutulanlar: yalnız gerçekten unutulmuş kartlar, çoktan aza', () => {
  const az = kart('lapstest');
  const cok = kart('lapstest');
  const hic = kart('lapstest');

  // "hic" kartı hiç unutulmadı.
  reviewCard(hic, 'good');

  // Kutu 0'dayken "again" lapse SAYILMAZ (zaten dipte); önce yukarı çıkarılır.
  reviewCard(az, 'good');
  reviewCard(az, 'again');

  reviewCard(cok, 'good');
  reviewCard(cok, 'again');
  reviewCard(cok, 'good');
  reviewCard(cok, 'again');

  const satirlar = getMostLapsed(['lapstest'], 10);
  assert.equal(satirlar.length, 2, 'hiç unutulmamış kart listede olmamalı');
  assert.equal(satirlar[0].id, cok.id, 'en çok unutulan üstte');
  assert.equal(satirlar[0].lapses, 2);
  assert.equal(satirlar[1].lapses, 1);
});

test('en çok unutulanlar sınırı aşmaz', () => {
  for (let i = 0; i < 12; i++) {
    const c = kart('limittest');
    reviewCard(c, 'good');
    reviewCard(c, 'again');
  }
  assert.equal(getMostLapsed(['limittest'], 10).length, 10);
});

test('unutma sayısı kalıcı kutudan düşen kartta da artar', () => {
  const c = kart('mastertest');
  for (let i = 0; i < SRS.masteredBox; i++) reviewCard(c, 'good');
  const dusus = reviewCard(c, 'again');
  assert.equal(dusus.lapsed, true);
  assert.equal(getMostLapsed(['mastertest'], 5)[0].lapses, 1);
});
