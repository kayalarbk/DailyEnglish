// store/profile.js — tanışma testinin rol dallanması.
//
// 2026-08-02'de test ilk soruyla başladı: öğrenci / çalışan / hobi. Bu dallanma
// iki sessiz hataya açık ve ikisi de kullanıcıyı doğrudan vurur:
//   1. Hobi olarak öğrenen kullanıcının BÖLÜMÜ YOKTUR. `hasProfile()` yalnız
//      bölüme bakarsa o kullanıcı "testi çözmemiş" sayılır ve her açılışta
//      yeniden teste çağrılır.
//   2. Bölümü olmayan kullanıcıya alan önerisi yapılamazsa alan seçimi ekranı
//      boş bir listeyle açılır ve kullanıcı nereden başlayacağını bilemez.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getProfileMeta,
  getRecommendedFields,
  getRole,
  hasProfile,
  setProfile,
} from '../src/js/store/profile.js';

test('rol tek başına testi tamamlanmış sayar (hobi kullanıcısı geri çağrılmaz)', () => {
  setProfile({ roleId: 'hobi', levelId: 'orta', goalIds: [] });
  assert.equal(hasProfile(), true, 'bölümü olmayan kullanıcı testi çözmüş sayılmalı');
  assert.equal(getRole()?.id, 'hobi');
});

test('rol kaydı yoksa test tamamlanmamıştır', () => {
  setProfile({ levelId: 'orta', goalIds: [] });
  assert.equal(hasProfile(), false);
});

test('bölümü olmayan kullanıcıya rolün alanları önerilir', () => {
  setProfile({ roleId: 'hobi', levelId: 'orta', goalIds: [] });
  const öneri = getRecommendedFields();
  assert.ok(öneri.length > 0, 'öneri listesi boş kalmamalı');
  assert.ok(öneri.includes('gunluk-rutin'));
  assert.ok(öneri.includes('seyahat'));
});

test('amaç seçimleri rolün önerisine EKLENİR, onun yerine geçmez', () => {
  setProfile({ roleId: 'hobi', levelId: 'orta', goalIds: ['akademik'] });
  const öneri = getRecommendedFields();
  assert.ok(öneri.includes('gunluk-rutin'), 'rolden gelen alan kaybolmamalı');
  assert.ok(öneri.includes('akademik'), 'amaçtan gelen alan eklenmeli');
});

test('profil çipi bölüm yoksa rolü gösterir', () => {
  setProfile({ roleId: 'calisan', levelId: 'ileri', goalIds: [] });
  const meta = getProfileMeta();
  assert.ok(meta, 'çip boş kalmamalı');
  assert.equal(meta.label, 'Çalışıyorum');
  assert.equal(meta.legacy, false);
});

test('rol seçilmemişse çip de yoktur', () => {
  setProfile({ levelId: 'orta', goalIds: [] });
  assert.equal(getProfileMeta(), null);
});
