# Daily English

Günlük İngilizce kelime ve kalıpları çalışmak için hazırlanmış, bağımlılıksız bir
flashcard uygulaması. 14 alan ve 35 kategoride 1118 kart; her kartta örnek cümle,
Türkçe karşılık, CEFR seviyesi ve telaffuz desteği var.

## Özellikler

- **İlgi alanına göre çalışma** — açılışta alanlarını seç, anasayfa yalnızca onları öne çıkarır
- **Flashcard'lar** — karta dokun, İngilizce/Türkçe yüzler arasında çevir
- **CEFR seviyeleri** — her kartta A1–B2 rozeti; kartlar ekranında seviye filtresi
- **Telaffuz** — Web Speech API ile kelime ve örnek cümle seslendirme
- **İlerleme takibi** — öğrenilen kartlar kalıcı id'leriyle `localStorage`'da saklanır
- **Oyunlaştırma** — günlük hedef, seri (streak) ve XP
- **Quiz modu** — boşluk doldurma ve anlam eşleştirme; çeldiriciler aynı seviyeden seçilir

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
├── index.html                  # Uygulama kabuğu (beş ekranın işaretlemesi)
├── docs/VERI-REHBERI.md        # Veri şeması ve yeni parti entegrasyonu
├── tools/
│   ├── validate-data.mjs       # Veri doğrulama (npm run validate)
│   └── sync-manifest.mjs       # Manifest'i verilerden üretir (npm run sync)
└── src/
    ├── data/fields/            # Manifest (fields.json) + alan dosyaları
    ├── styles/main.css         # Tüm stiller
    └── js/
        ├── main.js             # Giriş noktası, olay bağlamaları
        ├── config.js           # Sabitler (seviyeler, quiz uzunluğu, depolama anahtarları)
        ├── dom.js              # DOM referansları
        ├── state.js            # Kartlar ekranının paylaşılan durumu
        ├── utils.js            # Karıştırma ve seslendirme yardımcıları
        ├── data/repository.js  # Manifest ve alan dosyalarının yüklenmesi
        ├── store/              # localStorage katmanı: ilgi alanları, ilerleme, istatistik
        ├── ui/                 # Üst bar ve bildirimler
        └── screens/            # onboarding · home · field · cards · quiz
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

## Tarayıcı Desteği

ES modülleri ve `localStorage` destekleyen tüm güncel tarayıcılar. Telaffuz
özelliği Web Speech API bulunmayan tarayıcılarda sessizce devre dışı kalır.
