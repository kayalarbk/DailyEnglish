// store/tags.js — etiket sorgusu eşleştirmesi.
//
// `matchesTagQuery` mimarinin en kritik ve en kırılgan parçası: bir kez yanlış
// yazıldı ve mühendislik öğrencisine 150 akademik çekirdek kartının SIFIRI
// gösterildi (bkz. PROGRESS.md 2026-07-30, "Yakalanan mimari hata").
// Kural: eksenler arası VE, eksen içi VEYA, ve kartın etiketi olmayan eksen
// onu ELEMEZ — yokluk karşıtlık değil nötrlüktür.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesTagQuery } from '../src/js/store/tags.js';

const kart = (...tags) => ({ id: 'x', en: 'x', tags });

test('boş sorgu her kartı geçirir', () => {
  assert.equal(matchesTagQuery(kart('dom:law'), []), true);
});

test('eksen içi VEYA: sorgudaki alanlardan biri yeterli', () => {
  const sorgu = ['dom:physics', 'dom:math'];
  assert.equal(matchesTagQuery(kart('dom:math'), sorgu), true);
  assert.equal(matchesTagQuery(kart('dom:physics', 'dom:cs'), sorgu), true);
});

test('eksenler arası VE: her eksen ayrı ayrı sağlanmalı', () => {
  const sorgu = ['dom:physics', 'ctx:lab'];
  assert.equal(matchesTagQuery(kart('dom:physics', 'ctx:lab'), sorgu), true);
  assert.equal(
    matchesTagQuery(kart('dom:physics', 'ctx:everyday'), sorgu),
    false,
    'bilgi alanı tutsa da bağlam tutmuyorsa elenmeli'
  );
});

test('KRİTİK: kartın etiketi olmayan eksen onu ELEMEZ', () => {
  // Akademik çekirdek bilerek dom: taşımaz — "give rise to" fizikte de
  // hukukta da aynı işi görür. Yokluk "uymuyor" sayılsaydı mimarinin en
  // yüksek getirili katmanı tam da hizmet etmesi gereken kullanıcıdan gizlenirdi.
  const cekirdek = kart('fn:cause', 'ctx:paper');
  assert.equal(matchesTagQuery(cekirdek, ['dom:physics', 'ctx:paper']), true);
  assert.equal(matchesTagQuery(cekirdek, ['dom:law', 'ctx:paper']), true);
});

test('ama süzgeç HÂLÂ süzer: karşıt bilgi alanı elenir', () => {
  const tipKarti = kart('dom:medicine', 'fn:method', 'ctx:practice');
  assert.equal(
    matchesTagQuery(tipKarti, ['dom:law', 'ctx:practice']),
    false,
    'gevşetme değil: iddiası olan eksen yanlışsa kart elenmeli'
  );
});

test('sorguda hiç bulunmayan eksen kısıt getirmez', () => {
  // Bölüm demetlerinde `type:` yok; type taşıyan kart bu yüzden elenmemeli.
  const kartTip = kart('dom:cs', 'ctx:practice', 'type:phrasal');
  assert.equal(matchesTagQuery(kartTip, ['dom:cs', 'ctx:practice']), true);
});

test('çok alanlı kart, alanlarından biri sorguda varsa geçer', () => {
  const cokAlanli = kart('dom:math', 'dom:physics', 'fn:method', 'ctx:lecture');
  assert.equal(matchesTagQuery(cokAlanli, ['dom:physics', 'ctx:lecture']), true);
  assert.equal(matchesTagQuery(cokAlanli, ['dom:math', 'ctx:lecture']), true);
  assert.equal(matchesTagQuery(cokAlanli, ['dom:law', 'ctx:lecture']), false);
});

test('etiketsiz kart her sorguyu geçer', () => {
  assert.equal(matchesTagQuery({ id: 'x', en: 'x' }, ['dom:physics']), true);
  assert.equal(matchesTagQuery({ id: 'x', en: 'x', tags: [] }, ['dom:physics']), true);
});

test('bozuk girdi çökertmez', () => {
  assert.equal(matchesTagQuery(null, ['dom:physics']), true);
  assert.equal(matchesTagQuery(undefined, []), true);
});

test('gerçek demet ve gerçek kartla uçtan uca', () => {
  // Elektrik-Elektronik demetinin sadeleştirilmiş hâli.
  const ee = ['dom:physics', 'dom:math', 'dom:engineering', 'dom:cs',
    'fn:measure', 'fn:method', 'ctx:lab', 'ctx:lecture'];

  const fizik = kart('dom:physics', 'fn:measure', 'ctx:lab', 'ctx:lecture');
  const cekirdek = kart('fn:method', 'ctx:lecture'); // dom: yok
  const tip = kart('dom:medicine', 'fn:method', 'ctx:practice');
  const gunluk = kart('ctx:everyday', 'type:phrasal'); // fn/dom yok

  assert.equal(matchesTagQuery(fizik, ee), true, 'kendi alanı');
  assert.equal(matchesTagQuery(cekirdek, ee), true, 'akademik çekirdek ulaşmalı');
  assert.equal(matchesTagQuery(tip, ee), false, 'başka alanın kartı elenmeli');
  assert.equal(matchesTagQuery(gunluk, ee), false, 'ctx:everyday sorguda yok, elenmeli');
});
