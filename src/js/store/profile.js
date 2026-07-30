// Tanışma testinin sonucu: bölüm, seviye ve amaçlar.
// Alan seçimi ayrı tutulur (store/interests.js) — kullanıcı testten bağımsız
// olarak istediği zaman alan ekleyip çıkarabilir.
//
// Bölüm bilgisi iki kuşak taşır:
//   presetId  → yeni, ayrıntılı bölüm (presets.json: "elektrik-elektronik")
//   profileId → eski, kaba meslek grubu (config.js PROFILES: "muhendislik")
// Eski kayıt yeni bir bölüme OTOMATİK ÇEVRİLMEZ: "Mühendislik" seçmiş birine
// "Elektrik-Elektronik Mühendisliği" yazmak, kullanıcının söylemediği bir şeyi
// söylemiş gibi göstermek olurdu. Eski etiket görünmeye devam eder ve kullanıcı
// isterse testi çözüp bölümünü netleştirir.

import { GOALS, LEVEL_CHOICES, PROFILES, STORAGE_KEYS } from '../config.js';
import { getPreset } from '../data/tag-repository.js';
import { read, write } from './storage.js';

const EMPTY = { presetId: null, profileId: null, levelId: null, goalIds: [] };

let profile = { ...EMPTY, ...read(STORAGE_KEYS.profile, {}) };
if (!Array.isArray(profile.goalIds)) profile.goalIds = [];

/** Testin sonucu (salt okunur kopya). */
export function getProfile() {
  return { ...profile, goalIds: [...profile.goalIds] };
}

/** Kullanıcı testi tamamladı mı? (eski kayıt da sayılır) */
export function hasProfile() {
  return Boolean(profile.presetId || profile.profileId);
}

/** Bölüm ayrıntısı verilmiş mi, yoksa eski kaba kayıt mı duruyor? */
export function needsPresetUpgrade() {
  return Boolean(profile.profileId) && !profile.presetId;
}

/** @param {{presetId?: string, profileId?: string, levelId: string, goalIds: string[]}} next */
export function setProfile(next) {
  profile = {
    presetId: next.presetId ?? null,
    // Yeni bölüm seçildiyse eski kaba kayıt anlamını yitirir.
    profileId: next.presetId ? null : next.profileId ?? profile.profileId ?? null,
    levelId: next.levelId ?? null,
    goalIds: [...(next.goalIds ?? [])],
  };
  write(STORAGE_KEYS.profile, profile);
}

/**
 * Anasayfadaki profil çipi için görünen bilgi.
 * Önce yeni bölüm, yoksa eski meslek grubu; ikisi de yoksa null.
 * @returns {{ icon: string, label: string, legacy: boolean }|null}
 */
export function getProfileMeta() {
  const preset = profile.presetId ? getPreset(profile.presetId) : null;
  if (preset) {
    return { icon: '🎓', label: preset.tr, legacy: false };
  }

  const legacy = PROFILES.find((item) => item.id === profile.profileId);
  if (legacy) {
    return { icon: legacy.icon, label: legacy.label, legacy: true };
  }
  return null;
}

export function getLevelChoice() {
  return LEVEL_CHOICES.find((item) => item.id === profile.levelId) || null;
}

/**
 * Kullanıcının seviyesine karşılık gelen CEFR seviyeleri.
 * Test yapılmamışsa boş dizi döner (kartlar ekranı "sana uygun" filtresini gizler).
 */
export function getPreferredLevels() {
  return getLevelChoice()?.levels ?? [];
}

/**
 * Profil ve amaçlara göre önerilen alan id'leri.
 * Önce bölümün alanları, sonra amaçlardan gelenler; tekrarlar ayıklanır.
 * @param {{presetId?: string, profileId?: string, goalIds?: string[]}} [source]
 *   test sırasında henüz kaydedilmemiş seçimler için kullanılır
 */
export function getRecommendedFields(source = profile) {
  const preset = source.presetId ? getPreset(source.presetId) : null;
  const fromPreset =
    preset?.fields ?? PROFILES.find((item) => item.id === source.profileId)?.fields ?? [];
  const fromGoals = (source.goalIds ?? []).flatMap(
    (id) => GOALS.find((goal) => goal.id === id)?.fields ?? []
  );
  return [...new Set([...fromPreset, ...fromGoals])];
}

/**
 * Amaç seçimlerinin öne çıkardığı kullanım ortamları.
 * Bölüm demeti "hangi alan", amaç "hangi ortam" sorusunu cevaplar; ikisi
 * birleşince etiket sorgusu oluşur.
 */
export function getGoalContexts(goalIds = profile.goalIds) {
  return [...new Set(goalIds.flatMap((id) => GOALS.find((goal) => goal.id === id)?.ctx ?? []))];
}
