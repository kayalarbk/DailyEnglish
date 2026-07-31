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
| **Kelime** | 23 alan, 70 kategori, 1899 kart; örnek cümle, CEFR seviyesi, telaffuz, **çapraz etiketler** |
| **Kalıplar** | 15 kategori, 375 günlük ifade; kullanım düzeyi, kullanım notu, örnek |
| **Diyalog** | 30 canlandırma sahnesi, 368 replik; rol seçimi ve üç oynama modu |

Kelime verisi ayrıca **dört eksenli bir etiket katmanı** taşıyor (36 etiket) ve
**38 üniversite bölümü** için hazır etiket demetleri tanımlı.

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

### 2026-07-29 — Günlük karma deste ("Bugüne Başla")

Geri bildirim: *"Tek tek alan seçip o alanı bitirmek yerine hepsinde birden
ilerlemek istiyorum."* Kullanıcı her açılışta alan → kategori → kart yolunu elle
yürüyordu. "Bugünün tekrarı" kartı bunu kısmen karşılıyordu ama yalnız vadesi
gelmişleri topluyor, yeni kart tanıtmıyor ve üst sınır tanımıyordu.

**1. Deste kurucu** — `store/daily.js`, saf fonksiyon (DOM/localStorage yok,
bugünün tarihi bile dışarıdan gelir):

```
buildDeck({ cardIdsByField, progress, settings, today }) → { cardIds, stats }
```

- Tekrarlar önce: vade tarihine göre eskiden yeniye, en fazla `dailyGoal` kadar
- Kalan yer yeni kartla dolar, en fazla `newPerDay` kadar
- Hem tekrar hem yeni havuzunda alanlar arası **round-robin** — bir alan
  desteyi domine etmiyor (test: 60 kartlık borçta 7/7/6 dağılım)
- `stats.trimmedDue` desteye sığmayanların sayısını döndürür

**2. Oturum kalıcılığı** — `de_daily_session_v1`. Deste günde bir kez kurulur;
sayfa yenilenince yeniden karılmaz, `index`'ten devam edilir. `day` bugüne eşit
değilse oturum atılır. Ayarlar `de_daily_settings_v1`'de
(`fieldIds` · `newPerDay` · `mode`).

**3. Mevcut ekranlar parametrelendirildi, yeniden yazılmadı.** `cards.js` ve
`quiz.js`'e birer "günlük oturum bağlamı" eklendi: sayacı günün tamamına
çeviriyor (7/20), değerlendirmeyi dışarı bildiriyor, öbek bitince oturuma
dönüyor. Değerlendirme akışı, dürüstlük kilidi, kutu geçişleri, çeldirici
seçimi ve `recognitionMaxBox` tavanı **hiç değişmedi**.

**4. Anasayfa tek giriş noktası.** "Bugünün tekrarı" kartı "Bugüne Başla"ya
*dönüştürüldü*, yanına ikinci kart eklenmedi. Kart üç hâlde: kurulmamış ·
yarım · tamamlanmış. İlerleme çubuğu, `12 tekrar · 5 yeni` kırılımı,
"+43 tekrar yarına kaldı" notu ve ayar dişlisi taşıyor. Alan bazlı çalışma
duruyor ama düğmesi "Alan seçerek çalış" oldu — iki düğme aynı şeyi vaat
etmesin diye.

**5. Ayarlar modalı** — hedef (5/10/20/30/50 + özel), yeni kart tavanı
(0/3/5/10), çalışma tipi (kart/quiz/karışık), alan seçimi, "desteyi yenile".
Tanışma testine yeni adım eklenmedi; deste varsayılanlarla başlıyor.

**Özet ekranı:** doğru/yanlış, süre, alan bazlı kırılım (en düşük başarı üstte),
zorlanılan kartlar ve "bunları tekrar çalış".

Test: Chrome'da uçtan uca — 5 kartlık karma oturumun baştan sona oynanması
(kart→quiz→kart→quiz→kart), sayfa yenileme sonrası aynı destenin dönmesi,
yarım oturuma doğru kartla devam, 60 kartlık borçta tavanın 20'de kesmesi ve
**kırpılan 40 kartın `due` alanının değişmediğinin doğrulanması**, 5'erli quiz
öbeklerinin kullanıcıya görünmeden birbirine bağlanması, ayar değişikliği +
deste yenileme, kategori akışının bozulmadığı (araç çubuğu, seviye filtresi,
kategori quizi). Konsol hatasız.

### 2026-07-30 — Çok eksenli etiket mimarisi + akademik katman — **büyük değişiklik**

Hedef kitle genişledi: farklı bölümlerden üniversite öğrencileri. Mühendislik
öğrencisinin fizik/matematik terminolojisine, tıp öğrencisinin klinik dile
ihtiyacı var — ama **hepsinin ortak bir akademik çekirdeğe** ihtiyacı var.
Bu iki iş gerektirdi: veri modelini çok boyutlu etiketlemeye açmak, sonra o
modelin üstüne içerik koymak.

**1. Envanter aracı** — `tools/audit-data.mjs` (`npm run audit`)

Rapor: alan/kategori dağılımı, CEFR, tam ve yakın tekrarlar, aynı Türkçe
karşılıklar, örnek cümle sorunları, akademik kullanılabilirlik. Bulgular:

- Veri hijyeni beklenenden temiz: çapraz alan **tam tekrarı 0**, aynı TR **0**,
  yakın tekrar **1 çift**. "Tekrar = hata" kuralı eski veriyi düzeltmeye gerek
  kalmadan yürürlüğe girebildi.
- Akademik katman gerçekten boştu: 180/1349 (%13) "akademik/teknik" çıkıyordu
  ama 120'si beş meslek alanının kendisiydi; kalan 60 kart akademik değil
  **ofis/teknoloji** diliydi (`back up data`, `print a document`).
- **Meslek alanlarında CEFR ataması bozuk:** akademik/ekonomi/hukuk 23/24 B2,
  muhendislik/tip 20/24 B2. Teknik terim otomatik B2 sayılmış.
  **DÜZELTME (aynı gün):** Bu bulguyu ilk yazarken "başlangıç seviyesindeki
  kullanıcı bu alanları açtığında hiçbir kart göremiyor" demiştim; **bu yanlıştı
  ve tarayıcıda test edilerek çürütüldü.** `renderLevelFilter` (cards.js) zaten
  koruyor: eşleşme sıfırsa "⭐ Sana uygun" seçeneği hiç sunulmuyor ve filtre
  `all`'a düşüyor, kullanıcı 12 kartın hepsini görüyor. Sorun gerçekti ama
  etkisi daha ölçülüydü — bkz. aşağıdaki düzeltme girişi.

**2. Etiket mimarisi** — `src/data/tags.json`, 4 eksen · 36 etiket

Kart **tek bir ev alanına** ait kalır; id öneki ve `{alanId}-{sıra}` biçimi
korunur, çünkü ilerleme hesabı buna dayanıyor. Etiketler bunun ÜSTÜNE biner:

| Eksen | Soru | Zorunlu |
|---|---|---|
| `dom:` (13) | Hangi disiplinin metninde geçer? | hayır |
| `fn:` (11) | Akademik söylemde ne iş görür? | evet* |
| `ctx:` (8) | Nerede karşına çıkar? | evet |
| `type:` (4) | Yapısal özelliği ne? | hayır |

*`fn:` yalnız akademik ortam etiketi taşıyan kartlarda zorunlu; günlük ve
mesleki kartlar muaf.

`validate-data.mjs`'e eklenenler: tanımsız etiket → **hata**, proje geneli tam
tekrar → **hata** (`type:polysemy` istisnasıyla), eksik eksen · yakın tekrar ·
ince kategori · **hiçbir bölüme ulaşamayan kart** → uyarı.

**3. Geriye dönük etiketleme** — `tools/backfill-tags.mjs`

1349 kart kural tabanlı etiketlendi; kart metni ve id'si değişmedi
(1349/1349'unda `id`/`en`/`enS`/`tr`/`trS`/`level` bit bit aynı kaldı, yani
`de_srs_v1` etkilenmedi). 50 kartlık örnekleme **beş tur hata** yakalattı:

1. `fn:` günlük ve mesleki kartlara zorlanıyordu → muafiyet kuralı
2. Kurallar örnek cümlede çalışıyordu ("after the beep" → `fn:time`) → yalnız
   `en` + `tr` üzerinde çalışacak şekilde daraltıldı
3. Çok anlamlı sözcükler: "call", "beklemek", "katılmak", "toplamak", "yerine"
4. **JS `\b` Türkçe harfleri tanımıyor** — "şartları" içindeki `art` sahte sınır
   bulup eşleşiyor, "ölçmek" hiç eşleşmiyordu. Türkçe kurallar geriye bakışlı
   sınırla yeniden yazıldı.
5. Kategori adı işlev kanıtı sayılıyordu ("Morning" → 156 karta `fn:time`)

`fn:` kapsamı 782 → 373'e indi; silinen 409 etiketin neredeyse tamamı yanlıştı.
Önemli olan yerde kusursuz: **akademik ortam kartlarında `fn:` kapsamı %100.**

**4. Kişiselleştirilmiş onboarding** — `src/data/presets.json`, 9 grup · 38 bölüm

Tanışma testinin adım sayısı **artmadı**. Eski 6 seçenekli profil adımı, tek
ekranda grup çipleri + bölüm listesi + isteğe bağlı "ince ayar" olarak yeniden
kuruldu. Eski `profileId` kaydı **otomatik dönüştürülmedi**: "Mühendislik"
seçmiş kullanıcıya "Elektrik-Elektronik Mühendisliği" yazmak, söylemediği bir
şeyi söylemiş göstermek olurdu; eski etiket duruyor, yanında netleştirme çağrısı.

`store/tags.js` (`de_tags_v1`) etiket sorgusunu tutuyor; `interests.js`
değişmedi (alan = havuz, etiket = süzgeç).

**5. İçerik: +200 kart**

| Alan | Kart | İçerik |
|---|---|---|
| `genel-akademik` "Akademik Çekirdek" | 150 | 8 işlev kategorisi + 4 eşdizim kategorisi |
| `anlam-kaymasi` "Anlam Kayması" | 50 | Alanlar arası anlam kayması (`type:polysemy`) |

Çekirdek bölümden bağımsız (`dom:` etiketi yok) ve **38 bölümün hepsine birden**
hizmet ediyor. Anlam kayması kartlarında iki anlam yan yana: `positive` tıpta
"iyi haber" değil, `order` "sipariş" değil **mertebe**, `subject` "konu" değil
**denek**. Eşdizim partisinde ayrı bir kategori Türkçeden birebir çevrilince
çıkan hatalara ayrıldı (`make research` ✗ → `do research`).

Eşdizim partisi yazılmadan önce 31 aday mevcut korpusa karşı tarandı, **7
çakışma** bulunup değiştirildi; doğrulama tek seferde temiz geçti.

**Yakalanan mimari hata (düzeltildi):** İlk 50 çekirdek kartı yazıldıktan sonra
sorgu gerçek veriyle sınandı ve Elektrik-Elektronik öğrencisinin sorgusunun
**50 çekirdek kartının sıfırını** getirdiği görüldü. Sebep: eksenler arası VE
kuralı, "kartın `dom:` etiketi yok"u "`dom:` koşulunu sağlamıyor" sayıyordu.
Oysa çekirdek bilerek `dom:` taşımıyor — mimarinin bütün gerekçesi buydu.
Etiketin yokluğu karşıtlık değil **nötrlük**: `matchesTagQuery` düzeltildi,
kartın etiketi olmayan ekseni onu elemiyor. Süzgecin hâlâ süzdüğü karşıt
kontrollerle doğrulandı (`dom:law` sorgusu tıp kartlarını almıyor).

Test: Chrome'da uçtan uca — bölüm seçici (38 bölüm, ince ayar 32 çip), amaç →
`ctx:` ağırlıklandırması, eski profil kaydının korunması, etiket sorgusunun
gerçek kartlarla süzmesi (248 → 134), günlük destenin dört alandan birden kart
toplaması. Konsol hatasız.

### 2026-07-30 — Etiketin uygulamaya bağlanması

Önceki girişte mimari kurulmuş ama uygulama etiketi kullanmıyordu. Bu giriş o
boşluğu kapatıyor.

**Günlük deste artık süzgeçten geçiyor ve EKSEN dengesi kuruyor.**
`buildDeck`'in `cardIdsByField` parametresi `cardIdsByGroup` oldu: kurucu artık
grubun ne olduğunu bilmiyor, yalnız dengeyi kuruyor. Grubu çağıran seçiyor —
etiket sorgusunda bilgi alanı varsa kovalar `dom:` etiketleri, yoksa eskisi gibi
alanlar. Akademik çekirdek `dom:` taşımadığı için "genel" kovasında toplanıp
kendi payını alıyor: hiçbir bölüme ait olmaması onu dışlamamalı, tam tersi
hepsine birden hizmet ediyor.

**Etiket bazlı ilerleme** — `store/tag-progress.js` + `progress.js`'e eklenen
`getProgressForCards()`. Alan ilerlemesinin ucuz yolu (id önekinden, kart verisi
indirmeden) bilerek korundu; etiket ilerlemesi kart verisi gerektirdiği için
ayrı bir indeks üzerinden hesaplanıyor. Anasayfa açılışı 21 dosyanın inmesini
beklemiyor: bölüm önce gizli çiziliyor, indeks arka planda kurulunca anasayfa
yeniden çiziliyor.

**Kart rozetleri** — kartın ön yüzünde `dom:` ve `fn:` etiketleri (en fazla 3).
`ctx:` ve `type:` gösterilmiyor; kullanıcı için bilgi değil gürültü.

**Alan satırlarında süzgeç rozeti** — "19 kart uygun" / "bölümüne uygun kart
yok". Alan **gizlenmiyor**: kullanıcının kendi seçtiği bir alanı listeden silmek
kafa karıştırırdı, kaç kartının bölümüne uyduğu bilgisi ise doğrudan işine
yarıyor.

Yol boyunca çıkan bir hata: indeks hazır olmadan çizilen alan listesi, indeks
kurulunca tazelenmiyordu — geri çağrı yalnız ilerleme bölümünü yeniden
çiziyordu. Artık anasayfanın tamamı yeniden çiziliyor (sonsuz döngü yok:
ikinci geçişte indeks hazır olduğu için o dal hiç çalışmıyor).

Test: Elektrik-Elektronik profiliyle — havuz 248 → 134 süzüldü, deste beş dom
kovasına dağıldı, etiket ilerlemesi gerçek SRS'i yansıttı (Fizik %50 9/18,
Mühendislik %24 8/34, en geride olan üstte), alan rozetleri doğru sayıları
gösterdi (Günlük Rutin: "bölümüne uygun kart yok"), kart rozetleri göründü.
Konsol hatasız.

### 2026-07-30 — CEFR düzeltmesi ve veri temizliği

**29 kartın seviyesi B2 → B1** yapıldı (akademik 8, ekonomi 3, hukuk 3,
muhendislik 7, tip 8). İlke: seviye kavramın teknik zorluğunu değil **ifadenin
dilsel zorluğunu** yansıtır. `take a blood sample` teknik bir işlemdir ama
dilsel olarak B1; `curb inflation` ya da `waive a right` düşük sıklıklı sözcük
taşıdığı için B2 kalır. Kart id'leri ve metinleri değişmedi.

Meslek alanlarında B1 oranı: akademik 1→9, ekonomi 1→4, hukuk 1→4,
muhendislik 4→11, tip 4→12.

**Etkinin dürüst ölçüsü.** Bu düzeltmeyi "başlangıç kullanıcısı hiçbir kart
göremiyor" gerekçesiyle önermiştim; tarayıcıda test edince o gerekçenin YANLIŞ
olduğu ortaya çıktı (yukarıdaki envanter girişine düzeltme eklendi). Gerçek
kazanç daha ölçülü ama yine de gerçek: **orta seviye (A2–B1) kullanıcı için
"⭐ Sana uygun" filtresi bu beş alanda 4 kart yerine 12 kart getiriyor**, ve
günlük destenin seviye karışımı artık veriyi doğru temsil ediyor.

**Veri temizliği (7 kart):**

- `ev-doga-020` "trim the hedges", `ev-doga-043` "trim the hedge" ile aynı
  kalıptı. 020 "defrost the fridge"e çevrildi — zaten "Ev ve Eşyalar"
  kategorisindeydi ve bahçe işi oraya yakışmıyordu. **Id değişmedi**, ilerleme
  kaydı korundu.
- 6 kartta örnek cümle kalıbın kendisi + tek kelimeydi (`"call an ambulance"` →
  *"Call an ambulance, quickly!"*). Quiz'in boşluk sorusu bunlarda anlamsızdı:
  cümlenin tamamı zaten kalıbın kendisiydi. Gerçek bağlam veren cümlelerle
  değiştirildi.

Bu düzeltmelerden sonra `npm run validate` **ilk kez sıfır uyarıyla** geçiyor.

### 2026-07-31 — Bölümsel terminoloji: Mühendislik demeti, parti 1

`src/data/fields/fen-muhendislik.json` — **50 kart**, dört kategori:
Fizik 13 · Matematik 13 · Mühendislik 12 · Bilgisayar 12.

İlke: **ders kitabı sözlüğü kopyalanmadı.** Öğrenci `capacitor`ün ne olduğunu
dersinde biliyor; bilmediği, o terimin hangi fiille geldiği. Kartlar terim
değil eşdizim: `the capacitor discharges through the resistor`,
`the beam must withstand a load`, `the signal attenuates over long cable runs`,
`the algorithm runs in linear time`.

Alan adı `fen-muhendislik` seçildi çünkü akla ilk gelen iki ad da önek
çakışması üretiyordu: `muhendislik-cekirdegi` mevcut `muhendislik` alanıyla,
`tip-bilimleri` (sonraki demet için düşünülen) `tip` ile. Önek kuralı yeni alan
açarken her seferinde kontrol edilmeli.

**Yakalanan demet kusuru.** Parti yazıldıktan sonra bölümlere ulaşım ölçüldü ve
İstatistik'in 16 matematik kartından yalnız **1'ini** aldığı görüldü. Sebep
içerik değil, demet tanımıydı: `ctx:lecture` ve `ctx:exam`'ı ayırt edici bağlam
gibi kullanmıştım, oysa **her üniversite öğrencisi derse ve sınava girer.**
38 demetin çoğunda bu ikisi eksikti. Öğrenci gruplarındaki tüm demetlere
eklendi (44 etiket); `calisan` demeti bilerek dışarıda bırakıldı — o kişi
öğrenci değil. Ayırt edicilik `dom:` ve `lab`/`practice`/`paper` üzerinden
kuruluyor; bu iki bağlamın ayırt edici olmadığı `tags.json` açıklamalarına
yazıldı.

Düzeltme sonrası: İstatistik 1→8, İnşaat 20→34, Biyomedikal 15→20,
Bilgisayar 39→41.

Bölümlerin bu partiden aldığı: Elektrik-Elektronik 48/50 · Bilgisayar 41 ·
Makine 38 · İnşaat 34 · Fizik 30 · Endüstri 29 · Kimya Müh. 26 ·
Biyomedikal 20 · Matematik 15 · İstatistik 8 — Tıp 1, Hukuk 0, İngiliz Dili 0
(doğru: bu parti fen ve mühendislik içeriyor).

Korpus: 1549 → **1599 kart**, 21 → 22 alan. `validate` sıfır uyarı.

**Parti 2 ve 3 (aynı gün):** Aynı dört kategori derinleştirildi, +100 kart.
`fen-muhendislik` artık **150 kart** (Fizik 39 · Matematik 39 · Mühendislik 36 ·
Bilgisayar 36). Korpus **1699 kart**. Demet hedefi ~300 kart; yarısı yazıldı.
Elektrik-Elektronik bu alandan 95/100 → ölçüm parti 2 sonundaydı; parti 3 ile
oran korunuyor.

### 2026-07-31 — Mühendislik demeti, parti 4

`fen-muhendislik` **150 → 200 kart** (id 151–200): Fizik 13 · Matematik 13 ·
Mühendislik 12 · Bilgisayar 12. Alan artık Fizik 52 · Matematik 52 ·
Mühendislik 48 · Bilgisayar 48. Korpus **1699 → 1749 kart**.

Eşdizim ilkesi korundu: `the voltage drops across the resistor`,
`exceed the elastic limit`, `prove by contradiction`, `the bearing seizes`,
`the stack overflows`. Yazmadan önce 50 aday korpusa karşı tarandı, **5 çakışma**
bulundu ve değiştirildi — hepsi mevcut kartların yakınına düşüyordu:
`meet the specification` (≈ `muhendislik-009 meet the specifications`),
`roll back a release` (≈ `muhendislik-024 roll back a change`),
`tighten a bolt` (≈ `ev-doga-031 tighten a screw`), `pin a dependency`
(≈ `fen-muhendislik-099 mock a dependency`) ve `detect a leak`'in ilk hâli.
Yerlerine `the bearing seizes` · `tag a release` · `align the shaft` ·
`flush the buffer` yazıldı. Doğrulama tek seferde temiz geçti.

**Yakalanan demet kusuru (parti 1'dekiyle aynı biçimde).** Ulaşım ölçülünce
Matematik bölümünün 52 matematik kartının yalnız 45'ini, İstatistik'in ise
korpusun küçük bir dilimini aldığı görüldü. Sebep yine içerik değil demet
tanımıydı: `matematik` ve `istatistik` demetlerinde **`fn:method` yoktu**.
Oysa `solve an equation`, `expand the brackets`, `differentiate both sides`,
`prove by contradiction` — matematikte *işlemi yapmak* disiplinin kendisidir,
yan bir beceri değil. İki demete `fn:method` eklendi:
**Matematik 45 → 57 · İstatistik 30 → 53** (alan geneli, 200 kart üzerinden).

Beşeri demetlerde `fn:method`'un yokluğu **kasıtlı bırakıldı** — felsefe ya da
edebiyat okuyan öğrenci için deney/prosedür dili ayırt edici değil; oraya da
eklemek `fn:` eksenini işlevsizleştirir ve demeti süzgeç olmaktan çıkarır.

Bölümlerin bu partiden aldığı (50 kart üzerinden): Elektrik-Elektronik 45 ·
Bilgisayar 40 · Makine 34 · İnşaat 28 · Kimya Müh. 26 · Endüstri 25 · Fizik 24 ·
Ziraat 20 · Biyomedikal 17 · Matematik 14 · İstatistik 11 — Tıp 2, Hukuk 0,
İngiliz Dili 0 (doğru: bu parti fen ve mühendislik içeriyor; beşeri bölümler
akademik çekirdekten besleniyor).

`validate` · `sync:check` · `sync:sw:check` sıfır uyarı. Yeni dosya
eklenmediği için `CACHE_VERSION` artırılmadı.

### 2026-07-31 — Mühendislik demeti, parti 5: Kimya ve Malzeme

**Parti yazılmadan önce ölçülen boşluk.** Alanın adı "Fen ve Mühendislik Dili"
ama *fen* şu ana kadar yalnız fizik + matematik demekti. Ölçüm bunu sayıya
döktü: **8 bölüm demeti `dom:chemistry` sorguluyor, korpusta bu etiketi taşıyan
yalnız 15 kart var** — hepsi de fizik kartlarının yan ürünü (`absorb energy`,
`reach equilibrium`). Kimya, demetin en büyük deliğiydi.

Bu yüzden parti 5 mevcut dört kategoriyi derinleştirmek yerine **yeni bir
kategori** açtı: `Kimya ve Malzeme`, 50 kart (id 201–250). Dört öbek:
tepkime ve değişim 13 · çözelti ve derişim 13 · laboratuvar ve güvenlik 12 ·
malzeme ve dayanım 12. `fen-muhendislik` **200 → 250 kart**, korpus
**1749 → 1799**.

Eşdizim ilkesi: `shift the equilibrium`, `titrate against`, `evaporate to
dryness`, `run a blank`, `repeat in triplicate`, `fail by fatigue`,
`be brittle at low temperatures`. Laboratuvar öbeği bilinçli olarak **prosedür
ve güvenlik dili** — `wear goggles`, `work in a fume hood`, `dispose of waste`,
`clean up a spill`. Bunlar kimyanın kendisi değil, kimya yapılan yerin dili;
Erasmus'a giden ya da yurt dışında laboratuvara giren öğrencinin ilk günden
duyacağı cümleler.

Tarama 50 adayda **2 gerçek çakışma** buldu: `break down into` zaten
`genel-akademik-125`'ti (tam tekrar), `bond to` ise `anlam-kaymasi-038`
("bond", `dom:chemistry` + `type:polysemy`) tarafından zaten karşılanıyordu —
ikincisi doğrulayıcının yakalayamayacağı türden, çünkü tekrar değil **içerik
fazlalığı**. Yerlerine `trigger a reaction` ve `share electrons` yazıldı.
`balance an equation` benzerlik ölçümünde `solve an equation`'a %74 çıktı ama
tutuldu: kimyada denklem *denkleştirmek* çözmekten başka bir iştir ve eşik
%90'ın altında.

**Beklenen kazanç ölçüldü, sıradaki demete de yarıyor.** Bu parti yalnız kimya
bölümlerini değil, sıradaki **Sağlık demetinin kitlesini** de besledi
(alan geneli, 250 kart üzerinden):

| Bölüm | Önce | Sonra |
|---|---|---|
| Kimya Mühendisliği | 104 | 151 |
| Ziraat | 76 | 123 |
| Kimya | 62 | 106 |
| Tıp | 8 | 48 |
| Veterinerlik | 8 | 48 |
| Biyoloji | 7 | 45 |
| Eczacılık | 6 | 42 |
| Beslenme | 6 | 42 |

Diş Hekimliği (5) ve Hemşirelik (4) düşük kaldı — **kusur değil**: bu iki demet
`dom:chemistry` sorgulamıyor, klinik dille beslenecekler. Sağlık demetinin işi.

`validate` · `sync:check` · `sync:sw:check` sıfır uyarı.

### 2026-08-01 — Mühendislik demeti TAMAMLANDI (parti 6)

Son parti 50 kart (id 251–300) ekledi ve beş kategoriyi eşitledi:
**Fizik 60 · Matematik 60 · Mühendislik 60 · Bilgisayar 60 · Kimya ve Malzeme
60 = 300 kart.** Korpus **1799 → 1849**, `fen-muhendislik` hedefine ulaştı.

Bu parti bilinçli olarak **kalan boşlukları** doldurdu, var olanı derinleştirmedi:

- Fizik: devre (`connect in series`), optik (`focus a beam`), dalga
  (`the waves interfere`), çekirdek (`the half-life of`) ve ölçüm okuma
  (`read off the scale`)
- Matematik: geometri (`work out the area`, `be at right angles to`), küme ve
  mantık (`be a subset of`, `if and only if`), gösterim (`in terms of`,
  `to three significant figures`)
- Mühendislik: tasarım-üretim döngüsü (`build a prototype`,
  `retrofit the system`, `scale up the process`) ve saha güvenliği
  (`de-energise the circuit`)
- Bilgisayar: **hata ayıklama** (`set a breakpoint`, `step through the code`,
  `read the stack trace`, `reproduce the bug`), eşzamanlılık
  (`hit a race condition`, `acquire a lock`) ve **makine öğrenmesi**
  (`train a model`, `overfit the training data`, `tune the parameters`) —
  2026'da bilgisayar öğrencisinin ders dışında da her gün duyduğu dil
- Kimya: saflaştırma ve karakterizasyon (`distil off`, `crystallise out`,
  `determine the melting point`, `record a spectrum`, `the peak corresponds to`)

Tarama 50 adayda **1 çakışma** buldu: `comply with the code`, `hukuk-017`
"comply with the law"a %80 benzerlikteydi. Eşik %90 olduğu için doğrulayıcı
susardı, ama aynı kalıbı ikinci kez öğretmek olurdu — `retrofit the system`
ile değiştirildi.

**Demetin kapanış ölçümü.** Her bölüm kendi bilgi alanının kartlarının
neredeyse tamamına ulaşıyor; süzgeç doğru çalışıyor ve hiçbir kart öksüz değil:

| Bölüm | Alanındaki kart | Demetin aldığı |
|---|---|---|
| Bilgisayar (`dom:cs`) | 63 | 63 (%100) |
| Matematik (`dom:math`) | 70 | 69 (%99) |
| Fizik (`dom:physics`) | 78 | 74 (%95) |
| Kimya (`dom:chemistry`) | 65 | 61 (%94) |

Bölümlerin demetin tamamından aldığı (300 kart üzerinden): Elektrik-Elektronik
241 · Bilgisayar 215 · Makine 188 · Kimya Müh. 180 · İnşaat 167 · Ziraat 147 ·
Endüstri 144 · Kimya 126 · Fizik 120 · Biyomedikal 106 · Mimarlık 83 ·
Matematik 69 · İstatistik 64 · Tıp 58. Beşeri ve sosyal bölümler 0 —
**doğru sonuç**, onlar akademik çekirdekten besleniyor ve kendi demetlerini
bekliyor.

`validate` · `sync:check` · `sync:sw:check` sıfır uyarı.

### 2026-08-01 — Sağlık demeti, parti 1: yeni alan `saglik-bilimleri`

Yeni alan: **`saglik-bilimleri`** — "Sağlık Bilimleri Dili", 🏥, `#4338CA`,
**50 kart** (id 001–050), dört kategori: Hasta ve Muayene 13 · Tanı ve Tetkik
13 · Tedavi ve İlaç 12 · Bakım ve İzlem 12. Korpus **1849 → 1899**, 22 → 23 alan.

**Neden yeni alan, mevcut `tip` derinleştirilmedi.** `tip` tanışma testindeki
bir *meslek* alanı ve 24 kartı var; bu demet ise dokuz bölüme birden hizmet
ediyor (Tıp · Diş · Hemşirelik · Eczacılık · Fizyoterapi · Beslenme ·
Veterinerlik · Biyoloji · Biyomedikal). Hemşirelik ve fizyoterapi dilini
"tıp" alanının altına gömmek, o bölümlerin öğrencisine kendi dilini başkasının
alanından okutmak olurdu. Önek kuralı kontrol edildi: `saglik-bilimleri` ile
mevcut `saglik-spor` birbirinin öneki değil (7. karakterde ayrılıyorlar).

**İçerik kararı: klinik dil, temel bilim değil.** Parti 5'in ölçümü Diş
Hekimliği'nin 6, Hemşirelik'in 4 kartta takılı kaldığını göstermişti; bu iki
bölüm `dom:chemistry` sorgulamıyor. Bu yüzden parti temel bilime hiç girmedi,
tamamen **hastanın karşısındaki dile** ayrıldı: `present with`,
`complain of`, `the pain radiates to`, `the symptoms point to`,
`the results are inconclusive`, `wear off` / `kick in` (ilaç etkisinin
başlaması ve geçmesi), `scrub in`, `take a turn for the worse`,
`bear weight on the leg`.

İletişim kartları bilinçli olarak eklendi — `break bad news`,
`put the patient at ease`, `explain in plain language`, `reassure the family`.
Bunlar terminoloji değil ama klinikte terminolojiden daha çok kullanılıyor ve
ders kitabında hiç geçmiyorlar.

Mevcut `tip` (24 kart) ve `saglik-spor` (91 kart) yazmadan önce tek tek
okundu; 50 aday taramada **çakışma vermedi** (en yakını `listen to the chest`
↔ `ev-doga-074 listen to the rain` %74 — aynı fiil kalıbı, farklı alan).
`tip`'teki `make a diagnosis`, `run some tests`, `monitor the vital signs`,
`keep the patient stable` gibi kartlar bilerek tekrarlanmadı; bu parti onların
etrafını dolduruyor.

**Ölçüm — tıkalı iki bölüm açıldı** (bu tek partiden, 50 kart üzerinden):

| Bölüm | fen-muhendislik'ten | Bu partiden |
|---|---|---|
| Fizyoterapi | 71 | 44 |
| Tıp | 58 | 42 |
| Veterinerlik | 58 | 41 |
| Eczacılık / Beslenme | 51 | 40 |
| **Hemşirelik** | **4** | **39** |
| **Diş Hekimliği** | **6** | **36** |
| Biyomedikal | 106 | 36 |

Biyoloji yalnız 4 aldı — **kusur değil, sıradaki partinin işi**: klinik dil
`dom:medicine` taşıyor, biyoloji demeti `dom:biology` sorguluyor. Parti 2'de
"Beden ve İşleyiş" kategorisi (anatomi, fizyoloji, hücre) bu boşluğu
dolduracak. Mühendislik bölümleri 0 — doğru.

Yeni dosya eklendiği için `sync:sw` çalıştırıldı (90 dosya) ve
**`CACHE_VERSION` v7 → v8** yapıldı. `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

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
│   ├── data-lib.mjs            # Araçların paylaştığı okuma + metin karşılaştırma
│   ├── validate-data.mjs       # Şema, id, etiket, tekrar, ulaşım (npm run validate)
│   ├── audit-data.mjs          # ★ Envanter raporu, karar için (npm run audit)
│   ├── backfill-tags.mjs       # ★ Geriye dönük etiketleme (npm run backfill)
│   ├── sync-manifest.mjs       # fields.json'ı verilerden üretir (npm run sync)
│   └── sync-sw.mjs             # sw.js önbellek listesini üretir (npm run sync:sw)
└── src/
    ├── data/
    │   ├── tags.json           # ★ Etiket sözlüğü — TEK doğruluk kaynağı
    │   ├── presets.json        # ★ 38 bölüm → etiket demeti
    │   ├── fields/             # fields.json (manifest) + 22 alan dosyası
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
        │   ├── tag-repository.js       # ★ Etiket sözlüğü + bölüm demetleri
        │   ├── phrase-repository.js    # Kalıp verisi (aynı desen)
        │   └── dialogue-repository.js  # Diyalog verisi (aynı desen)
        ├── store/
        │   ├── storage.js      # localStorage sarmalayıcısı (hataya dayanıklı)
        │   ├── profile.js      # Tanışma testinin sonucu
        │   ├── interests.js    # Seçili alan id'leri
        │   ├── progress.js     # ★ SRS: kutu, vade, durum, taşıma, toplamlar
        │   ├── stats.js        # Seri, XP, günlük hedef (deste boyu da buradan)
        │   ├── daily.js        # ★ Günlük deste kurucu — SAF, birim testi yazılabilir
        │   ├── daily-session.js# Günün oturumu + deste ayarları
        │   ├── tags.js         # ★ Etiket sorgusu ve kart eşleştirme
        │   ├── tag-progress.js # ★ Etiket bazlı ilerleme (kart verisi gerektirir)
        │   ├── phrases.js      # Kalıp favorileri ve "öğrendim" işaretleri
        │   └── dialogues.js    # Tamamlanan sahneler ve en iyi telaffuz skoru
        ├── ui/
        │   ├── header.js       # Üst bar (seri, XP)
        │   ├── tabbar.js       # Alt sekme çubuğu (yalnız görünüm)
        │   ├── daily-settings.js # Günlük deste ayar modalı
        │   └── toast.js        # Kısa bildirimler
        └── screens/
            ├── navigation.js   # Ekran gösterme/gizleme + sekme durumu
            ├── onboarding.js   # Tanışma testi + alan seçimi
            ├── home.js         # Anasayfa: günün destesi, hedef, alanlar, kısayollar
            ├── field.js        # Alan detayı: kategoriler
            ├── cards.js        # ★ Flashcard + değerlendirme akışı
            ├── quiz.js         # Quiz: boşluk / anlam / yazma
            ├── daily.js        # ★ Günlük oturum sürücüsü + özet ekranı
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
| **Günlük destede oran değil TAVAN** | Tekrar kartı zamana bağlıdır, ertelenirse unutulur; yeni kartın acelesi yoktur. Sabit bir "%70 tekrar / %30 yeni" oranı, kuyruk şiştiğinde tam da korunması gereken tekrarları kırpardı. Tekrarlar önce alınır, artan yer yeni kartla dolar, yeni kartın kendi tavanı olur. |
| **Kırpılan tekrar ERTELENMEZ** | Desteye sığmayan kartın `due` alanına dokunulmuyor; kart yalnızca bugün gösterilmiyor. Vadeyi ileri atmak, unutma eğrisiyle ilgili tek verimizi kurcalamak ve SRS ölçümünü yalanlamak olurdu. Kullanıcı birikmeyi "+43 tekrar yarına kaldı" notundan görüyor. |
| **Deste boyu = `stats.dailyGoal`** | Günlük deste kendi hedef sayısını tutsaydı anasayfada iki farklı "20" belirir, hedef halkası ile deste sayacı ayrı şeyler söylerdi. Tek sayı, tek anlam. |
| **Tek giriş noktası** | "Bugünün tekrarı" kartı dönüştürüldü, ikinci bir "başla" eklenmedi. İki giriş kullanıcıyı hangisinin doğru olduğuna karar vermek zorunda bırakır; alan bazlı çalışma ikincil düğmeye indi. |
| **Karışık modda kart başına tek sunum** | Hem `cards.js` hem `quiz.js` `reviewCard` + `recordReview` çağırıyor. Aynı kartı hem flashcard hem soru olarak sunmak kutuyu iki kez oynatır ve gün sayacını bozardı; adımlar `{cardId, form}` olarak üretiliyor. |
| **Günlük oturum ileri yönlü** | Kart ekranında "Önceki" düğmesi günlük destede gizli. Geri dönüp aynı kartı yeniden değerlendirmek ikinci bir kutu hareketi yaratırdı. |
| **Deste günde bir kez kurulur** | Her yenilemede yeniden karılsaydı kullanıcı aynı gün içinde farklı kartlarla karşılaşır, "şunu bitiriyorum" hissi kaybolurdu. |
| **Tek ev alanı + çapraz etiket** | Kart bir alana ait kalır (id öneki), etiketler üstüne biner. Kartı çok alanlı yapmak `progress.js`'teki `"{alanId}-"` önekli ilerleme hesabını sessizce bozardı. Etiket katmanı `de_srs_v1`'e hiç dokunmuyor. |
| **Ön ekli, çok eksenli etiket** | Düz bir etiket listesi karışır: "physics" bir alan mı, bir bağlam mı? Ön ek hem okunurluğu hem de sorgu mantığını (eksen içi VEYA, eksenler arası VE) mümkün kılıyor. |
| **Etiketin yokluğu = nötrlük** | Kartın etiketi olmayan ekseni onu ELEMEZ. Akademik çekirdek bilerek `dom:` taşımaz; "eksik = uymuyor" sayılsaydı mühendislik öğrencisi 150 çekirdek kartının sıfırını görürdü. Yokluk karşıtlık değildir. |
| **`fn:` günlük kartlarda zorunlu değil** | `fn:` akademik söylem işlevidir. "buy gold" ya da "attend a meeting" somut eylemdir, söylem işlevi taşımaz; zorlama etiket mimarinin dayandığı ekseni değersizleştirir. |
| **Bölüm demetleri veri, kod değil** | 38 bölümün etiket seçimi `presets.json`'da. Yeni bölüm eklemek JavaScript'e dokunmayı gerektirmiyor; doğrulayıcı da demetleri sözlüğe ve alan listesine karşı kontrol ediyor. |
| **Eski profil kaydı otomatik dönüştürülmez** | "Mühendislik" seçmiş kullanıcıya "Elektrik-Elektronik" yazmak, onun söylemediği bir şeyi söylemiş gibi göstermektir. Eski etiket görünür, yanında netleştirme çağrısı durur. |
| **Etiket ilerlemesi ayrı hesaplanmalı** | Alan ilerlemesi id önekinden, kart verisi indirilmeden hesaplanabiliyor. Etiket ilerlemesi ("Fizik: %34") kart verisini okumayı gerektirir; `progress.js`'teki ucuz hesabı bozmamak için ayrı bir fonksiyon olacak (bkz. TODO). |
| **Eksik etiket, yanlış etiketten iyidir** | `backfill-tags.mjs` eşleşme bulamazsa alanı boş bırakır. Yanlış etiket sessizce yanlış deste kurar; boş etiket doğrulayıcıda görünür ve elle tamamlanır. |
| **Demet, disiplinin ne YAPTIĞINA göre kurulur** | `fn:method` matematik ve istatistik demetlerine eklendi, felsefe/edebiyat demetlerine eklenmedi. Matematikte işlemi yapmak (türev almak, parantez açmak) disiplinin kendisidir; beşeri bilimlerde prosedür dili ayırt edici değildir. Demeti "her ihtimale karşı geniş tut" diye şişirmek `fn:` eksenini süzgeç olmaktan çıkarır. |
| **Elle yazılan etiket ezilmez** | İçerik partileri etiketlerini tek tek düşünerek taşıyor. `backfill-tags.mjs` dolu `tags` alanını atlar; ezmek için açıkça `--force` gerekir. |

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
      **`store/daily.js` bu iş için hazır bekliyor:** bilerek saf yazıldı,
      `shuffle` bile enjekte edilebiliyor — `node --test` ile bağımlılıksız
      birim testi yazmak için başka hiçbir şey gerekmiyor.
- [ ] **Kalıp ve diyalog verisi doğrulanmıyor.** `tools/validate-data.mjs` yalnız
      `src/data/fields/`'a bakıyor. Kalıplarda id tekilliği/`register` geçerliliği,
      diyaloglarda `keyPhrases` referanslarının gerçekten var olması elle kontrol
      edildi; araca eklenmeli.

### Etiket mimarisinin kalan kısmı (2026-07-30)

- [ ] **Bölümsel terminoloji (Aşama 4-C) sürüyor.** Dört demet onaylandı
      (Mühendislik → Sağlık → Sosyal → Beşeri).
      - [x] ~~**Mühendislik demeti**~~ Kapandı (2026-08-01): `fen-muhendislik`
            **300 kart**, 6 parti, beş kategori × 60.
      - [ ] **Sağlık demeti sürüyor** → `saglik-bilimleri` **50/300 kart**
            (1 parti). Sıradaki parti id `saglik-bilimleri-051`'den devam eder.
            **Parti 2'nin işi belli: "Beden ve İşleyiş" kategorisi**
            (anatomi, fizyoloji, hücre — `dom:biology`). Parti 1 tamamen klinik
            dildi ve Biyoloji bölümü ondan yalnız 4 kart aldı; `dom:biology`
            sorgulayan bölümler (Biyoloji, Veterinerlik, Ziraat, Biyomedikal)
            bu kategoriyi bekliyor. Sonraki öbekler: beslenme/diyet,
            diş hekimliği, eczacılık-farmakoloji, ruh sağlığı.
      - [ ] Sonra: `sosyal-bilimler`, `beseri-bilimler` (önek çakışması
            kontrol edildi).
- [ ] **Hukuk ve beşeri bilimler için anlam kayması partisi.** Mevcut 50 kart
      fen/mühendislik ağırlıklı; Hukuk demeti bunlardan yalnız 1 kart alıyor.
      Adaylar: `consideration` · `party` · `instrument` · `title` · `execution`
      · `sentence` · `damages` · `motion`.
- [x] ~~**Meslek alanlarındaki CEFR ataması bozuk.**~~ Kapandı (2026-07-30):
      29 kart B2 → B1. Ayrıntı ve etkinin dürüst ölçüsü için o tarihli girişe bak.
- [x] ~~**Küçük veri temizliği.**~~ Kapandı (2026-07-30): tekrar eden kalıp ve
      6 zayıf örnek cümle düzeltildi. `npm run validate` artık sıfır uyarı veriyor.
- [ ] **Yeni alan, mevcut kullanıcıya kendiliğinden ulaşmıyor.** Günlük deste
      `resolveFieldIds` → ilgi alanları üzerinden kuruluyor
      (`store/daily-session.js`). Yani `fen-muhendislik` (300 kart) ve
      `saglik-bilimleri` (50 kart) yalnız kullanıcı "alan ekle" ekranından
      seçerse desteye giriyor. Yeni alanı herkesin ilgi listesine sessizce
      yazmak **yanlış olur** (kullanıcının seçimini onun adına değiştirmek),
      ama anasayfada "bölümüne uygun N yeni kart var, eklemek ister misin?"
      biçiminde bir çağrı gerekiyor — yoksa yazılan içerik görünmez kalıyor.
      Bu, içerik partilerinden bağımsız bir **uygulama işi**.
- [ ] **Kalıplarda aralıklı tekrar yok.** Şu an "öğrendim" bir beyan. İleride
      kalıplar için de zamana yayılmış bir kanıt modeli düşünülebilir — ama
      kelime SRS'inden ayrı bir kutu setiyle.
- [x] ~~**Tekrar kuyruğuna üst sınır yok.**~~ Kapandı (2026-07-29): günlük deste
      `dailyGoal` tavanıyla kesiyor. Kalan kartlar **ertelenmiyor** — vadeleri
      olduğu gibi duruyor, yalnızca bugün gösterilmiyorlar.
- [x] ~~**Yeni kart tanıtım hızı sınırsız.**~~ Kapandı (2026-07-29):
      `newPerDay` ayarı (0/3/5/10) günde tanıtılacak yeni kartı sınırlıyor.
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
