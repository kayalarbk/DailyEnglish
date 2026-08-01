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
| **Kelime** | 28 alan, 139 kategori, 3611 kart; örnek cümle, CEFR seviyesi, telaffuz, **çapraz etiketler** |
| **Kalıplar** | 15 kategori, 375 günlük ifade; kullanım düzeyi, kullanım notu, örnek |
| **Diyalog** | 30 canlandırma sahnesi, 368 replik; rol seçimi ve üç oynama modu |

Kelime verisi ayrıca **dört eksenli bir etiket katmanı** taşıyor (38 etiket) ve
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

### 2026-08-01 — Sağlık demeti, parti 2 ve 3

İki yeni kategori, +100 kart. `saglik-bilimleri` **150/300**, korpus
**1899 → 1999**.

**Parti 2 — "Beden ve İşleyiş" (50 kart, id 051–100).** Parti 1'in ölçümü
Biyoloji'nin yalnız 4 kart aldığını göstermişti: klinik dil `dom:medicine`
taşıyor, biyoloji demeti `dom:biology` sorguluyor. Bu kategori o ekseni
dolduruyor — dolaşım, solunum, sindirim, endokrin/sinir, kas-iskelet,
bağışıklık, hücre/kalıtım, boşaltım. Kartlar yine terim değil işleyiş:
`the artery narrows`, `carry oxygen to the tissues`, `the liver breaks down`,
`fight off an infection`, `code for a protein`, `wear away the cartilage`.

Sonuç: **Biyoloji 4 → 45 · Ziraat 4 → 51 · Psikoloji 4 → 41**, Diş Hekimliği
36 → 73, Veterinerlik 41 → 80.

**Parti 3 — "Halk Sağlığı ve Araştırma" (50 kart, id 101–150).** Yazmadan önce
`genel-akademik`in 150 kartı tek tek okundu ve bir sınır çizildi: **jenerik
araştırma dili orada zaten var** (`conduct a study`, `a control group`,
`randomly assign`, `statistically significant`, `obtain results`). Bu kategori
onu tekrarlamak yerine **sağlığa özgü** olanı aldı: epidemiyoloji
(`break the chain of transmission`, `the incidence of` ↔ `the prevalence of`,
`reach herd immunity`), klinik araştırma (`a randomised controlled trial`,
`a placebo group`, `report an adverse event`, `the trial was halted early`),
sağlık hizmeti (`triage patients`, `adhere to treatment`, `cut waiting times`,
`the service is overstretched`) ve etik (`protect patient confidentiality`,
`a conflict of interest`, `be under-reported`).

`the incidence of` ile `the prevalence of` bilerek yan yana kondu — Türkçede
ikisi de "sıklık" diye çevriliyor, oysa biri yeni vaka biri toplam vaka
oranıdır ve makale okurken karıştırmak yorumu tersine çevirir.

Taramada iki karar: `adhere to treatment` (`tip-022 respond to treatment`e %65)
**tutuldu** — hastanın uyumu ile bedenin yanıtı farklı şeyler ve bu ayrım
öğretilmeye değer. `run out of beds` **atıldı** — `ev-doga-082 run out of
something` kalıbı zaten öğretiyor, bu yalnız bir örneği olurdu; yerine
`the service is overstretched` yazıldı.

`validate` · `sync:check` sıfır uyarı.

### 2026-08-01 — Sağlık demeti TAMAMLANDI (parti 4, 5, 6)

Üç parti ilk dört kategoriyi 13/13/12/12'den 50'ye çıkardı.
**`saglik-bilimleri` 300 kart, 6 kategori × 50.** Korpus **1999 → 2149**.

- **Parti 4 (151–200)** — Hasta ve Muayene + Tanı ve Tetkik. Muayene
  yönergeleri (`roll up your sleeve`, `press on the abdomen`,
  `shine a light in the eye`), öykü alma (`bring on the pain`,
  `the pain settles`, `come and go`, `a dull ache`) ve görüşme becerileri
  (`ask an open question`, `use an interpreter`, `summarise back to the
  patient`). Tetkik tarafında sonucun **belirsizliği**: `be borderline`,
  `an abnormal finding`, `a false positive`, `be sensitive enough to detect`.
- **Parti 5 (201–250)** — Tedavi ve İlaç + Bakım ve İzlem. Eczacılık
  (`dispense a medicine`, `check for interactions`, `be contraindicated in`,
  `taper the dose`, `a generic version`), girişimler (`insert a catheter`,
  `put in a cast`, `come round from the anaesthetic`, `be nil by mouth`),
  diş (`extract a tooth`, `fit a filling`) ve rehabilitasyon
  (`regain independence`, `set realistic goals`, `adapt the home`).
- **Parti 6 (251–300)** — kalan boşluklar: ruh sağlığı (`feel low`,
  `lose interest in things`, `have a panic attack`, `start talking therapy`,
  `calm an agitated patient`, `burn out`), kadın doğum (`induce labour`,
  `have a caesarean`, `the due date`), pediatri (`reach a milestone`,
  `the child is off their food`), beslenme (`assess dietary intake`,
  `keep a food diary`, `follow a low-salt diet`) ve **veterinerlik**
  (`take a history from the owner`, `neuter an animal`,
  `put the animal to sleep`).

**Taramanın yakaladıkları.** İki tam tekrar: `run in the family` ve
`take a deep breath` zaten `iliskiler` alanındaydı. Beşi ise doğrulayıcının
**susacağı** türdendi — eşiğin altında ama kendi kartlarıma fazla yakın:
`ease the pain` (↔ `rate the pain` %85), `respect the patient's dignity`
(↔ `respect the patient's wishes` %79), `do the drug round`
(↔ `do the ward round` %76), `take a collateral history`
(↔ `tip-001` %68), ve iki düşük değerli aday (`the expiry date`,
`make steady progress`) — bunları başka kart zaten öğretiyordu.

Bu, partiler boyunca tekrarlanan bir bulgu: **%90 eşiği tam tekrarı yakalar,
"aynı şeyi iki kez öğretme"yi yakalamaz.** Onu ancak yazmadan önce mevcut
korpusu okuyarak görebiliyorsun.

**Kapanış ölçümü** (300 kart üzerinden): Tıp 263 · Veterinerlik 249 ·
Eczacılık 242 · Beslenme 242 · **Diş Hekimliği 235** · Fizyoterapi 223 ·
**Hemşirelik 217** · Biyomedikal 191. Demet başlarken Diş Hekimliği 6,
Hemşirelik 4 kartta takılıydı; hedef tam olarak buydu.

`validate` · `sync:check` · `sync:sw:check` sıfır uyarı.

### 2026-08-01 — Sosyal Bilimler demeti, parti 1: yeni alan `sosyal-bilimler`

Yeni alan: **`sosyal-bilimler`** — "Sosyal Bilimler Dili", 👥, `#65A30D`,
**50 kart** (id 001–050), dört kategori: Davranış ve Deney 13 · Toplum ve Alan
Araştırması 13 · Piyasa ve Ekonomi 12 · Hukuk Dili 12. Korpus **2149 → 2199**,
23 → 24 alan. Hedef yapı: **6 kategori × 50 = 300** (kalan ikisi:
Şirket ve Yönetim, Siyaset-Medya-Kamuoyu).

**`dom:sociology` yok — ve eklenmedi.** Sosyoloji demeti `dom:psychology` +
`dom:history` üzerinden sorguluyor; bu mevcut mimarinin kararı ve kartlar ona
göre etiketlendi. Yeni bir eksen etiketi eklemek 38 demeti gözden geçirmeyi
gerektirir; içerik partisinin işi değil.

Kartlar yine terim değil eşdizim: `introduce bias`, `imply causation`,
`the finding generalises to`, `conform to social norms`, `the gap widens`,
`demand outstrips supply`, `purchasing power falls`, `the burden of proof`,
`set a precedent`, `come into force`.

**Doğrulayıcının uyaracağı ilk çakışma.** `be liable for damages`,
`resmi-islemler-039 "be liable for damage"`e **%95** çıktı — eşiğin üstünde.
Üstelik hukuki "damages" (tazminat) ile gündelik "damage" (hasar) farkı gerçek
ama tek harflik bir kart çifti öğreticiden çok kafa karıştırıcı olurdu;
`award damages` yazıldı. `have a lasting effect` de `tip-016 have a side
effect`e %76'ydı, `withdraw at any time` ile değiştirildi.

**Yakalanan demet kusuru — üçüncü kez aynı biçim.** Ulaşım ölçülünce Hukuk'un
12 hukuk kartından yalnız 10'unu aldığı görüldü. Sebep yine demet tanımı:
`hukuk` ve `uluslararasi-iliskiler` demetlerinde **`fn:method` yoktu**.
Oysa `bring a case before the court`, `repeal a law`, `award damages`,
`ratify a treaty` — hukukta **usul disiplinin yarısıdır**, yan bir beceri
değil. Dahası bu eksiklik, hukuk öğrencisini `genel-akademik`in bütün
"Yöntem Anlatımı" kategorisinden de dışlıyordu (tez yazan her öğrenci
`collect data` ve `follow a procedure` kullanır).

İki demete `fn:method` eklendi: **Hukuk 169 → 261 · Uluslararası İlişkiler
106 → 153** (korpus geneli). Felsefe, Edebiyat, Tarih ve Güzel Sanatlar
demetlerine **eklenmedi** — 2026-07-31'de yazılan ilke aynen geçerli:
prosedür dili o disiplinlerde ayırt edici değil. Ayrım şu çizgide:
*uygulaması biçimsel bir usulden oluşan disiplinler* (matematik, istatistik,
hukuk, uluslararası ilişkiler) `fn:method` alır.

Yeni dosya eklendiği için `sync:sw` (91 dosya) ve **`CACHE_VERSION` v8 → v9**.
`validate` sıfır uyarı.

### 2026-08-01 — Sosyal Bilimler demeti, parti 2 ve 3

+100 kart, `sosyal-bilimler` **150/300**, korpus **2199 → 2299**.

**Parti 2 (051–100)** kalan iki kategoriyi açtı: **Şirket ve Yönetim** 25
(`take over a company`, `hold a stake in`, `post a loss`,
`break into a market`, `undercut a competitor`, `the deal falls through`,
`work to a tight margin`) ve **Siyaset, Medya ve Kamuoyu** 25
(`win by a landslide`, `the turnout was low`, `swing the vote`,
`break off diplomatic relations`, `hold the government to account`,
`shift the narrative`). Altı kategori tamamlandı.

İki tam tekrar yakalandı: `cite a source` zaten `akademik-002`, `go viral`
zaten `medya-eglence-026` idi → `protect a source` ve `gain traction`.

**Parti 3 (101–150)** ilk iki kategoriyi 38'e çıkardı — ve bir ölçüme cevap
verdi. Parti 2 sonunda **Öğretmenlik 10/100'de takılıydı**: demeti
`ctx:lecture` · `presentation` · `textbook` · `exam` sorguluyor, oysa
psikoloji kartlarım araştırma bağlamındaydı (`ctx:lab`, `ctx:paper`). Sorun
demet değil **içerikti** — öğretmen adayına araştırma yöntemi değil öğrenme
psikolojisi lazım. Parti 3'e o katman eklendi: `retain information`,
`space out practice`, `the material sticks`, `scaffold the task`,
`differentiate instruction`, `assess prior knowledge`, `hold a misconception`,
`a growth mindset`. **Öğretmenlik 10 → 45.**

(`space out practice` ve `recall from memory` uygulamanın kendi SRS ilkesini
anlatıyor — kullanıcı hem İngilizce hem de neden bu şekilde çalıştığını
öğreniyor.)

Taramada: `test yourself` zaten `kisisel-gelisim-034`'tü; yerine konan
`cram before an exam` da mevcut `cram for an exam`'e %84 çıkınca o da
elendi → `the material sticks`. `volunteer for a charity`
(↔ `iliskiler-107 volunteer for a cause` %78) → `join a trade union`.

`validate` · `sync:check` sıfır uyarı.

### 2026-08-01 — Sosyal Bilimler demeti TAMAMLANDI (parti 4, 5, 6)

+150 kart. **`sosyal-bilimler` 300 kart, 6 kategori × 50.** Korpus
**2299 → 2449**.

- **Parti 4 (151–200)** — Piyasa ve Hukuk 37'ye. Makro ekonomi
  (`inflation eases`, `tighten monetary policy`, `the multiplier effect`,
  `economies of scale`, `a market failure`, `capital flows out`) ve
  mahkeme dili (`cross-examine a witness`, `adjourn the hearing`,
  `overturn a conviction`, `commute a sentence`, `strike a plea bargain`).
- **Parti 5 (201–250)** — Şirket ve Siyaset 50'ye. Girişim ve yönetim
  (`pitch to investors`, `burn through cash`, `carry out due diligence`,
  `win a tender`, `a bottleneck forms`) ile siyaset
  (`concede defeat`, `a vote of no confidence`, `cling to power`,
  `broker a ceasefire`, `grant asylum`).
- **Parti 6 (251–300)** — kalan dördü 50'ye. Karar psikolojisi
  (`make a snap judgement`, `be risk-averse`, `anchor on the first figure`,
  `diffuse responsibility`, `overestimate your own ability`), toplumsal
  göstergeler (`sleep rough`, `a digital divide`, `be displaced by conflict`)
  ve hak dili (`the presumption of innocence`, `follow due process`,
  `mitigating circumstances`).

**Taramanın kritik iki yakalayışı bu partilerde de aynı desendeydi:**
`jump to conclusions` zaten `iletisim-046`'ydı; `weigh up the options`
(↔ `iletisim-048 weigh the options` **%85**) ve `take a mental shortcut`
(↔ `seyahat-052 take a shortcut` **%85**) eşiğin hemen altındaydı ama aynı
kalıbı ikinci kez öğretirdi.

**Kapanış ölçümü — ve bilerek YAPILMAYAN bir düzeltme.** Bölümlerin kendi
bilgi alanından aldığı oran: **Hukuk %97** (118 kartın 114'ü) · Sosyoloji %85 ·
Psikoloji %75 · **İktisat %66**.

İktisat'ın oranı düşük çünkü demeti `fn:method` içermiyor ve kaçırdığı kartlar
`take over a company`, `bid for a contract`, `carry out due diligence` gibi
**şirket uygulaması** kartları. Bu bir kusur değil, **eksenin işini yapması**:
o kartlar İktisat'ın değil İşletme'nin alanı ve İşletme demeti `fn:method`
taşıdığı için onları alıyor (98/300). Demeti sırf sayı büyüsün diye
genişletmek `fn:` eksenini süzgeç olmaktan çıkarırdı — bu partide **kasıtlı
olarak durduk**.

Demetin tamamından (300 üzerinden): Sınav Hazırlık 199 · Uluslararası
İlişkiler 179 · Sosyoloji 122 · Hukuk 114 · İşletme 98 · Mütercim
Tercümanlık 95 · İletişim-Gazetecilik 87 · İktisat 84 · Psikoloji 77 ·
Öğretmenlik 60.

`validate` · `sync:check` · `sync:sw:check` sıfır uyarı.

### 2026-08-01 — Beşeri Bilimler demeti, parti 1: yeni alan `beseri-bilimler`

Son demet başladı. **`beseri-bilimler`** — "Beşeri Bilimler Dili", 🏛️,
`#A16207`, **50 kart** (id 001–050), dört kategori: Metin ve Çözümleme 13 ·
Anlatı ve Üslup 13 · Tarih ve Kaynak 12 · Felsefe ve Sav 12. Korpus
**2449 → 2499**, 24 → 25 alan. Hedef 6 kategori × 50 (kalan ikisi: Çeviri ve
Dilbilim, Sanat ve Estetik).

**Bu demetin ekseni ötekilerden farklı.** Hedef bölümlerin demetleri
`fn:argue` · `fn:define` · `fn:compare` · `fn:hedge` üzerine kurulu ve
**`fn:method` taşımıyor** — bu bilinçli bir karardı (bkz. 2026-07-31 ve
2026-08-01 girişleri). Kartlar buna göre yazıldı: işlem anlatan değil
**iddia kuran ve yumuşatan** dil. `the text lends itself to`,
`be open to interpretation`, `the ending is ambiguous`,
`take the passage at face value`, `be biased towards`, `in hindsight`,
`beg the question`, `a false dichotomy`, `be self-evident`.

Beşeri bilimlerde "yanlış" genellikle bilgi eksikliği değil **fazla kesin
konuşmak**tır; bu yüzden çekimserlik katmanı (`fn:hedge`) burada süs değil
konunun kendisi.

Ölçüm (50 kart üzerinden): Felsefe 41 · Güzel Sanatlar 41 · İngiliz Dili 33 ·
Mütercim Tercümanlık 33 · İletişim-Gazetecilik 25 · Tarih 24. Bu parti 50
adayda **çakışma vermedi**.

`sync:sw` (92 dosya) ve **`CACHE_VERSION` v9 → v10**. `validate` sıfır uyarı.

### 2026-08-01 — Beşeri Bilimler demeti TAMAMLANDI → **AŞAMA 4-C BİTTİ**

Parti 2–6, +250 kart. **`beseri-bilimler` 300 kart, 6 kategori × 50.**
Korpus **2499 → 2749**.

Kategoriler: Metin ve Çözümleme · Anlatı ve Üslup · Tarih ve Kaynak ·
Felsefe ve Sav · Çeviri ve Dilbilim · Sanat ve Estetik.

Öne çıkanlar: `hinge on a single word`, `resist a single reading`,
`the register drops`, `free indirect speech`, `subvert a genre`,
`the record is silent on`, `historians disagree over`, `a straw man`,
`the veil of ignorance`, `a false friend`, `collocate with`,
`the provenance is unclear`.

`collocate with` ve `a phrasal verb` kartları uygulamanın kendi içerik
ilkesini anlatıyor — öğrenci hem terimi hem de neden kart olarak eşdizim
yazdığımızı öğreniyor.

**Doğrulayıcı bir kez konuştu ve haklıydı.** Parti 3'te `scan a line` kartına
`fn:method` + `fn:measure` vermiştim; `⚠ hiçbir bölüm demetiyle eşleşmiyor`
uyarısı geldi. Sebep tam da daha önce yazdığımız karardı: **edebiyat demetleri
`fn:method` taşımıyor.** Kart `fn:define` + `fn:compare` olarak yeniden
etiketlendi. "Hiçbir bölüme ulaşamayan kart" uyarısı tam bunun için yazılmıştı
ve ilk kez gerçek bir hatayı yakaladı.

---

## Aşama 4-C kapanış tablosu

Dört demet, **24 parti**, **1200 kart**, dört yeni alan:

| Demet | Alan | Kart | Kategori |
|---|---|---|---|
| Mühendislik | `fen-muhendislik` | 300 | 5 × 60 |
| Sağlık | `saglik-bilimleri` | 300 | 6 × 50 |
| Sosyal | `sosyal-bilimler` | 300 | 6 × 50 |
| Beşeri | `beseri-bilimler` | 300 | 6 × 50 |

Korpus **1699 → 2749 kart**, 22 → 25 alan. `validate` her partide sıfır
uyarıyla geçti.

**En önemli sonuç: artık hiçbir bölüm boşta değil.** Aşama başlarken Hukuk,
İşletme, Sosyoloji, Felsefe, Tarih, İngiliz Dili ve Güzel Sanatlar bölümsel
içerikten **sıfır** kart alıyordu. Şimdi 38 bölümün en azı 93 kart alıyor,
ortalama 460:

| | Bölüm | Kart |
|---|---|---|
| en az | Öğretmenlik | 93 |
| | İç Mimarlık | 141 |
| | Matematik | 184 |
| | İktisat | 192 |
| ortalama | — | 460 |
| en çok | Tıp | 557 · Ziraat 571 |

**Aşama boyunca öğrenilen üç şey:**

1. **Demet kusuru içerik kusurundan daha sık çıktı.** Dört kez ölçüm beklenmedik
   bir düşük sayı gösterdi ve dördünde de sebep `presets.json`'daki eksik bir
   etiketti: `ctx:lecture`/`ctx:exam` (parti 1), `fn:method` matematik ve
   istatistikte, `fn:method` hukuk ve uluslararası ilişkilerde. Bir kez de sebep
   gerçekten içerikti (Öğretmenlik) ve o zaman **demet değil kart yazıldı**.
2. **%90 eşiği yetmiyor.** Doğrulayıcı yalnızca tam ve çok yakın tekrarı görüyor.
   %65–85 aralığında, eşiğin altında ama "aynı şeyi ikinci kez öğreten" onlarca
   aday yalnızca **yazmadan önce mevcut korpusu okuyarak** elendi
   (`ease the pain` ↔ `rate the pain`, `weigh up the options` ↔
   `weigh the options`, `be liable for damages` ↔ `be liable for damage`).
3. **Demeti genişletmek her zaman doğru cevap değil.** Sosyal demetin sonunda
   İktisat %66'da kaldı; demete `fn:method` eklemek sayıyı büyütürdü ama o
   kartlar İşletme'nin alanıydı. Genişletmemek, eksenin süzgeç olarak
   çalıştığının kanıtı oldu.

### 2026-08-01 — Yazılan içeriğin kullanıcıya ulaşması

Aşama 4-C'nin 1200 kartı yazıldı ama **kimse göremiyordu.** Günlük deste
`resolveFieldIds` üzerinden yalnız kullanıcının SEÇTİĞİ alanlardan kuruluyor;
sonradan eklenen dört alan hiçbir kullanıcının listesinde yoktu. İçerik
görünmüyorsa yazılmamış sayılır — bu giriş o boşluğu kapatıyor.

**İki ayrı sorun çıktı, ikisi de düzeltildi.**

**1. Yeni kullanıcı — kök sebep `presets.json`'daydı.** Elektrik-Elektronik
seçen *yepyeni* bir kullanıcıya bile 24 kartlık `muhendislik` öneriliyordu,
300 kartlık `fen-muhendislik` değil: demetlerin `fields` dizileri Aşama 4-C
boyunca hiç güncellenmemişti. **37 demetin önerilen alanları** kendi bölümsel
alanını ve akademik çekirdeği içerecek şekilde yeniden yazıldı (en fazla 4
alan — öneri listesi okunabilir kalmalı). `calisan` dışarıda bırakıldı:
öğrenci değil, akademik çekirdek onun için öne çıkarılmamalı.

**2. Mevcut kullanıcı — yeni depo `store/field-suggest.js`.** Anasayfada
"Bölümüne uygun N kart daha var" çağrısı: hangi alanlar, her birinde kaç kart,
"Listeme ekle" ve "Şimdi değil".

Tasarım kararları:

| Karar | Gerekçe |
|---|---|
| Alan listesi kullanıcı adına DEĞİŞTİRİLMEZ | Seçtiği alanlar onun beyanıdır; sessizce büyütmek "senin adına da şunu seçtim" demektir. Sayı gösterilir, karar ona bırakılır. |
| Sayı tahmin edilmez, sayılır | "Yaklaşık 1000 kart" deyip eklendiğinde 300 çıkması sözü tutmamaktır. Hesap için aday alan dosyaları inmeli; bu yüzden arka planda yapılır ve öneri **ancak hazır olunca** çizilir (etiket ilerlemesindeki desenin aynısı). Dosyalar zaten SW önbelleğinde, ilk ziyaretten sonra ağa çıkılmaz. |
| Alan başına en az **10 kart** | Eşiksiz hâlde Elektrik-Elektronik öğrencisine "Sağlık Bilimleri Dili" de öneriliyordu — orada ona uyan **1** kart vardı. 1 kart için listeye satır eklemek kazanç değil kalabalık. |
| "Şimdi değil" alan id'lerini saklar, bayrak değil | Sonradan YENİ bir alan yazılırsa öneri geri gelmeli: kullanıcı o alan hakkında henüz bir şey söylemedi. Tarayıcıda doğrulandı. |

**Yol boyunca yakalanan bug (düzeltildi).** `home.js` keşfet listesindeki
"+ Ekle" düğmesinde `toast()` çağırıyordu ama **modülü hiç import etmemişti**.
Alan ekleniyor, sonra `ReferenceError` fırlıyor, bildirim hiç görünmüyordu.
Import eklendi.

Test: Chrome'da uçtan uca. Mevcut kullanıcı taklidi (3 eski alan +
Elektrik-Elektronik bölümü) → banner **389 kart / 7 alan** gösterdi, eşikten
sonra **388 / 6**; sayılar alan satırlarındaki "N kart uygun" rozetleriyle
birebir tuttu (Fen ve Mühendislik 241, Akademik Çekirdek 78, Anlam Kayması 26).
"Listeme ekle" → 6 alan eklendi, banner kayboldu, **günlük deste 5 kartın
4'ünü `fen-muhendislik`'ten çekti** — bu değişiklik öncesi o alan hiç
görünmezdi. "Şimdi değil" → yenilemeden sonra da gizli kaldı; geçilenlerden
biri silinince öneri tekil metinle geri geldi. Yeni kullanıcı yolu: tanışma
testi Elektrik-Elektronik ile bitirildi, **Fen ve Mühendislik Dili + Akademik
Çekirdek önerilen olarak işaretli geldi**. Bütün akışlarda konsol hatasız
(hata/rejection/console.error dinleyicisiyle ölçüldü).

`sync:sw` (93 dosya) ve **`CACHE_VERSION` v10 → v11**.

---

### 2026-08-01 — Otomatik test + temel terminoloji tabanı

**1. `npm test` — 54 test, sıfır bağımlılık.** `node --test` ile çalışıyor,
kurulum gerektirmiyor. Dört dosya, dördü de "sessizce bozulabilecek" katmanlar:

| Dosya | Test | Neyi koruyor |
|---|---|---|
| `tests/daily.test.mjs` | 14 | Oran değil tavan · kırpılan tekrarın `due` alanına DOKUNULMAMASI · gruplar arası round-robin · karışık modda kart başına tek sunum |
| `tests/progress.test.mjs` | 14 | Leitner kutu geçişleri · "zor" kutuyu korur · çoktan seçmelinin kartı kalıcı YAPAMAMASI · tanıma tavanının kazanılmış kutuyu düşürmemesi |
| `tests/utils.test.mjs` | 16 | `dayKey`’in YEREL günü vermesi (UTC olsaydı SRS bir gün kayardı) · artık yıl · Türkçe arama katlama · benzerlik simetrisi |
| `tests/tags.test.mjs` | 10 | "Etiketin yokluğu nötrlüktür" kuralı — bir kez yanlış yazıldı ve 150 çekirdek kartının sıfırı gösterildi |

Testler ürün kararlarını sınıyor, uygulamayı değil: her biri PROGRESS’teki bir
"Teknik Karar" satırının karşılığı. Bozulursa hangi kararın çiğnendiği belli olur.

**2. Temel terminoloji — kabul edilen bir içerik kusuru.** Kullanıcı geri bildirimi:
*"en basit fizik kelimeleri bile şu an dahil değil."* Ölçüm doğruladı: 30 temel
fizik teriminden **22’si tek başına hiçbir kartta yoktu** (`velocity`, `friction`,
`wavelength`, `voltage`, `atom`, `electron`…). Var olan 8’i de yalnızca
`anlam-kaymasi`’ndaydı, üstelik başka bir sebeple.

Sebep, demetin kendi ilkesinin fazla katı uygulanmasıydı: *"kart = terim değil
eşdizim"*. İlke doğruydu — öğrenci `capacitor`ü biliyor, bilmediği
`discharges through`. Ama bu, tabanı hiç koymamayı haklı çıkarmıyor: öğrenci
"kuvvet" görüp "force" diyemiyorsa eşdizim öğretmenin zemini yok.

Dört bölümsel alana **"Temel Terimler" kategorisi** eklendi, her birine 50 kart
(+200): `fen-muhendislik` · `saglik-bilimleri` · `sosyal-bilimler` ·
`beseri-bilimler` → hepsi **350 kart**. Korpus **2749 → 2949**.

Terim listeleri uydurulmadı, standart sözlüklere dayandırıldı: Ducksters
"Motion Glossary" (fizik), Rasmussen "Basic Medical Terms" ve Osmosis
"100 Essential Terms" (sağlık), Wikipedia "Glossary of chemistry terms".

Kartın **`en` tarafı terim, `enS` tarafı gerçek kullanım**: `force` kartının
cümlesi *"A force is a push or a pull on an object."* Böylece hem terim hem de
terimin içinde yaşadığı cümle öğreniliyor; eşdizim kartlarının yerini almıyor,
altına zemin koyuyor.

**Tarama yine iş gördü.** `anlam-kaymasi` ile **9 tam çakışma** çıktı
(`vector` · `conductor` · `function` · `matrix` · `load` · `stress` · `strain` ·
`cell` · `tissue`) — bunların hepsi zaten teknik anlamıyla öğretiliyordu, yani
mimari doğru çalışıyor. Ayrıca `heart rate` ve `blood pressure` mevcut eşdizim
kartlarına **%80** çıktığı için elendi. Yerlerine `inertia`, `resistor`,
`theorem`, `beam`, `lever`, `gear`, `cartilage`, `spine`, `oxygen`, `crutches`.

**Başlangıç seviyesi payı arttı:** A1+A2 oranı %22 → **%26** (760 kart). Temel
terimler dilsel olarak kolay, kavramsal olarak vazgeçilmez — CEFR’ın
"ifadenin dilsel zorluğunu yansıtır" ilkesi burada da uygulandı.

`npm test` 54/54 · `validate` · `sync:check` · `sync:sw:check` sıfır uyarı.

### 2026-08-01 — Akademik eşdizim tabanı: ACL'e dayanan 50 kart

Şimdiye kadarki içerik partileri kart listelerini **kendi muhakememizle**
kuruyordu; terim listeleri (2026-08-01 temel terminoloji) standart sözlüklere
dayandırılmıştı ama **eşdizimlerin** böyle bir dayanağı yoktu. Bu giriş o
dayanağı kuruyor: kaynak, korpustan türetilmiş **Academic Collocation List**
(Ackermann & Chen, *JEAP* 12/4, 2013) — 25 milyon sözcüklük PICAE korpusundan
uzman süzgecinden geçmiş 2469 eşdizim, akademik İngilizcenin yaklaşık %1,4'ünü
kaplıyor.

**Ölçüm önce yapıldı ve boşluk beklenenden büyük çıktı.** ACL'in sıklık
sıralamasındaki ilk 200 eşdizim 2949 kartlık korpusa karşı tarandı:
**tam karşılığı olan 9, yakın karşılığı olan 19, boşta 172.** Yani en sık
akademik eşdizimlerin %86'sı korpusta yoktu. Sebep anlaşılır: `genel-akademik`
işlev sözcükleri ve bağlaçlar üzerine kurulmuştu (`account for`, `whereas`,
`refute`), ACL'in ana gövdesi olan **sıfat+isim** ve **fiil+isim** katmanı
neredeyse boştu.

`genel-akademik` **150 → 200 kart**, dört yeni kategori: Sıfat + İsim
Eşdizimleri 13 · Fiil + İsim Eşdizimleri 13 · Ölçü, Derece ve Nicelik 12 ·
Değerlendirme ve Konumlandırma 12. Korpus **2949 → 2999**.

**172 boş adaydan 50'si seçilirken üç eleme yapıldı:**

1. **Konuya özgü bileşikler çekirdeğe alınmadı** — `climate change`,
   `domestic violence`, `mental health`, `foreign policy` ACL'de sık ama
   *konu* sözcükleri; çekirdeğin tanımı bölümden bağımsız olmak. Bunlar ilgili
   bölümsel alanın işi.
2. **Eşik altı kalan ama aynı şeyi ikinci kez öğretenler elle elendi** —
   doğrulayıcı %90'ın altını görmez: `achieve an objective`
   (≈ `kisisel-gelisim-002 achieve a goal`), `conduct research`
   (≈ `genel-akademik-036 conduct a study`), `take into consideration`
   (≈ `take into account`), `lead to the conclusion` (≈ `reach a conclusion`),
   `increase awareness` (≈ `raise awareness of`). Beşi de listeden çıkarıldı.
   `in the previous section` de atıldı: mevcut `in the following section`'ın
   ayna görüntüsü, ayrı kart olmayı hak etmiyor.
3. **Aynı parti içindeki eş adaylar tekilleştirildi** — `high level`/`low level`,
   `be widely used`/`be commonly used`, `further research`/`further
   investigation`, `provide information`/`give information` çiftlerinin yalnız
   sık olanı yazıldı.

Kalan 50 aday taramada **tek uyarı** verdi: `little evidence` ↔ `hukuk-005
give evidence` %73. Tutuldu — biri nicelik çerçevesi, diğeri hukuki bir edim.

İki kart bilerek **karıştırılan çift** olarak yazıldı, `tr` alanında ayrım
açıkça duruyor: `the standard error` (mevcut `the standard deviation`'ın yanına)
ve `little evidence` ("a little" değil: yok denecek kadar az). `a critical
analysis` da öyle — "eleştirel çözümleme (yerme değil, tartma)".

**Yakalanan kendi kusurum (düzeltildi).** Parti yazıldıktan sonra bölümlere
ulaşım ölçüldü ve **öğretmenlik 50 kartın 1'ini, iç mimarlık 1, hemşirelik 2,
genel öğrenci 2** aldığı görüldü. Sebep demet değil **kendi etiketlemem**di:
50 kartın 50'sine `ctx:paper` vermiş, başka ortam etiketi neredeyse hiç
koymamıştım. Oysa `play a role in`, `a key factor`, `be widely used` yalnız
makalede geçmez — ders anlatımının ve ders kitabının da dilidir; `ctx:paper`
taşımayan demetler bu yüzden kartları hiç göremiyordu. Elli kart tek tek
gözden geçirilip gerçekten doğru olan ortam etiketleri eklendi (`ctx:lecture`
44 · `ctx:textbook` 41 · `ctx:lab` 7 · `ctx:practice` 6 · `ctx:presentation` 6).
Demetlere
**hiç dokunulmadı** — kusur onlarda değildi.

| Bölüm | Önce | Sonra |
|---|---|---|
| Öğretmenlik | 1 | 21 |
| İç Mimarlık | 1 | 14 |
| Hemşirelik | 2 | 18 |
| Genel öğrenci | 2 | 16 |
| Güzel Sanatlar | 5 | 21 |
| Diş Hekimliği | 7 | 17 |

Düzeltmeden sonra **hiçbir bölüm 9'un altında değil**, ortalama 25,4/50.
`calisan` 9'da kaldı — doğru: o demet öğrenci ortamlarını bilerek dışarıda
bırakıyor.

Bu ölçüm mevcut 150 kartta da aynı eğilimi gösterdi (öğretmenlik %19, iç
mimarlık %11, genel öğrenci %11 — hepsi `ctx:paper` ağırlığından). Yeni parti
düzeltmeden sonra o oranların **iki katını** veriyor. Eski 150'nin gözden
geçirilmesi TODO'ya yazıldı; bu partide kapsam dışı tutuldu.

Dosya içeriği değiştiği için **`CACHE_VERSION` v12 → v13**. Yeni dosya
eklenmediğinden `sync:sw` listesi aynı (93 dosya) ama sürüm artmazsa çevrimdışı
kullanıcı 150 kartlık eski kopyayla kalırdı.

`npm test` 54/54 · `validate` · `sync:check` · `sync:sw:check` sıfır uyarı.
**Tarayıcı testi bu oturumda yapılamadı** — Chrome eklentisi bağlı değildi.
Doğrulama sunucu üzerinden yapıldı: manifest 16 kategori, `genel-akademik.json`
200 kart, son id `genel-akademik-200`. Ekran katmanına dokunulmadığı için risk
düşük ama gözle kontrol bir sonraki oturuma kaldı.

### 2026-08-01 — ACL parti 2: sıklık sırasının 201–380 aralığı

Aynı kaynağın (ACL) bir sonraki dilimi tarandı: 121 aday → **tam 3, yakın 17,
boşta 101.** Bu dilimden 50 kart yazıldı; `genel-akademik` **200 → 250**,
korpus **2999 → 3049**. Dört kategori: Kanıt, Varsayım ve Değerlendirme 13 ·
Yöntem ve Araştırma Tasarımı 13 · Nicelik ve Kapsam 12 · Etki, İlişki ve
Süreç 12.

**Eleme bu partide daha ağır bastı** — 101 boş adaydan yalnız yarısı yazıldı.
ACL sıklık sırasında ilerledikçe **aynı çerçevenin varyantları** birikiyor:
`key role` · `major role` · `crucial role` · `central role` · `active role` ·
`vital role` (altısı da `play a role in`'in etrafında), `further evidence` ·
`further analysis` · `further development` (`further research` yazılmıştı),
`key concept` · `key feature` · `key element` (`a key factor` yazılmıştı),
`recent study` · `recent research` · `previous research` (`a previous study`
yazılmıştı). **Çerçeve bir kez öğretilir**; on beş varyantı ayrı kart yapmak
öğrenmeyi değil kuyruğu büyütür. Bu, sıklık listesinden kart yazarken
doğrulayıcının göremeyeceği ikinci eleme türü — ilki eşik altı örtüşme,
bu ise aynı kalıbın farklı doldurmaları.

İki çift bilerek yan yana yazıldı, Türkçede ikisi de karışıyor:
`qualitative research` ↔ `quantitative research` (nitel/nicel) ve
`a positive correlation` (istatistiksel) — `tr` alanında ayrım açıkça duruyor.

**Etiketleme parti 1'in dersiyle başladı:** hiçbir kart yalnız `ctx:paper`
almadı, her kart gerçekten geçtiği ortamlarla etiketlendi. Sonuç ilk ölçümde
sağlıklı çıktı, düzeltme gerekmedi: **hiçbir bölüm sıfır almadı, ortalama
21,9/50**, en düşük öğrenci demeti 11 (tarih, iletişim). `calisan` 7 —
doğru, o demet öğrenci ortamlarını dışarıda bırakıyor. Karşılaştırma:
parti 1 aynı noktada öğretmenlik için 1/50 veriyordu.

`CACHE_VERSION` v13 → v14. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı. Tarayıcı testi yine yapılamadı (Chrome eklentisi
bağlı değil); doğrulama sunucu üzerinden yapıldı.

### 2026-08-01 — Yeni alan: Öbek Fiiller (PHaVE parti 1)

`phrasal-verbs` id'si rehberde uzun süredir ayrılmıştı ama alan hiç yazılmamıştı.
Bu, korpusun en büyük yapısal boşluğuydu: öbek fiiller günlük İngilizcenin
belkemiği ve Türkçe konuşan için en zor katman — `look up` ile `look out`
arasındaki farkı sözcüklerden çıkarmak mümkün değil.

**Kaynak: PHaVE List** (Garnier & Schmitt, *Language Teaching Research* 19/6,
2015). COCA'dan türetilmiş **en sık 150 öbek fiil**, her birinin baskın anlam
senaryoları ve yüzdeleri. Listenin asıl değeri sıralama değil, **hangi anlamın
öğretileceğini söylemesi**: öbek fiillerin ortalama 5,6 anlamı var, hepsini
öğretmek imkânsız, yanlışını seçmek ise yaygın bir ders kitabı hatası.
Örnekler bu partide doğrudan işe yaradı:

| Kart | Ders kitabının öğrettiği | PHaVE'in baskın anlamı |
|---|---|---|
| `look up` | sözlüğe bakmak | **başını kaldırıp bakmak** (%88) |
| `make up` | uydurmak | **oluşturmak, meydana getirmek** (%42,5) |
| `turn out` | üretmek | **olduğu anlaşılmak** (%91) |
| `put out` | (ateşi) söndürmek | **kamuya duyurmak** (%47; söndürmek %14) |
| `work out` | spor yapmak | **ayrıntısını çıkarmak, planlamak** (%33) |

Bu ayrımlar kartın `tr` alanına açıkça yazıldı: *"başını kaldırıp bakmak (en sık
anlamı bu; 'sözlüğe bakmak' daha seyrek)"*.

Alan: **`phrasal-verbs`** — "Öbek Fiiller", 🔤, `#0D9488`, **50 kart**,
dört kategori **edata göre**: `"up"` 13 · `"out"` 13 · `"back"/"down"` 12 ·
`"on"/"in"/"off"/"over"` 12. Edat ekseni bilinçli: edat metaforu taşıyor
(up = tamamlanma/artış, out = ortaya çıkma, back = geri dönüş, down = azalma),
alfabetik ya da rastgele bir sıra bu örüntüyü gizlerdi. Korpus **3049 → 3099**,
25 → 26 alan.

**Tarama, listenin dokuzunun zaten öğretildiğini gösterdi** — `point out` ·
`grow up` · `wake up` · `carry out` · `set out` · `move in` · `bring about` ·
`rule out` · `move out`. Hepsi atlandı. Not: bunların bir kısmı korpusta
**farklı anlamıyla** duruyor (`set out` = "ortaya koymak", PHaVE'de "yola
çıkmak"); tekrar muafiyeti yalnız `type:polysemy` + ayrık `dom:` ile geçerli
olduğu ve çekirdek kartların `dom:` etiketi olmadığı için ikinci anlam kart
olarak yazılamaz. Bu, mimarinin kabul edilmiş bir sınırı.

**`fn:` zorlanmadı, `ctx:` kırpıldı.** İlk yazımda 11 kart uyarı verdi:
akademik ortam etiketi taşıyıp `fn:` taşımıyorlardı. İki çıkış vardı — uydurma
bir `fn:` yazmak ya da o kartın gerçekten akademik olmayan ortam etiketlerini
bırakmak. İkincisi seçildi: `sit down`, `look up`, `break down` somut
eylemlerdir, akademik söylem işlevi taşımazlar (`tags.json`'ın açıkça
uyardığı durum). 33 kart `ctx:everyday` + `ctx:practice`'e sadeleştirildi;
gerçekten söylem işlevi olan 17 kart (`turn out` fn:argue, `work out`
fn:method, `go up`/`go down` fn:change, `take up`/`make up` fn:quantity…)
akademik ortamlarını korudu.

**Yakalanan demet kusuru.** Ulaşım ölçülünce **İngiliz Dili & Edebiyatı
öğrencisinin 50 öbek fiilin 3'ünü**, öğretmenliğin 8'ini aldığı görüldü —
öbek fiiller onların tam da konusu olduğu hâlde. Sebep: bu demetler yalnız
`ctx:paper`/`lecture`/`exam` sorguluyor, `ctx:practice` taşımıyordu. Oysa
sınıfın önünde ders anlatan öğretmenin ve çeviri masasındaki dilcinin
**mesleki uygulama ortamı vardır**. İki demete `ctx:practice`, sınav hazırlık
demetine (bölüm değil *amaç* demeti, kapsamı genel İngilizce) `ctx:everyday`
eklendi:

| Demet | Önce | Sonra |
|---|---|---|
| İngiliz Dili | 3 | 26 |
| Öğretmenlik | 8 | 31 |
| Sınav hazırlık | 8 | 42 |

Felsefe (3), matematik (7), tarih (7) düşük kaldı ve **bilerek düzeltilmedi**:
o demetlerin mezununun ayırt edici bir uygulama ortamı yok, `ctx:everyday`
eklemek ise onlara `gunluk-rutin`'in tamamını açardı. Bu, `ctx:` ekseninin
genel katman alanları için yapısal olarak dar kaldığını gösteriyor — TODO'ya
yazıldı.

**Alan kullanıcıya ulaştırıldı** (2026-08-01'deki dersin uygulaması): dil
odaklı beş demetin önerilen alanlarına `phrasal-verbs` eklendi (İngiliz Dili ·
Mütercim-Tercümanlık · Sınav hazırlık · Genel öğrenci · Çalışan). Öneri listesi
dört alanla sınırlı olduğu için ilk dördünde `iletisim` çıkarıldı; öbek fiiller
o kitle için daha temel.

Yeni dosya eklendi: `sync:sw` **94 dosya**, `CACHE_VERSION` v14 → **v15**.
`npm test` 54/54 · `validate` · `sync:check` · `sync:sw:check` sıfır uyarı.
Tarayıcı testi yine yapılamadı (Chrome eklentisi bağlı değil).

### 2026-08-01 — Öbek Fiiller parti 2

`phrasal-verbs` **50 → 100 kart**, korpus **3099 → 3149**. Dört kategori daha,
yine edata göre. PHaVE sıklık sırasının 18–130 aralığından seçildi.

**Bu partide eleme, tekrar taramasından çok "zaten öğretiliyor mu" sorusuyla
yapıldı.** Korpusta öbek fiiller uzun süredir *nesneleriyle birlikte* öğretiliyor
(`run out of time`, `put on makeup`, `turn off the light`, `keep up with the
class`, `hang out with friends`). Doğrulayıcı bunları tekrar saymaz — metinler
farklı — ama öğrenci için aynı şeydir. Ölçüt şu oldu: **PHaVE'in baskın anlamı
mevcut kartın öğrettiği anlamla aynı mı?**

| Aday | Korpustaki karşılığı | Karar |
|---|---|---|
| `keep up` | `egitim-083 keep up with the class` | atıldı (aynı anlam) |
| `run out` | `ev-doga-082 run out of something` | atıldı |
| `put on` | `gunluk-rutin-034 put on makeup` (+5 kart) | atıldı |
| `hang up` | `iletisim-002 hang up the phone` | atıldı |
| `hold back` | `iliskiler-064 hold back tears` | atıldı |
| **`turn up`** | `medya-eglence-013 turn up the volume` | **yazıldı** — baskın anlam "ortaya çıkmak" (%48), ses açma ikincil |
| **`turn down`** | `medya-eglence-014 turn down the volume` | **yazıldı** — baskın anlam "reddetmek" (%82,5) |
| **`back up`** | `is-hayati-050 back up data`, `akademik-015 back up a claim` | **yazıldı** — baskın anlam "geri geri gitmek" (%26) |
| **`go through`** | `seyahat-004 go through security` | **yazıldı** — baskın anlam "zor bir şey yaşamak" (%61) |
| **`show up`** | `saglik-bilimleri-017 show up on the scan` | **yazıldı** — baskın anlam "bir buluşmaya gelmek" (%81) |

Toplam 14 aday atıldı, yerlerine listede daha aşağıdakiler alındı. Atılan
kartların yerine gelenler arasında **akademik söylem işlevi taşıyanlar** öne
çıktı ve bu bir kazanç oldu: `sum up` (fn:define + fn:argue), `stand out`
(fn:compare), `lay out` (fn:define), `bring out` (fn:argue), `step back`
(fn:argue), `break out` (fn:time), `bring down` (fn:change). Öbek fiil alanı
böylece yalnız günlük dil değil, akademik metnin de bir parçası oluyor.

Ulaşım: ortalama **31,4/50**, sıfır alan bölüm yok, en yüksek öğretmenlik 43.
İktisat (4), felsefe (6), matematik (7) düşük — bilinen `ctx:` sınırı, TODO'da.

`CACHE_VERSION` v15 → v16. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-01 — Öbek Fiiller TAMAMLANDI (parti 3): PHaVE listesi bitti

`phrasal-verbs` **100 → 124 kart**, korpus **3149 → 3173**. İki kategori:
Süreç ve sonuç bildirenler 12 · Verme, alma ve yerine koyma 12.

**PHaVE'in 150 öbek fiilinin tamamı işlendi.** Kapanış muhasebesi:

| | Sayı |
|---|---|
| PHaVE listesi | 150 |
| Korpusta zaten tam karşılığı vardı | −9 |
| Baskın anlamı korpusta zaten öğretiliyordu | −17 |
| **Yazılan kart** | **124** |

124 ≠ 141 çünkü aradaki 17, doğrulayıcının göremediği ama öğrenci için
gerçek olan tekrarlardı (`keep up with the class`, `run out of time`,
`hang up the phone`, `sort out the paperwork`, `follow up on an email`…).

**Bu parti bir kalıbı tersine çevirdi.** İlk iki partide ölçüt "baskın anlam
zaten öğretiliyorsa yazma" idi. Burada tam tersi bir fırsat çıktı: baskın
anlamı zaten öğretilen bazı fiillerin **ikinci anlamı** hiç öğretilmiyordu ve
o anlam Türkçe konuşan için daha da görünmez:

| Kart | Korpustaki (baskın) anlam | Bu partide yazılan (ikincil) anlam |
|---|---|---|
| `pay off` | `finans-para-006 pay off a debt` | **meyvesini vermek** |
| `keep up` | `egitim-083 keep up with the class` | **sürdürmek** ("keep up the good work") |
| `build up` | `fen-muhendislik-160 build up charge` | **kurmak, geliştirmek** (itibar, iş) |
| `hold back` | `iliskiler-064 hold back tears` | **bilgi saklamak** |
| `go around` | `seyahat-065 go around the block` | **herkese yetmek** |

İkinci anlam kartlarında `tr` alanı ilk anlamın nerede olduğunu **açıkça
söylüyor**: *"meyvesini vermek, işe yaramak (borç ödemek anlamı ayrı kartta)"*.
Aksi hâlde kullanıcı iki kartı çelişki sanırdı.

Akademik değeri yüksek olanlar bu partide de öne çıktı: `come about`
(fn:cause — "nasıl meydana geldi"), `set down` (fn:define), `take in`
(fn:define), `take down` (fn:method), `play out`, `set about`.

`CACHE_VERSION` v16 → v17. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-01 — AWL denetimi ve tek sözcük katmanı: Akademik Çekirdek 300'e ulaştı

Eşdizim (ACL) ve öbek fiil (PHaVE) katmanları kurulunca geriye bir soru kaldı:
**tek sözcük düzeyinde durum ne?** Ölçüt olarak **Academic Word List** seçildi
(Coxhead 2000; 570 sözcük ailesi, akademik metnin ~%10'u). Bir sözcüğün
"öğretiliyor" sayılması için kartın `en` alanında geçmesi arandı — yalnız örnek
cümlede geçmek öğretmek değildir.

**Sonuç ikiye ayrıldı ve ikisi de bilgi verdi:**

| AWL dilimi | Kart metninde | Yalnız örnek cümlede | Hiç yok |
|---|---|---|---|
| Alt liste 1–2 (en sık 120) | **99** | 9 | 12 |
| Alt liste 4–6 (180) | 115 | 14 | **51** |

Yani korpus en sık akademik sözcükleri zaten kapsıyordu (%83) — eşdizim
ilkesiyle yazılan kartlar bu sözcükleri kendiliğinden getirmiş. Boşluk
**orta sıklıkta** ve tam da soyut akademik sözcüklerde: `hence`, `furthermore`,
`nevertheless`, `facilitate`, `inhibit`, `entity`, `notion`, `discrete`,
`explicit`. Bunlar eşdizim olarak kolay kolay yakalanmaz çünkü sabit bir
eşdizimleri yok — her yerde geçerler.

`genel-akademik` **250 → 300 kart** (4 kategori: bağlaç/kesinlik 12 ·
araştırma-yöntem 13 · kavram-yapı 13 · eylem-etki 12). Korpus **3173 → 3223**.
Alan böylece bölümsel demetlerle aynı büyüklüğe ulaştı.

**Seçimde iki eleme yapıldı.** (1) Alana özgü olanlar çekirdeğe alınmadı —
`medical`, `psychology`, `federal`, `liberal`, `ministry`, `estate`, `ethnic`
ilgili bölümsel alanın işi. (2) `overseas`, `ignorant`, `occupy` gibi düşük
getirili olanlar bırakıldı; 65 boşluktan 50'si yazıldı.

**Karıştırılan çiftler yine `tr` alanında ayrıldı** — bu partide üç tane çıktı
ve üçü de sınavda puan kaybettiren türden: `discrete` (ayrık) ≠ *discreet*
(ağzı sıkı), `principal` (başlıca) ≠ *principle* (ilke, korpusta zaten var),
`adequate` = "yeterli, o kadar" (iyi demek değil). `utilise` kartında ise
`use` ile **aynı anlama geldiği** yazıldı: öğrenci uzun sözcüğü daha akademik
sanıp gereksiz yere kullanıyor.

Ulaşım: ortalama **25,1/50**, en düşük 15, sıfır alan bölüm yok.

`CACHE_VERSION` v17 → v18. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-02 — AWL parti 2: Akademik Çekirdek 350'ye ulaştı

AWL denetimi kalan alt listelere genişletildi (3, 7, 8 — 174 sözcük):
**kart metninde 96 · yalnız örnek cümlede 16 · hiç yok 62.** Alt liste 1–2'deki
%83'lük kapsama burada %55'e düşüyor; eğilim parti 1'de görülenle aynı ve
sebebi de aynı: eşdizim ilkesiyle yazılan kartlar **sabit eşdizimi olan**
sözcükleri getiriyor, `phenomenon` · `criteria` · `thereby` · `arbitrary` gibi
her yerde geçen soyut sözcükleri getirmiyor.

78 boşluktan 50'si yazıldı. `genel-akademik` **300 → 350 kart**, korpus
**3223 → 3273**. Dört kategori: sav kurma ve gösterme 13 · ölçüt, sınır ve
kapsam 13 · olgu, süreç ve sonuç 12 · uygulama, araç ve kurum 12.

**Bu partide tuzak sözcükler ağır bastı** ve hepsi `tr` alanında açıkça
uyarıya çevrildi — Türkçe konuşan öğrencinin sistematik olarak yanlış
kullandığı sözcükler:

| Kart | Tuzak |
|---|---|
| `criteria` | çoğuldur; tekili `criterion`, **`criterias` diye bir sözcük yok** |
| `eventual` | "olası" DEĞİL — "sonunda ortaya çıkan" |
| `unique` | "biraz farklı" değil, **tek** |
| `implicit` | `explicit`in karşıtı: örtük |
| `ensure` | `insure` (sigortalamak) ile karışır |
| `phenomenon` | çoğulu `phenomena` |
| `random` | yöntemsel bir seçim; "gelişigüzel" ile aynı şey değil |

Ulaşım: ortalama **23,1/50**, en düşük 12, sıfır alan bölüm yok.

**AWL denetimi böylece 474 sözcükte tamamlandı** (alt liste 1–8). Kalan
alt liste 9–10 (~96 sözcük) ve bu iki partide bilerek atlanan ~40 aday
TODO'da duruyor.

`CACHE_VERSION` v18 → v19. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-02 — AWL denetimi TAMAMLANDI (parti 3): Akademik Çekirdek 400 kart

Son alt listeler (9–10, 81 sözcük) tarandı ve kapsama uçurumu netleşti:
**kart metninde yalnız 28, hiç yok 51.** Alt liste 1–2'de %83 olan kapsama
burada **%35'e** düşüyor. Beklenen bir sonuç — bu sözcükler daha seyrek — ama
öğrenci için tersi geçerli: `albeit`, `whereby`, `notwithstanding`,
`nonetheless` bir makalede karşısına çıktığında cümleyi tamamen kilitleyen
sözcükler.

53 boşluktan 50'si yazıldı. `genel-akademik` **350 → 400 kart**, korpus
**3273 → 3323**. Dört kategori: yazı dilinin bağlaçları 12 · süre, sıra ve
değişim 13 · uyum, ölçü ve düzen 13 · tutum, kurum ve karşılaşma 12.

**Kapanış ölçümü — AWL'nin tamamı (10 alt liste, 555 kök sözcük):**

| | Sayı | Oran |
|---|---|---|
| Kart metninde öğretiliyor | **486** | %88 |
| Yalnız örnek cümlede geçiyor | 29 | %5 |
| Hiç yok | 40 | %7 |

Bu oturumun başında bu sayı ~%61 idi (üç parti, 150 kart). Kalan 40 sözcük
bilinçli olarak bırakıldı: alana özgü olanlar (`medical`, `federal`,
`ministry`, `ideology`) ilgili bölümsel alanın işi, düşük getirili olanlar
(`overseas`, `ignorant`, `levy`) çekirdeği şişirirdi.

**Register notu bu partide bir kart türü hâline geldi.** Bu sözcüklerin çoğu
"aynı anlamın resmî hâli"; öğrenci farkı bilmezse ya konuşurken kitap gibi
konuşur ya da makalede günlük dil kullanır. `tr` alanı bunu söylüyor:
`commence` = "başlamak (resmî; konuşmada 'start' denir)", `albeit` =
"gerçi ('although' yerine kısa yol; ardından cümle gelmez)",
`notwithstanding` = "buna rağmen (çok resmî; hukuk ve yönetmelik dilinde sık)".
`assure` / `ensure` ayrımı da kartta duruyor.

Ulaşım: ortalama **18,4/50** — önceki partilerden düşük ve bu **beklenen**:
bu sözcükler ağırlıkla `ctx:paper` ve `ctx:textbook` sözcükleri, laboratuvar
ya da uygulama ortamında geçmiyorlar. Sıfır alan bölüm yok; en düşük
fizyoterapi 8.

`CACHE_VERSION` v19 → v20. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-02 — Anlam Kayması parti 2: hukuk ve beşeri bilimler

TODO'da duran boşluk kapatıldı. `anlam-kaymasi` **50 → 100 kart**, korpus
**3323 → 3373**. Mevcut 50 kart fen ve mühendislik ağırlıklıydı; Hukuk demeti
bunlardan yalnız 1 kart alıyordu. Dört yeni kategori: Hukuk 13 · Edebiyat ve
Dilbilim 13 · Tarih ve Felsefe 12 · Toplum ve İktisat 12.

Bu alanın ilkesi, sözcüğün **günlük anlamını bildiği hâlde** metinde
anlamayacak olan öğrenciyi hedeflemek. Bu partide en keskin örnekler:
`consideration` = ivaz (düşünme değil) · `damages` = tazminat (zararlar değil,
ve hep çoğul) · `a party` = taraf · `execution` = imzalanma · `serve` = tebliğ
etmek · `voice` = çatı · `tense` = zaman kipi · `a foot` = şiirde ölçü birimi ·
`substance` = töz · `an accident` = ilinek · `sound` = sağlam (mantıkta) ·
`agency` = eyleyicilik · `rent` = rant · `interest` = faiz ·
`a sanction` = hem yaptırım hem onay (kendi karşıtını içeren sözcük).

**Doğrulayıcı dört gerçek hata yakaladı** ve bu, tekrar denetiminin proje
geneline taşınmış olmasının işe yaradığını gösterdi: `court`, `revolution`,
`capital`, `labour` — dördü de **Temel Terimler** kategorilerinde zaten vardı
(sosyal-bilimler, beşeri-bilimler). `type:polysemy` muafiyeti burada işlemez,
çünkü muafiyet iki kartın da polysemy olmasını ister; oradakiler düz terim
kartı. Yerlerine `a charter` · `a discipline` · `equity` · `a firm` yazıldı.

**Yakalanan demet kusuru — `fn:define` 21 demette eksikti.** Ulaşım ölçülünce
yeni partinin **21 demete hiç ulaşmadığı** görüldü. Sebep yapısaldı: bir anlam
kayması kartı doğası gereği **tanımlayıcıdır** ("bu alanda bu sözcük şu demek"),
yani `fn:define` taşır. Oysa 38 demetin 21'inde bu etiket yoktu — İşletme
öğrencisi `capital`, `equity`, `goods` kartlarının hiçbirini göremiyordu.
`fn:define` de tıpkı `ctx:lecture` ve `ctx:exam` gibi **ayırt edici değildir**:
her disiplin kendi terimlerini tanımlar. 20 öğrenci demetine eklendi ve bu
`tags.json` açıklamasına yazıldı. Havuz etkisi ölçüldü: demet başına ~120 kart
(%20–25 büyüme), hepsi kendi alanının tanım kartları.

İkinci düzeltme: mevcut 50 kartın yalnız 5'i `ctx:textbook` taşıyordu. Oysa
bir sözcüğün alana özgü anlamı tam olarak **ders kitabında** öğrenilir;
45 karta eklendi.

| | Önce | Sonra |
|---|---|---|
| Sıfır alan demet (alan geneli) | 2 | **0** |
| İşletme | 0 | 9 |
| Öğretmenlik | 0 | 4 |
| Alan geneli ortalama | 17,6 | **25,1** |

Öğretmenlik 4'te kaldı — bu alan tanımı gereği disipline özgü; eğitim
öğrencisinin `consideration`'ın hukuki anlamına ihtiyacı yok.

`CACHE_VERSION` v20 → v21. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-02 — Öğretmenin sınıftaki dili + yeni eksen değeri `dom:education`

TODO'daki en eski içerik boşluğu kapandı: **Öğretmenlik, 38 bölüm arasında en az
kart alan demetti (93).** Ölçüm sebebi gösterdi — `egitim` alanının 87 kartının
tamamı **öğrenci tarafındaydı** (`attend class`, `take an exam`,
`do homework`). Öğretmenin kendi dili korpusta hiç yoktu.

`egitim` **87 → 137 kart**, korpus **3373 → 3423**. Dört kategori: Sınıfta
Yönerge Verme 13 · Sınıf Yönetimi 12 · Değerlendirme ve Geri Bildirim 13 ·
Veli Görüşmesi ve Okul Hayatı 12.

Kaynak uydurulmadı: sınıf dili envanteri **Cambridge / Helbling "MORE!"
Teacher's Book** sınıf dili ekinden alındı (yönerge, sınıf yönetimi, eşli
çalışma, oyun, geri bildirim başlıkları). Buradan kartlaştırılanlar
`hand out the worksheets` · `pass them on` · `work in pairs` ·
`get into groups` · `repeat after me` · `keep the noise down` ·
`go over the answers` gibi gerçek sınıf cümleleri.

**İki İngiliz/Amerikan farkı kartın kendisine yazıldı**, çünkü öğretmen
adayının en çok karşılaşacağı ikilem bu: `mark an essay` = ödev okuyup
puanlamak (İngiltere; ABD'de `grade`), `sit the exam` = sınava girmek
(İngiltere kullanımı). `set homework` kartında ise perspektif farkı duruyor:
öğretmen **verir**, öğrenci **yapar** (`do homework`, `egitim-014`).

**Yeni eksen değeri: `dom:education`.** Parti yazıldıktan sonra ölçüm bir kusur
gösterdi — 50 kartın **44'ü elektrik-elektronik demetine** de gidiyordu.
Sebep, mimarinin kendi kuralının ters yönde işlemesiydi: `dom:` taşımayan kart
nötrdür ve herkese gider. Bu, akademik çekirdek için doğru; "bahçe nöbeti
tutmak" için değil. `tags.json`'a **on dördüncü `dom:` değeri** eklendi ve
sınırı açıklamasına yazıldı: öğretmenin sınıftaki dili `dom:education`
taşır, **öğrenci tarafındaki okul dili taşımaz** — o herkesin ortak dilidir
ve nötr kalmalıdır. Mevcut 87 öğrenci kartına dokunulmadı.

Etiket eklenince `ogretmenlik` demetinde ikinci bir kusur ortaya çıktı:
demet `fn:measure` taşımıyordu, oysa **not vermek, puan kırmak, ilerlemeyi
değerlendirmek** öğretmenliğin merkezinde. Eklendi.

| | Önce | Sonra |
|---|---|---|
| Yeni partiden öğretmenliğe ulaşan | — | **46/50** |
| Yeni partiden elektrik-elektroniğe | 44 | **0** |
| Öğretmenlik toplam havuzu | 309 | **534** |

`CACHE_VERSION` v21 → v22. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-02 — ACL parti 3: sıklık sırasının 381–500 aralığı

`genel-akademik` **400 → 450 kart**, korpus **3423 → 3473**. Dört kategori:
Kanıtın gücü ve olasılık 13 · Çalışma türleri ve süreçler 13 · Artış, önem ve
nitelik 12 · Toplum, hukuk ve tarih bağlamı 12.

**Eleme oranı bu partide en yükseğe çıktı: 72 adayın 60'ı boştaydı ama yalnız
27'si yazılmaya değer bulundu.** Kalan 23 kart, daha önceki partilerin
yazılmayan artıklarından tamamlandı. Sebep ACL'de aşağı indikçe artan
doygunluk: `obtain a result` (≈ `obtain results`), `create an opportunity`
(≈ `offer an opportunity`), `a high proportion of` (≈ `a large proportion of`),
`make an impact` (≈ `have an impact on`), `a theoretical framework`
(≈ `a conceptual framework`), `further study` (≈ `further research`),
`previous work` (≈ `a previous study`), `a crucial factor` (≈ `a key factor`).
Doğrulayıcı bunların hiçbirini görmezdi.

**Bu, ACL taramasının doğal bitiş noktasına yaklaştığını gösteriyor.** İlk
200'de boşluk oranı %86 idi, 201–380'de %83, 381–500'de yine yüksek ama
**yazılabilirlik** oranı %86 → %54 → %38'e düştü. Listede aşağı inmek artık
yeni çerçeve değil, aynı çerçevenin yeni doldurmalarını getiriyor.

Yazılanlar arasında öne çıkanlar iddia dili (`seem unlikely`,
`have a tendency to`, `explanatory power`, `a stark contrast`), çalışma
türleri (`a comparative analysis`, `a critical essay`, `conduct an interview`,
`a longitudinal study` zaten vardı) ve hukuk-tarih bağlamı (`due process`,
`natural law`, `a legal framework`, `historical context`).

Ulaşım: ortalama **32,6/50** — bu oturumun en yüksek ortalaması, sıfır alan
bölüm yok. Sebebi partinin bilinçli olarak bölümden bağımsız seçilmiş olması.

`CACHE_VERSION` v22 → v23. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-02 — Eski çekirdek kartların ortam etiketleri düzeltildi (kart eklenmedi)

TODO'da duran ölçüm gerçekleşti. `genel-akademik`in **ilk 150 kartı** (mimarinin
kurulduğu 2026-07-30 partisi) neredeyse yalnız `ctx:paper` taşıyordu: 128 kart
`ctx:paper`, yalnız 16'sı `ctx:lecture`, 3'ü `ctx:textbook`. Sonuç, makale
bağlamı sorgulamayan demetlerin çekirdeği neredeyse hiç görmemesiydi.

Bu partide **tek bir kart yazılmadı**; 128 kartın ortam etiketi tamamlandı.
Gerekçe kartların kendisinde: `account for` · `whereas` · `subsequently` ·
`be defined as` · `refute` akademik **söylemin** dilidir, makaleye özgü değil.
Aynı sözcükler ders anlatımında da, ders kitabında da geçer. Ayrım eksenini
çekirdek için `ctx:` değil **`fn:`** taşır — `ctx:`i dar tutmak ayrım
sağlamıyor, yalnız kartı gizliyordu.

| Demet | Önce | Sonra |
|---|---|---|
| Öğretmenlik | 37/150 | **90** |
| Fizyoterapi | 24/150 | **74** |
| Diş Hekimliği | 43/150 | **72** |
| Genel öğrenci | 17/150 | **68** |
| Güzel Sanatlar | 23/150 | **64** |
| Hemşirelik | 24/150 | **62** |
| İç Mimarlık | 17/150 | **49** |
| Hukuk | 115/150 | 115 (değişmedi) |
| Çalışan | 12/150 | 12 (değişmedi — akademik ortam sorgulamıyor, doğru) |

Kart metinleri, id'leri ve `fn:` etiketleri **hiç değişmedi**; `de_srs_v1`
etkilenmiyor. Bu düzeltme 2026-08-01'de ACL parti 1'de yeni kartlar için
yapılan işin eski kartlara uygulanmasıdır.

`CACHE_VERSION` v23 → v24. `npm test` 54/54 · `validate` sıfır uyarı.

### 2026-08-02 — Yeni alan: Sanat ve Kültür (ölçüm partiyi 50'den 38'e indirdi)

Havuz ölçümü yeni en dar bölümü gösterdi: **İç Mimarlık 366 kart** (ortalama
~900). Ayrılmış `sanat-kultur` alanı bu boşluk için açıldı.

**Ama parti yazıldıktan sonra doğrulayıcı yedi tekrar yakaladı** ve bu, alanın
ilk tasarımının yanlış olduğunu gösterdi: `beseri-bilimler` zaten **50 kartlık
bir "Sanat ve Estetik" kategorisi** taşıyordu (`curate an exhibition`,
`restore a painting`, `a focal point`, `let in natural light`, `perform live`,
`play by ear`, `a stage direction`). Görsel sanat ve galeri dili yazılmış
durumdaydı; benim "Görsel Sanatlar ve Atölye" kategorim büyük ölçüde onun
tekrarıydı.

**Alan 50 karttan 38'e indirildi** ve yalnızca çakışmayan üç kategoriye
odaklandı: Tasarım ve Mekân 13 · Sahne ve Prova 13 · Film, Ses ve Müzik 12.
Bunlar `beseri-bilimler`in kapsamadığı üretim dilidir — o alan sanat *eserini*
konuşur, bu alan **stüdyoyu, provayı ve seti** konuşur:
`draw up a floor plan` · `zone the room` · `the proportions work` ·
`block a scene` · `cue the lights` · `strike the set` · `do another take` ·
`cut to a close-up` · `play in tune`. Korpus **3473 → 3511**, 26 → 27 alan.

Kart sayısını 50'ye tamamlamak için zorlamak, doğrulayıcının yeni yakaladığı
tekrarları elle geri koymak olurdu. **Ölçüm partinin boyutunu belirledi.**

**Yeni eksen değeri: `dom:art`** (`tags.json`, on beşinci `dom:`). Sanat ve
tasarım dili şimdiye kadar `dom:literature` ve `dom:architecture` arasına
sıkışmıştı; "fırça darbesi"ni edebiyat etiketiyle taşımak yanlıştı. Sınırı
açıklamaya yazıldı: mekân ve yapı `dom:architecture` ile birlikte gelir,
metin çözümlemesi `dom:literature`a aittir. Üç demete eklendi (Güzel Sanatlar,
İç Mimarlık, Mimarlık).

**Yakalanan demet kusuru.** İlk ölçümde İç Mimarlık 38 kartın 11'ini,
Güzel Sanatlar 7'sini alıyordu — kendi alanları olduğu hâlde. Sebep: iki
demette de **`fn:method` yoktu.** Oysa plan çizmek, prova etmek, sahne çekmek
bu disiplinlerde yan beceri değil **işin kendisidir** — 2026-07-31'de
matematik ve istatistik için verilen kararın aynısı. Eklendi:

| Demet | Önce | Sonra | Toplam havuz |
|---|---|---|---|
| İç Mimarlık | 11/38 | **32** | 366 → **588** |
| Güzel Sanatlar | 7/38 | **28** | → 919 |
| Mimarlık | 32/38 | 32 | → 785 |

Yeni dosya: `sync:sw` **95 dosya**, `CACHE_VERSION` v24 → **v25**.
`npm test` 54/54 · `validate` · `sync:check` · `sync:sw:check` sıfır uyarı.

### 2026-08-02 — Formül okuma katmanı (en dar bölüm: Matematik)

Havuz ölçümü yeni en dar bölümü verdi: **Matematik 405 kart** (ortalama 856).
Demet tanımı kusursuzdu — yedi `fn:` değeri taşıyor — yani eksik olan
**içerikti**.

Aranan boşluk şu soruyla bulundu: *öğrenci bir formülü İngilizce sesli
okuyabiliyor mu?* Korpusta bu katmandan yalnız **beş kart** vardı
(`round to two decimal places`, `integrate with respect to`,
`raise to the power of`, `take the square root`, `to the nearest`).
Öğrenci `x²`yi görüyor ama "x squared" diyemiyor; `∑`yi tanıyor ama
"the sum from one to n" diyemiyor. Ders dinlerken ve sınavda konuşurken
tıkanılan yer tam burası ve hiçbir ders kitabı bunu öğretmiyor.

`fen-muhendislik` **350 → 400 kart**, korpus **3511 → 3561**. İki kategori:
**Sayı ve İşlem Okuma 25** · **Simge ve Formül Okuma 25**.

Kartlarda üç tuzak açıkça yazıldı:
- `zero point five` — İngilizcede ondalık ayırıcı **nokta** okunur, virgül değil
- `subtract A from B` — sıralama Türkçenin tersi ("B'den A'yı çıkar")
- `f prime of x` — `f'(x)` "f üssü" değil "f prime" diye okunur

Doğrulayıcı üç tekrar yakaladı (`coefficient`, `exponent`, `remainder` —
üçü de aynı alanın **Temel Terimler** kategorisinde vardı); yerlerine
`carry the one`, `a common factor`, `to the power of n` yazıldı. Terim
kartı ile okuma kartı arasındaki sınırın ne kadar ince olduğunu gösteriyor:
`exponent` terimdir, `to the power of n` onun **okunuşudur**.

Ulaşım: **Matematik, İstatistik ve Endüstri 50/50**, Elektrik-Elektronik ·
Makine · Bilgisayar 39/50. Matematik havuzu **405 → 455**.

`CACHE_VERSION` v25 → v26. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-02 — Yazılmayan parti: İktisat'ın sorunu içerik değil demetti

Sıradaki en dar bölüm İktisat'tı (473 kart) ve rehberde `ekonomi` alanının
24 kartla "hâlâ sığ" olduğu yazıyordu. 50 kartlık bir parti yazıldı —
makro göstergeler, piyasa ve fiyat, kredi ve risk, çalışma ve örgüt.

**Doğrulayıcı 11 tekrar yakaladı ve parti çöpe gitti.** Sekizi
`sosyal-bilimler` ile (`the economy contracts`, `tighten monetary policy`,
`a price ceiling`, `a bubble bursts`, `service a debt`, `default on a loan`),
üçü `is-hayati` ve `finans-para` ile çakışıyordu. Ölçüm sebebi gösterdi:

| Alan | `dom:economics` kartı |
|---|---|
| `sosyal-bilimler` | **146** |
| `ekonomi` | 24 |
| `anlam-kaymasi` | 11 |

İktisat dili zaten yazılmıştı — Aşama 4-C'nin sosyal bilimler demetinde.
`ekonomi` alanının "sığ" görünmesi yanıltıcıydı: o bir *meslek* alanı,
bölümün dil havuzu değil.

**Gerçek sebep demetteydi.** `iktisat` demeti `fn:measure` ve `fn:method`
taşımıyordu. Oysa iktisat büyümeyi **ölçer**, model **kurar**; bu iki eksen
olmadan `sosyal-bilimler`in 146 iktisat kartının yalnız bir kısmı görünüyordu.
İkisi eklendi:

| | Önce | Sonra |
|---|---|---|
| İktisat havuzu | 473 | **676** |
| İşletme havuzu | 547 | **706** |

**Tek kart yazılmadan 203 kart görünür oldu.** Parti geri alındı
(`git checkout`), yalnız demet düzeltmesi kaldı.

Bu, oturumun üçüncü kez aynı dersi vermesi: *önce ölç, sonra yaz.* Sanat
partisi 50'den 38'e indi, bu parti sıfıra. Doğrulayıcının proje geneli tekrar
denetimi olmasaydı üçü de sessizce korpusa girerdi.

Oturum sonu havuz dağılımı: ortalama **873**, en düşük Matematik 455
(ortalamanın %52'si; oturum başında bu oran %41 idi).

`presets.json` da önbellek listesinde olduğu için `CACHE_VERSION` v26 → **v27**;
aksi hâlde çevrimdışı kullanıcı eski demetle kalırdı. `npm test` 54/54 ·
`validate` sıfır uyarı.

### 2026-08-02 — Demet denetimi: `ctx:textbook` 36 demette eksikti

İktisat dersi bütün demetlere uygulandı: kart yazmadan önce demet tanımına
bakıldı. İki tür kusur çıktı.

**1. `ctx:textbook` 38 demetin 36'sında yoktu.** Bu, `fn:define` ve
`ctx:lecture` ile aynı tür bir hata: **ders kitabı ayırt edici değildir**,
her öğrenci ders kitabı okur. Etiket eksik olduğu için "tanım ve açıklama
diliyle" yazılmış kartlar — çekirdeğin ve terim kategorilerinin büyük bölümü —
o demetlere hiç ulaşmıyordu. 35 öğrenci demetine eklendi (`calisan` hariç:
o öğrenci değil) ve `tags.json` açıklamasına yazıldı.

**2. Yedi demette disipline özgü bir eksen eksikti.** Her biri ayrı ayrı
gerekçelendirildi, "her ihtimale karşı geniş tut" diye eklenmedi:

| Demet | Eklenen | Gerekçe |
|---|---|---|
| Tarih | `fn:hedge` · `fn:method` | Tarihçi sürekli çekimser yazar ("kaynaklar ... olduğunu düşündürüyor") ve kaynak eleştirisi bir yöntemdir |
| Felsefe | `fn:cause` | Nedensellik felsefenin konusudur, yan bir beceri değil |
| Biyoloji | `fn:change` · `fn:measure` | Büyüme, evrim, mutasyon değişimdir; deney ölçümle yürür |
| Matematik | `fn:change` | Türev **değişim oranıdır** |
| İstatistik | `fn:change` | Zaman serisi ve eğilim |
| İngiliz Dili | `fn:time` | Anlatı zamanı ve olay örgüsü sırası |
| Psikoloji | `fn:change` · `fn:quantity` | Gelişim ve ölçek puanları |

**Oturum boyunca havuz dağılımının değişimi** (kart sayısı 2949 → 3561,
%21 arttı; havuz ortalaması bundan çok daha fazla arttı çünkü asıl darboğaz
etiketlemeydi):

| | Oturum başı | Oturum sonu |
|---|---|---|
| Havuz ortalaması | ~700 | **890** |
| En dar bölüm | İç Mimarlık 366 | **Matematik 489** |
| En dar / ortalama | %41 | **%55** |

`CACHE_VERSION` v27 → v28. `npm test` 54/54 · `validate` · `sync:check` ·
`sync:sw:check` sıfır uyarı.

### 2026-08-02 — Yeni alan: Araba ve Sürüş

Akademik katman doygunluğa ulaşınca ölçüm günlük hayata çevrildi ve **gerçek
bir boşluk** çıktı: sürüş ve araç dili korpusta yoktu. Tarama 3561 kartta
yalnız **12 dolaylı** eşleşme buldu (`drive to work`, `get stuck in traffic`,
`parallel park`) — hepsi başka alanların yan ürünü. Direksiyon, trafik kuralı,
arıza ve kiralama dili hiç yazılmamıştı.

Bu, yurt dışına giden kullanıcı için somut bir eksik: araç kiralamak, yol
yardımı çağırmak, polisin "pull over" demesini anlamak ders kitabı konusu
değil ama ilk hafta gereken dil.

`araba-surus` — "Araba ve Sürüş", 🚗, `#3B82F6`, **50 kart**, dört kategori:
Direksiyonda 13 · Yolda ve Trafikte 13 · Bakım ve Arıza 12 · Belge, Kural ve
Kiralama 12. Korpus **3561 → 3611**, 27 → 28 alan.

Doğrulayıcı iki tekrar yakaladı (`follow the signs`, `pull over` — ikisi de
`seyahat` alanında vardı); yerlerine `miss the turning` ve `flag down a car`
yazıldı. Bir İngiliz/Amerikan farkı karta yazıldı: `hire a car` (İngiltere),
ABD'de `rent a car`.

Kartlar `ctx:everyday` ve `ctx:practice` taşıyor; `fn:` muafiyeti geçerli
(bunlar somut eylemler, akademik söylem işlevi taşımazlar). Alan bölüm
demetlerine gitmiyor — **doğru sonuç**, bu bir yaşam alanı, disiplin değil;
kullanıcıya alan önerisi ve kendi seçimi üzerinden ulaşır.

Yeni dosya: `sync:sw` **96 dosya**, `CACHE_VERSION` v28 → **v29**.
`npm test` 54/54 · `validate` · `sync:check` · `sync:sw:check` sıfır uyarı.

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
├── tests/                      # ★ node --test (npm test) — bağımlılıksız birim testleri
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
    │   ├── fields/             # fields.json (manifest) + 26 alan dosyası
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
        │   ├── field-suggest.js# ★ "Bölümüne uygun N kart daha var" hesabı
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
| **Alan listesi kullanıcı adına değiştirilmez** | Yeni yazılan alanlar herkesin ilgi listesine sessizce eklenebilirdi; bu, kullanıcının seçimini onun adına değiştirmek olurdu. Bunun yerine anasayfada "bölümüne uygun N kart daha var" denir, karar ona bırakılır. Sayı tahmin edilmez: aday alanlar arka planda indirilip sayılır ve hesap bitmeden çağrı hiç çizilmez. Alan başına 10 kart eşiği var — 1 kart için listeye satır eklemek kalabalıktır. |
| **Kart listesi korpus kaynağına dayandırılır** | Terim listeleri standart sözlüklere (2026-08-01), akademik eşdizimler **Academic Collocation List**'e (Ackermann & Chen 2013) dayanır. Gerekçe ölçülebilir: ACL'in en sık 200 eşdizimi 2949 kartlık korpusa tarandığında %86'sının eksik olduğu çıktı — kendi muhakememiz işlev sözcüklerini bulmuş, en sık sıfat+isim katmanını görmemişti. Kaynak, kör noktayı sayıya çeviriyor. Kaynak listeyi **kopyalamak** yine de yasak: konuya özgü bileşikler çekirdeğe alınmaz, eşik altı örtüşenler elle elenir. |
| **Çekirdek kart yalnız `ctx:paper` taşımaz** | Akademik çekirdeğin varlık sebebi 38 bölüme birden hizmet etmek. Yalnız makale bağlamıyla etiketlenen kart, makale sorgulamayan demetlerin (öğretmenlik, hemşirelik, iç mimarlık, genel öğrenci) gözünde yok hükmündedir — ACL partisinde ölçüldü: 50 kartın 1'i görünüyordu. `ctx:` eksenini kartın gerçekten geçtiği bütün ortamlarla doldurmak, `dom:` yokluğunun sağladığı nötrlüğü tamamlar. |
| **Elle yazılan etiket ezilmez** | İçerik partileri etiketlerini tek tek düşünerek taşıyor. `backfill-tags.mjs` dolu `tags` alanını atlar; ezmek için açıkça `--force` gerekir. |

---

## TODO / Bilinen Eksikler

- [ ] **`SPEC.md` yok.** Ürün gereksinimleri README ve PROGRESS arasında
      dağınık. Tek bir spesifikasyon dosyası yazılmalı; bu dosyanın üstündeki
      referans o zaman gerçek bir bağlantıya dönüşür.
- [x] ~~**Otomatik test yok.**~~ Kapandı (2026-08-01): `npm test` → 54 test,
      sıfır bağımlılık (`node --test`). `store/daily.js`, `store/progress.js`,
      `store/tags.js` ve `utils.js` kapsandı. Ekran katmanı hâlâ testsiz;
      oradaki eşzamanlılık hataları ancak tarayıcıda yakalanıyor.
- [ ] **Kalıp ve diyalog verisi doğrulanmıyor.** `tools/validate-data.mjs` yalnız
      `src/data/fields/`'a bakıyor. Kalıplarda id tekilliği/`register` geçerliliği,
      diyaloglarda `keyPhrases` referanslarının gerçekten var olması elle kontrol
      edildi; araca eklenmeli.

### Etiket mimarisinin kalan kısmı (2026-07-30)

- [ ] **Bölümsel terminoloji (Aşama 4-C) sürüyor.** Dört demet onaylandı
      (Mühendislik → Sağlık → Sosyal → Beşeri).
      - [x] ~~**Mühendislik demeti**~~ Kapandı (2026-08-01): `fen-muhendislik`
            **300 kart**, 6 parti, beş kategori × 60.
      - [x] ~~**Sağlık demeti**~~ Kapandı (2026-08-01): `saglik-bilimleri`
            **300 kart**, 6 parti, altı kategori × 50.
      - [x] ~~**Sosyal Bilimler demeti**~~ Kapandı (2026-08-01):
            `sosyal-bilimler` **300 kart**, 6 parti, altı kategori × 50.
      - [x] ~~**Beşeri Bilimler demeti**~~ Kapandı (2026-08-01):
            `beseri-bilimler` **300 kart**, 6 parti, altı kategori × 50.
      - **AŞAMA 4-C BİTTİ.** Dört demet, 24 parti, 1200 kart. Kapanış
            tablosu ve çıkarılan dersler için o tarihli girişe bak.
- [x] ~~**Öğretmenlik en az kart alan bölüm (93).**~~ Kapandı (2026-08-02):
      `egitim` 137 kart, dört yeni kategori öğretmenin sınıftaki dili.
      Yeni eksen değeri `dom:education` eklendi. Havuz 309 → 534.
- [x] ~~**Mevcut 150 çekirdek kart `ctx:paper` ağırlıklı.**~~ Kapandı
      (2026-08-02): 128 kartın ortam etiketi tamamlandı, kart yazılmadı.
      Öğretmenlik 37 → 90, genel öğrenci 17 → 68. Ayrıntı için o tarihli
      girişe bak.
- [x] ~~**AWL denetimi**~~ Kapandı (2026-08-02): 10 alt listenin tamamı
      tarandı (555 kök sözcük), üç parti yazıldı (150 kart). Kapsama
      **%88** (486 sözcük kart metninde). Kalan 40 sözcük bilinçli olarak
      bırakıldı — alana özgü olanlar bölümsel alanların işi. Ölçüm betiği
      kartın `en` alanında geçme ölçütüyle çalışıyor ve yeniden
      koşturulabilir.
- [ ] **ACL taraması 500'e kadar yapıldı, doygunluğa yaklaştı.** Üç parti,
      150 kart. Yazılabilirlik oranı %86 → %54 → %38 düşüyor: listede aşağı
      inmek artık yeni çerçeve değil, aynı çerçevenin yeni doldurmalarını
      getiriyor (`a crucial factor` ≈ `a key factor`). 501–2469 aralığı hiç
      taranmadı ama **oradan kart yazmadan önce kazanç ölçülmeli**; muhtemelen
      daha verimli olan, mevcut kartların örnek cümlelerini zenginleştirmek.
      Kaynak: <https://www.eapfoundation.com/vocab/academic/acl/frequency/>
- [x] ~~**Öbek Fiiller alanı**~~ Kapandı (2026-08-01): `phrasal-verbs`
      **124 kart**, 3 parti, 10 kategori. PHaVE'in 150 fiilinin tamamı
      işlendi. Alanı büyütmek için sıradaki kaynak **Liu & Myers (2020)**,
      *Language Teaching Research* — akademik yazı ve konuşmaya özgü öbek
      fiil sıklıkları; PHaVE genel COCA'ya dayanıyor, o çalışma akademik
      alt korpusa bakıyor ve sıralama farklı çıkıyor.
- [ ] **`ctx:` ekseni genel katman alanları için dar.** Akademik çekirdek
      `dom:` taşımayarak nötr kalabiliyor, ama `ctx:` zorunlu olduğu için
      `phrasal-verbs` gibi bölümden bağımsız bir katman nötr kalamıyor:
      `ctx:everyday` verilince akademik demetler görmüyor, akademik ortam
      verilince `fn:` uydurmak gerekiyor. 2026-08-01'de felsefe 3/50,
      matematik 7/50'de kaldı. Çözüm seçenekleri: (a) `ctx:general` diye
      dördüncü bir nötr değer, (b) `matchesTagQuery`'de `ctx` eksenini de
      "yokluk = nötrlük" gibi ele alan bir istisna, (c) alan bazlı muafiyet.
      Karar verilmeden yeni alan açılmamalı.
- [x] ~~**Hukuk ve beşeri bilimler için anlam kayması partisi.**~~ Kapandı
      (2026-08-02): `anlam-kaymasi` **100 kart**, dört yeni kategori (hukuk,
      edebiyat-dilbilim, tarih-felsefe, toplum-iktisat). Yol boyunca
      `fn:define`'ın 21 demette eksik olduğu bulundu ve düzeltildi.
- [x] ~~**Meslek alanlarındaki CEFR ataması bozuk.**~~ Kapandı (2026-07-30):
      29 kart B2 → B1. Ayrıntı ve etkinin dürüst ölçüsü için o tarihli girişe bak.
- [x] ~~**Küçük veri temizliği.**~~ Kapandı (2026-07-30): tekrar eden kalıp ve
      6 zayıf örnek cümle düzeltildi. `npm run validate` artık sıfır uyarı veriyor.
- [x] ~~**Yeni alan, mevcut kullanıcıya kendiliğinden ulaşmıyor.**~~ Kapandı
      (2026-08-01): anasayfada öneri çağrısı (`store/field-suggest.js`) +
      37 demetin önerilen alanları güncellendi. Ayrıntı için o tarihli girişe bak.
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
