# Veri Genişletme — Parti 1+2 Entegrasyon Notları

## Özet

| | Başlangıç | Parti 1 | **Parti 2 (şimdi)** | Hedef |
|---|---|---|---|---|
| Alan | 8 | 14 | **14** | 14+ |
| Kart | 601 | 866 | **1118** | ~3000 |

Parti 2 mevcut 8 alana **252 yeni kart** ekledi ve **TÜM kartlara** iki yeni alan getirdi: `id` ve `level`.

Seviye dağılımı: A1: 93 · A2: 611 · B1: 339 · B2: 75

## Kurulum

**Bu paketteki 15 dosyanın TAMAMI** `src/data/fields/` klasöründeki eskilerin yerine konmalı (14 alan dosyası + `fields.json`). Eski 8 dosya artık değişti — hepsinde `id`, `level` ve yeni kartlar var.

## Yeni Şema (tüm kartlarda geçerli)

```json
{
  "id": "gunluk-rutin-101",
  "en": "hit the snooze button",
  "enS": "I hit the snooze button twice.",
  "tr": "erteleme tuşuna basmak",
  "trS": "Erteleme tuşuna iki kez basarım.",
  "level": "A2"
}
```

- `id`: alan bazında benzersiz, `{alanId}-{sıraNo}` formatında. **İlerleme takibi / spaced repetition için bunu anahtar olarak kullan** (kart metni değişse bile id sabit kalır).
- `level`: `"A1" | "A2" | "B1" | "B2"`. Artık tüm kartlarda mevcut — `?? "A2"` yedeğine gerek kalmadı, ama savunmacı kod zarar vermez.

## HTML/CSS Değişiklikleri

### 1. Seviye rozeti

```html
<span class="level-badge level-b1">B1</span>
```
```css
.level-badge { font-size:.7rem; font-weight:700; padding:2px 8px; border-radius:999px; letter-spacing:.05em; }
.level-a1 { background:#DCFCE7; color:#166534; }
.level-a2 { background:#DBEAFE; color:#1E40AF; }
.level-b1 { background:#FEF3C7; color:#92400E; }
.level-b2 { background:#FEE2E2; color:#991B1B; }
```

### 2. Seviye filtresi

```html
<div class="level-filter">
  <button data-level="all" class="active">Tümü</button>
  <button data-level="A1">A1</button>
  <button data-level="A2">A2</button>
  <button data-level="B1">B1</button>
  <button data-level="B2">B2</button>
</div>
```
```js
const filtered = level === "all" ? cards : cards.filter(c => c.level === level);
```

### 3. İlerleme takibi (id sayesinde artık mümkün)

```js
// localStorage örneği
const known = new Set(JSON.parse(localStorage.getItem("knownCards") ?? "[]"));
function markKnown(cardId) {
  known.add(cardId);
  localStorage.setItem("knownCards", JSON.stringify([...known]));
}
// Kategori ilerleme yüzdesi
const pct = cards.filter(c => known.has(c.id)).length / cards.length * 100;
```

### 4. 14 alan için esnek ızgara

```css
.fields-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(160px,1fr)); gap:12px; }
```

## Parti 2'de Eklenen İçerik (özet)

Her mevcut kategoriye 12 yeni kart eklendi; mevcutlarla çakışma kontrolü yapıldı. Yeni içerik özellikle B1-B2 kalıpları ve deyimlerle seviye yelpazesini genişletiyor (ör. "toss and turn", "break the ice", "pull an all-nighter", "pour with rain", "take after one's father").

| Alan | Önce | Sonra |
|---|---|---|
| Günlük Rutin | 100 | 148 |
| İş Hayatı | 60 | 84 |
| Eğitim | 56 | 80 |
| Seyahat | 86 | 122 |
| Sağlık & Spor | 58 | 82 |
| Yemek & Alışveriş | 91 | 127 |
| İlişkiler | 96 | 132 |
| Ev & Doğa | 54 | 78 |

## Sonraki Partiler

- **Parti 3:** Yeni 6 alanın derinleştirilmesi + yeni alanlar (Araba & Sürüş, Çocuk & Ebeveynlik, Sanat & Kültür, Phrasal Verbs) → ~1800 karta.
- **Parti 4:** B2 içeriğin artırılması, deyim/phrasal verb ağırlıklı ek kategoriler → ~3000 hedefine.

## Doğrulama

- 15 JSON dosyası da geçerli, `fields.json` wordCount'ları script ile gerçek sayılardan üretildi.
- 1118 kart ID'sinin tamamı benzersiz.
