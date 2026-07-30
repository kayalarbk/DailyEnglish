# Daily English

Günlük ve akademik İngilizce çalışmak için hazırlanmış, bağımlılıksız bir öğrenme
uygulaması. Üç bölümden oluşur: **kelime** (21 alan, 61 kategori, 1549 kart),
**günlük kalıplar** (15 konu, 375 ifade) ve **diyalog** (30 canlandırma sahnesi).
Kelime verisi ayrıca **çok eksenli bir etiket katmanı** taşır ve **38 üniversite
bölümü** için hazır etiket demetleri tanımlıdır. Kurulum gerektirmez, tamamen
çevrimdışı çalışır.

## Özellikler

- **Tanışma testi** — bölüm/meslek, seviye ve amacını sorar; alanları sana göre önerir
- **Kişiselleştirme** — mesleki alanlar (mühendislik, tıp, ekonomi, hukuk, akademik) ve
  "sana uygun" seviye filtresi; istediğin zaman yeni alan ekleyip çıkarabilirsin
- **Flashcard'lar** — karta dokun, İngilizce/Türkçe yüzler arasında çevir
- **Aralıklı tekrar (Leitner)** — Türkçesini görmeden "hatırlamadım / zor / kolay"
  dersin; kart kutular arasında gezer ve bir sonraki tekrar 1 · 3 · 7 · 16 · 35 gün
  sonrasına planlanır. Cevaba önce bakarsan "kolay" seçeneği kapanır.
- **Dört durum** — Yeni · Öğreniliyor · Pekişti · Kalıcı. Bir kart ancak ~2 hafta
  arayla hatırlanmayı sürdürürse "kalıcı" sayılır; tek dokunuşla öğrenilmiş olmaz.
- **Bugüne Başla (günlük karma deste)** — anasayfada tek giriş noktası: tüm
  alanlardan vadesi gelmiş tekrarlar + sınırlı sayıda yeni kart, tek destede
  toplanır. Alan alan gezmek gerekmez.
  - **Tavan modeli:** tekrarlar önce alınır (en eski vade önde), kalan yer
    yeni kartla dolar; toplam günlük hedefi aşmaz, yeni kartın kendi tavanı olur
  - **Alanlar dengeli:** seçim alanlar arasında sırayla yapılır, bir alan
    desteyi domine etmez
  - **Sığmayan tekrarlar ertelenmez** — vadeleri olduğu gibi kalır, yalnızca
    bugün gösterilmezler ("+43 tekrar yarına kaldı")
  - Deste günde bir kez kurulur; sayfayı yenilesen de kaldığın yerden devam eder
  - Kart / quiz / karışık çalışma tipi, ayarlanabilir günlük hedef ve yeni kart
    tavanı
  - Gün sonunda özet: doğru/yanlış, süre, alan bazlı kırılım, zorlanılan kartlar
- **CEFR seviyeleri** — her kartta A1–B2 rozeti; kartlar ekranında seviye filtresi
- **Telaffuz** — Web Speech API ile kelime ve örnek cümle seslendirme
- **Oyunlaştırma** — günlük hedef (çalışılan kart sayısı), seri (streak) ve XP
- **Quiz modu** — boşluk doldurma, anlam eşleştirme ve **yazma**; sonuçlar tekrar
  kayıtlarını da günceller. Çoktan seçmeli doğru cevap kartı en fazla "Pekişti"ye
  taşır — dört şıkta şansla bulmak kalıcılık kanıtı değildir; son adımı yazarak
  bilmek ya da kartta "kolay" demek açar.

### Akademik ve bölümsel katman

- **Akademik Çekirdek** (150 kart) — bölümden bağımsız akademik dil, dilsel
  işleve göre kategorilere ayrılmış: neden-sonuç · değişim ve eğilim ·
  karşılaştırma · ölçüm · iddia ve itiraz · yöntem · tanımlama · süreç.
  Tek bir katman, 38 bölümün hepsine birden hizmet eder.
  - Ayrı bir kategori **Türkçeden birebir çevrilince çıkan hatalara** ayrıldı:
    `do research` (make ✗) · `make a decision` (give ✗) · `pay attention to`
    (make ✗) · `pass an exam` (win ✗)
- **Anlam Kayması** (50 kart) — günlük anlamını bildiğin ama alanında bambaşka
  anlama gelen sözcükler. Tıpta `positive` **iyi haber değildir**; `order`
  "sipariş" değil *mertebe*, `subject` "konu" değil *denek*.
- **Bölüm seçimi** — 9 grup, 38 bölüm. Bölümünü seçince hangi kelimelerin öne
  çıkacağı belirlenir; istersen etiketleri tek tek ince ayar yapabilirsin.

### Günlük Kalıplar

15 konuda 375 hazır ifade: selamlaşma, restoran, alışveriş ve pazarlık, yol tarifi,
ulaşım, otel, telefon, sağlık, iş yeri, small talk, anlamadığını belirtme, kabul/ret,
özür/teşekkür, duygu ifade etme.

- **Ders kitabı değil, gerçek kullanım** — "How do you do?" değil "What's up?"
- **Kullanım düzeyi rozeti** — resmî · nötr · samimi. Bir kalıbın nerede
  *kullanılamayacağını* bilmek, ne demek olduğunu bilmek kadar önemlidir.
- **Kullanım notu ve tuzak uyarısı** — `Do you mind…?` sorusuna "yes" demek
  reddetmektir; `on sale` ≠ `for sale`; `nervous` "sinirli" değil "kaygılı"dır
- **Birebir çeviri** — yalnız yanıltıcı olduğunda gösterilir
  (`I couldn't agree more` olumsuz görünür ama en güçlü onaydır)
- **Arama** — hem İngilizce hem Türkçe içinde; `hesabi` yazınca `hesabı` da bulunur
- **Türkçeyi gizle** — önce hatırlamayı dene, sonra dokunup kontrol et
- Favorilere ekleme ve öğrenildi işaretleme

### Diyalog (canlandırma)

30 sahne, 8–14 replik, mesajlaşma arayüzünde. Sen bir rolü üstlenirsin, karşı taraf
kendiliğinden seslendirilir.

- **Rol seçimi** — aynı sahneyi iki taraftan da oynayabilirsin
- **Üç mod:**
  - *Oku* — replik yazılı gelir
  - *Hatırla* — yalnız Türkçesi gösterilir, İngilizcesini sen bulursun
  - *Konuş* — mikrofona söylersin, normalize edilmiş Levenshtein benzerliğiyle
    puan alırsın. Kabul edilen alternatif söyleyişler de tam puan alır
    ("I'll have a latte" ≡ "Can I get a latte"). Tarayıcı `SpeechRecognition`
    desteklemiyorsa bu mod hiç görünmez.
- **Farklı sesler** — roller ayrı seslerle (ya da tek ses varsa ayrı perdeyle) okunur
- **Sahne özeti** — kullanılan kalıpların listesi (kalıplar modülüne bağlı),
  konuşma modundaysa ortalama telaffuz puanı, "tekrar oyna" ve "rolü değiştir"

## Çalıştırma

Uygulama ES modülleri kullandığı için `index.html` dosyasını çift tıklayarak açmak
yerine yerel bir sunucu üzerinden servis edilmelidir.

```bash
npm start
# veya
python -m http.server 8000
```

Ardından tarayıcıdan `http://localhost:8000` adresini aç.

## Klasör Yapısı

```
.
├── index.html                  # Uygulama kabuğu (on ekranın işaretlemesi)
├── sw.js                       # Service worker (çevrimdışı önbellek)
├── manifest.webmanifest        # PWA tanımı
├── icon.svg                    # Uygulama ikonu
├── docs/VERI-REHBERI.md        # Veri şeması ve yeni parti entegrasyonu
├── tools/
│   ├── validate-data.mjs       # Veri doğrulama (npm run validate)
│   ├── sync-manifest.mjs       # Manifest'i verilerden üretir (npm run sync)
│   └── sync-sw.mjs             # sw.js önbellek listesini üretir (npm run sync:sw)
└── src/
    ├── data/
    │   ├── fields/             # Kelime: manifest (fields.json) + 19 alan
    │   ├── phrases/            # Kalıplar: manifest + 15 kategori
    │   └── dialogues/          # Diyaloglar: manifest + 9 kategori
    ├── styles/main.css         # Tüm stiller
    └── js/
        ├── main.js             # Giriş noktası, olay bağlamaları, SW kaydı
        ├── config.js           # Sabitler (seviyeler, SRS, düzeyler, depolama anahtarları)
        ├── dom.js              # DOM referansları
        ├── state.js            # Ekranlar arası paylaşılan durum
        ├── utils.js            # Karıştırma, seslendirme, arama katlama, Levenshtein
        ├── data/               # repository · phrase-repository · dialogue-repository
        ├── store/              # localStorage: profil, ilgi, SRS, istatistik,
        │   │                   #   kalıp favorileri, diyalog kayıtları
        │   ├── progress.js     # Aralıklı tekrar: kutu, vade, durum ve toplamlar
        │   └── daily.js        # Günlük deste kurucu (saf fonksiyon)
        ├── ui/                 # Üst bar · sekme çubuğu · modal · bildirimler
        └── screens/            # onboarding · home · field · cards · quiz
                                #   · daily · phrases · dialogues
```

## Kelime Ekleme

Kelime verisi `src/data/fields/` altındadır ve arayüz tamamen manifest'ten
beslenir — yeni bir alan eklemek için JavaScript'e dokunmak gerekmez:

```bash
# alan dosyasını src/data/fields/ içine koy, sonra:
npm run sync       # manifest'i (fields.json) verilerden yeniden üret
npm run validate   # şema, id ve sayaç kontrolü
```

Şema, id kuralları ve parti entegrasyon adımları için
[docs/VERI-REHBERI.md](docs/VERI-REHBERI.md).

## Veri Taşıma

Eski sürümlerin ilerleme kayıtları açılışta otomatik taşınır: `de_learned_v2`
(düz id listesi) ve daha eski `kartlar_learned_v1` (`"Kategori::kelime"`)
kayıtları, 2. kutuda ve bugün vadesi gelmiş SRS kayıtlarına dönüşür. Yani eski
"öğrendim" işaretleri kaybolmaz ama sıfırdan doğrulanır — ilk tekrar kartın
gerçekten hatırlanıp hatırlanmadığını ortaya çıkarır.

## Çevrimdışı Çalışma

Uygulama bir service worker ile tüm dosyalarını (kabuk, stiller, betikler ve
bütün veri dosyaları) önbelleğe alır; ilk açılıştan sonra ağ bağlantısı
gerekmez. Dış kaynak yoktur — CDN, font ya da API çağrısı yapılmaz.

Yeni bir dosya eklendiğinde önbellek listesi yeniden üretilmelidir:

```bash
npm run sync:sw          # sw.js içindeki ASSETS listesini yeniden yaz
npm run sync:sw:check    # yalnız kontrol et (commit öncesi)
```

Sürüm çıkarırken `sw.js` içindeki `CACHE_VERSION` artırılır; eski önbellek
etkinleşme sırasında silinir.

## Tarayıcı Desteği

ES modülleri ve `localStorage` destekleyen tüm güncel tarayıcılar. Telaffuz
özelliği Web Speech API bulunmayan tarayıcılarda sessizce devre dışı kalır.
Diyalogların **Konuş modu** `SpeechRecognition` gerektirir (Chrome, Edge, Safari);
desteklenmeyen tarayıcıda mod listede hiç görünmez, diğer iki mod çalışmayı sürdürür.
