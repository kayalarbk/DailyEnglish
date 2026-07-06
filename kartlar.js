// Kelime listesi (word list) — günlük İngilizce (Toplam 601 Kelime, 21 kategori)
const data = {
  "Morning": {
    "color": "#D9A441",
    "cards": [
      {
        "en": "wake up",
        "enS": "I wake up at seven.",
        "tr": "uyanmak",
        "trS": "Ben yedide uyanırım."
      },
      {
        "en": "brush teeth",
        "enS": "I brush my teeth every morning.",
        "tr": "diş fırçalamak",
        "trS": "Her sabah dişlerimi fırçalarım."
      },
      {
        "en": "have breakfast",
        "enS": "We have breakfast together.",
        "tr": "kahvaltı yapmak",
        "trS": "Birlikte kahvaltı yaparız."
      },
      {
        "en": "get dressed",
        "enS": "She gets dressed quickly.",
        "tr": "giyinmek",
        "trS": "O hızlıca giyinir."
      },
      {
        "en": "make coffee",
        "enS": "He makes coffee every day.",
        "tr": "kahve yapmak",
        "trS": "O her gün kahve yapar."
      },
      {
        "en": "make the bed",
        "enS": "I make the bed after waking up.",
        "tr": "yatağı toplamak",
        "trS": "Uyandıktan sonra yatağı toplarım."
      },
      {
        "en": "wash face",
        "enS": "She washes her face with cold water.",
        "tr": "yüz yıkamak",
        "trS": "O yüzünü soğuk suyla yıkar."
      },
      {
        "en": "comb hair",
        "enS": "He combs his hair carefully.",
        "tr": "saç taramak",
        "trS": "O saçını dikkatlice tarar."
      },
      {
        "en": "read the news",
        "enS": "I read the news online.",
        "tr": "haberleri okumak",
        "trS": "Haberleri internetten okurum."
      },
      {
        "en": "check phone",
        "enS": "I check my phone for messages.",
        "tr": "telefona bakmak",
        "trS": "Mesajlar için telefonuma bakarım."
      },
      {
        "en": "feed the pet",
        "enS": "She feeds the dog every morning.",
        "tr": "evcil hayvanı beslemek",
        "trS": "O her sabah köpeği besler."
      },
      {
        "en": "water the plants",
        "enS": "He waters the plants on the balcony.",
        "tr": "çiçekleri sulamak",
        "trS": "O balkondaki çiçekleri sular."
      },
      {
        "en": "pack a bag",
        "enS": "I pack my bag for school.",
        "tr": "çanta hazırlamak",
        "trS": "Okul için çantamı hazırlarım."
      },
      {
        "en": "leave home",
        "enS": "We leave home at eight.",
        "tr": "evden çıkmak",
        "trS": "Saat sekizde evden çıkarız."
      },
      {
        "en": "wait for the bus",
        "enS": "She waits for the bus at the stop.",
        "tr": "otobüs beklemek",
        "trS": "O durakta otobüs bekler."
      },
      {
        "en": "drive to work",
        "enS": "He drives to work every day.",
        "tr": "işe arabayla gitmek",
        "trS": "O her gün işe arabayla gider."
      },
      {
        "en": "listen to a podcast",
        "enS": "I listen to a podcast on the way.",
        "tr": "podcast dinlemek",
        "trS": "Yolda podcast dinlerim."
      },
      {
        "en": "arrive at the office",
        "enS": "We arrive at the office early.",
        "tr": "ofise varmak",
        "trS": "Ofise erken varırız."
      },
      {
        "en": "greet colleagues",
        "enS": "She greets her colleagues.",
        "tr": "iş arkadaşlarıyla selamlaşmak",
        "trS": "O iş arkadaşlarıyla selamlaşır."
      },
      {
        "en": "organize the desk",
        "enS": "I organize my desk before starting.",
        "tr": "masayı düzenlemek",
        "trS": "Başlamadan önce masamı düzenlerim."
      },
      {
        "en": "review tasks",
        "enS": "He reviews his daily tasks.",
        "tr": "görevleri gözden geçirmek",
        "trS": "O günlük görevlerini gözden geçirir."
      },
      {
        "en": "attend a morning meeting",
        "enS": "We attend a morning meeting.",
        "tr": "sabah toplantısına katılmak",
        "trS": "Sabah toplantısına katılırız."
      },
      {
        "en": "write a list",
        "enS": "I write a to-do list.",
        "tr": "liste yazmak",
        "trS": "Bir yapılacaklar listesi yazarım."
      },
      {
        "en": "drink tea",
        "enS": "She drinks green tea in the morning.",
        "tr": "çay içmek",
        "trS": "O sabahları yeşil çay içer."
      },
      {
        "en": "open the windows",
        "enS": "He opens the windows for fresh air.",
        "tr": "camları açmak",
        "trS": "O temiz hava için camları açar."
      }
    ]
  },
  "Afternoon": {
    "color": "#C1622E",
    "cards": [
      {
        "en": "have lunch",
        "enS": "I have lunch at noon.",
        "tr": "öğle yemeği yemek",
        "trS": "Öğlen öğle yemeği yerim."
      },
      {
        "en": "go to work",
        "enS": "She goes to work by bus.",
        "tr": "işe gitmek",
        "trS": "O otobüsle işe gider."
      },
      {
        "en": "take a break",
        "enS": "We take a break at three.",
        "tr": "mola vermek",
        "trS": "Saat üçte mola veririz."
      },
      {
        "en": "answer emails",
        "enS": "He answers emails after lunch.",
        "tr": "e-postalara cevap vermek",
        "trS": "O öğle yemeğinden sonra e-postalara cevap verir."
      },
      {
        "en": "meet a friend",
        "enS": "I meet a friend for coffee.",
        "tr": "bir arkadaşla buluşmak",
        "trS": "Kahve içmek için bir arkadaşla buluşurum."
      },
      {
        "en": "write a report",
        "enS": "I write a report for my boss.",
        "tr": "rapor yazmak",
        "trS": "Patronum için bir rapor yazarım."
      },
      {
        "en": "make a phone call",
        "enS": "She makes an important phone call.",
        "tr": "telefon görüşmesi yapmak",
        "trS": "O önemli bir telefon görüşmesi yapar."
      },
      {
        "en": "grab a snack",
        "enS": "He grabs a snack from the kitchen.",
        "tr": "atıştırmalık almak",
        "trS": "O mutfaktan bir atıştırmalık alır."
      },
      {
        "en": "attend a seminar",
        "enS": "We attend an online seminar.",
        "tr": "seminere katılmak",
        "trS": "Çevrimiçi bir seminere katılırız."
      },
      {
        "en": "brainstorm ideas",
        "enS": "They brainstorm ideas for the project.",
        "tr": "fikir alışverişi yapmak",
        "trS": "Proje için fikir alışverişi yaparlar."
      },
      {
        "en": "solve a problem",
        "enS": "I try to solve a math problem.",
        "tr": "problem çözmek",
        "trS": "Bir matematik problemini çözmeye çalışırım."
      },
      {
        "en": "stretch legs",
        "enS": "She stretches her legs during the break.",
        "tr": "bacakları esnetmek",
        "trS": "O mola sırasında bacaklarını esnetir."
      },
      {
        "en": "drink water",
        "enS": "It is important to drink water.",
        "tr": "su içmek",
        "trS": "Su içmek önemlidir."
      },
      {
        "en": "finish work",
        "enS": "He finishes work at five.",
        "tr": "işi bitirmek",
        "trS": "O beşte işi bitirir."
      },
      {
        "en": "leave the office",
        "enS": "We leave the office together.",
        "tr": "ofisten çıkmak",
        "trS": "Ofisten birlikte çıkarız."
      },
      {
        "en": "go shopping",
        "enS": "I go shopping for groceries.",
        "tr": "alışverişe gitmek",
        "trS": "Market alışverişine giderim."
      },
      {
        "en": "buy bread",
        "enS": "She buys fresh bread from the bakery.",
        "tr": "ekmek almak",
        "trS": "O fırından taze ekmek alır."
      },
      {
        "en": "carry bags",
        "enS": "He carries the heavy bags.",
        "tr": "poşetleri taşımak",
        "trS": "O ağır poşetleri taşır."
      },
      {
        "en": "take the subway",
        "enS": "We take the subway to go home.",
        "tr": "metroya binmek",
        "trS": "Eve gitmek için metroya bineriz."
      },
      {
        "en": "read a magazine",
        "enS": "I read a magazine on the train.",
        "tr": "dergi okumak",
        "trS": "Trende dergi okurum."
      },
      {
        "en": "pick up kids",
        "enS": "She picks up her kids from school.",
        "tr": "çocukları almak",
        "trS": "O çocuklarını okuldan alır."
      },
      {
        "en": "help with homework",
        "enS": "He helps his son with homework.",
        "tr": "ödeve yardım etmek",
        "trS": "O oğluna ödevinde yardım eder."
      },
      {
        "en": "pay bills",
        "enS": "I pay the electricity bills.",
        "tr": "faturaları ödemek",
        "trS": "Elektrik faturalarını öderim."
      },
      {
        "en": "clean the room",
        "enS": "They clean their room in the afternoon.",
        "tr": "odayı temizlemek",
        "trS": "Öğleden sonra odalarını temizlerler."
      },
      {
        "en": "rest on the sofa",
        "enS": "I rest on the sofa for a while.",
        "tr": "kanepede dinlenmek",
        "trS": "Bir süre kanepede dinlenirim."
      }
    ]
  },
  "Evening": {
    "color": "#4A5A8A",
    "cards": [
      {
        "en": "cook dinner",
        "enS": "We cook dinner together.",
        "tr": "akşam yemeği pişirmek",
        "trS": "Birlikte akşam yemeği pişiririz."
      },
      {
        "en": "watch TV",
        "enS": "I watch TV after dinner.",
        "tr": "televizyon izlemek",
        "trS": "Akşam yemeğinden sonra televizyon izlerim."
      },
      {
        "en": "go for a walk",
        "enS": "They go for a walk in the park.",
        "tr": "yürüyüşe çıkmak",
        "trS": "Parkta yürüyüşe çıkarlar."
      },
      {
        "en": "call family",
        "enS": "She calls her family every evening.",
        "tr": "aileyi aramak",
        "trS": "O her akşam ailesini arar."
      },
      {
        "en": "do the dishes",
        "enS": "He does the dishes after eating.",
        "tr": "bulaşık yıkamak",
        "trS": "O yemekten sonra bulaşık yıkar."
      },
      {
        "en": "set the table",
        "enS": "I set the table for dinner.",
        "tr": "masayı kurmak",
        "trS": "Akşam yemeği için masayı kurarım."
      },
      {
        "en": "have dinner",
        "enS": "We have dinner at seven.",
        "tr": "akşam yemeği yemek",
        "trS": "Yedide akşam yemeği yeriz."
      },
      {
        "en": "clear the table",
        "enS": "She clears the table quickly.",
        "tr": "masayı toplamak",
        "trS": "O masayı hızlıca toplar."
      },
      {
        "en": "take out the trash",
        "enS": "He takes out the trash.",
        "tr": "çöpü çıkarmak",
        "trS": "O çöpü çıkarır."
      },
      {
        "en": "feed the cat",
        "enS": "I feed the cat in the evening.",
        "tr": "kediyi beslemek",
        "trS": "Akşamları kediyi beslerim."
      },
      {
        "en": "listen to music",
        "enS": "We listen to relaxing music.",
        "tr": "müzik dinlemek",
        "trS": "Rahatlatıcı müzik dinleriz."
      },
      {
        "en": "play a game",
        "enS": "They play a board game.",
        "tr": "oyun oynamak",
        "trS": "Onlar kutu oyunu oynarlar."
      },
      {
        "en": "surf the internet",
        "enS": "I surf the internet for an hour.",
        "tr": "internette gezinmek",
        "trS": "Bir saat internette gezinirim."
      },
      {
        "en": "check social media",
        "enS": "She checks social media on her phone.",
        "tr": "sosyal medyaya bakmak",
        "trS": "O telefonundan sosyal medyaya bakar."
      },
      {
        "en": "do yoga",
        "enS": "He does yoga to relax.",
        "tr": "yoga yapmak",
        "trS": "O rahatlamak için yoga yapar."
      },
      {
        "en": "water the garden",
        "enS": "I water the garden when it gets cool.",
        "tr": "bahçeyi sulamak",
        "trS": "Hava serinleyince bahçeyi sularım."
      },
      {
        "en": "chat with a neighbor",
        "enS": "We chat with our neighbor.",
        "tr": "komşuyla sohbet etmek",
        "trS": "Komşumuzla sohbet ederiz."
      },
      {
        "en": "drink coffee",
        "enS": "She drinks coffee after dinner.",
        "tr": "kahve içmek",
        "trS": "O akşam yemeğinden sonra kahve içer."
      },
      {
        "en": "iron clothes",
        "enS": "He irons his clothes for tomorrow.",
        "tr": "kıyafet ütülemek",
        "trS": "O yarın için kıyafetlerini ütüler."
      },
      {
        "en": "prepare lunchbox",
        "enS": "I prepare my lunchbox for work.",
        "tr": "beslenme çantası hazırlamak",
        "trS": "İş için beslenme çantamı hazırlarım."
      },
      {
        "en": "plan the next day",
        "enS": "We plan the next day together.",
        "tr": "ertesi günü planlamak",
        "trS": "Ertesi günü birlikte planlarız."
      },
      {
        "en": "light a candle",
        "enS": "She lights a candle in the living room.",
        "tr": "mum yakmak",
        "trS": "O oturma odasında mum yakar."
      },
      {
        "en": "write in a journal",
        "enS": "I write in my journal every evening.",
        "tr": "günlük yazmak",
        "trS": "Her akşam günlüğüme yazarım."
      },
      {
        "en": "do laundry",
        "enS": "He does laundry on weekends.",
        "tr": "çamaşır yıkamak",
        "trS": "O hafta sonları çamaşır yıkar."
      },
      {
        "en": "hang the clothes",
        "enS": "I hang the clothes to dry.",
        "tr": "çamaşır asmak",
        "trS": "Kuruması için çamaşırları asarım."
      }
    ]
  },
  "Night": {
    "color": "#2E3550",
    "cards": [
      {
        "en": "take a shower",
        "enS": "I take a shower before bed.",
        "tr": "duş almak",
        "trS": "Yatmadan önce duş alırım."
      },
      {
        "en": "read a book",
        "enS": "She reads a book at night.",
        "tr": "kitap okumak",
        "trS": "O gece kitap okur."
      },
      {
        "en": "set an alarm",
        "enS": "I set an alarm for six.",
        "tr": "alarm kurmak",
        "trS": "Altıya alarm kurarım."
      },
      {
        "en": "turn off the light",
        "enS": "He turns off the light and sleeps.",
        "tr": "ışığı kapatmak",
        "trS": "O ışığı kapatır ve uyur."
      },
      {
        "en": "go to bed",
        "enS": "We go to bed at eleven.",
        "tr": "yatmak",
        "trS": "Saat onbirde yatarız."
      },
      {
        "en": "put on pajamas",
        "enS": "I put on my warm pajamas.",
        "tr": "pijama giymek",
        "trS": "Sıcak pijamalarımı giyerim."
      },
      {
        "en": "lock the door",
        "enS": "She locks the front door.",
        "tr": "kapıyı kilitlemek",
        "trS": "O ön kapıyı kilitler."
      },
      {
        "en": "close the curtains",
        "enS": "He closes the curtains in the bedroom.",
        "tr": "perdeleri kapatmak",
        "trS": "O yatak odasındaki perdeleri kapatır."
      },
      {
        "en": "charge the phone",
        "enS": "I charge my phone overnight.",
        "tr": "telefonu şarja takmak",
        "trS": "Gece boyunca telefonumu şarj ederim."
      },
      {
        "en": "turn off the TV",
        "enS": "We turn off the TV before sleeping.",
        "tr": "televizyonu kapatmak",
        "trS": "Uyumadan önce televizyonu kapatırız."
      },
      {
        "en": "floss teeth",
        "enS": "She flosses her teeth carefully.",
        "tr": "diş ipi kullanmak",
        "trS": "O diş ipini dikkatlice kullanır."
      },
      {
        "en": "wash dishes",
        "enS": "He washes the last dishes.",
        "tr": "bulaşıkları yıkamak",
        "trS": "O son bulaşıkları yıkar."
      },
      {
        "en": "drink warm milk",
        "enS": "I drink warm milk to sleep well.",
        "tr": "ılık süt içmek",
        "trS": "İyi uyumak için ılık süt içerim."
      },
      {
        "en": "meditate",
        "enS": "She meditates for ten minutes.",
        "tr": "meditasyon yapmak",
        "trS": "O on dakika meditasyon yapar."
      },
      {
        "en": "cuddle the dog",
        "enS": "We cuddle the dog on the bed.",
        "tr": "köpeğe sarılmak",
        "trS": "Yatakta köpeğe sarılırız."
      },
      {
        "en": "check the kids",
        "enS": "He checks the kids in their room.",
        "tr": "çocukları kontrol etmek",
        "trS": "O odalarında çocukları kontrol eder."
      },
      {
        "en": "turn on the nightlight",
        "enS": "I turn on the nightlight.",
        "tr": "gece lambasını açmak",
        "trS": "Gece lambasını açarım."
      },
      {
        "en": "say goodnight",
        "enS": "She says goodnight to everyone.",
        "tr": "iyi geceler demek",
        "trS": "O herkese iyi geceler der."
      },
      {
        "en": "pull up the blanket",
        "enS": "He pulls up the blanket.",
        "tr": "battaniyeyi çekmek",
        "trS": "O battaniyeyi çeker."
      },
      {
        "en": "close eyes",
        "enS": "I close my eyes and relax.",
        "tr": "gözleri kapatmak",
        "trS": "Gözlerimi kapatır ve rahatlarım."
      },
      {
        "en": "fall asleep",
        "enS": "The baby falls asleep quickly.",
        "tr": "uykuya dalmak",
        "trS": "Bebek hızlıca uykuya dalar."
      },
      {
        "en": "have a dream",
        "enS": "She has a beautiful dream.",
        "tr": "rüya görmek",
        "trS": "O güzel bir rüya görür."
      },
      {
        "en": "snore",
        "enS": "My brother snores loudly.",
        "tr": "horlamak",
        "trS": "Erkek kardeşim yüksek sesle horlar."
      },
      {
        "en": "wake up in the night",
        "enS": "I sometimes wake up in the night.",
        "tr": "gece uyanmak",
        "trS": "Bazen gece uyanırım."
      },
      {
        "en": "drink water",
        "enS": "He drinks a glass of water at night.",
        "tr": "su içmek",
        "trS": "O gece bir bardak su içer."
      }
    ]
  },
  "Yemek": {
    "color": "#8A4B3B",
    "cards": [
      {
        "en": "order food",
        "enS": "I order food online.",
        "tr": "yemek sipariş etmek",
        "trS": "İnternetten yemek sipariş ederim."
      },
      {
        "en": "pay the bill",
        "enS": "He pays the bill after dinner.",
        "tr": "hesabı ödemek",
        "trS": "O akşam yemeğinden sonra hesabı öder."
      },
      {
        "en": "cut vegetables",
        "enS": "She cuts vegetables for the salad.",
        "tr": "sebze doğramak",
        "trS": "O salata için sebze doğrar."
      },
      {
        "en": "boil water",
        "enS": "I boil water for tea.",
        "tr": "su kaynatmak",
        "trS": "Çay için su kaynatırım."
      },
      {
        "en": "fry an egg",
        "enS": "He fries an egg for breakfast.",
        "tr": "yumurta kızartmak",
        "trS": "O kahvaltı için yumurta kızartır."
      },
      {
        "en": "bake a cake",
        "enS": "We bake a cake for the party.",
        "tr": "kek pişirmek",
        "trS": "Parti için kek pişiririz."
      },
      {
        "en": "taste the soup",
        "enS": "She tastes the soup before serving.",
        "tr": "çorbayı tatmak",
        "trS": "O servis yapmadan önce çorbayı tadar."
      },
      {
        "en": "add salt",
        "enS": "I add salt to the food.",
        "tr": "tuz eklemek",
        "trS": "Yemeğe tuz eklerim."
      },
      {
        "en": "peel an orange",
        "enS": "He peels an orange after lunch.",
        "tr": "portakal soymak",
        "trS": "O öğle yemeğinden sonra portakal soyar."
      },
      {
        "en": "chew slowly",
        "enS": "You should chew slowly.",
        "tr": "yavaş çiğnemek",
        "trS": "Yavaş çiğnemelisin."
      },
      {
        "en": "order dessert",
        "enS": "We order dessert at the restaurant.",
        "tr": "tatlı sipariş etmek",
        "trS": "Restoranda tatlı sipariş ederiz."
      },
      {
        "en": "book a table",
        "enS": "I book a table for two.",
        "tr": "masa ayırtmak",
        "trS": "İki kişilik masa ayırtırım."
      },
      {
        "en": "grill meat",
        "enS": "He grills meat on weekends.",
        "tr": "et ızgara yapmak",
        "trS": "O hafta sonları et ızgara yapar."
      },
      {
        "en": "slice bread",
        "enS": "She slices the bread thinly.",
        "tr": "ekmek dilimlemek",
        "trS": "O ekmeği ince dilimler."
      },
      {
        "en": "set the oven",
        "enS": "I set the oven to 200 degrees.",
        "tr": "fırını ayarlamak",
        "trS": "Fırını 200 dereceye ayarlarım."
      },
      {
        "en": "stir the sauce",
        "enS": "He stirs the sauce constantly.",
        "tr": "sosu karıştırmak",
        "trS": "O sosu sürekli karıştırır."
      },
      {
        "en": "serve the meal",
        "enS": "She serves the meal to the guests.",
        "tr": "yemeği servis etmek",
        "trS": "O yemeği misafirlere servis eder."
      },
      {
        "en": "clear the plates",
        "enS": "We clear the plates after dinner.",
        "tr": "tabakları kaldırmak",
        "trS": "Akşam yemeğinden sonra tabakları kaldırırız."
      },
      {
        "en": "drink orange juice",
        "enS": "I drink orange juice every morning.",
        "tr": "portakal suyu içmek",
        "trS": "Her sabah portakal suyu içerim."
      },
      {
        "en": "eat a sandwich",
        "enS": "He eats a sandwich for lunch.",
        "tr": "sandviç yemek",
        "trS": "O öğle yemeğinde sandviç yer."
      },
      {
        "en": "be hungry",
        "enS": "I am hungry right now.",
        "tr": "aç olmak",
        "trS": "Şu anda açım."
      },
      {
        "en": "be thirsty",
        "enS": "She is thirsty after running.",
        "tr": "susamış olmak",
        "trS": "O koşudan sonra susamış."
      },
      {
        "en": "be full",
        "enS": "He is full after the meal.",
        "tr": "tok olmak",
        "trS": "O yemekten sonra tok."
      },
      {
        "en": "taste delicious",
        "enS": "This soup tastes delicious.",
        "tr": "lezzetli olmak",
        "trS": "Bu çorba çok lezzetli."
      },
      {
        "en": "reheat food",
        "enS": "I reheat the food in the microwave.",
        "tr": "yemeği ısıtmak",
        "trS": "Yemeği mikrodalgada ısıtırım."
      },
      {
        "en": "freeze leftovers",
        "enS": "She freezes the leftovers.",
        "tr": "artıkları dondurmak",
        "trS": "O artıkları dondurur."
      },
      {
        "en": "defrost meat",
        "enS": "He defrosts the meat overnight.",
        "tr": "eti çözdürmek",
        "trS": "O eti gece boyunca çözdürür."
      },
      {
        "en": "season the dish",
        "enS": "I season the dish with pepper.",
        "tr": "yemeği baharatlamak",
        "trS": "Yemeği karabiberle baharatlarım."
      },
      {
        "en": "order takeout",
        "enS": "We order takeout on Fridays.",
        "tr": "paket servis sipariş etmek",
        "trS": "Cuma günleri paket servis sipariş ederiz."
      },
      {
        "en": "go on a diet",
        "enS": "She goes on a diet in January.",
        "tr": "diyet yapmak",
        "trS": "O ocak ayında diyet yapar."
      },
      {
        "en": "skip a meal",
        "enS": "He skips breakfast sometimes.",
        "tr": "öğün atlamak",
        "trS": "O bazen kahvaltıyı atlar."
      },
      {
        "en": "be on a budget",
        "enS": "We eat out on a budget.",
        "tr": "bütçeli yemek",
        "trS": "Bütçeli bir şekilde dışarıda yeriz."
      },
      {
        "en": "wash the vegetables",
        "enS": "I wash the vegetables carefully.",
        "tr": "sebzeleri yıkamak",
        "trS": "Sebzeleri dikkatlice yıkarım."
      },
      {
        "en": "measure the ingredients",
        "enS": "She measures the ingredients precisely.",
        "tr": "malzemeleri ölçmek",
        "trS": "O malzemeleri hassas bir şekilde ölçer."
      },
      {
        "en": "preheat the oven",
        "enS": "I preheat the oven first.",
        "tr": "fırını ısıtmak",
        "trS": "Önce fırını ısıtırım."
      }
    ]
  },
  "Aile": {
    "color": "#6B4C7A",
    "cards": [
      {
        "en": "get married",
        "enS": "They got married last year.",
        "tr": "evlenmek",
        "trS": "Onlar geçen yıl evlendi."
      },
      {
        "en": "have a baby",
        "enS": "She had a baby in March.",
        "tr": "bebek sahibi olmak",
        "trS": "O martta bebek sahibi oldu."
      },
      {
        "en": "raise children",
        "enS": "They raise their children together.",
        "tr": "çocuk büyütmek",
        "trS": "Onlar çocuklarını birlikte büyütür."
      },
      {
        "en": "visit relatives",
        "enS": "We visit relatives on holidays.",
        "tr": "akrabaları ziyaret etmek",
        "trS": "Bayramlarda akrabaları ziyaret ederiz."
      },
      {
        "en": "take care of parents",
        "enS": "She takes care of her parents.",
        "tr": "ebeveynlere bakmak",
        "trS": "O ebeveynlerine bakar."
      },
      {
        "en": "argue with siblings",
        "enS": "He argues with his brother sometimes.",
        "tr": "kardeşle tartışmak",
        "trS": "O bazen kardeşiyle tartışır."
      },
      {
        "en": "get along well",
        "enS": "We get along well with our neighbors.",
        "tr": "iyi geçinmek",
        "trS": "Komşularımızla iyi geçiniriz."
      },
      {
        "en": "trust someone",
        "enS": "I trust my best friend completely.",
        "tr": "birine güvenmek",
        "trS": "En yakın arkadaşıma tamamen güvenirim."
      },
      {
        "en": "support each other",
        "enS": "Families support each other.",
        "tr": "birbirine destek olmak",
        "trS": "Aileler birbirine destek olur."
      },
      {
        "en": "miss someone",
        "enS": "I miss my grandmother a lot.",
        "tr": "birini özlemek",
        "trS": "Büyükannemi çok özlüyorum."
      },
      {
        "en": "forgive someone",
        "enS": "She forgives her sister easily.",
        "tr": "birini affetmek",
        "trS": "O kız kardeşini kolayca affeder."
      },
      {
        "en": "keep in touch",
        "enS": "We keep in touch every week.",
        "tr": "irtibatta kalmak",
        "trS": "Her hafta irtibatta kalırız."
      },
      {
        "en": "grow up",
        "enS": "He grew up in a small town.",
        "tr": "büyümek",
        "trS": "O küçük bir kasabada büyüdü."
      },
      {
        "en": "move out",
        "enS": "She moved out at eighteen.",
        "tr": "evden ayrılmak",
        "trS": "O on sekizinde evden ayrıldı."
      },
      {
        "en": "get divorced",
        "enS": "They got divorced two years ago.",
        "tr": "boşanmak",
        "trS": "Onlar iki yıl önce boşandı."
      },
      {
        "en": "propose to someone",
        "enS": "He proposed to her on the beach.",
        "tr": "evlilik teklif etmek",
        "trS": "O sahilde ona evlilik teklif etti."
      },
      {
        "en": "celebrate an anniversary",
        "enS": "We celebrate our anniversary every year.",
        "tr": "yıldönümü kutlamak",
        "trS": "Her yıl yıldönümümüzü kutlarız."
      },
      {
        "en": "babysit",
        "enS": "She babysits her nephew on weekends.",
        "tr": "bebek bakıcılığı yapmak",
        "trS": "O hafta sonları yeğenine bakar."
      },
      {
        "en": "inherit a house",
        "enS": "He inherited a house from his father.",
        "tr": "miras almak",
        "trS": "O babasından bir ev miras aldı."
      },
      {
        "en": "argue about money",
        "enS": "Couples sometimes argue about money.",
        "tr": "para hakkında tartışmak",
        "trS": "Çiftler bazen para hakkında tartışır."
      },
      {
        "en": "comfort someone",
        "enS": "I comfort my friend when she's sad.",
        "tr": "birini teselli etmek",
        "trS": "Arkadaşım üzgün olduğunda onu teselli ederim."
      },
      {
        "en": "apologize",
        "enS": "He apologizes when he makes a mistake.",
        "tr": "özür dilemek",
        "trS": "O hata yaptığında özür diler."
      },
      {
        "en": "make peace",
        "enS": "They made peace after the fight.",
        "tr": "barışmak",
        "trS": "Onlar kavgadan sonra barıştı."
      },
      {
        "en": "be close to someone",
        "enS": "I am close to my cousin.",
        "tr": "birine yakın olmak",
        "trS": "Kuzenime yakınım."
      },
      {
        "en": "respect elders",
        "enS": "Children should respect elders.",
        "tr": "büyüklere saygı göstermek",
        "trS": "Çocuklar büyüklere saygı göstermeli."
      },
      {
        "en": "spoil a child",
        "enS": "Grandparents often spoil their grandchildren.",
        "tr": "çocuğu şımartmak",
        "trS": "Büyükanne ve büyükbabalar torunlarını genellikle şımartır."
      },
      {
        "en": "discipline a child",
        "enS": "Parents discipline their children fairly.",
        "tr": "çocuğa disiplin uygulamak",
        "trS": "Ebeveynler çocuklarına adil bir şekilde disiplin uygular."
      },
      {
        "en": "depend on family",
        "enS": "I depend on my family for support.",
        "tr": "aileye bağımlı olmak",
        "trS": "Destek için aileme bağımlıyım."
      },
      {
        "en": "value tradition",
        "enS": "We value family traditions.",
        "tr": "geleneklere değer vermek",
        "trS": "Aile geleneklerine değer veririz."
      },
      {
        "en": "reunite with family",
        "enS": "They reunited with their family abroad.",
        "tr": "aileyle yeniden bir araya gelmek",
        "trS": "Onlar yurt dışındaki aileleriyle yeniden bir araya geldi."
      }
    ]
  },
  "İş": {
    "color": "#35707A",
    "cards": [
      {
        "en": "apply for a job",
        "enS": "I applied for a new job.",
        "tr": "işe başvurmak",
        "trS": "Yeni bir işe başvurdum."
      },
      {
        "en": "attend an interview",
        "enS": "She attends an interview tomorrow.",
        "tr": "mülakata katılmak",
        "trS": "O yarın bir mülakata katılıyor."
      },
      {
        "en": "get hired",
        "enS": "He got hired last month.",
        "tr": "işe alınmak",
        "trS": "O geçen ay işe alındı."
      },
      {
        "en": "get fired",
        "enS": "She got fired from her job.",
        "tr": "işten atılmak",
        "trS": "O işinden atıldı."
      },
      {
        "en": "resign from a job",
        "enS": "He resigned from his job yesterday.",
        "tr": "işten istifa etmek",
        "trS": "O dün işinden istifa etti."
      },
      {
        "en": "meet a deadline",
        "enS": "We meet the deadline every time.",
        "tr": "son tarihe yetişmek",
        "trS": "Her seferinde son tarihe yetişiriz."
      },
      {
        "en": "give a presentation",
        "enS": "I give a presentation on Monday.",
        "tr": "sunum yapmak",
        "trS": "Pazartesi bir sunum yapıyorum."
      },
      {
        "en": "schedule a meeting",
        "enS": "She schedules a meeting for Friday.",
        "tr": "toplantı ayarlamak",
        "trS": "O cuma günü için bir toplantı ayarlar."
      },
      {
        "en": "negotiate a salary",
        "enS": "He negotiates his salary every year.",
        "tr": "maaş pazarlığı yapmak",
        "trS": "O her yıl maaş pazarlığı yapar."
      },
      {
        "en": "take a sick day",
        "enS": "I take a sick day when I'm ill.",
        "tr": "hastalık izni almak",
        "trS": "Hasta olduğumda hastalık izni alırım."
      },
      {
        "en": "work overtime",
        "enS": "He works overtime this week.",
        "tr": "mesai yapmak",
        "trS": "O bu hafta mesai yapıyor."
      },
      {
        "en": "get promoted",
        "enS": "She got promoted last year.",
        "tr": "terfi almak",
        "trS": "O geçen yıl terfi aldı."
      },
      {
        "en": "collaborate with a team",
        "enS": "We collaborate with the design team.",
        "tr": "ekiple işbirliği yapmak",
        "trS": "Tasarım ekibiyle işbirliği yaparız."
      },
      {
        "en": "delegate a task",
        "enS": "He delegates tasks to his team.",
        "tr": "görev devretmek",
        "trS": "O ekibine görev devreder."
      },
      {
        "en": "manage a project",
        "enS": "She manages a big project.",
        "tr": "proje yönetmek",
        "trS": "O büyük bir proje yönetiyor."
      },
      {
        "en": "meet a client",
        "enS": "I meet a client this afternoon.",
        "tr": "müşteriyle buluşmak",
        "trS": "Bu öğleden sonra bir müşteriyle buluşuyorum."
      },
      {
        "en": "sign a contract",
        "enS": "They signed a contract yesterday.",
        "tr": "sözleşme imzalamak",
        "trS": "Onlar dün bir sözleşme imzaladı."
      },
      {
        "en": "take notes",
        "enS": "I take notes during meetings.",
        "tr": "not almak",
        "trS": "Toplantılarda not alırım."
      },
      {
        "en": "handle a complaint",
        "enS": "She handles customer complaints.",
        "tr": "şikayeti ele almak",
        "trS": "O müşteri şikayetlerini ele alır."
      },
      {
        "en": "take a business trip",
        "enS": "He takes a business trip next week.",
        "tr": "iş seyahatine çıkmak",
        "trS": "O gelecek hafta bir iş seyahatine çıkıyor."
      },
      {
        "en": "work from home",
        "enS": "I work from home on Fridays.",
        "tr": "evden çalışmak",
        "trS": "Cuma günleri evden çalışırım."
      },
      {
        "en": "clock in",
        "enS": "She clocks in at nine.",
        "tr": "mesaiye giriş yapmak",
        "trS": "O dokuzda mesaiye giriş yapar."
      },
      {
        "en": "clock out",
        "enS": "He clocks out at six.",
        "tr": "mesaiden çıkış yapmak",
        "trS": "O altıda mesaiden çıkış yapar."
      },
      {
        "en": "take a work break",
        "enS": "I take a short break at noon.",
        "tr": "iş molası vermek",
        "trS": "Öğlen kısa bir mola veririm."
      },
      {
        "en": "fill out a form",
        "enS": "She fills out the application form.",
        "tr": "form doldurmak",
        "trS": "O başvuru formunu doldurur."
      },
      {
        "en": "submit a report",
        "enS": "I submit the report on time.",
        "tr": "rapor teslim etmek",
        "trS": "Raporu zamanında teslim ederim."
      },
      {
        "en": "brainstorm solutions",
        "enS": "We brainstorm solutions together.",
        "tr": "çözüm için fikir üretmek",
        "trS": "Birlikte çözüm için fikir üretiriz."
      },
      {
        "en": "train a new employee",
        "enS": "He trains a new employee.",
        "tr": "yeni çalışanı eğitmek",
        "trS": "O yeni bir çalışanı eğitir."
      },
      {
        "en": "retire from work",
        "enS": "She retires from work next year.",
        "tr": "emekli olmak",
        "trS": "O gelecek yıl emekli oluyor."
      },
      {
        "en": "earn a living",
        "enS": "He earns a living as a teacher.",
        "tr": "geçimini sağlamak",
        "trS": "O öğretmen olarak geçimini sağlıyor."
      },
      {
        "en": "ask for a raise",
        "enS": "I ask for a raise this year.",
        "tr": "zam istemek",
        "trS": "Bu yıl zam istiyorum."
      },
      {
        "en": "meet a colleague",
        "enS": "She meets a colleague for coffee.",
        "tr": "meslektaşla buluşmak",
        "trS": "O bir meslektaşıyla kahve içmek için buluşuyor."
      }
    ]
  },
  "Seyahat": {
    "color": "#3E7C4A",
    "cards": [
      {
        "en": "book a flight",
        "enS": "I book a flight online.",
        "tr": "uçak bileti almak",
        "trS": "İnternetten uçak bileti alırım."
      },
      {
        "en": "pack a suitcase",
        "enS": "She packs a suitcase the night before.",
        "tr": "bavul hazırlamak",
        "trS": "O bir önceki gece bavul hazırlar."
      },
      {
        "en": "check in at the airport",
        "enS": "We check in two hours early.",
        "tr": "havalimanında check-in yapmak",
        "trS": "İki saat önceden check-in yaparız."
      },
      {
        "en": "go through security",
        "enS": "He goes through security quickly.",
        "tr": "güvenlikten geçmek",
        "trS": "O hızlıca güvenlikten geçer."
      },
      {
        "en": "board a plane",
        "enS": "I board the plane at gate five.",
        "tr": "uçağa binmek",
        "trS": "Beşinci kapıdan uçağa binerim."
      },
      {
        "en": "miss a flight",
        "enS": "She missed her flight yesterday.",
        "tr": "uçağı kaçırmak",
        "trS": "O dün uçağını kaçırdı."
      },
      {
        "en": "rent a car",
        "enS": "We rent a car for the trip.",
        "tr": "araba kiralamak",
        "trS": "Gezi için araba kiralarız."
      },
      {
        "en": "get lost",
        "enS": "He got lost in the old city.",
        "tr": "kaybolmak",
        "trS": "O eski şehirde kayboldu."
      },
      {
        "en": "ask for directions",
        "enS": "I ask for directions when lost.",
        "tr": "yol sormak",
        "trS": "Kaybolduğumda yol sorarım."
      },
      {
        "en": "check into a hotel",
        "enS": "We check into the hotel at three.",
        "tr": "otele giriş yapmak",
        "trS": "Saat üçte otele giriş yaparız."
      },
      {
        "en": "check out of a hotel",
        "enS": "She checks out at noon.",
        "tr": "otelden çıkış yapmak",
        "trS": "O öğlen otelden çıkış yapar."
      },
      {
        "en": "exchange currency",
        "enS": "I exchange currency at the airport.",
        "tr": "döviz bozdurmak",
        "trS": "Havalimanında döviz bozdururum."
      },
      {
        "en": "go through customs",
        "enS": "He goes through customs quickly.",
        "tr": "gümrükten geçmek",
        "trS": "O hızlıca gümrükten geçer."
      },
      {
        "en": "take a taxi",
        "enS": "We take a taxi to the hotel.",
        "tr": "taksiye binmek",
        "trS": "Otele taksiyle gideriz."
      },
      {
        "en": "catch a train",
        "enS": "I catch the train at eight.",
        "tr": "trene yetişmek",
        "trS": "Trene sekizde yetişirim."
      },
      {
        "en": "miss a connection",
        "enS": "She missed her connection flight.",
        "tr": "aktarmayı kaçırmak",
        "trS": "O aktarma uçuşunu kaçırdı."
      },
      {
        "en": "visit a landmark",
        "enS": "We visit a famous landmark.",
        "tr": "ünlü bir yeri ziyaret etmek",
        "trS": "Ünlü bir yeri ziyaret ederiz."
      },
      {
        "en": "take photos",
        "enS": "He takes photos of the view.",
        "tr": "fotoğraf çekmek",
        "trS": "O manzaranın fotoğraflarını çeker."
      },
      {
        "en": "buy souvenirs",
        "enS": "I buy souvenirs for my family.",
        "tr": "hediyelik eşya almak",
        "trS": "Ailem için hediyelik eşya alırım."
      },
      {
        "en": "get a visa",
        "enS": "She gets a visa before traveling.",
        "tr": "vize almak",
        "trS": "O seyahat etmeden önce vize alır."
      },
      {
        "en": "travel abroad",
        "enS": "We travel abroad every summer.",
        "tr": "yurt dışına seyahat etmek",
        "trS": "Her yaz yurt dışına seyahat ederiz."
      },
      {
        "en": "explore a city",
        "enS": "He explores the city on foot.",
        "tr": "şehri keşfetmek",
        "trS": "O şehri yürüyerek keşfeder."
      },
      {
        "en": "cross the border",
        "enS": "They cross the border by bus.",
        "tr": "sınırı geçmek",
        "trS": "Onlar otobüsle sınırı geçer."
      },
      {
        "en": "read a map",
        "enS": "I read a map to find the way.",
        "tr": "harita okumak",
        "trS": "Yolu bulmak için harita okurum."
      },
      {
        "en": "use a GPS",
        "enS": "She uses a GPS while driving.",
        "tr": "GPS kullanmak",
        "trS": "O araba kullanırken GPS kullanır."
      },
      {
        "en": "change a flight",
        "enS": "He changes his flight last minute.",
        "tr": "uçuşu değiştirmek",
        "trS": "O son dakika uçuşunu değiştirir."
      },
      {
        "en": "go sightseeing",
        "enS": "We go sightseeing all day.",
        "tr": "gezip görmek",
        "trS": "Bütün gün gezip görürüz."
      },
      {
        "en": "stay overnight",
        "enS": "I stay overnight at a friend's house.",
        "tr": "geceyi geçirmek",
        "trS": "Bir arkadaşımın evinde geceyi geçiririm."
      },
      {
        "en": "travel light",
        "enS": "She travels light with one bag.",
        "tr": "az eşyayla seyahat etmek",
        "trS": "O tek çantayla az eşyayla seyahat eder."
      },
      {
        "en": "get a refund",
        "enS": "He gets a refund for the canceled flight.",
        "tr": "iade almak",
        "trS": "O iptal edilen uçuş için iade alır."
      }
    ]
  },
  "Hava Durumu": {
    "color": "#4E7FA8",
    "cards": [
      {
        "en": "be sunny",
        "enS": "It is sunny today.",
        "tr": "güneşli olmak",
        "trS": "Bugün hava güneşli."
      },
      {
        "en": "be cloudy",
        "enS": "It gets cloudy in the afternoon.",
        "tr": "bulutlu olmak",
        "trS": "Öğleden sonra hava bulutlanıyor."
      },
      {
        "en": "be rainy",
        "enS": "It is rainy this week.",
        "tr": "yağmurlu olmak",
        "trS": "Bu hafta hava yağmurlu."
      },
      {
        "en": "be windy",
        "enS": "It is very windy today.",
        "tr": "rüzgarlı olmak",
        "trS": "Bugün hava çok rüzgarlı."
      },
      {
        "en": "be foggy",
        "enS": "It is foggy in the morning.",
        "tr": "sisli olmak",
        "trS": "Sabahları hava sisli."
      },
      {
        "en": "be snowy",
        "enS": "It is snowy in December.",
        "tr": "karlı olmak",
        "trS": "Aralıkta hava karlı."
      },
      {
        "en": "be humid",
        "enS": "It is humid in summer.",
        "tr": "nemli olmak",
        "trS": "Yazın hava nemli."
      },
      {
        "en": "be freezing",
        "enS": "It is freezing outside.",
        "tr": "dondurucu soğuk olmak",
        "trS": "Dışarısı dondurucu soğuk."
      },
      {
        "en": "be boiling hot",
        "enS": "It is boiling hot in July.",
        "tr": "çok sıcak olmak",
        "trS": "Temmuzda hava çok sıcak."
      },
      {
        "en": "check the forecast",
        "enS": "I check the forecast every morning.",
        "tr": "hava durumuna bakmak",
        "trS": "Her sabah hava durumuna bakarım."
      },
      {
        "en": "carry an umbrella",
        "enS": "She carries an umbrella just in case.",
        "tr": "şemsiye taşımak",
        "trS": "O ihtimale karşı şemsiye taşır."
      },
      {
        "en": "wear a coat",
        "enS": "He wears a coat in winter.",
        "tr": "palto giymek",
        "trS": "O kışın palto giyer."
      },
      {
        "en": "catch a cold",
        "enS": "I catch a cold every winter.",
        "tr": "soğuk almak",
        "trS": "Her kış soğuk alırım."
      },
      {
        "en": "thunder and lightning",
        "enS": "There was thunder and lightning last night.",
        "tr": "gök gürültüsü ve şimşek",
        "trS": "Dün gece gök gürültüsü ve şimşek vardı."
      },
      {
        "en": "a heatwave",
        "enS": "There is a heatwave this week.",
        "tr": "sıcak hava dalgası",
        "trS": "Bu hafta bir sıcak hava dalgası var."
      },
      {
        "en": "a storm is coming",
        "enS": "A storm is coming tonight.",
        "tr": "fırtına geliyor",
        "trS": "Bu gece bir fırtına geliyor."
      },
      {
        "en": "the temperature drops",
        "enS": "The temperature drops at night.",
        "tr": "sıcaklık düşmek",
        "trS": "Gece sıcaklık düşer."
      },
      {
        "en": "the temperature rises",
        "enS": "The temperature rises in summer.",
        "tr": "sıcaklık yükselmek",
        "trS": "Yazın sıcaklık yükselir."
      },
      {
        "en": "a mild climate",
        "enS": "This city has a mild climate.",
        "tr": "ılıman iklim",
        "trS": "Bu şehrin ılıman bir iklimi var."
      },
      {
        "en": "clear skies",
        "enS": "We have clear skies today.",
        "tr": "açık gökyüzü",
        "trS": "Bugün açık bir gökyüzümüz var."
      },
      {
        "en": "a light breeze",
        "enS": "There is a light breeze outside.",
        "tr": "hafif esinti",
        "trS": "Dışarıda hafif bir esinti var."
      },
      {
        "en": "get soaked in the rain",
        "enS": "He got soaked in the rain.",
        "tr": "yağmurda sırılsıklam olmak",
        "trS": "O yağmurda sırılsıklam oldu."
      },
      {
        "en": "a rainbow appears",
        "enS": "A rainbow appears after the rain.",
        "tr": "gökkuşağı çıkmak",
        "trS": "Yağmurdan sonra bir gökkuşağı çıkar."
      },
      {
        "en": "hail falls",
        "enS": "Hail falls during the storm.",
        "tr": "dolu yağmak",
        "trS": "Fırtına sırasında dolu yağar."
      },
      {
        "en": "it drizzles",
        "enS": "It drizzles in the early morning.",
        "tr": "çisenti yağmak",
        "trS": "Sabahın erken saatlerinde çisenti yağar."
      },
      {
        "en": "the sun sets early",
        "enS": "The sun sets early in winter.",
        "tr": "güneş erken batmak",
        "trS": "Kışın güneş erken batar."
      },
      {
        "en": "the sun rises late",
        "enS": "The sun rises late in December.",
        "tr": "güneş geç doğmak",
        "trS": "Aralıkta güneş geç doğar."
      },
      {
        "en": "dress in layers",
        "enS": "I dress in layers in autumn.",
        "tr": "katmanlı giyinmek",
        "trS": "Sonbaharda katmanlı giyinirim."
      }
    ]
  },
  "Sağlık": {
    "color": "#A83E4E",
    "cards": [
      {
        "en": "feel sick",
        "enS": "I feel sick today.",
        "tr": "hasta hissetmek",
        "trS": "Bugün kendimi hasta hissediyorum."
      },
      {
        "en": "have a fever",
        "enS": "She has a fever tonight.",
        "tr": "ateşi olmak",
        "trS": "O bu gece ateşleniyor."
      },
      {
        "en": "have a headache",
        "enS": "He has a headache after work.",
        "tr": "baş ağrısı olmak",
        "trS": "O işten sonra başı ağrıyor."
      },
      {
        "en": "catch the flu",
        "enS": "I caught the flu last week.",
        "tr": "grip olmak",
        "trS": "Geçen hafta gribe yakalandım."
      },
      {
        "en": "see a doctor",
        "enS": "She sees a doctor tomorrow.",
        "tr": "doktora görünmek",
        "trS": "O yarın doktora görünüyor."
      },
      {
        "en": "make an appointment",
        "enS": "I make an appointment for Monday.",
        "tr": "randevu almak",
        "trS": "Pazartesi için randevu alırım."
      },
      {
        "en": "take medicine",
        "enS": "He takes medicine twice a day.",
        "tr": "ilaç almak",
        "trS": "O günde iki kez ilaç alır."
      },
      {
        "en": "get a vaccine",
        "enS": "She gets a vaccine every year.",
        "tr": "aşı olmak",
        "trS": "O her yıl aşı oluyor."
      },
      {
        "en": "break a bone",
        "enS": "He broke his arm skiing.",
        "tr": "kemik kırmak",
        "trS": "O kayak yaparken kolunu kırdı."
      },
      {
        "en": "twist an ankle",
        "enS": "She twisted her ankle running.",
        "tr": "ayak bileğini burkmak",
        "trS": "O koşarken ayak bileğini burktu."
      },
      {
        "en": "recover from illness",
        "enS": "He recovers from illness quickly.",
        "tr": "hastalıktan iyileşmek",
        "trS": "O hastalıktan hızlıca iyileşir."
      },
      {
        "en": "go to the hospital",
        "enS": "We go to the hospital immediately.",
        "tr": "hastaneye gitmek",
        "trS": "Hemen hastaneye gideriz."
      },
      {
        "en": "have surgery",
        "enS": "She has surgery next month.",
        "tr": "ameliyat olmak",
        "trS": "O gelecek ay ameliyat oluyor."
      },
      {
        "en": "check blood pressure",
        "enS": "I check my blood pressure regularly.",
        "tr": "tansiyonu ölçmek",
        "trS": "Tansiyonumu düzenli olarak ölçerim."
      },
      {
        "en": "lose weight",
        "enS": "He loses weight by exercising.",
        "tr": "kilo vermek",
        "trS": "O egzersiz yaparak kilo veriyor."
      },
      {
        "en": "gain weight",
        "enS": "She gains weight during the holidays.",
        "tr": "kilo almak",
        "trS": "O tatillerde kilo alır."
      },
      {
        "en": "exercise regularly",
        "enS": "I exercise regularly every morning.",
        "tr": "düzenli egzersiz yapmak",
        "trS": "Her sabah düzenli egzersiz yaparım."
      },
      {
        "en": "eat healthy",
        "enS": "We try to eat healthy.",
        "tr": "sağlıklı beslenmek",
        "trS": "Sağlıklı beslenmeye çalışırız."
      },
      {
        "en": "get enough sleep",
        "enS": "He doesn't get enough sleep.",
        "tr": "yeterince uyumak",
        "trS": "O yeterince uyumuyor."
      },
      {
        "en": "feel dizzy",
        "enS": "She feels dizzy sometimes.",
        "tr": "baş dönmesi hissetmek",
        "trS": "O bazen baş dönmesi hissediyor."
      },
      {
        "en": "have allergies",
        "enS": "I have allergies in spring.",
        "tr": "alerjisi olmak",
        "trS": "İlkbaharda alerjim oluyor."
      },
      {
        "en": "cough a lot",
        "enS": "He coughs a lot at night.",
        "tr": "çok öksürmek",
        "trS": "O gece çok öksürüyor."
      },
      {
        "en": "sneeze constantly",
        "enS": "She sneezes constantly with a cold.",
        "tr": "sürekli hapşırmak",
        "trS": "O soğuk algınlığıyla sürekli hapşırıyor."
      },
      {
        "en": "feel better",
        "enS": "I feel better after resting.",
        "tr": "daha iyi hissetmek",
        "trS": "Dinlendikten sonra daha iyi hissediyorum."
      },
      {
        "en": "stay healthy",
        "enS": "We try to stay healthy.",
        "tr": "sağlıklı kalmak",
        "trS": "Sağlıklı kalmaya çalışırız."
      },
      {
        "en": "donate blood",
        "enS": "He donates blood twice a year.",
        "tr": "kan bağışlamak",
        "trS": "O yılda iki kez kan bağışlar."
      },
      {
        "en": "get a check-up",
        "enS": "I get a check-up every year.",
        "tr": "kontrolden geçmek",
        "trS": "Her yıl bir kontrolden geçerim."
      },
      {
        "en": "treat a wound",
        "enS": "She treats the wound carefully.",
        "tr": "yarayı tedavi etmek",
        "trS": "O yarayı dikkatlice tedavi eder."
      },
      {
        "en": "feel exhausted",
        "enS": "He feels exhausted after the shift.",
        "tr": "bitkin hissetmek",
        "trS": "O vardiyadan sonra bitkin hissediyor."
      },
      {
        "en": "be in pain",
        "enS": "She is in pain after the fall.",
        "tr": "acı çekmek",
        "trS": "O düşmeden sonra acı çekiyor."
      }
    ]
  },
  "Duygular": {
    "color": "#A8763E",
    "cards": [
      {
        "en": "feel happy",
        "enS": "I feel happy today.",
        "tr": "mutlu hissetmek",
        "trS": "Bugün mutlu hissediyorum."
      },
      {
        "en": "feel sad",
        "enS": "She feels sad about the news.",
        "tr": "üzgün hissetmek",
        "trS": "O haber için üzgün hissediyor."
      },
      {
        "en": "feel angry",
        "enS": "He feels angry about the delay.",
        "tr": "sinirli hissetmek",
        "trS": "O gecikme için sinirli hissediyor."
      },
      {
        "en": "feel nervous",
        "enS": "I feel nervous before exams.",
        "tr": "gergin hissetmek",
        "trS": "Sınavlardan önce gergin hissederim."
      },
      {
        "en": "feel excited",
        "enS": "She feels excited about the trip.",
        "tr": "heyecanlı hissetmek",
        "trS": "O gezi için heyecanlı hissediyor."
      },
      {
        "en": "feel bored",
        "enS": "He feels bored on Sundays.",
        "tr": "sıkılmış hissetmek",
        "trS": "O pazar günleri sıkılmış hissediyor."
      },
      {
        "en": "feel proud",
        "enS": "I feel proud of my son.",
        "tr": "gururlu hissetmek",
        "trS": "Oğlumla gurur duyuyorum."
      },
      {
        "en": "feel jealous",
        "enS": "She feels jealous sometimes.",
        "tr": "kıskanmak",
        "trS": "O bazen kıskanıyor."
      },
      {
        "en": "feel embarrassed",
        "enS": "He feels embarrassed about the mistake.",
        "tr": "utanmak",
        "trS": "O hata için utanıyor."
      },
      {
        "en": "feel grateful",
        "enS": "I feel grateful for my friends.",
        "tr": "minnettar hissetmek",
        "trS": "Arkadaşlarım için minnettar hissediyorum."
      },
      {
        "en": "feel confident",
        "enS": "She feels confident before the interview.",
        "tr": "kendine güvenmek",
        "trS": "O mülakattan önce kendine güveniyor."
      },
      {
        "en": "feel anxious",
        "enS": "He feels anxious about the results.",
        "tr": "kaygılı hissetmek",
        "trS": "O sonuçlar için kaygılı hissediyor."
      },
      {
        "en": "feel relieved",
        "enS": "I feel relieved after the exam.",
        "tr": "rahatlamak",
        "trS": "Sınavdan sonra rahatlıyorum."
      },
      {
        "en": "feel lonely",
        "enS": "She feels lonely at night.",
        "tr": "yalnız hissetmek",
        "trS": "O gece yalnız hissediyor."
      },
      {
        "en": "feel overwhelmed",
        "enS": "He feels overwhelmed with work.",
        "tr": "bunalmış hissetmek",
        "trS": "O işle bunalmış hissediyor."
      },
      {
        "en": "feel disappointed",
        "enS": "I feel disappointed with the result.",
        "tr": "hayal kırıklığına uğramak",
        "trS": "Sonuçla hayal kırıklığına uğradım."
      },
      {
        "en": "calm down",
        "enS": "She calms down after a walk.",
        "tr": "sakinleşmek",
        "trS": "O bir yürüyüşten sonra sakinleşir."
      },
      {
        "en": "lose temper",
        "enS": "He loses his temper easily.",
        "tr": "sinirini kaybetmek",
        "trS": "O kolayca sinirini kaybeder."
      },
      {
        "en": "cheer someone up",
        "enS": "I cheer my friend up when sad.",
        "tr": "birini neşelendirmek",
        "trS": "Arkadaşım üzgün olduğunda onu neşelendiririm."
      },
      {
        "en": "burst into tears",
        "enS": "She burst into tears suddenly.",
        "tr": "ağlamaya başlamak",
        "trS": "O aniden ağlamaya başladı."
      },
      {
        "en": "laugh out loud",
        "enS": "We laugh out loud at the joke.",
        "tr": "kahkaha atmak",
        "trS": "Şakaya kahkaha atarız."
      },
      {
        "en": "hold back tears",
        "enS": "He holds back his tears.",
        "tr": "gözyaşlarını tutmak",
        "trS": "O gözyaşlarını tutuyor."
      },
      {
        "en": "worry about something",
        "enS": "I worry about the future.",
        "tr": "bir şey hakkında endişelenmek",
        "trS": "Gelecek hakkında endişeleniyorum."
      },
      {
        "en": "be in a good mood",
        "enS": "She is in a good mood today.",
        "tr": "keyfi yerinde olmak",
        "trS": "Bugün keyfi yerinde."
      },
      {
        "en": "be in a bad mood",
        "enS": "He is in a bad mood tonight.",
        "tr": "keyfi yerinde olmamak",
        "trS": "O bu gece keyfi yerinde değil."
      },
      {
        "en": "trust one's feelings",
        "enS": "I trust my feelings.",
        "tr": "hislerine güvenmek",
        "trS": "Hislerime güvenirim."
      },
      {
        "en": "hide emotions",
        "enS": "He hides his emotions well.",
        "tr": "duygularını gizlemek",
        "trS": "O duygularını iyi gizler."
      },
      {
        "en": "express feelings",
        "enS": "I express my feelings honestly.",
        "tr": "duygularını ifade etmek",
        "trS": "Duygularımı dürüstçe ifade ederim."
      }
    ]
  },
  "Ev ve Eşyalar": {
    "color": "#5A5A3E",
    "cards": [
      {
        "en": "furnish an apartment",
        "enS": "They furnish the apartment slowly.",
        "tr": "daireyi döşemek",
        "trS": "Onlar daireyi yavaşça döşer."
      },
      {
        "en": "rent an apartment",
        "enS": "We rent an apartment downtown.",
        "tr": "daire kiralamak",
        "trS": "Şehir merkezinde bir daire kiralarız."
      },
      {
        "en": "pay the rent",
        "enS": "I pay the rent on the first.",
        "tr": "kira ödemek",
        "trS": "Ayın birinde kira öderim."
      },
      {
        "en": "fix a leak",
        "enS": "He fixes a leak in the sink.",
        "tr": "sızıntıyı onarmak",
        "trS": "O lavabodaki sızıntıyı onarır."
      },
      {
        "en": "change a light bulb",
        "enS": "She changes a light bulb quickly.",
        "tr": "ampul değiştirmek",
        "trS": "O hızlıca bir ampul değiştirir."
      },
      {
        "en": "vacuum the carpet",
        "enS": "I vacuum the carpet on Saturdays.",
        "tr": "halıyı süpürmek",
        "trS": "Cumartesileri halıyı süpürürüm."
      },
      {
        "en": "mop the floor",
        "enS": "He mops the floor every week.",
        "tr": "yeri paspaslamak",
        "trS": "O her hafta yeri paspaslar."
      },
      {
        "en": "dust the shelves",
        "enS": "She dusts the shelves regularly.",
        "tr": "rafların tozunu almak",
        "trS": "O rafların tozunu düzenli olarak alır."
      },
      {
        "en": "take out recycling",
        "enS": "We take out recycling on Tuesdays.",
        "tr": "geri dönüşümü çıkarmak",
        "trS": "Salı günleri geri dönüşümü çıkarırız."
      },
      {
        "en": "repaint a wall",
        "enS": "He repaints the wall this weekend.",
        "tr": "duvarı boyamak",
        "trS": "O bu hafta sonu duvarı boyuyor."
      },
      {
        "en": "assemble furniture",
        "enS": "I assemble furniture myself.",
        "tr": "mobilya monte etmek",
        "trS": "Mobilyayı kendim monte ederim."
      },
      {
        "en": "unclog a drain",
        "enS": "She unclogs the drain with a tool.",
        "tr": "gideri açmak",
        "trS": "O gideri bir aletle açar."
      },
      {
        "en": "move furniture",
        "enS": "We move furniture around the room.",
        "tr": "mobilya taşımak",
        "trS": "Odadaki mobilyayı taşırız."
      },
      {
        "en": "hang a picture",
        "enS": "He hangs a picture on the wall.",
        "tr": "tablo asmak",
        "trS": "O duvara bir tablo asar."
      },
      {
        "en": "install curtains",
        "enS": "She installs new curtains.",
        "tr": "perde takmak",
        "trS": "O yeni perdeler takar."
      },
      {
        "en": "organize a closet",
        "enS": "I organize my closet every season.",
        "tr": "dolabı düzenlemek",
        "trS": "Her mevsim dolabımı düzenlerim."
      },
      {
        "en": "declutter a room",
        "enS": "We declutter the room together.",
        "tr": "odayı düzene sokmak",
        "trS": "Odayı birlikte düzene sokarız."
      },
      {
        "en": "do the gardening",
        "enS": "He does the gardening on weekends.",
        "tr": "bahçe işi yapmak",
        "trS": "O hafta sonları bahçe işi yapar."
      },
      {
        "en": "mow the lawn",
        "enS": "She mows the lawn every week.",
        "tr": "çimleri biçmek",
        "trS": "O her hafta çimleri biçer."
      },
      {
        "en": "trim the hedges",
        "enS": "He trims the hedges in spring.",
        "tr": "çitleri kırpmak",
        "trS": "O ilkbaharda çitleri kırpar."
      },
      {
        "en": "take care of appliances",
        "enS": "I take care of the appliances.",
        "tr": "cihazlara bakım yapmak",
        "trS": "Cihazlara bakım yaparım."
      },
      {
        "en": "call a plumber",
        "enS": "We call a plumber for the leak.",
        "tr": "tesisatçı çağırmak",
        "trS": "Sızıntı için tesisatçı çağırırız."
      },
      {
        "en": "call an electrician",
        "enS": "She calls an electrician for the wiring.",
        "tr": "elektrikçi çağırmak",
        "trS": "O kablolar için elektrikçi çağırır."
      },
      {
        "en": "set up wifi",
        "enS": "He sets up the wifi at home.",
        "tr": "wifi kurmak",
        "trS": "O evde wifi kurar."
      },
      {
        "en": "pay utility bills",
        "enS": "I pay utility bills online.",
        "tr": "fatura ödemek",
        "trS": "Faturaları internetten öderim."
      },
      {
        "en": "store items in the attic",
        "enS": "We store items in the attic.",
        "tr": "eşyaları tavan arasında saklamak",
        "trS": "Eşyaları tavan arasında saklarız."
      }
    ]
  },
  "Alışveriş": {
    "color": "#7A3E5A",
    "cards": [
      {
        "en": "try on clothes",
        "enS": "I try on clothes before buying.",
        "tr": "kıyafet denemek",
        "trS": "Almadan önce kıyafet denerim."
      },
      {
        "en": "return an item",
        "enS": "She returns an item to the store.",
        "tr": "ürünü iade etmek",
        "trS": "O bir ürünü mağazaya iade eder."
      },
      {
        "en": "exchange a product",
        "enS": "He exchanges a product for a bigger size.",
        "tr": "ürünü değiştirmek",
        "trS": "O bir ürünü daha büyük bedenle değiştirir."
      },
      {
        "en": "compare prices",
        "enS": "I compare prices before buying.",
        "tr": "fiyat karşılaştırmak",
        "trS": "Almadan önce fiyat karşılaştırırım."
      },
      {
        "en": "look for a discount",
        "enS": "She looks for a discount online.",
        "tr": "indirim aramak",
        "trS": "O internette indirim arar."
      },
      {
        "en": "use a coupon",
        "enS": "He uses a coupon at checkout.",
        "tr": "kupon kullanmak",
        "trS": "O ödeme sırasında kupon kullanır."
      },
      {
        "en": "pay in cash",
        "enS": "I pay in cash at the market.",
        "tr": "nakit ödemek",
        "trS": "Markette nakit öderim."
      },
      {
        "en": "pay by card",
        "enS": "She pays by card usually.",
        "tr": "kartla ödemek",
        "trS": "O genellikle kartla öder."
      },
      {
        "en": "stand in line",
        "enS": "We stand in line at the checkout.",
        "tr": "sırada beklemek",
        "trS": "Kasada sırada bekleriz."
      },
      {
        "en": "browse online",
        "enS": "He browses online for shoes.",
        "tr": "internette gezinmek",
        "trS": "O ayakkabı için internette gezinir."
      },
      {
        "en": "add to cart",
        "enS": "I add items to my cart.",
        "tr": "sepete eklemek",
        "trS": "Ürünleri sepetime eklerim."
      },
      {
        "en": "checkout online",
        "enS": "She checks out online quickly.",
        "tr": "internetten ödeme yapmak",
        "trS": "O hızlıca internetten ödeme yapar."
      },
      {
        "en": "track a package",
        "enS": "I track my package daily.",
        "tr": "kargoyu takip etmek",
        "trS": "Kargomu her gün takip ederim."
      },
      {
        "en": "return for a refund",
        "enS": "He returns the item for a refund.",
        "tr": "iade için geri götürmek",
        "trS": "O ürünü iade için geri götürür."
      },
      {
        "en": "bargain with a seller",
        "enS": "She bargains with the seller.",
        "tr": "satıcıyla pazarlık yapmak",
        "trS": "O satıcıyla pazarlık yapar."
      },
      {
        "en": "go window shopping",
        "enS": "We go window shopping on Sundays.",
        "tr": "vitrin gezmek",
        "trS": "Pazar günleri vitrin geziyoruz."
      },
      {
        "en": "buy in bulk",
        "enS": "I buy rice in bulk.",
        "tr": "toptan almak",
        "trS": "Pirinci toptan alırım."
      },
      {
        "en": "check the receipt",
        "enS": "He checks the receipt carefully.",
        "tr": "fişi kontrol etmek",
        "trS": "O fişi dikkatlice kontrol eder."
      },
      {
        "en": "shop for groceries",
        "enS": "She shops for groceries weekly.",
        "tr": "market alışverişi yapmak",
        "trS": "O haftalık market alışverişi yapar."
      },
      {
        "en": "look for a size",
        "enS": "I look for my size in the store.",
        "tr": "beden aramak",
        "trS": "Mağazada bedenimi ararım."
      },
      {
        "en": "be out of stock",
        "enS": "This item is out of stock.",
        "tr": "stokta olmamak",
        "trS": "Bu ürün stokta yok."
      },
      {
        "en": "add a review",
        "enS": "She adds a review after buying.",
        "tr": "yorum eklemek",
        "trS": "O aldıktan sonra yorum ekler."
      },
      {
        "en": "queue at the till",
        "enS": "He queues at the till patiently.",
        "tr": "kasada beklemek",
        "trS": "O kasada sabırla bekler."
      },
      {
        "en": "haggle over the price",
        "enS": "They haggle over the price.",
        "tr": "fiyat üzerinde pazarlık etmek",
        "trS": "Onlar fiyat üzerinde pazarlık eder."
      },
      {
        "en": "get a receipt",
        "enS": "I get a receipt after paying.",
        "tr": "fiş almak",
        "trS": "Ödedikten sonra fiş alırım."
      },
      {
        "en": "wrap a gift",
        "enS": "She wraps a gift nicely.",
        "tr": "hediye paketlemek",
        "trS": "O bir hediyeyi güzelce paketler."
      },
      {
        "en": "place an order",
        "enS": "He places an order online.",
        "tr": "sipariş vermek",
        "trS": "O internetten sipariş verir."
      },
      {
        "en": "cancel an order",
        "enS": "She cancels her order last minute.",
        "tr": "siparişi iptal etmek",
        "trS": "O son dakika siparişini iptal eder."
      }
    ]
  },
  "Zaman ve Sayılar": {
    "color": "#3E5A7A",
    "cards": [
      {
        "en": "tell the time",
        "enS": "I can tell the time in English.",
        "tr": "saati söylemek",
        "trS": "İngilizce saati söyleyebilirim."
      },
      {
        "en": "be on time",
        "enS": "He is always on time.",
        "tr": "zamanında olmak",
        "trS": "O her zaman zamanında."
      },
      {
        "en": "be late",
        "enS": "She is late for work.",
        "tr": "geç kalmak",
        "trS": "O işe geç kalıyor."
      },
      {
        "en": "be early",
        "enS": "We are early for the meeting.",
        "tr": "erken gelmek",
        "trS": "Toplantıya erken geliyoruz."
      },
      {
        "en": "set a reminder",
        "enS": "I set a reminder for the call.",
        "tr": "hatırlatıcı kurmak",
        "trS": "Arama için hatırlatıcı kurarım."
      },
      {
        "en": "count numbers",
        "enS": "Children learn to count numbers.",
        "tr": "sayıları saymak",
        "trS": "Çocuklar sayıları saymayı öğrenir."
      },
      {
        "en": "calculate a total",
        "enS": "I calculate the total quickly.",
        "tr": "toplamı hesaplamak",
        "trS": "Toplamı hızlıca hesaplarım."
      },
      {
        "en": "double a number",
        "enS": "She doubles the number easily.",
        "tr": "sayıyı ikiye katlamak",
        "trS": "O sayıyı kolayca ikiye katlar."
      },
      {
        "en": "divide equally",
        "enS": "We divide the bill equally.",
        "tr": "eşit bölmek",
        "trS": "Hesabı eşit böleriz."
      },
      {
        "en": "measure the distance",
        "enS": "He measures the distance carefully.",
        "tr": "mesafeyi ölçmek",
        "trS": "O mesafeyi dikkatlice ölçer."
      },
      {
        "en": "estimate the cost",
        "enS": "I estimate the cost roughly.",
        "tr": "maliyeti tahmin etmek",
        "trS": "Maliyeti kabaca tahmin ederim."
      },
      {
        "en": "round a number",
        "enS": "She rounds the number up.",
        "tr": "sayıyı yuvarlamak",
        "trS": "O sayıyı yukarı yuvarlar."
      },
      {
        "en": "schedule an event",
        "enS": "I schedule the event for next week.",
        "tr": "etkinlik planlamak",
        "trS": "Etkinliği gelecek hafta için planlarım."
      },
      {
        "en": "postpone a meeting",
        "enS": "He postpones the meeting to Friday.",
        "tr": "toplantıyı ertelemek",
        "trS": "O toplantıyı cumaya erteler."
      },
      {
        "en": "reschedule an appointment",
        "enS": "She reschedules her appointment.",
        "tr": "randevuyu yeniden planlamak",
        "trS": "O randevusunu yeniden planlar."
      },
      {
        "en": "run out of time",
        "enS": "We run out of time during the test.",
        "tr": "vakit yetmemek",
        "trS": "Sınav sırasında vaktimiz yetmez."
      },
      {
        "en": "waste time",
        "enS": "He wastes time on his phone.",
        "tr": "vakit kaybetmek",
        "trS": "O telefonuyla vakit kaybeder."
      },
      {
        "en": "save time",
        "enS": "This method saves time.",
        "tr": "vakit kazandırmak",
        "trS": "Bu yöntem vakit kazandırır."
      },
      {
        "en": "spend time together",
        "enS": "We spend time together on weekends.",
        "tr": "birlikte vakit geçirmek",
        "trS": "Hafta sonları birlikte vakit geçiririz."
      },
      {
        "en": "be in a hurry",
        "enS": "I am in a hurry this morning.",
        "tr": "acele etmek",
        "trS": "Bu sabah acelem var."
      },
      {
        "en": "take one's time",
        "enS": "She takes her time with the work.",
        "tr": "acele etmemek",
        "trS": "O işle acele etmiyor."
      },
      {
        "en": "lose track of time",
        "enS": "He loses track of time while reading.",
        "tr": "zamanı fark etmemek",
        "trS": "O okurken zamanı fark etmiyor."
      },
      {
        "en": "set a deadline",
        "enS": "We set a deadline for Monday.",
        "tr": "son tarih belirlemek",
        "trS": "Pazartesi için bir son tarih belirleriz."
      },
      {
        "en": "count down",
        "enS": "Children count down to New Year.",
        "tr": "geri sayım yapmak",
        "trS": "Çocuklar yeni yıla geri sayım yapar."
      },
      {
        "en": "add up numbers",
        "enS": "I add up the numbers quickly.",
        "tr": "sayıları toplamak",
        "trS": "Sayıları hızlıca toplarım."
      },
      {
        "en": "subtract a number",
        "enS": "She subtracts the discount.",
        "tr": "sayı çıkarmak",
        "trS": "O indirimi çıkarır."
      },
      {
        "en": "multiply by two",
        "enS": "He multiplies the amount by two.",
        "tr": "ikiyle çarpmak",
        "trS": "O miktarı ikiyle çarpar."
      },
      {
        "en": "be punctual",
        "enS": "She is very punctual.",
        "tr": "dakik olmak",
        "trS": "O çok dakik."
      }
    ]
  },
  "Giyim": {
    "color": "#7A5A3E",
    "cards": [
      {
        "en": "put on shoes",
        "enS": "I put on my shoes quickly.",
        "tr": "ayakkabı giymek",
        "trS": "Ayakkabılarımı hızlıca giyerim."
      },
      {
        "en": "take off a jacket",
        "enS": "He takes off his jacket indoors.",
        "tr": "ceketi çıkarmak",
        "trS": "O içeride ceketini çıkarır."
      },
      {
        "en": "try on a dress",
        "enS": "She tries on a new dress.",
        "tr": "elbise denemek",
        "trS": "O yeni bir elbise dener."
      },
      {
        "en": "fit well",
        "enS": "This shirt fits well.",
        "tr": "iyi oturmak",
        "trS": "Bu gömlek iyi oturuyor."
      },
      {
        "en": "be too tight",
        "enS": "These pants are too tight.",
        "tr": "çok dar olmak",
        "trS": "Bu pantolon çok dar."
      },
      {
        "en": "be too loose",
        "enS": "This dress is too loose.",
        "tr": "çok bol olmak",
        "trS": "Bu elbise çok bol."
      },
      {
        "en": "match colors",
        "enS": "She matches her colors well.",
        "tr": "renkleri eşleştirmek",
        "trS": "O renklerini iyi eşleştirir."
      },
      {
        "en": "iron a shirt",
        "enS": "I iron my shirt every morning.",
        "tr": "gömlek ütülemek",
        "trS": "Her sabah gömleğimi ütülerim."
      },
      {
        "en": "fold clothes",
        "enS": "He folds his clothes neatly.",
        "tr": "kıyafet katlamak",
        "trS": "O kıyafetlerini düzgünce katlar."
      },
      {
        "en": "hang up a coat",
        "enS": "She hangs up her coat.",
        "tr": "mont asmak",
        "trS": "O montunu asar."
      },
      {
        "en": "wear a uniform",
        "enS": "He wears a uniform at work.",
        "tr": "üniforma giymek",
        "trS": "O işte üniforma giyer."
      },
      {
        "en": "dress up for an event",
        "enS": "We dress up for the wedding.",
        "tr": "özel giyinmek",
        "trS": "Düğün için özel giyiniriz."
      },
      {
        "en": "dress casually",
        "enS": "I dress casually on weekends.",
        "tr": "rahat giyinmek",
        "trS": "Hafta sonları rahat giyinirim."
      },
      {
        "en": "wear a scarf",
        "enS": "She wears a scarf in winter.",
        "tr": "atkı takmak",
        "trS": "O kışın atkı takar."
      },
      {
        "en": "put on a belt",
        "enS": "He puts on a belt with his pants.",
        "tr": "kemer takmak",
        "trS": "O pantolonuyla kemer takar."
      },
      {
        "en": "button a shirt",
        "enS": "I button my shirt slowly.",
        "tr": "gömleği düğmelemek",
        "trS": "Gömleğimi yavaşça düğmelerim."
      },
      {
        "en": "zip up a jacket",
        "enS": "She zips up her jacket.",
        "tr": "ceketin fermuarını çekmek",
        "trS": "O ceketinin fermuarını çeker."
      },
      {
        "en": "roll up sleeves",
        "enS": "He rolls up his sleeves to work.",
        "tr": "kolları sıvamak",
        "trS": "O çalışmak için kollarını sıvar."
      },
      {
        "en": "polish shoes",
        "enS": "I polish my shoes on Sundays.",
        "tr": "ayakkabı parlatmak",
        "trS": "Pazar günleri ayakkabılarımı parlatırım."
      },
      {
        "en": "wear glasses",
        "enS": "She wears glasses for reading.",
        "tr": "gözlük takmak",
        "trS": "O okumak için gözlük takar."
      },
      {
        "en": "wear a hat",
        "enS": "He wears a hat in the sun.",
        "tr": "şapka takmak",
        "trS": "O güneşte şapka takar."
      },
      {
        "en": "get dressed up",
        "enS": "We get dressed up for the party.",
        "tr": "şık giyinmek",
        "trS": "Parti için şık giyiniriz."
      },
      {
        "en": "wash clothes",
        "enS": "I wash clothes twice a week.",
        "tr": "kıyafet yıkamak",
        "trS": "Haftada iki kez kıyafet yıkarım."
      },
      {
        "en": "dry clothes",
        "enS": "She dries clothes on the balcony.",
        "tr": "kıyafet kurutmak",
        "trS": "O balkonda kıyafet kurutur."
      },
      {
        "en": "sew a button",
        "enS": "He sews a button on his shirt.",
        "tr": "düğme dikmek",
        "trS": "O gömleğine bir düğme diker."
      },
      {
        "en": "patch a hole",
        "enS": "She patches a hole in her jeans.",
        "tr": "deliği yamalamak",
        "trS": "O kotundaki bir deliği yamalar."
      },
      {
        "en": "shrink in the wash",
        "enS": "This shirt shrank in the wash.",
        "tr": "yıkamada küçülmek",
        "trS": "Bu gömlek yıkamada küçüldü."
      },
      {
        "en": "go out of fashion",
        "enS": "Those shoes went out of fashion.",
        "tr": "modası geçmek",
        "trS": "O ayakkabıların modası geçti."
      }
    ]
  },
  "Teknoloji": {
    "color": "#3E3E7A",
    "cards": [
      {
        "en": "charge a laptop",
        "enS": "I charge my laptop overnight.",
        "tr": "dizüstü bilgisayarı şarj etmek",
        "trS": "Dizüstü bilgisayarımı gece boyunca şarj ederim."
      },
      {
        "en": "update software",
        "enS": "She updates the software regularly.",
        "tr": "yazılımı güncellemek",
        "trS": "O yazılımı düzenli olarak günceller."
      },
      {
        "en": "restart a computer",
        "enS": "He restarts his computer often.",
        "tr": "bilgisayarı yeniden başlatmak",
        "trS": "O bilgisayarını sık sık yeniden başlatır."
      },
      {
        "en": "install an app",
        "enS": "I install a new app today.",
        "tr": "uygulama yüklemek",
        "trS": "Bugün yeni bir uygulama yüklerim."
      },
      {
        "en": "delete a file",
        "enS": "She deletes an old file.",
        "tr": "dosyayı silmek",
        "trS": "O eski bir dosyayı siler."
      },
      {
        "en": "back up data",
        "enS": "I back up my data every week.",
        "tr": "veri yedeklemek",
        "trS": "Her hafta verilerimi yedeklerim."
      },
      {
        "en": "connect to wifi",
        "enS": "He connects to wifi automatically.",
        "tr": "wifi'ye bağlanmak",
        "trS": "O otomatik olarak wifi'ye bağlanır."
      },
      {
        "en": "send a message",
        "enS": "I send a message to my friend.",
        "tr": "mesaj göndermek",
        "trS": "Arkadaşıma bir mesaj gönderirim."
      },
      {
        "en": "make a video call",
        "enS": "She makes a video call to her family.",
        "tr": "görüntülü arama yapmak",
        "trS": "O ailesine görüntülü arama yapar."
      },
      {
        "en": "take a screenshot",
        "enS": "He takes a screenshot of the page.",
        "tr": "ekran görüntüsü almak",
        "trS": "O sayfanın ekran görüntüsünü alır."
      },
      {
        "en": "browse the web",
        "enS": "I browse the web in the evening.",
        "tr": "internette gezinmek",
        "trS": "Akşamları internette gezinirim."
      },
      {
        "en": "stream a movie",
        "enS": "We stream a movie on Fridays.",
        "tr": "film izlemek",
        "trS": "Cuma günleri film izleriz."
      },
      {
        "en": "upload a photo",
        "enS": "She uploads a photo to social media.",
        "tr": "fotoğraf yüklemek",
        "trS": "O sosyal medyaya bir fotoğraf yükler."
      },
      {
        "en": "download a file",
        "enS": "He downloads a file quickly.",
        "tr": "dosya indirmek",
        "trS": "O hızlıca bir dosya indirir."
      },
      {
        "en": "reset a password",
        "enS": "I reset my password often.",
        "tr": "şifreyi sıfırlamak",
        "trS": "Şifremi sık sık sıfırlarım."
      },
      {
        "en": "block a contact",
        "enS": "She blocks an unknown contact.",
        "tr": "kişiyi engellemek",
        "trS": "O bilinmeyen bir kişiyi engeller."
      },
      {
        "en": "mute notifications",
        "enS": "He mutes his notifications at night.",
        "tr": "bildirimleri sessize almak",
        "trS": "O gece bildirimlerini sessize alır."
      },
      {
        "en": "scan a document",
        "enS": "I scan a document for work.",
        "tr": "belge taramak",
        "trS": "İş için bir belge tararım."
      },
      {
        "en": "print a document",
        "enS": "She prints a document at the office.",
        "tr": "belge yazdırmak",
        "trS": "O ofiste bir belge yazdırır."
      },
      {
        "en": "troubleshoot an issue",
        "enS": "He troubleshoots the internet issue.",
        "tr": "sorunu gidermek",
        "trS": "O internet sorununu giderir."
      },
      {
        "en": "sync devices",
        "enS": "I sync my devices automatically.",
        "tr": "cihazları senkronize etmek",
        "trS": "Cihazlarımı otomatik olarak senkronize ederim."
      },
      {
        "en": "enable notifications",
        "enS": "She enables notifications for the app.",
        "tr": "bildirimleri açmak",
        "trS": "O uygulama için bildirimleri açar."
      },
      {
        "en": "clear the cache",
        "enS": "I clear the cache on my phone.",
        "tr": "önbelleği temizlemek",
        "trS": "Telefonumdaki önbelleği temizlerim."
      },
      {
        "en": "update an app",
        "enS": "He updates the app weekly.",
        "tr": "uygulamayı güncellemek",
        "trS": "O uygulamayı haftalık günceller."
      },
      {
        "en": "lose signal",
        "enS": "We lose signal in the tunnel.",
        "tr": "sinyal kaybetmek",
        "trS": "Tünelde sinyal kaybederiz."
      },
      {
        "en": "charge a phone",
        "enS": "I charge my phone every night.",
        "tr": "telefonu şarj etmek",
        "trS": "Her gece telefonumu şarj ederim."
      },
      {
        "en": "set up an account",
        "enS": "She sets up a new account.",
        "tr": "hesap oluşturmak",
        "trS": "O yeni bir hesap oluşturur."
      },
      {
        "en": "log into an account",
        "enS": "He logs into his account daily.",
        "tr": "hesaba giriş yapmak",
        "trS": "O her gün hesabına giriş yapar."
      }
    ]
  },
  "Doğa ve Hayvanlar": {
    "color": "#4A7A3E",
    "cards": [
      {
        "en": "go for a hike",
        "enS": "We go for a hike on weekends.",
        "tr": "doğa yürüyüşüne çıkmak",
        "trS": "Hafta sonları doğa yürüyüşüne çıkarız."
      },
      {
        "en": "walk the dog",
        "enS": "I walk the dog every evening.",
        "tr": "köpeği gezdirmek",
        "trS": "Her akşam köpeği gezdiririm."
      },
      {
        "en": "feed the birds",
        "enS": "She feeds the birds in the park.",
        "tr": "kuşları beslemek",
        "trS": "O parkta kuşları besler."
      },
      {
        "en": "plant a tree",
        "enS": "He plants a tree in spring.",
        "tr": "ağaç dikmek",
        "trS": "O ilkbaharda ağaç diker."
      },
      {
        "en": "water the flowers",
        "enS": "I water the flowers daily.",
        "tr": "çiçekleri sulamak",
        "trS": "Çiçekleri her gün sularım."
      },
      {
        "en": "climb a mountain",
        "enS": "They climb a mountain every year.",
        "tr": "dağa tırmanmak",
        "trS": "Onlar her yıl bir dağa tırmanır."
      },
      {
        "en": "swim in the sea",
        "enS": "We swim in the sea in summer.",
        "tr": "denizde yüzmek",
        "trS": "Yazın denizde yüzeriz."
      },
      {
        "en": "go fishing",
        "enS": "He goes fishing on Sundays.",
        "tr": "balığa gitmek",
        "trS": "O pazar günleri balığa gider."
      },
      {
        "en": "watch the sunset",
        "enS": "She watches the sunset every evening.",
        "tr": "gün batımını izlemek",
        "trS": "O her akşam gün batımını izler."
      },
      {
        "en": "collect leaves",
        "enS": "Children collect leaves in autumn.",
        "tr": "yaprak toplamak",
        "trS": "Çocuklar sonbaharda yaprak toplar."
      },
      {
        "en": "spot wildlife",
        "enS": "We spot wildlife on the trail.",
        "tr": "vahşi yaşam gözlemlemek",
        "trS": "Patikada vahşi yaşamı gözlemleriz."
      },
      {
        "en": "protect the environment",
        "enS": "I try to protect the environment.",
        "tr": "çevreyi korumak",
        "trS": "Çevreyi korumaya çalışırım."
      },
      {
        "en": "recycle waste",
        "enS": "She recycles waste at home.",
        "tr": "atığı geri dönüştürmek",
        "trS": "O evde atığı geri dönüştürür."
      },
      {
        "en": "pick fruit",
        "enS": "They pick fruit from the garden.",
        "tr": "meyve toplamak",
        "trS": "Onlar bahçeden meyve toplar."
      },
      {
        "en": "feed the fish",
        "enS": "I feed the fish every morning.",
        "tr": "balıkları beslemek",
        "trS": "Her sabah balıkları beslerim."
      },
      {
        "en": "adopt a pet",
        "enS": "She adopts a pet from a shelter.",
        "tr": "evcil hayvan sahiplenmek",
        "trS": "O bir barınaktan evcil hayvan sahiplenir."
      },
      {
        "en": "train a dog",
        "enS": "He trains his dog patiently.",
        "tr": "köpek eğitmek",
        "trS": "O sabırla köpeğini eğitir."
      },
      {
        "en": "groom a pet",
        "enS": "She grooms her cat weekly.",
        "tr": "evcil hayvan bakımı yapmak",
        "trS": "O haftalık kedisinin bakımını yapar."
      },
      {
        "en": "take a pet to the vet",
        "enS": "I take my dog to the vet.",
        "tr": "evcil hayvanı veterinere götürmek",
        "trS": "Köpeğimi veterinere götürürüm."
      },
      {
        "en": "explore a forest",
        "enS": "We explore the forest together.",
        "tr": "ormanı keşfetmek",
        "trS": "Ormanı birlikte keşfederiz."
      },
      {
        "en": "camp outdoors",
        "enS": "They camp outdoors in summer.",
        "tr": "kamp yapmak",
        "trS": "Onlar yazın kamp yapar."
      },
      {
        "en": "watch the stars",
        "enS": "I watch the stars at night.",
        "tr": "yıldızları izlemek",
        "trS": "Gece yıldızları izlerim."
      },
      {
        "en": "avoid a storm",
        "enS": "We avoid the storm by staying inside.",
        "tr": "fırtınadan kaçınmak",
        "trS": "İçeride kalarak fırtınadan kaçınırız."
      },
      {
        "en": "listen to birds sing",
        "enS": "I listen to birds sing in the morning.",
        "tr": "kuş sesi dinlemek",
        "trS": "Sabahları kuş sesi dinlerim."
      },
      {
        "en": "grow vegetables",
        "enS": "She grows vegetables in her garden.",
        "tr": "sebze yetiştirmek",
        "trS": "O bahçesinde sebze yetiştirir."
      },
      {
        "en": "chase a butterfly",
        "enS": "The child chases a butterfly.",
        "tr": "kelebek kovalamak",
        "trS": "Çocuk bir kelebeği kovalıyor."
      },
      {
        "en": "migrate south",
        "enS": "Birds migrate south in winter.",
        "tr": "güneye göç etmek",
        "trS": "Kuşlar kışın güneye göç eder."
      },
      {
        "en": "hibernate in winter",
        "enS": "Bears hibernate in winter.",
        "tr": "kış uykusuna yatmak",
        "trS": "Ayılar kışın kış uykusuna yatar."
      }
    ]
  },
  "Şehir ve Yönler": {
    "color": "#7A6A3E",
    "cards": [
      {
        "en": "cross the street",
        "enS": "I cross the street carefully.",
        "tr": "caddeyi geçmek",
        "trS": "Caddeyi dikkatlice geçerim."
      },
      {
        "en": "turn left",
        "enS": "Turn left at the corner.",
        "tr": "sola dönmek",
        "trS": "Köşede sola dönün."
      },
      {
        "en": "turn right",
        "enS": "Turn right after the bridge.",
        "tr": "sağa dönmek",
        "trS": "Köprüden sonra sağa dönün."
      },
      {
        "en": "go straight",
        "enS": "Go straight for two blocks.",
        "tr": "düz gitmek",
        "trS": "İki blok düz gidin."
      },
      {
        "en": "take the elevator",
        "enS": "We take the elevator to the fifth floor.",
        "tr": "asansöre binmek",
        "trS": "Beşinci kata asansöre bineriz."
      },
      {
        "en": "take the stairs",
        "enS": "He takes the stairs instead.",
        "tr": "merdiveni kullanmak",
        "trS": "O bunun yerine merdiveni kullanır."
      },
      {
        "en": "find a parking spot",
        "enS": "I find a parking spot nearby.",
        "tr": "park yeri bulmak",
        "trS": "Yakında bir park yeri bulurum."
      },
      {
        "en": "pay for parking",
        "enS": "She pays for parking downtown.",
        "tr": "park ücreti ödemek",
        "trS": "O şehir merkezinde park ücreti öder."
      },
      {
        "en": "get stuck in traffic",
        "enS": "We get stuck in traffic every morning.",
        "tr": "trafikte sıkışmak",
        "trS": "Her sabah trafikte sıkışırız."
      },
      {
        "en": "take a shortcut",
        "enS": "He takes a shortcut home.",
        "tr": "kestirmeden gitmek",
        "trS": "O eve kestirmeden gider."
      },
      {
        "en": "follow the signs",
        "enS": "I follow the signs to the station.",
        "tr": "tabelaları takip etmek",
        "trS": "İstasyona kadar tabelaları takip ederim."
      },
      {
        "en": "cross a bridge",
        "enS": "We cross a bridge to get home.",
        "tr": "köprüden geçmek",
        "trS": "Eve varmak için bir köprüden geçeriz."
      },
      {
        "en": "walk down the street",
        "enS": "She walks down the street slowly.",
        "tr": "caddede yürümek",
        "trS": "O caddede yavaşça yürür."
      },
      {
        "en": "live in the suburbs",
        "enS": "They live in the suburbs.",
        "tr": "banliyöde yaşamak",
        "trS": "Onlar banliyöde yaşıyor."
      },
      {
        "en": "live downtown",
        "enS": "I live downtown near the park.",
        "tr": "şehir merkezinde yaşamak",
        "trS": "Park yakınında şehir merkezinde yaşıyorum."
      },
      {
        "en": "take public transport",
        "enS": "We take public transport to work.",
        "tr": "toplu taşıma kullanmak",
        "trS": "İşe toplu taşımayla gideriz."
      },
      {
        "en": "miss the bus",
        "enS": "He misses the bus sometimes.",
        "tr": "otobüsü kaçırmak",
        "trS": "O bazen otobüsü kaçırır."
      },
      {
        "en": "wait at a crosswalk",
        "enS": "She waits at the crosswalk.",
        "tr": "yaya geçidinde beklemek",
        "trS": "O yaya geçidinde bekler."
      },
      {
        "en": "get directions",
        "enS": "I get directions from a local.",
        "tr": "yol tarifi almak",
        "trS": "Yerel birinden yol tarifi alırım."
      },
      {
        "en": "be located near",
        "enS": "The store is located near the station.",
        "tr": "yakınında bulunmak",
        "trS": "Mağaza istasyonun yakınında bulunuyor."
      },
      {
        "en": "walk past a building",
        "enS": "We walk past the old building.",
        "tr": "binanın önünden geçmek",
        "trS": "Eski binanın önünden geçeriz."
      },
      {
        "en": "ask a passerby",
        "enS": "I ask a passerby for help.",
        "tr": "geçen birine sormak",
        "trS": "Geçen birine yardım için sorarım."
      },
      {
        "en": "go around the block",
        "enS": "He goes around the block twice.",
        "tr": "bloğu dolaşmak",
        "trS": "O bloğu iki kez dolaşır."
      },
      {
        "en": "be stuck at a red light",
        "enS": "We are stuck at a red light.",
        "tr": "kırmızı ışıkta beklemek",
        "trS": "Kırmızı ışıkta bekliyoruz."
      },
      {
        "en": "navigate with an app",
        "enS": "I navigate with an app in a new city.",
        "tr": "uygulamayla yön bulmak",
        "trS": "Yeni bir şehirde uygulamayla yön bulurum."
      },
      {
        "en": "get on the wrong bus",
        "enS": "He gets on the wrong bus by mistake.",
        "tr": "yanlış otobüse binmek",
        "trS": "O yanlışlıkla yanlış otobüse biner."
      },
      {
        "en": "walk in circles",
        "enS": "We walked in circles looking for the place.",
        "tr": "daire çizerek yürümek",
        "trS": "Yeri ararken daire çizerek yürüdük."
      },
      {
        "en": "be within walking distance",
        "enS": "The shop is within walking distance.",
        "tr": "yürüme mesafesinde olmak",
        "trS": "Dükkan yürüme mesafesinde."
      }
    ]
  },
  "Okul ve Eğitim": {
    "color": "#3E7A6A",
    "cards": [
      {
        "en": "attend class",
        "enS": "I attend class every day.",
        "tr": "derse katılmak",
        "trS": "Her gün derse katılırım."
      },
      {
        "en": "take an exam",
        "enS": "She takes an exam tomorrow.",
        "tr": "sınava girmek",
        "trS": "O yarın sınava giriyor."
      },
      {
        "en": "pass a test",
        "enS": "He passes the test easily.",
        "tr": "sınavı geçmek",
        "trS": "O sınavı kolayca geçer."
      },
      {
        "en": "fail a course",
        "enS": "She fails the course this term.",
        "tr": "dersten kalmak",
        "trS": "O bu dönem dersten kalır."
      },
      {
        "en": "study for an exam",
        "enS": "I study for the exam all night.",
        "tr": "sınav için çalışmak",
        "trS": "Sınav için bütün gece çalışırım."
      },
      {
        "en": "submit an assignment",
        "enS": "He submits his assignment on time.",
        "tr": "ödevi teslim etmek",
        "trS": "O ödevini zamanında teslim eder."
      },
      {
        "en": "raise a hand",
        "enS": "She raises her hand in class.",
        "tr": "el kaldırmak",
        "trS": "O derste elini kaldırır."
      },
      {
        "en": "take notes in class",
        "enS": "I take notes in every class.",
        "tr": "derste not almak",
        "trS": "Her derste not alırım."
      },
      {
        "en": "graduate from university",
        "enS": "He graduates from university this year.",
        "tr": "üniversiteden mezun olmak",
        "trS": "O bu yıl üniversiteden mezun oluyor."
      },
      {
        "en": "apply to a university",
        "enS": "She applies to a university abroad.",
        "tr": "üniversiteye başvurmak",
        "trS": "O yurt dışındaki bir üniversiteye başvurur."
      },
      {
        "en": "get a scholarship",
        "enS": "He gets a scholarship for his grades.",
        "tr": "burs almak",
        "trS": "O notları için burs alır."
      },
      {
        "en": "skip a class",
        "enS": "She skips a class sometimes.",
        "tr": "dersi asmak",
        "trS": "O bazen dersi asar."
      },
      {
        "en": "repeat a grade",
        "enS": "He repeats a grade at school.",
        "tr": "sınıfta kalmak",
        "trS": "O okulda sınıfta kalır."
      },
      {
        "en": "do homework",
        "enS": "I do my homework after dinner.",
        "tr": "ödev yapmak",
        "trS": "Akşam yemeğinden sonra ödevimi yaparım."
      },
      {
        "en": "memorize vocabulary",
        "enS": "She memorizes new vocabulary daily.",
        "tr": "kelime ezberlemek",
        "trS": "O her gün yeni kelimeler ezberler."
      },
      {
        "en": "give a speech",
        "enS": "He gives a speech at graduation.",
        "tr": "konuşma yapmak",
        "trS": "O mezuniyette bir konuşma yapar."
      },
      {
        "en": "join a club",
        "enS": "I join the debate club.",
        "tr": "kulübe katılmak",
        "trS": "Tartışma kulübüne katılırım."
      },
      {
        "en": "take a course online",
        "enS": "She takes a course online.",
        "tr": "internetten kurs almak",
        "trS": "O internetten bir kurs alır."
      },
      {
        "en": "ask a question",
        "enS": "He asks a question in class.",
        "tr": "soru sormak",
        "trS": "O derste bir soru sorar."
      },
      {
        "en": "explain a topic",
        "enS": "The teacher explains the topic clearly.",
        "tr": "konuyu açıklamak",
        "trS": "Öğretmen konuyu açıkça açıklar."
      },
      {
        "en": "correct a mistake",
        "enS": "She corrects her mistake quickly.",
        "tr": "hatayı düzeltmek",
        "trS": "O hatasını hızlıca düzeltir."
      },
      {
        "en": "improve a grade",
        "enS": "I improve my grade this semester.",
        "tr": "notu yükseltmek",
        "trS": "Bu dönem notumu yükseltirim."
      },
      {
        "en": "cheat on a test",
        "enS": "He never cheats on a test.",
        "tr": "sınavda kopya çekmek",
        "trS": "O asla sınavda kopya çekmez."
      },
      {
        "en": "revise for finals",
        "enS": "I revise for finals every June.",
        "tr": "final için tekrar yapmak",
        "trS": "Her haziran final için tekrar yaparım."
      },
      {
        "en": "hand in an essay",
        "enS": "She hands in her essay early.",
        "tr": "deneme yazısını teslim etmek",
        "trS": "O deneme yazısını erken teslim eder."
      },
      {
        "en": "attend a lecture",
        "enS": "We attend a lecture on Tuesdays.",
        "tr": "konferansa katılmak",
        "trS": "Salı günleri bir konferansa katılırız."
      },
      {
        "en": "take a break between classes",
        "enS": "I take a break between classes.",
        "tr": "dersler arası mola vermek",
        "trS": "Dersler arasında mola veririm."
      },
      {
        "en": "drop out of school",
        "enS": "He never dropped out of school.",
        "tr": "okulu bırakmak",
        "trS": "O hiç okulu bırakmadı."
      }
    ]
  },
  "Spor ve Hobiler": {
    "color": "#7A3E3E",
    "cards": [
      {
        "en": "play football",
        "enS": "I play football on weekends.",
        "tr": "futbol oynamak",
        "trS": "Hafta sonları futbol oynarım."
      },
      {
        "en": "go swimming",
        "enS": "She goes swimming every morning.",
        "tr": "yüzmeye gitmek",
        "trS": "O her sabah yüzmeye gider."
      },
      {
        "en": "go for a run",
        "enS": "He goes for a run in the park.",
        "tr": "koşuya çıkmak",
        "trS": "O parkta koşuya çıkar."
      },
      {
        "en": "lift weights",
        "enS": "I lift weights at the gym.",
        "tr": "ağırlık kaldırmak",
        "trS": "Spor salonunda ağırlık kaldırırım."
      },
      {
        "en": "do yoga as a sport",
        "enS": "She does yoga every evening.",
        "tr": "yoga yapmak",
        "trS": "O her akşam yoga yapar."
      },
      {
        "en": "ride a bike",
        "enS": "He rides a bike to work.",
        "tr": "bisiklete binmek",
        "trS": "O işe bisikletle gider."
      },
      {
        "en": "play chess",
        "enS": "We play chess on rainy days.",
        "tr": "satranç oynamak",
        "trS": "Yağmurlu günlerde satranç oynarız."
      },
      {
        "en": "paint a picture",
        "enS": "She paints a picture on weekends.",
        "tr": "resim yapmak",
        "trS": "O hafta sonları resim yapar."
      },
      {
        "en": "play a musical instrument",
        "enS": "He plays the guitar every day.",
        "tr": "müzik aleti çalmak",
        "trS": "O her gün gitar çalar."
      },
      {
        "en": "take photographs",
        "enS": "I take photographs as a hobby.",
        "tr": "fotoğraf çekmek",
        "trS": "Hobi olarak fotoğraf çekerim."
      },
      {
        "en": "collect stamps",
        "enS": "He collects stamps since childhood.",
        "tr": "pul biriktirmek",
        "trS": "O çocukluğundan beri pul biriktirir."
      },
      {
        "en": "knit a sweater",
        "enS": "She knits a sweater for winter.",
        "tr": "kazak örmek",
        "trS": "O kış için bir kazak örer."
      },
      {
        "en": "join a gym",
        "enS": "I join a gym in January.",
        "tr": "spor salonuna üye olmak",
        "trS": "Ocak ayında bir spor salonuna üye olurum."
      },
      {
        "en": "win a match",
        "enS": "They win the match easily.",
        "tr": "maçı kazanmak",
        "trS": "Onlar maçı kolayca kazanır."
      },
      {
        "en": "lose a game",
        "enS": "He loses the game sometimes.",
        "tr": "oyunu kaybetmek",
        "trS": "O bazen oyunu kaybeder."
      },
      {
        "en": "score a goal",
        "enS": "She scores a goal in the first half.",
        "tr": "gol atmak",
        "trS": "O ilk yarıda gol atar."
      },
      {
        "en": "practice a sport",
        "enS": "I practice tennis twice a week.",
        "tr": "spor pratiği yapmak",
        "trS": "Haftada iki kez tenis pratiği yaparım."
      },
      {
        "en": "join a team",
        "enS": "He joins the local team.",
        "tr": "takıma katılmak",
        "trS": "O yerel takıma katılır."
      },
      {
        "en": "watch a game",
        "enS": "We watch the game together.",
        "tr": "maç izlemek",
        "trS": "Maçı birlikte izleriz."
      },
      {
        "en": "go camping",
        "enS": "They go camping in summer.",
        "tr": "kampa gitmek",
        "trS": "Onlar yazın kampa gider."
      },
      {
        "en": "do a puzzle",
        "enS": "She does a puzzle in her free time.",
        "tr": "bulmaca çözmek",
        "trS": "O boş zamanında bulmaca çözer."
      },
      {
        "en": "read a novel",
        "enS": "I read a novel before bed.",
        "tr": "roman okumak",
        "trS": "Yatmadan önce roman okurum."
      },
      {
        "en": "garden as a hobby",
        "enS": "He gardens as a hobby.",
        "tr": "hobi olarak bahçıvanlık yapmak",
        "trS": "O hobi olarak bahçıvanlıkla uğraşır."
      },
      {
        "en": "learn a new skill",
        "enS": "I learn a new skill every year.",
        "tr": "yeni beceri öğrenmek",
        "trS": "Her yıl yeni bir beceri öğrenirim."
      },
      {
        "en": "join a dance class",
        "enS": "She joins a dance class.",
        "tr": "dans kursuna katılmak",
        "trS": "O bir dans kursuna katılır."
      },
      {
        "en": "go bowling",
        "enS": "We go bowling on Fridays.",
        "tr": "bowling oynamaya gitmek",
        "trS": "Cuma günleri bowling oynamaya gideriz."
      },
      {
        "en": "play video games",
        "enS": "He plays video games at night.",
        "tr": "video oyunu oynamak",
        "trS": "O gece video oyunu oynar."
      },
      {
        "en": "do woodworking",
        "enS": "She does woodworking in her garage.",
        "tr": "ahşap işçiliği yapmak",
        "trS": "O garajında ahşap işçiliği yapar."
      }
    ]
  },
  "Sosyal Yaşam": {
    "color": "#5A3E7A",
    "cards": [
      {
        "en": "make new friends",
        "enS": "I make new friends easily.",
        "tr": "yeni arkadaşlar edinmek",
        "trS": "Kolayca yeni arkadaşlar edinirim."
      },
      {
        "en": "hang out with friends",
        "enS": "We hang out with friends on weekends.",
        "tr": "arkadaşlarla takılmak",
        "trS": "Hafta sonları arkadaşlarla takılırız."
      },
      {
        "en": "throw a party",
        "enS": "She throws a party for her birthday.",
        "tr": "parti düzenlemek",
        "trS": "O doğum günü için parti düzenler."
      },
      {
        "en": "attend a wedding",
        "enS": "We attend a wedding this weekend.",
        "tr": "düğüne katılmak",
        "trS": "Bu hafta sonu bir düğüne katılırız."
      },
      {
        "en": "send an invitation",
        "enS": "I send an invitation to my friends.",
        "tr": "davetiye göndermek",
        "trS": "Arkadaşlarıma davetiye gönderirim."
      },
      {
        "en": "catch up with someone",
        "enS": "He catches up with an old friend.",
        "tr": "biriyle hasret gidermek",
        "trS": "O eski bir arkadaşıyla hasret gider."
      },
      {
        "en": "gossip about someone",
        "enS": "They gossip about their neighbor.",
        "tr": "biri hakkında dedikodu yapmak",
        "trS": "Onlar komşuları hakkında dedikodu yapar."
      },
      {
        "en": "keep a secret",
        "enS": "She keeps a secret well.",
        "tr": "sır saklamak",
        "trS": "O bir sırrı iyi saklar."
      },
      {
        "en": "break a promise",
        "enS": "He breaks his promise sometimes.",
        "tr": "sözünü tutmamak",
        "trS": "O bazen sözünü tutmaz."
      },
      {
        "en": "keep a promise",
        "enS": "I keep my promises always.",
        "tr": "sözünü tutmak",
        "trS": "Sözlerimi her zaman tutarım."
      },
      {
        "en": "introduce a friend",
        "enS": "She introduces her friend to the group.",
        "tr": "arkadaşını tanıştırmak",
        "trS": "O arkadaşını gruba tanıştırır."
      },
      {
        "en": "make plans",
        "enS": "We make plans for the weekend.",
        "tr": "plan yapmak",
        "trS": "Hafta sonu için plan yaparız."
      },
      {
        "en": "cancel plans",
        "enS": "He cancels the plans last minute.",
        "tr": "planı iptal etmek",
        "trS": "O planı son dakika iptal eder."
      },
      {
        "en": "text a friend",
        "enS": "I text a friend every day.",
        "tr": "arkadaşına mesaj atmak",
        "trS": "Her gün bir arkadaşıma mesaj atarım."
      },
      {
        "en": "call a friend",
        "enS": "She calls a friend after work.",
        "tr": "arkadaşını aramak",
        "trS": "O işten sonra bir arkadaşını arar."
      },
      {
        "en": "share news",
        "enS": "I share good news with my family.",
        "tr": "haber paylaşmak",
        "trS": "Ailemle iyi haberler paylaşırım."
      },
      {
        "en": "give advice",
        "enS": "He gives advice to his friend.",
        "tr": "tavsiye vermek",
        "trS": "O arkadaşına tavsiye verir."
      },
      {
        "en": "take advice",
        "enS": "She takes her mother's advice.",
        "tr": "tavsiye almak",
        "trS": "O annesinin tavsiyesini alır."
      },
      {
        "en": "complain about something",
        "enS": "He complains about the weather.",
        "tr": "bir şeyden şikayet etmek",
        "trS": "O hava durumundan şikayet eder."
      },
      {
        "en": "compliment someone",
        "enS": "I compliment my friend's dress.",
        "tr": "birine iltifat etmek",
        "trS": "Arkadaşımın elbisesine iltifat ederim."
      },
      {
        "en": "tease a friend",
        "enS": "They tease each other a lot.",
        "tr": "arkadaşıyla dalga geçmek",
        "trS": "Onlar birbirleriyle çok dalga geçer."
      },
      {
        "en": "make an excuse",
        "enS": "He makes an excuse for being late.",
        "tr": "bahane uydurmak",
        "trS": "O geç kalmak için bahane uydurur."
      },
      {
        "en": "reconnect with an old friend",
        "enS": "I reconnect with an old friend online.",
        "tr": "eski arkadaşla yeniden bağlantı kurmak",
        "trS": "İnternette eski bir arkadaşımla yeniden bağlantı kurarım."
      },
      {
        "en": "attend a reunion",
        "enS": "We attend a school reunion.",
        "tr": "buluşmaya katılmak",
        "trS": "Bir okul buluşmasına katılırız."
      },
      {
        "en": "volunteer for a cause",
        "enS": "She volunteers for a good cause.",
        "tr": "bir amaç için gönüllü olmak",
        "trS": "O iyi bir amaç için gönüllü olur."
      },
      {
        "en": "donate to charity",
        "enS": "He donates to charity every year.",
        "tr": "hayır kurumuna bağış yapmak",
        "trS": "O her yıl bir hayır kurumuna bağış yapar."
      },
      {
        "en": "attend a networking event",
        "enS": "I attend a networking event monthly.",
        "tr": "networking etkinliğine katılmak",
        "trS": "Aylık bir networking etkinliğine katılırım."
      },
      {
        "en": "stay in touch online",
        "enS": "We stay in touch online.",
        "tr": "internetten iletişimde kalmak",
        "trS": "İnternet üzerinden iletişimde kalırız."
      },
      {
        "en": "avoid a conflict",
        "enS": "She avoids conflict with her coworker.",
        "tr": "çatışmadan kaçınmak",
        "trS": "O iş arkadaşıyla çatışmadan kaçınır."
      },
      {
        "en": "resolve a disagreement",
        "enS": "They resolve their disagreement calmly.",
        "tr": "anlaşmazlığı çözmek",
        "trS": "Onlar anlaşmazlıklarını sakin bir şekilde çözer."
      },
      {
        "en": "build a friendship",
        "enS": "I build a friendship slowly.",
        "tr": "arkadaşlık kurmak",
        "trS": "Yavaşça bir arkadaşlık kurarım."
      },
      {
        "en": "lose touch with someone",
        "enS": "He loses touch with his old classmates.",
        "tr": "biriyle bağlantıyı kaybetmek",
        "trS": "O eski sınıf arkadaşlarıyla bağlantısını kaybeder."
      },
      {
        "en": "forgive a friend",
        "enS": "I forgive my friend quickly.",
        "tr": "arkadaşını affetmek",
        "trS": "Arkadaşımı hızlıca affederim."
      },
      {
        "en": "apologize to a friend",
        "enS": "She apologizes to her friend.",
        "tr": "arkadaşından özür dilemek",
        "trS": "O arkadaşından özür diler."
      },
      {
        "en": "plan a surprise",
        "enS": "We plan a surprise for her birthday.",
        "tr": "sürpriz planlamak",
        "trS": "Doğum günü için bir sürpriz planlarız."
      },
      {
        "en": "keep someone company",
        "enS": "I keep my grandmother company.",
        "tr": "birine eşlik etmek",
        "trS": "Büyükanneme eşlik ederim."
      },
      {
        "en": "support a friend",
        "enS": "He supports his friend through hard times.",
        "tr": "arkadaşına destek olmak",
        "trS": "O zor zamanlarda arkadaşına destek olur."
      },
      {
        "en": "celebrate together",
        "enS": "We celebrate together every year.",
        "tr": "birlikte kutlamak",
        "trS": "Her yıl birlikte kutlarız."
      }
    ]
  }
};

// ---- Durum (state) ----
let currentTab = null;       // aktif kategori (henüz seçilmedi = null)
let currentIndex = 0;
let flipped = false;
let onlyUnlearned = false;   // sadece öğrenilmeyenleri göster filtresi

// ---- localStorage ile öğrenme takibi ----
const STORAGE_KEY = "kartlar_learned_v1";

function loadLearned() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveLearned(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

let learnedMap = loadLearned();

function cardKey(tab, card) {
  return `${tab}::${card.en}`;
}

function isLearned(tab, card) {
  return !!learnedMap[cardKey(tab, card)];
}

function toggleLearned(tab, card) {
  const key = cardKey(tab, card);
  learnedMap[key] = !learnedMap[key];
  saveLearned(learnedMap);
}

function countLearned(tab) {
  return data[tab].cards.filter(c => isLearned(tab, c)).length;
}

function countLearnedTotal() {
  return Object.keys(data).reduce((sum, tab) => sum + countLearned(tab), 0);
}

function totalCardCount() {
  return Object.keys(data).reduce((sum, tab) => sum + data[tab].cards.length, 0);
}

// ---- DOM referansları ----
const welcomeScreen = document.getElementById('welcome-screen');
const categoriesScreen = document.getElementById('categories-screen');
const cardsScreen = document.getElementById('cards-screen');

const startBtn = document.getElementById('startBtn');
const homeBtn = document.getElementById('homeBtn');
const categoriesBtn = document.getElementById('categoriesBtn');

const categoriesListEl = document.getElementById('categoriesList');
const overallProgressEl = document.getElementById('overallProgress');
const overallBarFillEl = document.getElementById('overallBarFill');

const deckEl = document.getElementById('deck');
const counterEl = document.getElementById('counter');
const progressEl = document.getElementById('progress');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const filterBtn = document.getElementById('filterBtn');

const screens = { welcome: welcomeScreen, categories: categoriesScreen, cards: cardsScreen };

// ---- Ekran geçişleri ----
function showScreen(name) {
  Object.values(screens).forEach(el => el.classList.add('hidden'));
  screens[name].classList.remove('hidden');
}

startBtn.onclick = () => {
  renderCategoriesList();
  updateOverallProgress();
  showScreen('categories');
};

homeBtn.onclick = () => {
  showScreen('welcome');
};

categoriesBtn.onclick = () => {
  renderCategoriesList();
  updateOverallProgress();
  showScreen('categories');
};

// ---- Kategoriler ekranı: dikey liste ----
function renderCategoriesList() {
  categoriesListEl.innerHTML = '';
  Object.keys(data).forEach(tab => {
    const total = data[tab].cards.length;
    const learned = countLearned(tab);
    const pct = total ? Math.round((learned / total) * 100) : 0;
    const color = data[tab].color;

    const card = document.createElement('div');
    card.className = 'category-card';
    card.style.borderLeftColor = color;

    card.innerHTML = `
      <div class="category-name">${tab}</div>
      <div class="category-progress-wrap">
        <div class="category-progress-text">${learned}/${total} öğrenildi</div>
        <div class="category-progress-bar">
          <div class="category-progress-fill" style="width:${pct}%; background:${color};"></div>
        </div>
      </div>
    `;

    card.onclick = () => selectCategory(tab);
    categoriesListEl.appendChild(card);
  });
}

function selectCategory(tab) {
  currentTab = tab;
  currentIndex = 0;
  flipped = false;
  onlyUnlearned = false;
  showScreen('cards');
  renderCardScreen();
}

// ---- Yardımcı: aktif kategoride gösterilecek kart listesi ----
function getVisibleList() {
  const list = data[currentTab].cards;
  if (!onlyUnlearned) return list;
  return list.filter(c => !isLearned(currentTab, c));
}

function renderCard() {
  const list = getVisibleList();
  const color = data[currentTab].color;

  // Filtre uygulanmış listede kart kalmadıysa
  if (list.length === 0) {
    deckEl.innerHTML = `
      <div class="empty-state">
        🎉 Bu kategorideki tüm kelimeleri öğrendin!<br>
        <span class="empty-sub">Filtreyi kapatıp tekrar göz atabilirsin.</span>
      </div>
    `;
    counterEl.textContent = `0 / 0`;
    progressEl.textContent = `${currentTab} — tamamlandı`;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    updateOverallProgress();
    return;
  }

  if (currentIndex >= list.length) currentIndex = list.length - 1;
  if (currentIndex < 0) currentIndex = 0;

  const card = list[currentIndex];
  const learned = isLearned(currentTab, card);

  deckEl.innerHTML = `
    <div class="card">
      <div class="card-inner" id="cardInner">
        <div class="face face-front">
          <div class="time-tag" style="background:${color}22; color:${color};">${currentTab}</div>
          ${learned ? '<div class="learned-badge">✓ öğrenildi</div>' : ''}
          <div class="word-en">${card.en}</div>
          <div class="sentence-en">${card.enS}</div>
          <div class="hint">dokun ve çevir</div>
        </div>
        <div class="face face-back">
          <div class="time-tag" style="background:rgba(255,255,255,0.15); color:white;">Türkçe</div>
          <div class="word-tr">${card.tr}</div>
          <div class="sentence-tr">${card.trS}</div>
          <button class="learn-btn ${learned ? 'is-learned' : ''}" id="learnBtn">
            ${learned ? '✓ Öğrenildi' : 'Öğrendim olarak işaretle'}
          </button>
        </div>
      </div>
    </div>
  `;

  const inner = document.getElementById('cardInner');
  if (flipped) inner.classList.add('flipped');
  inner.onclick = (e) => {
    if (e.target.id === 'learnBtn') return; // buton tıklamasında kart çevirme tetiklenmesin
    flipped = !flipped;
    inner.classList.toggle('flipped');
  };

  const learnBtn = document.getElementById('learnBtn');
  learnBtn.onclick = (e) => {
    e.stopPropagation();
    toggleLearned(currentTab, card);
    renderCardScreen();
  };

  counterEl.textContent = `${currentIndex + 1} / ${list.length}`;
  progressEl.textContent = `${currentTab} — Kart ${currentIndex + 1}${onlyUnlearned ? ' (filtre: öğrenilmeyenler)' : ''}`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === list.length - 1;

  updateOverallProgress();
}

function updateOverallProgress() {
  const learned = countLearnedTotal();
  const total = totalCardCount();
  const pct = total ? Math.round((learned / total) * 100) : 0;
  if (overallProgressEl) overallProgressEl.textContent = `Toplam: ${learned}/${total} kelime öğrenildi (%${pct})`;
  if (overallBarFillEl) overallBarFillEl.style.width = `${pct}%`;
}

function renderCardScreen() {
  renderCard();
  if (filterBtn) {
    filterBtn.classList.toggle('active', onlyUnlearned);
    filterBtn.textContent = onlyUnlearned ? '🔎 Tümünü göster' : '🔎 Sadece öğrenilmeyenler';
  }
}

// ---- Fisher-Yates karıştırma ----
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- Kontroller ----
prevBtn.onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    flipped = false;
    renderCard();
  }
};

nextBtn.onclick = () => {
  const list = getVisibleList();
  if (currentIndex < list.length - 1) {
    currentIndex++;
    flipped = false;
    renderCard();
  }
};

if (shuffleBtn) {
  shuffleBtn.onclick = () => {
    shuffleArray(data[currentTab].cards);
    currentIndex = 0;
    flipped = false;
    renderCardScreen();
  };
}

if (filterBtn) {
  filterBtn.onclick = () => {
    onlyUnlearned = !onlyUnlearned;
    currentIndex = 0;
    flipped = false;
    renderCardScreen();
  };
}

// ---- Başlangıç: sadece Anasayfa görünür (HTML'de zaten öyle tanımlı) ----
