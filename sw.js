// Daily English — service worker.
//
// Uygulama tamamen çevrimdışı çalışmalı: kurulumda bütün kabuk ve veri
// dosyaları önbelleğe alınır, sonrasında istekler önce önbellekten karşılanır.
// Dış kaynak (CDN, font, API) yok; bu yüzden ağ yalnız güncelleme için gerekir.
//
// Sürüm çıkarken CACHE_VERSION artırılır — eski önbellek activate sırasında
// silinir, kullanıcı bayat dosyayla kalmaz.

const CACHE_VERSION = 'v8';
const CACHE_NAME = `daily-english-${CACHE_VERSION}`;

// >>> ASSETS (üretilmiştir: npm run sync:sw)
const ASSETS = [
  './',
  'icon.svg',
  'index.html',
  'manifest.webmanifest',
  'src/data/dialogues/dialogues.json',
  'src/data/dialogues/directions.json',
  'src/data/dialogues/health.json',
  'src/data/dialogues/hotel.json',
  'src/data/dialogues/phone.json',
  'src/data/dialogues/restaurant.json',
  'src/data/dialogues/shopping.json',
  'src/data/dialogues/social.json',
  'src/data/dialogues/transport.json',
  'src/data/dialogues/work.json',
  'src/data/fields/acil-guvenlik.json',
  'src/data/fields/akademik.json',
  'src/data/fields/anlam-kaymasi.json',
  'src/data/fields/egitim.json',
  'src/data/fields/ekonomi.json',
  'src/data/fields/ev-doga.json',
  'src/data/fields/fen-muhendislik.json',
  'src/data/fields/fields.json',
  'src/data/fields/finans-para.json',
  'src/data/fields/genel-akademik.json',
  'src/data/fields/gunluk-rutin.json',
  'src/data/fields/hukuk.json',
  'src/data/fields/iletisim.json',
  'src/data/fields/iliskiler.json',
  'src/data/fields/is-hayati.json',
  'src/data/fields/kisisel-gelisim.json',
  'src/data/fields/medya-eglence.json',
  'src/data/fields/muhendislik.json',
  'src/data/fields/resmi-islemler.json',
  'src/data/fields/saglik-bilimleri.json',
  'src/data/fields/saglik-spor.json',
  'src/data/fields/seyahat.json',
  'src/data/fields/tip.json',
  'src/data/fields/yemek-alisveris.json',
  'src/data/phrases/agree.json',
  'src/data/phrases/clarify.json',
  'src/data/phrases/courtesy.json',
  'src/data/phrases/directions.json',
  'src/data/phrases/emotions.json',
  'src/data/phrases/greetings.json',
  'src/data/phrases/health.json',
  'src/data/phrases/hotel.json',
  'src/data/phrases/introductions.json',
  'src/data/phrases/phone.json',
  'src/data/phrases/phrases.json',
  'src/data/phrases/restaurant.json',
  'src/data/phrases/shopping.json',
  'src/data/phrases/smalltalk.json',
  'src/data/phrases/transport.json',
  'src/data/phrases/work.json',
  'src/data/presets.json',
  'src/data/tags.json',
  'src/js/config.js',
  'src/js/data/dialogue-repository.js',
  'src/js/data/phrase-repository.js',
  'src/js/data/repository.js',
  'src/js/data/tag-repository.js',
  'src/js/dom.js',
  'src/js/main.js',
  'src/js/screens/cards.js',
  'src/js/screens/daily.js',
  'src/js/screens/dialogues.js',
  'src/js/screens/field.js',
  'src/js/screens/home.js',
  'src/js/screens/navigation.js',
  'src/js/screens/onboarding.js',
  'src/js/screens/phrases.js',
  'src/js/screens/quiz.js',
  'src/js/state.js',
  'src/js/store/daily-session.js',
  'src/js/store/daily.js',
  'src/js/store/dialogues.js',
  'src/js/store/interests.js',
  'src/js/store/phrases.js',
  'src/js/store/profile.js',
  'src/js/store/progress.js',
  'src/js/store/stats.js',
  'src/js/store/storage.js',
  'src/js/store/tag-progress.js',
  'src/js/store/tags.js',
  'src/js/ui/daily-settings.js',
  'src/js/ui/header.js',
  'src/js/ui/tabbar.js',
  'src/js/ui/toast.js',
  'src/js/utils.js',
  'src/styles/main.css',
];
// <<< ASSETS

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Tek tek eklenir: bir dosya 404 verirse tüm kurulum çökmesin.
      await Promise.all(
        ASSETS.map((asset) =>
          cache.add(asset).catch((error) => console.warn('Önbelleğe alınamadı:', asset, error))
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Yalnız kendi kaynağımızdan gelen GET istekleri önbelleklenir.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        // Arka planda tazele: kullanıcı beklemez, bir sonraki açılış günceldir.
        event.waitUntil(refresh(request));
        return cached;
      }

      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        // Çevrimdışıyken bilinmeyen bir sayfa istenirse uygulama kabuğuna düş.
        if (request.mode === 'navigate') {
          const shell = await caches.match('./');
          if (shell) return shell;
        }
        throw error;
      }
    })()
  );
});

async function refresh(request) {
  try {
    const response = await fetch(request);
    if (!response.ok) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
  } catch {
    /* çevrimdışıyız; önbellekteki sürüm geçerli kalır */
  }
}
