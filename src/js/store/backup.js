// Verinin dışa/içe aktarılması.
//
// Uygulamanın bütün ilerlemesi tek bir tarayıcının localStorage'ında duruyor:
// SRS geçmişi, seri, XP, bölüm seçimi, kalıp ve diyalog kayıtları. Tarayıcı
// verisi silinirse — çerez temizliği, cihaz değişikliği, gizli mod — aylarca
// biriken kanıt geri getirilemez. SRS'in bütün iddiası zamana yayılmış ölçüm
// olduğu için burada kaybedilen şey bir ayar değil, ölçümün kendisidir.
//
// ANAHTAR LİSTESİ ELLE YAZILMAZ. `STORAGE_KEYS`ten türetilir; yeni bir depo
// anahtarı eklendiğinde yedek onu kendiliğinden kapsar. Elle tutulan bir liste
// er geç eksik kalır ve hata sessiz olur: yedek alınır, dosya makul görünür,
// eksik olan yalnızca geri yüklendiğinde fark edilir. Bu, service worker
// önbellek listesinde öğrenilen dersin (`sync-sw.mjs`) aynısı.
//
// Bu modüldeki iki ana fonksiyon SAFTIR: depoya erişimi dışarıdan alırlar.
// Böylece Node testlerinde localStorage taklidi yeterli olur.

import { STORAGE_KEYS } from '../config.js';

/** Yedek dosyasının biçim sürümü. Biçim değişirse artar. */
export const BACKUP_VERSION = 1;

/**
 * Yedeğe girecek anahtarlar — tek kaynak `config.js`.
 *
 * Eski biçim anahtarları (`de_learned_v2`, `kartlar_learned_v1`) de dâhil:
 * onlar henüz taşınmamış ilerlemedir ve dışarıda bırakılırsa yedeği alan
 * kullanıcı, hiç açılmamış bir alanın eski kayıtlarını kaybeder.
 * @type {string[]}
 */
export const BACKUP_KEYS = Object.values(STORAGE_KEYS);

/** Varsayılan depo: gerçek localStorage. Erişilemezse sessizce boş davranır. */
const browserStore = {
  read(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  write(key, raw) {
    try {
      localStorage.setItem(key, raw);
    } catch {
      /* gizli mod / kota: sessizce geç */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* gizli mod: sessizce geç */
    }
  },
};

/**
 * Yedek nesnesini kurar.
 *
 * Depoda bulunmayan anahtar dosyaya HİÇ yazılmaz (boş nesneyle doldurulmaz):
 * "bu kullanıcının kalıp kaydı yok" ile "kalıp kaydı boştu" farklı şeylerdir
 * ve geri yükleme bu farkı koruyabilmeli.
 *
 * @param {{ store?: typeof browserStore, now?: () => Date }} [options]
 * @returns {{ version: number, exportedAt: string, data: Record<string, unknown> }}
 */
export function exportData({ store = browserStore, now = () => new Date() } = {}) {
  /** @type {Record<string, unknown>} */
  const data = {};

  BACKUP_KEYS.forEach((key) => {
    const raw = store.read(key);
    if (raw === null || raw === undefined) return;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      // Bozuk bir kayıt yedeği tamamen engellememeli; ham metin olarak taşınır
      // ve geri yüklendiğinde depo katmanı onu yine sessizce yutar.
      data[key] = raw;
    }
  });

  return { version: BACKUP_VERSION, exportedAt: now().toISOString(), data };
}

/**
 * Yedek dosyasının adı: `daily-english-yedek-2026-08-02.json`.
 * @param {Date} [date]
 */
export function backupFileName(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  const day = new Date(date.getTime() - offset).toISOString().slice(0, 10);
  return `daily-english-yedek-${day}.json`;
}

/**
 * Yedek metnini çözümler ve DOĞRULAR — hiçbir şey yazmaz.
 *
 * Ayrı bir adım olması bilinçli: içe aktarma ya tamamen uygulanmalı ya hiç.
 * Doğrulama yazmayla iç içe olsaydı, dosyanın ortasındaki bir bozukluk
 * kullanıcıyı yarısı yeni yarısı eski bir depoyla bırakırdı — bu, hiç geri
 * yüklememekten daha kötüdür, çünkü tutarsızlık fark edilmez.
 *
 * @param {string} json
 * @returns {{ ok: true, version: number, data: Record<string, unknown>,
 *   skipped: string[], exportedAt: string|null }
 *   | { ok: false, error: string }}
 */
export function parseBackup(json) {
  if (typeof json !== 'string' || json.trim() === '') {
    return { ok: false, error: 'Dosya boş.' };
  }

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Dosya okunamadı: geçerli bir JSON değil.' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Dosya bir yedek dosyası değil.' };
  }
  if (parsed.version !== BACKUP_VERSION) {
    return {
      ok: false,
      error:
        `Yedek sürümü ${parsed.version ?? '(yok)'} — bu sürüm yalnız ` +
        `${BACKUP_VERSION} numaralı yedekleri okuyabiliyor.`,
    };
  }
  if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
    return { ok: false, error: 'Yedekte "data" bölümü yok.' };
  }

  // Bilinmeyen anahtar ATLANIR, hata sayılmaz: ileriki bir sürümde yazılmış
  // yedek, bu sürümün tanıdığı kısmıyla geri yüklenebilmeli. Ama tanınmayan
  // anahtar depoya YAZILMAZ — depo, kodun bildiği anahtarlardan ibarettir.
  /** @type {Record<string, unknown>} */
  const data = {};
  /** @type {string[]} */
  const skipped = [];
  Object.keys(parsed.data).forEach((key) => {
    if (BACKUP_KEYS.includes(key)) {
      data[key] = parsed.data[key];
    } else {
      skipped.push(key);
    }
  });

  if (Object.keys(data).length === 0) {
    return { ok: false, error: 'Yedekte bu uygulamaya ait hiçbir kayıt yok.' };
  }

  return {
    ok: true,
    version: parsed.version,
    data,
    skipped,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : null,
  };
}

/**
 * Yedeği depoya uygular. Önce doğrular; dosya bozuksa HİÇBİR anahtara dokunmaz.
 *
 * Yedekte bulunmayan bilinen anahtarlar SİLİNİR. Gerekçe: geri yükleme bir
 * birleştirme değil, o günkü hâle dönüştür. Eski kayıtlar yerinde bırakılsaydı
 * kullanıcı, yedeği aldığı gün silmiş olduğu bir alanın ilerlemesini geri gelmiş
 * bulurdu ve hangi kaydın nereden geldiğini artık hiçbir yerden anlayamazdı.
 *
 * @param {string} json
 * @param {{ store?: typeof browserStore }} [options]
 * @returns {{ ok: true, restored: string[], cleared: string[], skipped: string[],
 *   exportedAt: string|null } | { ok: false, error: string }}
 */
export function importData(json, { store = browserStore } = {}) {
  const parsed = parseBackup(json);
  if (!parsed.ok) return parsed;

  const restored = [];
  const cleared = [];

  BACKUP_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(parsed.data, key)) {
      store.write(key, JSON.stringify(parsed.data[key]));
      restored.push(key);
    } else if (store.read(key) !== null && store.read(key) !== undefined) {
      store.remove(key);
      cleared.push(key);
    }
  });

  return {
    ok: true,
    restored,
    cleared,
    skipped: parsed.skipped,
    exportedAt: parsed.exportedAt,
  };
}
