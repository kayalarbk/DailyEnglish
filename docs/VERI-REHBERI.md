# Veri Rehberi

Kelime verisi tamamen `src/data/fields/` altında yaşar ve uygulama bu klasörü
manifest üzerinden okur. **Yeni bir alan eklemek için JavaScript'e dokunmak
gerekmez** — dosyayı koy, `npm run sync && npm run validate` çalıştır.

## Dosya düzeni

```
src/data/fields/
├── fields.json          # manifest: alan listesi + sayaçlar (script üretir)
├── gunluk-rutin.json    # alan dosyası (kategoriler → kartlar)
└── ...
```

Manifest tek kaynaktır; `src/data/fields.json` gibi ikinci bir kopya **yoktur**.

## Alan dosyası şeması

```json
{
  "id": "gunluk-rutin",
  "name": "Günlük Rutin",
  "icon": "🌅",
  "color": "#F59E0B",
  "description": "Sabahtan gece yatana kadar her gün kullandığın kalıplar.",
  "categories": [
    {
      "name": "Morning",
      "color": "#D9A441",
      "cards": [
        {
          "id": "gunluk-rutin-001",
          "en": "wake up",
          "enS": "I wake up at seven.",
          "tr": "uyanmak",
          "trS": "Ben yedide uyanırım.",
          "level": "A1",
          "tags": ["fn:time", "ctx:everyday"]
        }
      ]
    }
  ]
}
```

**Zorunlu alanlar:** `id`, `en`, `enS`, `tr`, `trS`, `level`.
**Opsiyonel alan:** `tags` (aşağıya bakınız). Bunların dışındaki bir alan
doğrulayıcıda uyarı üretir.

## Etiketler (`tags`)

Kart **tek bir alana** aittir; id öneki ve `{alanId}-{sıra}` biçimi bunun
taşıyıcısıdır ve ilerleme takibi buna dayanır. Etiketler bu sahipliğin
**üstüne** çapraz katman olarak binder: kartın ev alanını değiştirmez,
`de_srs_v1` kayıtlarına dokunmaz.

Etiketlerin tek doğruluk kaynağı `src/data/tags.json`. Kodda hiçbir yerde
etiket dizesi elle yazılmaz; tanımsız bir etiket doğrulayıcıda **hatadır**.

Dört eksen vardır, hepsi ön ekli:

| Eksen | Ne sorar | Zorunlu mu | Örnek |
|---|---|---|---|
| `dom:` | Hangi disiplinin metninde geçer? | hayır | `dom:physics` `dom:math` |
| `fn:` | Cümlede ne iş görür? | **evet** | `fn:cause` `fn:hedge` |
| `ctx:` | Nerede karşına çıkar? | **evet** | `ctx:paper` `ctx:lab` |
| `type:` | Yapısal özelliği ne? | hayır | `type:phrasal` `type:polysemy` |

- Bir kart **birden çok `dom:`** taşıyabilir — `derive` hem matematik hem
  fizik. Asıl kazanç budur: bir akademik çekirdek kartı on bölüme birden
  hizmet eder ve her bölüm için yeniden yazılmaz.
- Genel akademik kartın hiç `dom:` etiketi olmayabilir.
- `fn:` ve `ctx:` eksiği hata değil **uyarıdır** — geriye dönük etiketleme
  tamamlanana kadar veri kısmen etiketsiz kalabilir.
- `dom:cs` ↔ `dom:engineering` ve `dom:medicine` ↔ `dom:biology` sınırları
  `tags.json` içindeki `aciklama` alanlarında yazılıdır; yeni parti yazarken
  oraya bak.

## Kart terim mi olur, eşdizim mi?

Bölümsel demetlerin ana ilkesi **eşdizim**dir: öğrenci `capacitor`ün ne olduğunu
dersinde biliyor, bilmediği `the capacitor **discharges through** the resistor`.
Ders kitabı sözlüğü kopyalamak bu yüzden yasaktır.

Ama bu ilke fazla katı uygulanınca taban boş kaldı: 2026-08-01'de ölçüldü ki
30 temel fizik teriminin **22'si** tek başına hiçbir kartta yoktu. Öğrenci
"kuvvet" görüp `force` diyemiyorsa eşdizim öğretmenin zemini yoktur.

Kural şu:

| Kart tipi | Ne zaman | Nerede durur |
|---|---|---|
| **Terim** (`force`, `artery`, `premise`) | Alanın konuşulamayacağı çekirdek sözcük | `Temel Terimler` kategorisi |
| **Eşdizim** (`exert a force`, `the artery narrows`) | Terim biliniyor ama birlikte geldiği fiil bilinmiyor | Konu kategorileri |

Terim kartında da örnek cümle **gerçek kullanım** taşır — `force` kartının
cümlesi "A force is a push or a pull on an object." Terimi tanımlayan cümle,
tanımın kendisi kadar öğreticidir.

Terim listeleri **uydurulmaz**, standart sözlüklere dayandırılır (Ducksters
"Motion Glossary", Wikipedia "Glossary of chemistry terms", Rasmussen
"Basic Medical Terms" gibi). Yazmadan önce mevcut korpusa karşı taranır —
`anlam-kaymasi` alanı çoğu çok anlamlı terimi (`vector`, `load`, `cell`,
`function`) zaten teknik anlamıyla öğretiyor; onları tekrar yazmak hatadır.

**Eşdizim listeleri de uydurulmaz.** Bölümden bağımsız akademik eşdizimler için
kaynak, korpustan türetilmiş **Academic Collocation List**'tir (Ackermann &
Chen 2013; 25 milyon sözcüklük PICAE korpusundan 2469 eşdizim). Sıklık sırasıyla
gezilebilir hâli: <https://www.eapfoundation.com/vocab/academic/acl/frequency/>.
Listeden kart yazarken üç eleme yapılır: (1) korpusa karşı benzerlik taraması,
(2) eşiğin altında kalsa da **aynı şeyi ikinci kez öğreten** adayların elle
elenmesi, (3) konuya özgü bileşiklerin (`climate change`, `domestic violence`)
çekirdeğe değil ilgili bölümsel alana bırakılması.

**Öbek fiil listesi de uydurulmaz.** Kaynak **PHaVE List**'tir (Garnier &
Schmitt, *Language Teaching Research* 19/6, 2015): COCA'dan türetilmiş en sık
150 öbek fiil ve her birinin baskın anlam(lar)ı, yüzdeleriyle. Öbek fiillerin
ortalama 5,6 anlamı var; listenin asıl değeri **hangi anlamın öğretileceğini**
söylemesi — `look up` kartı "sözlüğe bakmak" değil "başını kaldırıp bakmak"
öğretir, çünkü baskın anlam odur (%88).

## Tekrar kuralı

Proje genelinde **tam metin tekrarı hatadır** (normalize: küçük harf, baştaki
`a`/`an`/`the`/`to` atılır). İki kart aynı kalıbı taşırsa ikisine ayrı ilerleme
kaydı açılır, quiz seçeneklerinde birlikte çıkarlar ve kullanıcı aynı şeyi iki
kez öğrenmeye çalışır.

**Tek istisna `type:polysemy`.** Aynı sözcüğün farklı alanda farklı anlama
gelmesi kasıtlıdır (`current` = elektrik akımı / güncel). Muafiyet yalnız
**iki kart da** `type:polysemy` işaretliyse **ve** `dom:` kümeleri ayrıksa
geçerlidir; yoksa etiket gerçek tekrarı gizlemenin bahanesine dönüşür.

Yakın tekrar (benzerlik > %90) uyarıdır — bazen gerçekten iki ayrı kalıptır.

## Kurallar

| Kural | Neden |
|---|---|
| Kategori başına en az 12 kart | quiz dört şık üretemez, deste kuramaz (uyarı) |
| Etiketler `tags.json`'da tanımlı olmalı | tek doğruluk kaynağı; yazım hatası sessizce yeni etiket yaratmasın (hata) |
| Dosya adı `{alanId}.json`, içindeki `id` ile aynı | manifest eşleştirmesi buna dayanır |
| Kart id'si `{alanId}-{3 haneli sıra}`, 1'den başlayıp kesintisiz | ilerleme anahtarı; boşluk olursa sonraki parti nereden devam edeceğini bilemez |
| Hiçbir alan id'si başka bir alan id'sinin öneki olamaz | alan ilerlemesi `"{alanId}-"` önekiyle sayılıyor (`ev` + `ev-doga` birbirine karışırdı) |
| `level` yalnızca `A1` / `A2` / `B1` / `B2` | seviye filtresi ve rozetler bu değerlere göre çalışır |
| Mevcut kartın `id`'si asla değişmez | id değişirse kullanıcının o kartı "öğrendim" kaydı sıfırlanır |
| `enS`, `en` kalıbını içermeli (çekim farkı olabilir) | quiz boşluk sorusu cümlede kalıbı bulup siliyor |
| Aynı `en` bir alanda iki kez geçmemeli | quiz seçeneklerinde ve kart listesinde tekrar olur |

Kart **metnini** düzeltmek serbesttir (id sabit kaldığı sürece ilerleme korunur).
Kart **silmek** numaralarda boşluk bırakır; bunun yerine düzeltmeyi tercih et.

## Yeni parti entegrasyonu

```bash
# 1. Yeni/güncellenmiş alan dosyalarını src/data/fields/ içine kopyala
# 2. Manifest'i verilerden yeniden üret
npm run sync
# 3. Doğrula (hata varsa çıkış kodu 1)
npm run validate
# 4. Uygulamayı aç ve yeni alanı gözle kontrol et
npm start
```

`npm run validate` çıktısı: alan/kart sayıları, seviye dağılımı, `✖` hatalar ve
`⚠` uyarılar. Uyarılar sürümü engellemez ama içerik kalitesine işaret eder
(aynı alanda tekrar eden kalıp, cümleyle ilgisiz görünen kalıp gibi).

## Meslek alanları ve tanışma testi

`src/js/config.js` içindeki `PROFILES`, testin ilk adımındaki bölüm/meslek
seçeneklerini ve her birinin **önerdiği alanları** tanımlar. Yeni bir meslek
alanı eklerken:

1. Alan dosyasını `src/data/fields/` içine koy, `npm run sync && npm run validate`.
2. İlgili profilin `fields` dizisine alanın id'sini ekle (ya da yeni bir profil tanımla).
3. Amaca bağlı öneri isteniyorsa `GOALS` içindeki uygun kaydın `fields` dizisine ekle.

Kod tarafında başka değişiklik gerekmez; anasayfa, keşfet listesi ve test
tamamen manifest + bu iki tablodan beslenir.

Hâlihazırdaki meslek alanları: `muhendislik`, `tip`, `ekonomi`, `hukuk`, `akademik`.

## Sonraki partiler için ayrılan alan kimlikleri

Planlanan yeni alanlar aşağıdaki id/ikon/renk ile gelmelidir; bu değerler
mevcut alanlarla çakışmayacak şekilde seçildi (önek çakışması yok, renkler
paletteki tonlardan ayrışıyor).

| Alan | id | icon | color |
|---|---|---|---|
| Araba & Sürüş | `araba-surus` | 🚗 | `#3B82F6` |
| Çocuk & Ebeveynlik | `cocuk-ebeveynlik` | 👶 | `#FB7185` |
| Sanat & Kültür | `sanat-kultur` | 🎨 | `#D946EF` |

`phrasal-verbs` **açıldı** (2026-08-01, 100/141 kart) — bkz. aşağıdaki tablo.

Mevcut alanlar derinleştirilirken yeni kartlar, o alandaki **son sıra
numarasından** devam etmelidir:

| Alan | son id | Alan | son id |
|---|---|---|---|
| `gunluk-rutin` | 156 | `medya-eglence` | 60 |
| `is-hayati` | 98 | `acil-guvenlik` | 44 |
| `egitim` | 87 | `resmi-islemler` | 39 |
| `seyahat` | 129 | `kisisel-gelisim` | 41 |
| `saglik-spor` | 91 | `akademik` | 24 |
| `yemek-alisveris` | 135 | `ekonomi` | 24 |
| `iliskiler` | 141 | `hukuk` | 24 |
| `ev-doga` | 84 | `muhendislik` | 24 |
| `finans-para` | 57 | `tip` | 24 |
| `iletisim` | 67 | | |
| `genel-akademik` | 250 | `anlam-kaymasi` | 50 |
| `fen-muhendislik` | 350 | `saglik-bilimleri` | 350 |
| `sosyal-bilimler` | 350 | `beseri-bilimler` | 350 |
| `phrasal-verbs` | 100 | | |

Toplam **3149 kart / 26 alan** (2026-08-01). Meslek alanları (`akademik`,
`ekonomi`, `hukuk`, `muhendislik`, `tip`) 24'er kartla başladı ve hâlâ sığ;
akademik katman ise `genel-akademik` + `anlam-kaymasi` + bölümsel demetler
üzerinden büyütülüyor (bkz. PROGRESS.md, Aşama 4-C).
