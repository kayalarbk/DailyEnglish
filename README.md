# Daily English

Günlük İngilizce kelime ve kalıpları çalışmak için hazırlanmış, bağımlılıksız bir flashcard uygulaması. 21 kategoride 601 kelime, örnek cümleler, telaffuz ve quiz modu içerir.

## Özellikler

- **Flashcard'lar** — karta dokun, İngilizce/Türkçe yüzler arasında çevir
- **Telaffuz** — Web Speech API ile kelime ve örnek cümle seslendirme
- **İlerleme takibi** — öğrenilen kelimeler `localStorage`'da saklanır, kategori ve genel ilerleme çubuklarında gösterilir
- **Filtre & karıştırma** — sadece öğrenilmemiş kartları göster, desteyi karıştır
- **Quiz modu** — boşluk doldurma ve anlam eşleştirme soruları, tur sonunda yanlış yapılan kelimelerin listesi

## Çalıştırma

Uygulama ES modülleri kullandığı için `index.html` dosyasını çift tıklayarak açmak yerine yerel bir sunucu üzerinden servis edilmelidir.

```bash
npx serve .
# veya
python -m http.server 8000
```

Ardından tarayıcıdan `http://localhost:8000` adresini aç.

## Klasör Yapısı

```
.
├── index.html              # Uygulama kabuğu (dört ekranın işaretlemesi)
└── src/
    ├── data/
    │   └── words.js        # Kelime listesi (kategori → kartlar)
    ├── styles/
    │   └── main.css        # Tüm stiller
    └── js/
        ├── main.js         # Giriş noktası, olay bağlamaları
        ├── config.js       # Sabitler (quiz uzunluğu, depolama anahtarı)
        ├── dom.js          # DOM referansları
        ├── state.js        # Kartlar ekranının paylaşılan durumu
        ├── progress.js     # localStorage tabanlı öğrenme takibi
        ├── utils.js        # Karıştırma ve seslendirme yardımcıları
        └── screens/
            ├── navigation.js   # Ekran geçişleri
            ├── categories.js   # Kategori listesi
            ├── cards.js        # Flashcard gösterimi ve kontrolleri
            └── quiz.js         # Quiz akışı ve sonuç ekranı
```

## Kelime Ekleme

`src/data/words.js` içindeki `words` nesnesine kart eklemek yeterlidir:

```js
"Morning": {
  "color": "#D9A441",
  "cards": [
    {
      "en": "wake up",
      "enS": "I wake up at seven.",
      "tr": "uyanmak",
      "trS": "Ben yedide uyanırım."
    }
  ]
}
```

Yeni bir kategori için nesneye `color` ve `cards` alanlarına sahip yeni bir anahtar eklemek yeterlidir; arayüz kendini otomatik günceller.

## Tarayıcı Desteği

ES modülleri ve `localStorage` destekleyen tüm güncel tarayıcılar. Telaffuz özelliği Web Speech API bulunmayan tarayıcılarda sessizce devre dışı kalır.
