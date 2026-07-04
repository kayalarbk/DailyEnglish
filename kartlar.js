// Kelime listesi (word list) — günlük aktiviteler
const data = {
  Morning: {
    color: "#D9A441",
    cards: [
      { en: "wake up", enS: "I wake up at seven.", tr: "uyanmak", trS: "Ben yedide uyanırım." },
      { en: "brush teeth", enS: "I brush my teeth every morning.", tr: "diş fırçalamak", trS: "Her sabah dişlerimi fırçalarım." },
      { en: "have breakfast", enS: "We have breakfast together.", tr: "kahvaltı yapmak", trS: "Birlikte kahvaltı yaparız." },
      { en: "get dressed", enS: "She gets dressed quickly.", tr: "giyinmek", trS: "O hızlıca giyinir." },
      { en: "make coffee", enS: "He makes coffee every day.", tr: "kahve yapmak", trS: "O her gün kahve yapar." }
    ]
  },
  Afternoon: {
    color: "#C1622E",
    cards: [
      { en: "have lunch", enS: "I have lunch at noon.", tr: "öğle yemeği yemek", trS: "Öğlen öğle yemeği yerim." },
      { en: "go to work", enS: "She goes to work by bus.", tr: "işe gitmek", trS: "O otobüsle işe gider." },
      { en: "take a break", enS: "We take a break at three.", tr: "mola vermek", trS: "Saat üçte mola veririz." },
      { en: "answer emails", enS: "He answers emails after lunch.", tr: "e-postalara cevap vermek", trS: "O öğle yemeğinden sonra e-postalara cevap verir." },
      { en: "meet a friend", enS: "I meet a friend for coffee.", tr: "bir arkadaşla buluşmak", trS: "Kahve içmek için bir arkadaşla buluşurum." }
    ]
  },
  Evening: {
    color: "#4A5A8A",
    cards: [
      { en: "cook dinner", enS: "We cook dinner together.", tr: "akşam yemeği pişirmek", trS: "Birlikte akşam yemeği pişiririz." },
      { en: "watch TV", enS: "I watch TV after dinner.", tr: "televizyon izlemek", trS: "Akşam yemeğinden sonra televizyon izlerim." },
      { en: "go for a walk", enS: "They go for a walk in the park.", tr: "yürüyüşe çıkmak", trS: "Parkta yürüyüşe çıkarlar." },
      { en: "call family", enS: "She calls her family every evening.", tr: "aileyi aramak", trS: "O her akşam ailesini arar." },
      { en: "do the dishes", enS: "He does the dishes after eating.", tr: "bulaşık yıkamak", trS: "O yemekten sonra bulaşık yıkar." }
    ]
  },
  Night: {
    color: "#2E3550",
    cards: [
      { en: "take a shower", enS: "I take a shower before bed.", tr: "duş almak", trS: "Yatmadan önce duş alırım." },
      { en: "read a book", enS: "She reads a book at night.", tr: "kitap okumak", trS: "O gece kitap okur." },
      { en: "set an alarm", enS: "I set an alarm for six.", tr: "alarm kurmak", trS: "Altıya alarm kurarım." },
      { en: "turn off the light", enS: "He turns off the light and sleeps.", tr: "ışığı kapatmak", trS: "O ışığı kapatır ve uyur." },
      { en: "go to bed", enS: "We go to bed at eleven.", tr: "yatmak", trS: "Saat onbirde yatarız." }
    ]
  }
};

let currentTab = "Morning";
let currentIndex = 0;
let flipped = false;

const tabsEl = document.getElementById('tabs');
const deckEl = document.getElementById('deck');
const counterEl = document.getElementById('counter');
const progressEl = document.getElementById('progress');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function renderTabs() {
  tabsEl.innerHTML = '';
  Object.keys(data).forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (tab === currentTab ? ' active' : '');
    btn.textContent = tab;
    btn.style.borderColor = data[tab].color;
    if (tab === currentTab) {
      btn.style.background = data[tab].color;
      btn.style.borderColor = data[tab].color;
    } else {
      btn.style.color = data[tab].color;
    }
    btn.onclick = () => {
      currentTab = tab;
      currentIndex = 0;
      flipped = false;
      renderAll();
    };
    tabsEl.appendChild(btn);
  });
}

function renderCard() {
  const list = data[currentTab].cards;
  const card = list[currentIndex];
  const color = data[currentTab].color;

  deckEl.innerHTML = `
    <div class="card">
      <div class="card-inner" id="cardInner">
        <div class="face face-front">
          <div class="time-tag" style="background:${color}22; color:${color};">${currentTab}</div>
          <div class="word-en">${card.en}</div>
          <div class="sentence-en">${card.enS}</div>
          <div class="hint">dokun ve çevir</div>
        </div>
        <div class="face face-back">
          <div class="time-tag" style="background:rgba(255,255,255,0.15); color:white;">Türkçe</div>
          <div class="word-tr">${card.tr}</div>
          <div class="sentence-tr">${card.trS}</div>
        </div>
      </div>
    </div>
  `;

  const inner = document.getElementById('cardInner');
  if (flipped) inner.classList.add('flipped');
  inner.onclick = () => {
    flipped = !flipped;
    inner.classList.toggle('flipped');
  };

  counterEl.textContent = `${currentIndex + 1} / ${list.length}`;
  progressEl.textContent = `${currentTab} — Kart ${currentIndex + 1}`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === list.length - 1;
}

function renderAll() {
  renderTabs();
  renderCard();
}

prevBtn.onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    flipped = false;
    renderCard();
  }
};

nextBtn.onclick = () => {
  const list = data[currentTab].cards;
  if (currentIndex < list.length - 1) {
    currentIndex++;
    flipped = false;
    renderCard();
  }
};

renderAll();
