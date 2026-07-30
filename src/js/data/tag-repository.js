// Etiket sözlüğü ve bölüm demetlerine erişim.
//
// `config.js` senkron sabitler modülüdür, dosya okuyamaz; sözlük bu yüzden
// alan manifesti gibi açılışta bir kez indirilir. Kodun hiçbir yerinde etiket
// dizesi elle yazılmaz — etiket adı bilinmek istendiğinde buradan sorulur.

import { PRESETS_MANIFEST, TAGS_MANIFEST } from '../config.js';

/** @type {{id: string, tr: string, aciklama: string, zorunlu?: boolean, muaf?: string[]}[]} */
let axes = [];
/** @type {{id: string, eksen: string, tr: string, aciklama: string}[]} */
let tags = [];
/** @type {Map<string, object>} */
let tagById = new Map();

/** @type {{id: string, tr: string, icon: string}[]} */
let groups = [];
/** @type {{id: string, tr: string, grup: string, tags: string[], fields: string[]}[]} */
let presets = [];

let ready = false;

/** Sözlüğü ve demetleri yükler. Açılışta bir kez çağrılır. */
export async function loadTagData() {
  if (ready) return;

  const [tagResponse, presetResponse] = await Promise.all([
    fetch(TAGS_MANIFEST),
    fetch(PRESETS_MANIFEST),
  ]);
  if (!tagResponse.ok) throw new Error(`Etiket sözlüğü yüklenemedi (${tagResponse.status})`);
  if (!presetResponse.ok) throw new Error(`Bölüm listesi yüklenemedi (${presetResponse.status})`);

  const tagJson = await tagResponse.json();
  const presetJson = await presetResponse.json();

  axes = tagJson.axes || [];
  tags = tagJson.tags || [];
  tagById = new Map(tags.map((tag) => [tag.id, tag]));
  groups = presetJson.groups || [];
  presets = presetJson.presets || [];
  ready = true;
}

export function isTagDataReady() {
  return ready;
}

// ------------------------------------------------------------------
// Etiketler
// ------------------------------------------------------------------

export function getAxes() {
  return axes;
}

export function getAxis(axisId) {
  return axes.find((axis) => axis.id === axisId) || null;
}

/** Bir eksenin etiketleri, sözlükteki sırayla. */
export function getTagsOfAxis(axisId) {
  return tags.filter((tag) => tag.eksen === axisId);
}

export function getTag(tagId) {
  return tagById.get(tagId) || null;
}

/**
 * Etiketin görünen adı: "dom:physics" → "Fizik".
 * Sözlükte yoksa etiketin kendisi döner; arayüz boş rozet göstermesin.
 */
export function tagLabel(tagId) {
  return tagById.get(tagId)?.tr || tagId;
}

/** Etiketin ekseni: "dom:physics" → "dom". */
export function axisOf(tagId) {
  return String(tagId).split(':')[0];
}

/** Bir kartın (ya da herhangi bir etiket listesinin) belirli eksendeki etiketleri. */
export function filterAxis(tagList, axisId) {
  return (tagList || []).filter((tag) => tag.startsWith(`${axisId}:`));
}

// ------------------------------------------------------------------
// Bölüm demetleri
// ------------------------------------------------------------------

export function getGroups() {
  return groups;
}

export function getPresets() {
  return presets;
}

export function getPresetsOfGroup(groupId) {
  return presets.filter((preset) => preset.grup === groupId);
}

export function getPreset(presetId) {
  return presets.find((preset) => preset.id === presetId) || null;
}

export function getGroup(groupId) {
  return groups.find((group) => group.id === groupId) || null;
}
