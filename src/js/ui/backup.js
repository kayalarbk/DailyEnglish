// Yedekleme arayüzü: "Verimi indir" ve "Yedekten geri yükle".
//
// Geri yükleme YIKICI bir işlemdir ve geri alınamaz; bu yüzden dosya seçmek
// tek başına yeterli değil. Dosya önce okunup DOĞRULANIR, sonra kullanıcıya
// ne yükleyeceği (yedeğin tarihi, kaç kart kaydı taşıdığı) gösterilir ve
// onay istenir. `confirm()` kullanılmadı: tarayıcının kendi kutusu ne
// yükleneceğini gösteremez, yalnızca "emin misin?" der — oysa asıl soru
// "hangi yedek?" sorusudur.
//
// Onaydan sonra sayfa yeniden yüklenir. Depo modülleri (progress, stats,
// interests…) durumlarını import anında bellekte tuttukları için, yeniden
// yüklemeden devam etmek ekranda eski veriyi göstermeye devam ederdi.

import { el } from '../dom.js';
import { STORAGE_KEYS } from '../config.js';
import { backupFileName, exportData, importData, parseBackup } from '../store/backup.js';
import { toast } from './toast.js';

/** Doğrulanmış ama henüz uygulanmamış yedek metni. */
let pending = null;

function setNote(text, kind = '') {
  if (!el.backupNote) return;
  el.backupNote.textContent = text || '';
  el.backupNote.className = `backup-note${kind ? ` is-${kind}` : ''}`;
  el.backupNote.classList.toggle('hidden', !text);
}

function hideConfirm() {
  pending = null;
  el.backupConfirm?.classList.add('hidden');
}

/** Dosyayı indirir. Blob + geçici bağlantı — kütüphane yok. */
function downloadBackup() {
  const backup = exportData();
  const cards = Object.keys(backup.data[STORAGE_KEYS.srs] || {}).length;

  try {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backupFileName();
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Bellek sızmasın: bağlantı kullanıldıktan sonra URL serbest bırakılır.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    setNote('Dosya indirilemedi. Tarayıcı indirmeye izin vermiyor olabilir.', 'error');
    return;
  }

  setNote(
    cards > 0
      ? `${cards} kart kaydı yedeklendi. Dosyayı e-postana ya da buluta kopyalamayı unutma.`
      : 'Yedek alındı. Henüz çalışılmış kart yok.',
    'ok'
  );
  toast('Yedek indirildi', '💾');
}

/** Seçilen dosyayı okur, doğrular ve onay kutusunu hazırlar. */
async function reviewFile(file) {
  hideConfirm();
  if (!file) return;

  let text;
  try {
    text = await file.text();
  } catch {
    setNote('Dosya okunamadı.', 'error');
    return;
  }

  const parsed = parseBackup(text);
  if (!parsed.ok) {
    setNote(`Bu dosya geri yüklenemez — ${parsed.error}`, 'error');
    return;
  }

  pending = text;
  setNote('');

  const cards = Object.keys(parsed.data[STORAGE_KEYS.srs] || {}).length;
  const day = parsed.exportedAt ? parsed.exportedAt.slice(0, 10) : 'tarihsiz';
  const skipped = parsed.skipped.length
    ? ` ${parsed.skipped.length} tanınmayan kayıt atlanacak.`
    : '';

  if (el.backupConfirmText) {
    el.backupConfirmText.textContent =
      `${day} tarihli yedek · ${cards} kart kaydı.${skipped} ` +
      'Bu cihazdaki mevcut ilerlemenin ÜZERİNE yazılacak ve geri alınamaz.';
  }
  el.backupConfirm?.classList.remove('hidden');
}

function applyPending() {
  if (!pending) return;
  const result = importData(pending);
  hideConfirm();

  if (!result.ok) {
    setNote(`Geri yükleme yapılamadı — ${result.error}`, 'error');
    return;
  }

  setNote('Geri yüklendi. Sayfa yenileniyor…', 'ok');
  toast('Yedek geri yüklendi', '♻️');
  // Depolar bellekteki hâllerini bırakmalı; en temiz yol yeniden başlamak.
  setTimeout(() => window.location.reload(), 600);
}

export function bindBackup() {
  if (el.backupExportBtn) el.backupExportBtn.onclick = downloadBackup;

  if (el.backupImportBtn && el.backupFileInput) {
    el.backupImportBtn.onclick = () => {
      // Aynı dosya ikinci kez seçilirse de `change` tetiklensin diye sıfırlanır.
      el.backupFileInput.value = '';
      el.backupFileInput.click();
    };
    el.backupFileInput.onchange = () => reviewFile(el.backupFileInput.files?.[0]);
  }

  if (el.backupConfirmBtn) el.backupConfirmBtn.onclick = applyPending;
  if (el.backupCancelBtn) {
    el.backupCancelBtn.onclick = () => {
      hideConfirm();
      setNote('Geri yükleme iptal edildi. Hiçbir şey değişmedi.');
    };
  }
}
