// localStorage sarmalayıcısı.
// Gizli mod / kotanın dolması gibi durumlarda uygulama çökmemeli.

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* gizli mod vb. durumlarda sessizce geç */
  }
}
