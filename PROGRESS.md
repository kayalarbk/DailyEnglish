# PROGRESS — Proje Hafızası

> **Bu dosya projenin hafızasıdır. Her güncelleme, yeni özellik, bug fix veya
> teknik karar sonrasında bu dosya GÜNCELLENMELİDİR. Güncelleme yapılmadan iş
> "bitti" sayılmaz.**

**Çalışma akışı:**

1. Her oturumun başında önce bu dosya okunur, kaldığın yerden devam edilir.
2. İş bitince PROGRESS.md güncellenir.
3. PROGRESS.md ve ilgili kod değişiklikleri **birlikte** commit edilir ve
   push'lanır. Commit mesajı: `feat: …` / `fix: …` / `docs: …`
4. Push yapılmadan görev tamamlanmış sayılmaz.

---

## Proje Özeti

**Daily English** — ilgi alanına göre İngilizce çalıştıran, bağımlılıksız
(framework yok, build adımı yok) bir öğrenme uygulaması. Üç bölüm:

| Bölüm | İçerik |
|---|---|
| **Kelime** | 19 alan, 45 kategori, 1349 kart; örnek cümle, CEFR seviyesi, telaffuz |
| **Kalıplar** | 15 kategori, 375 günlük ifade; kullanım düzeyi, kullanım notu, örnek |
| **Diyalog** | 30 canlandırma sahnesi, 368 replik; rol seçimi ve üç oynama modu |

**Amaç:** Kullanıcının *gerçekten* öğrenmesi — görmesi değil. Bu yüzden kelime
tarafının merkezinde aralıklı tekrar (spaced repetition) var; kalıp ve diyalog
bölümleri bu ölçümü sulandırmamak için ayrı tutuluyor (bkz. Teknik Kararlar).

**Referans dokümanlar:**

- `SPEC.md` — **henüz yok** (bkz. TODO). Ürün gereksinimleri şu an README ve
  bu dosya arasında dağılmış durumda.
- `README.md` — kullanıcıya dönük özellik listesi, kurulum, klasör yapısı
- `docs/VERI-REHBERI.md` — veri şeması, id kuralları, yeni kelime partisi ekleme

---

## Tamamlanan İşler

Tarihler commit tarihleridir.

### 2026-07-05 — İlk sürüm

- Tek dosyalık HTML flashcard uygulaması (`index.html`), gömülü kelime listesi.

### 2026-07-07 / 2026-07-15 — İçerik büyütme

- Kelime listesi partiler hâlinde genişletildi.

### 2026-07-20 — Modüler yapıya geçiş

- Tek dosya, ES modüllerine bölündü: `src/js/` altında `store`, `screens`,
  `ui`, `data` katmanları; veri `src/data/fields/` altında JSON dosyalarına
  taşındı. Artık yerel sunucu gerekiyor (ES modülleri `file://` ile çalışmaz).

### 2026-07-21 — Seviyeler, veri araçları, içerik

- Her karta CEFR seviyesi (A1–B2) ve rozet; kartlar ekranında seviye filtresi.
- İlerleme takibi kart metnine değil **kalıcı kart id'sine** bağlandı
  (`gunluk-rutin-101`) — metin değişse bile ilerleme korunuyor.
- `tools/validate-data.mjs` (şema/id/sayaç doğrulama) ve
  `tools/sync-manifest.mjs` (manifest üretimi) eklendi.
- İçerik: tekrar eden kalıplar temizlendi, B2 ve günlük kalıplar artırıldı.

### 2026-07-22 — Kişiselleştirme

- Tanışma testi (bölüm/meslek → seviye → amaç), profile göre alan önerisi,
  "⭐ Sana uygun" seviye filtresi, alan ekle/çıkar ekranı.

### 2026-07-22 — Aralıklı tekrar (SRS) — **büyük değişiklik**

Sorun: "Öğrendim" butonu kartın **arka** yüzündeydi. Kullanıcı Türkçe karşılığı
gördükten sonra basıyordu; ölçülen şey hatırlama değil *tanıma* idi. İlerleme
ikili (öğrenildi/öğrenilmedi) tutuluyordu, zaman boyutu yoktu.

Yapılanlar:

1. **Değerlendirme kartın ön yüzüne alındı.** Cevap görülmeden üç seçenek:
   Hatırlamadım / Zor hatırladım / Kolay (klavye: 1-2-3). Seçince kart cevabı
   göstermek için kendiliğinden dönüyor.
   - **Dürüstlük kilidi:** kullanıcı değerlendirmeden önce kartı çevirirse
     ("peek") "Kolay" seçeneği kapanıyor.
2. **Leitner kutuları.** Kart başına kayıt: `{box, due, seen, correct, lapses,
   last}`. Aralıklar `0 · 1 · 3 · 7 · 16 · 35` gün. Kutu ≥ 4 → "Kalıcı".
   Dört durum: **Yeni → Öğreniliyor → Pekişti → Kalıcı**.
3. **Quiz artık ölçüyor.** Doğru cevap kutuyu ilerletiyor, yanlış cevap
   sıfırlıyor (kart aynı gün kuyruğa dönüyor). Yeni **yazma modu** (TR → EN
   yazdırma) eklendi.
4. **"Bugünün tekrarı"** kartı anasayfada: tüm alanlardan vadesi gelmiş
   kartlar tek destede toplanıyor.
5. **Günlük hedef** artık "öğrendim denilen kelime" değil "çalışılan kart"
   sayıyor; aynı kart günde bir kez sayılıyor (hedef şişirilemiyor).
6. **Veri taşıma:** eski `de_learned_v2` (düz id listesi) ve
   `kartlar_learned_v1` (`"Kategori::kelime"`) kayıtları açılışta 2. kutuya,
   bugün vadeli olarak taşınıyor. Eski ilerleme kaybolmuyor ama yeniden
   doğrulanıyor.

Test: Chrome'da uçtan uca denendi — taşıma, tekrar seansı, kutu geçişleri
(kolay → 7 gün, zor → 3 gün, hatırlamadım → bugün), quiz yazma modu, dürüstlük
kilidi, boş kuyruk hâli. Konsol hatasız.

### 2026-07-29 — Kalıplar, Diyalog ve PWA — **büyük değişiklik**

Sorun: uygulama yalnız kelime öğretiyordu. Kelime bilmek konuşabilmek değil;
kullanıcı "reservation" kelimesini biliyor ama masayı ayırtamıyordu. İki yeni
bölüm eklendi; kelime modülüne dokunulmadı.

**1. Günlük Kalıplar** (`src/data/phrases/`, 15 kategori, 375 kalıp)

- Ders kitabı değil gerçek kullanım hedeflendi: `What's up?`, `Can't complain.`,
  `I'm swamped.`, `Let's take this offline.`, `It is what it is.`
- Her kalıpta **kullanım düzeyi** (formal/neutral/informal) renkli rozet olarak.
  Gerekçe: bir kalıbın nerede *kullanılamayacağını* bilmek, ne demek olduğunu
  bilmek kadar önemli.
- `usage` alanı tuzak uyarısı olarak da kullanıldı: `Do you mind…?` sorusuna
  "yes" reddetmektir, `on sale` ≠ `for sale`, `push` ≠ `move up`,
  `nervous` = kaygılı (sinirli değil), ABD/İngiltere farkları.
- `literal` (birebir çeviri) **yalnız yanıltıcı olduğunda** dolduruldu —
  `I couldn't agree more`, `Tell me about it`, `That's a shame`. Anlamı şeffaf
  olan kalıplarda boş; gereksiz gürültü olmasın diye.
- Arama hem EN hem TR içinde ve Türkçe harfleri katlıyor (`foldForSearch`):
  `hesabi` yazınca `hesabı` bulunuyor, klavye düzeni engel değil.
- **"Türkçeyi gizle" modu**: karşılık gizlenip "dokunarak gör" ipucuna dönüşüyor.
  Önce hatırlamayı dene, sonra kontrol et.

**2. Diyalog / canlandırma** (`src/data/dialogues/`, 30 sahne, 368 replik)

- Mesajlaşma arayüzü: karşı taraf solda ve otomatik seslendiriliyor, kullanıcı
  sağda. Roller farklı seslerle (tek ses varsa farklı perdeyle) okunuyor.
- Kullanıcı iki rolden birini seçiyor; **her replikte `alternatives` var** ki
  hangi rol seçilirse seçilsin konuşma modu ölçülebilir kalsın.
- Üç mod: **Oku** · **Hatırla** (yalnız TR gösterilir) · **Konuş**
  (`SpeechRecognition` + normalize edilmiş Levenshtein benzerliği).
  Tarayıcı desteklemiyorsa Konuş modu hiç listelenmiyor — sessiz geri düşüş.
- Skorlama alternatifleri de kabul ediyor: "I'll have a medium latte" ≡
  "Can I get a medium latte, please?" → %100. Tek kelime hatası %84,
  alakasız cümle %16.
- Sahne özeti kullanılan kalıpları **kalıplar modülünden** çekiyor
  (`keyPhrases` → `ph_*` id'leri); iki modül birbirine bağlı.
- Senaryolar bilinçli olarak çatışma içeriyor: yanlış gelen yemek, hesapta
  fazladan kalem, reddedilen pazarlık, kaçırılan aktarma. Sadece "sipariş ver,
  teşekkür et" akışları gerçek konuşmaya hazırlamıyor.

**3. Navigasyon ve PWA**

- Alt sekme çubuğu: Ana sayfa · Kalıplar · Diyalog (44px+ dokunma hedefleri).
  Onboarding sırasında gizli. Anasayfaya iki kısayol kartı eklendi.
- **Service worker ve manifest ilk kez eklendi** — proje daha önce PWA değildi.
  77 dosya önbelleğe alınıyor, uygulama tamamen çevrimdışı çalışıyor.
- `tools/sync-sw.mjs` önbellek listesini dosyalardan üretiyor
  (`npm run sync:sw`). Liste elle tutulsaydı yeni veri dosyası unutulur ve hata
  sessiz olurdu: uygulama çevrimdışıyken o dosyayı bulamazdı.

**Yakalanan bug (düzeltildi):** Sahne motorunda iki `playNext` zinciri aynı anda
çalışabiliyordu. `stopScene()` seslendirmeyi ve mikrofonu durduruyor ama
replikler arası `setTimeout(playNext)` zincirini iptal etmiyordu; ayrıca Diyalog
sekmesine basmak çalışan sahneyi durdurmuyordu. İkisi birleşince `scene.index`
iki kat artıyor, kullanıcının sırası atlanıyor ve roller ters görünüyordu.
Çözüm: `scene.advanceTimer` izleniyor ve `scene.run` çalıştırma numarası
eklendi — eskimiş eşzamansız geri çağrılar kendi numaralarının geçersizleştiğini
görüp çekiliyor. `openDialogues()` artık girişin kendisinde sahneyi durduruyor.

Test: Chrome'da uçtan uca denendi — 15 kategori/375 kalıp listeleme, arama
(`hesabi`→`hesabı`), düzey filtresi, favori/öğrenildi kalıcılığı, sahnenin
baştan sona oynanması (12 replik, 6 kullanıcı sırası), rol değiştirme, üç mod,
mikrofon reddi/zaman aşımı kurtarma, özet + XP, **sunucu kapalıyken tam
çevrimdışı açılış** (15 kategori, 30 sahne, 19 alan önbellekten). Konsol hatasız.

---

## Dosya Yapısı

```
.
├── PROGRESS.md                 # BU DOSYA — proje hafızası
├── README.md                   # Kullanıcıya dönük tanıtım ve kurulum
├── index.html                  # Uygulama kabuğu (on ekranın işaretlemesi)
├── sw.js                       # Service worker — ASSETS bloğu üretilmiştir
├── manifest.webmanifest        # PWA tanımı
├── icon.svg                    # Uygulama ikonu (tek dosya, maskable)
├── package.json                # npm start / validate / sync / sync:sw betikleri
├── docs/VERI-REHBERI.md        # Veri şeması ve yeni parti entegrasyonu
├── tools/
│   ├── data-lib.mjs            # Araçların paylaştığı veri okuma yardımcıları
│   ├── validate-data.mjs       # Şema, id ve sayaç doğrulama (npm run validate)
│   ├── sync-manifest.mjs       # fields.json'ı verilerden üretir (npm run sync)
│   └── sync-sw.mjs             # sw.js önbellek listesini üretir (npm run sync:sw)
└── src/
    ├── data/
    │   ├── fields/             # fields.json (manifest) + 19 alan dosyası
    │   ├── phrases/            # phrases.json (manifest) + 15 kategori dosyası
    │   └── dialogues/          # dialogues.json (manifest) + 9 kategori dosyası
    ├── styles/main.css         # Tüm stiller (açık/koyu tema, CSS değişkenleri)
    └── js/
        ├── main.js             # Giriş noktası, olay bağlamaları, SW kaydı
        ├── config.js           # Sabitler: SRS, GRADES, REGISTERS, DIALOGUE, anahtarlar
        ├── dom.js              # DOM referansları (hepsi null olabilir)
        ├── state.js            # Ekranlar arası paylaşılan gezinme durumu
        ├── utils.js            # Karıştırma, seslendirme, gün/tarih, normalize,
        │                       #   arama katlama, Levenshtein/benzerlik
        ├── data/
        │   ├── repository.js           # Kelime verisi
        │   ├── phrase-repository.js    # Kalıp verisi (aynı desen)
        │   └── dialogue-repository.js  # Diyalog verisi (aynı desen)
        ├── store/
        │   ├── storage.js      # localStorage sarmalayıcısı (hataya dayanıklı)
        │   ├── profile.js      # Tanışma testinin sonucu
        │   ├── interests.js    # Seçili alan id'leri
        │   ├── progress.js     # ★ SRS: kutu, vade, durum, taşıma, toplamlar
        │   ├── stats.js        # Seri, XP, günlük hedef
        │   ├── phrases.js      # Kalıp favorileri ve "öğrendim" işaretleri
        │   └── dialogues.js    # Tamamlanan sahneler ve en iyi telaffuz skoru
        ├── ui/
        │   ├── header.js       # Üst bar (seri, XP)
        │   ├── tabbar.js       # Alt sekme çubuğu (yalnız görünüm)
        │   └── toast.js        # Kısa bildirimler
        └── screens/
            ├── navigation.js   # Ekran gösterme/gizleme + sekme durumu
            ├── onboarding.js   # Tanışma testi + alan seçimi
            ├── home.js         # Anasayfa: tekrar kuyruğu, hedef, alanlar, kısayollar
            ├── field.js        # Alan detayı: kategoriler
            ├── cards.js        # ★ Flashcard + değerlendirme akışı
            ├── quiz.js         # Quiz: boşluk / anlam / yazma
            ├── phrases.js      # ★ Kalıplar: kategori ızgarası + liste
            └── dialogues.js    # ★ Diyalog: liste + rol/mod seçimi + sahne + özet
```

---

## Teknik Kararlar ve Gerekçeleri

| Karar | Gerekçe |
|---|---|
| **Bağımlılık ve build yok** | Uygulama statik dosya olarak servis edilebiliyor; katkı için `npm install` gerekmiyor. ES modülleri yüzünden yerel sunucu şart. |
| **İlerleme anahtarı = kart id'si** | Kart metni düzeltilince ilerleme sıfırlanmasın diye. Id'nin alan öneki (`tip-042`) sayesinde bir alanın ilerlemesi, kart verisi indirilmeden yalnız kayıtlardan hesaplanabiliyor. |
| **Değerlendirme ön yüzde** | Cevabı gördükten sonra "biliyordum" demek tanımadır, hatırlama değil. Ölçüm ancak cevap gizliyken anlamlı. |
| **"Peek" → Kolay kapanır** | Kullanıcının kendini kandırması ölçümü bozar. Bakmak bir bilgi değil, bir sonuçtur. |
| **Çoktan seçmeliye kutu tavanı (`recognitionMaxBox: 3`)** | Dört şıkta %25 şansla doğru bulmak kalıcılık kanıtı değil. Kutu 4'ü (Kalıcı) yalnız yazma sorusu ya da kartta "Kolay" açar. |
| **Yazma modu 3 kelime / 20 karakter sınırı** | Uzun kalıpları yazdırmak dil sınavını imla sınavına çevirir. |
| **Seri (streak) kuyruğa değil çalışmaya bağlı** | Kuyruk 200 karta çıktığında seriyi kaybetmek kaçınılmaz olurdu; bu ceza kullanıcıyı uygulamadan soğutur. Kuyruk bunun yerine anasayfada en üstte duruyor. |
| **Günlük hedef kart başına bir kez sayar** | Aynı kartı tekrar tekrar işaretleyerek hedef şişirilemesin diye. |
| **İki katmanlı ilerleme çubuğu** | Dolu = kalıcı, soluk = çalışılıyor. Tek yüzde ilerlemeyi abartırdı. |
| **Savunmacı DOM erişimi** | `dom.js`'teki her referans null olabilir; eksik bir eleman tüm uygulamayı çökertmemeli. |
| **localStorage sarmalayıcısı sessizce yutar** | Gizli modda / kota dolduğunda uygulama çalışmaya devam etmeli. |
| **Kalıpta "öğrendim" SRS'e yazılmaz** | Kalıp bir üretim birimi değil başvuru kaynağıdır; onu "kanıtlanmış" saymak SRS'in ölçüm iddiasını sulandırırdı. `de_phrase_learned_v1` ayrı bir beyan kaydıdır, `de_srs_v1`'e dokunmaz. |
| **Diyalog XP verir ama günlük hedefi ilerletmez** | Günlük hedefin birimi "çalışılan kart". Sahne oynamayı da sayarsak hedef anlamını yitirir ve kelime tekrarı ihmal edilebilir hâle gelir. |
| **Her replikte `alternatives`** | Kullanıcı iki rolden birini seçebiliyor. Alternatifler tek tarafa konsaydı, diğer rol seçildiğinde konuşma skoru sistematik olarak düşük çıkardı. |
| **Konuş modu desteklenmiyorsa listelenmez** | Devre dışı bir düğme göstermek "bende çalışmıyor" hissi verir. Mod hiç yokmuş gibi davranmak sessiz ve dürüst bir geri düşüştür. |
| **Sahne motorunda çalıştırma numarası (`scene.run`)** | Seslendirme geri çağrıları eşzamansız; sahne durdurulduktan sonra da tetiklenebiliyorlar. Numara olmadan iki `playNext` zinciri aynı anda ilerleyip kullanıcının sırasını atlıyordu (bkz. 2026-07-29 bug notu). |
| **`literal` yalnız yanıltıcıysa dolu** | Her kalıba birebir çeviri koymak gürültü olurdu. Alan, "Türkçe mantığıyla çevirirsen yanılırsın" uyarısı olarak ayrıldı. |
| **SW önbellek listesi araçla üretilir** | Elle tutulan liste yeni veri dosyasında unutulur; hata da sessiz olur — uygulama yalnızca çevrimdışıyken ve yalnızca o dosyada patlar. `npm run sync:sw:check` bunu commit öncesi yakalar. |

---

## TODO / Bilinen Eksikler

- [ ] **`SPEC.md` yok.** Ürün gereksinimleri README ve PROGRESS arasında
      dağınık. Tek bir spesifikasyon dosyası yazılmalı; bu dosyanın üstündeki
      referans o zaman gerçek bir bağlantıya dönüşür.
- [ ] **Otomatik test yok.** Özellikle `store/progress.js` (kutu geçişleri,
      vade hesabı, taşıma) ve `utils.js` (gün anahtarı, normalize, `levenshtein`,
      `similarity`, `foldForSearch`) saf fonksiyonlar — birim testi yazmak kolay
      ve değerli olur. Sahne motorunda çıkan eşzamanlılık hatası, testi olmayan
      bir alanın ne kadar sessizce bozulabildiğini gösterdi.
- [ ] **Kalıp ve diyalog verisi doğrulanmıyor.** `tools/validate-data.mjs` yalnız
      `src/data/fields/`'a bakıyor. Kalıplarda id tekilliği/`register` geçerliliği,
      diyaloglarda `keyPhrases` referanslarının gerçekten var olması elle kontrol
      edildi; araca eklenmeli.
- [ ] **Kalıplarda aralıklı tekrar yok.** Şu an "öğrendim" bir beyan. İleride
      kalıplar için de zamana yayılmış bir kanıt modeli düşünülebilir — ama
      kelime SRS'inden ayrı bir kutu setiyle.
- [ ] **Tekrar kuyruğuna üst sınır yok.** Uzun aradan sonra dönen kullanıcıyı
      500 kartlık kuyruk karşılayabilir. Günlük tekrar tavanı (örn. 50) ve
      kalanın ertelenmesi düşünülmeli.
- [ ] **Yeni kart tanıtım hızı sınırsız.** Kullanıcı bir oturumda 100 yeni kart
      açabilir, hepsi ertesi güne düşer. "Günde en fazla N yeni kart" ayarı.
- [ ] **İstatistik ekranı yok.** Kutu dağılımı, günlük tekrar grafiği, en çok
      unutulan kelimeler gösterilmiyor.
- [ ] **Veri dışa/içe aktarma yok.** Tüm ilerleme tek tarayıcının
      `localStorage`'ında; tarayıcı verisi silinirse her şey gider.
- [ ] **Yazma modunda yakın cevaba tolerans yok.** Tek harf hatası ("makup")
      tamamen yanlış sayılıyor; Levenshtein mesafesiyle "neredeyse doğru"
      geri bildirimi verilebilir.
- [ ] `GUNCELLEME.md` çalışma dizininde silinmiş görünüyordu (commit'lenmemiş
      silme). İçeriği PROGRESS.md'ye taşındığı için geri alınmadı — bilinçli
      bir karar olarak burada not edilir.

---

## Bilinen Buglar

- **Sıçrayan tıklama kartı çevirebilir.** Ekran geçişi sırasında (ör. "Tekrara
  başla" → kartlar ekranı) imlecin altında kalan karta tıklama düşerse kart
  "peek" sayılıp "Kolay" seçeneği kapanabilir. Otomasyon testinde gözlendi;
  gerçek kullanımda nadir ve kullanıcı yine de "Hatırlamadım/Zor" ile devam
  edebiliyor, bir sonraki tekrarda kendini düzeltiyor. Düşük öncelik.
- **Konuş modunda mikrofon izni reddedilirse** sessizce sonuçsuz dönülüyor;
  kullanıcıya "mikrofon izni gerekli" diye açık bir mesaj gösterilmiyor.
  Sahne kilitlenmiyor (panel geri geliyor, "Geç" ile ilerleniyor) ama neden
  puan alamadığı belirsiz kalabilir. Düşük öncelik.
- Bunun dışında bilinen açık bug yok (2026-07-29 itibarıyla).
