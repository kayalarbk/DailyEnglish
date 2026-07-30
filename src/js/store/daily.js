// Günlük karma deste ("Bugüne Başla") — deste kurucu.
//
// Bu dosya SAF tutulur: DOM'a, window'a, localStorage'a ve tarih fonksiyonlarına
// dokunmaz; bugünün tarihini bile dışarıdan alır. Sebebi, seçim mantığının
// birim testi yazılabilir kalmasıdır (bkz. PROGRESS.md TODO: "otomatik test yok").
//
// Model: oran değil TAVAN.
//
// Tekrar kartı zamana bağlıdır — ertelenirse unutulur. Yeni kartın acelesi
// yoktur; bugün tanıtılmazsa hiçbir şey kaybolmaz. Bu yüzden sabit bir
// "%70 tekrar / %30 yeni" oranı yanlış olurdu: kuyruk şiştiğinde tam da
// korunması gereken tekrarları kırpardı. Onun yerine tekrarlar önce alınır,
// artan yer yeni kartla doldurulur ve yeni kartın kendi tavanı vardır.

import { shuffleArray } from '../utils.js';

/**
 * Listeleri sırayla dolaşarak tek listeye örer: a1, b1, c1, a2, b2, …
 * Tükenen liste atlanır. Amaç bir GRUBUN desteyi domine etmemesi.
 *
 * Grubun ne olduğuna çağıran karar verir: alan seçimiyle çalışan kullanıcıda
 * grup = alan, bölüm etiketiyle çalışanda grup = bilgi alanı (`dom:`). Kurucu
 * bunu bilmez, yalnız dengeyi kurar.
 * @template T
 * @param {T[][]} lists
 * @returns {T[]}
 */
function roundRobin(lists) {
  const out = [];
  const cursors = lists.map(() => 0);
  let remaining = lists.reduce((sum, list) => sum + list.length, 0);

  while (remaining > 0) {
    for (let i = 0; i < lists.length; i++) {
      if (cursors[i] >= lists[i].length) continue;
      out.push(lists[i][cursors[i]]);
      cursors[i] += 1;
      remaining -= 1;
    }
  }

  return out;
}

/**
 * Bir gruptaki kartları vadesi gelmişler ve hiç görülmemişler olarak ayırır.
 * Vadesi gelenler `due` tarihine göre eskiden yeniye sıralanır: en uzun süredir
 * bekleyen kart en çok unutulmaya yakın olandır.
 *
 * @param {string[]} cardIds grubun kart id'leri (müfredat sırasında)
 * @param {Record<string, {due: string}>} progress
 * @param {string} today YYYY-MM-DD
 */
function splitGroup(cardIds, progress, today) {
  const due = [];
  const fresh = [];

  cardIds.forEach((id) => {
    const record = progress[id];
    if (!record) {
      fresh.push(id);
    } else if (record.due <= today) {
      due.push({ id, due: record.due });
    }
  });

  due.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));

  return { due: due.map((item) => item.id), fresh };
}

/**
 * Günün destesini kurar.
 *
 * @param {object} input
 * @param {Record<string, string[]>} input.cardIdsByGroup
 *   Dengelenecek grupların kart id'leri. Grup ölçütünü çağıran belirler
 *   (alan ya da bilgi alanı). Yeni kart "kaydı olmayan kart" demek olduğu için
 *   kayıtlara bakmak yetmez; kartların evreni dışarıdan verilmelidir.
 * @param {Record<string, {due: string}>} input.progress ham SRS kayıtları
 * @param {{ dailyGoal: number, newPerDay: number }} input.settings
 * @param {string} input.today YYYY-MM-DD (yerel gün anahtarı)
 * @param {(arr: any[]) => any[]} [input.shuffle] testte sabitlenebilsin diye
 * @returns {{ cardIds: string[], stats: { due: number, new: number,
 *   trimmedDue: number, total: number } }}
 */
export function buildDeck({
  cardIdsByGroup = {},
  progress = {},
  settings = {},
  today,
  shuffle = shuffleArray,
} = {}) {
  const dailyGoal = Math.max(0, Math.floor(settings.dailyGoal ?? 0));
  const newPerDay = Math.max(0, Math.floor(settings.newPerDay ?? 0));

  const groupIds = Object.keys(cardIdsByGroup);
  const split = groupIds.map((groupId) =>
    splitGroup(cardIdsByGroup[groupId] || [], progress, today)
  );

  // 1) Tekrarlar önce. Gruplar arası round-robin, grup içinde en eski vade önde.
  const allDue = roundRobin(split.map((part) => part.due));
  const takenDue = allDue.slice(0, dailyGoal);

  // 2) Kalan yer yeni kartlarla dolar; kendi tavanını da aşamaz.
  const room = Math.max(0, dailyGoal - takenDue.length);
  const newLimit = Math.min(newPerDay, room);
  const allNew = roundRobin(split.map((part) => part.fresh));
  const takenNew = allNew.slice(0, newLimit);

  // Yeni ve tekrar kartları iç içe geçsin: deste blok blok gelirse önce
  // "tanıdık" sonra "yabancı" hissi oluşur ve ritim bozulur.
  const cardIds = shuffle([...takenDue, ...takenNew]);

  return {
    cardIds,
    stats: {
      due: takenDue.length,
      new: takenNew.length,
      // Kırpılan tekrarlar ERTELENMEZ: `due` alanına dokunulmaz, kart yalnızca
      // bugün gösterilmez. Vade verisini kurcalamak SRS ölçümünü bozardı.
      trimmedDue: allDue.length - takenDue.length,
      total: cardIds.length,
    },
  };
}

/**
 * Deste kart id'lerini oturum adımlarına çevirir.
 *
 * `mixed` modunda bir kart YA flashcard YA quiz sorusu olur, ikisi birden
 * değil: hem `cards.js` hem `quiz.js` değerlendirmeyi `reviewCard` +
 * `recordReview` üzerinden işliyor, aynı kartı iki kez sunmak kutuyu iki kez
 * oynatır ve gün sayacını bozardı.
 *
 * @param {string[]} cardIds
 * @param {'card'|'quiz'|'mixed'} mode
 * @returns {{ cardId: string, form: 'card'|'quiz' }[]}
 */
export function buildSteps(cardIds, mode) {
  if (mode === 'quiz') return cardIds.map((cardId) => ({ cardId, form: 'quiz' }));
  if (mode !== 'mixed') return cardIds.map((cardId) => ({ cardId, form: 'card' }));
  return cardIds.map((cardId, index) => ({
    cardId,
    form: index % 2 === 1 ? 'quiz' : 'card',
  }));
}

/**
 * Ardışık aynı biçimli adımları öbeklere ayırır.
 * Quiz öbekleri `quizBatch` boyunda kesilir; `quiz.js`'in tur arayüzü
 * (ilerleme çubuğu, sonuç akışı) makul uzunlukta turlarla çalışsın diye.
 *
 * @param {{cardId: string, form: 'card'|'quiz'}[]} steps
 * @param {number} quizBatch
 * @returns {{ form: 'card'|'quiz', start: number, cardIds: string[] }[]}
 */
export function buildRuns(steps, quizBatch = 5) {
  const runs = [];

  steps.forEach((step, index) => {
    const last = runs[runs.length - 1];
    const canExtend =
      last &&
      last.form === step.form &&
      last.start + last.cardIds.length === index &&
      (step.form !== 'quiz' || last.cardIds.length < quizBatch);

    if (canExtend) last.cardIds.push(step.cardId);
    else runs.push({ form: step.form, start: index, cardIds: [step.cardId] });
  });

  return runs;
}
