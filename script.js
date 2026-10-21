// ---- 言葉たち ----
const praises = [
  ["えらい", "よくやってる", "息してて偉い", "ここに来たのがもう偉い"],
  [
    "かなりえらい",
    "えらさが滲み出てる",
    "今日のきみ、ちゃんと頑張ってた",
    "えらいの上位互換",
  ],
  [
    "今日ここまで来たの、すごいよ",
    "その努力、ちゃんと見てたよ",
    "えらさの自己ベスト更新",
    "えらいを通り越して尊い",
  ],
  [
    "天才では？",
    "才能が隠しきれてない",
    "IQが部屋の温度を上げている",
    "その頑張り、教科書に載せたい",
  ],
  [
    "きみの努力、町内で噂になってる",
    "商店街がきみの名前でセールを始めた",
    "回覧板にきみの功績が載った",
    "近所の猫がきみに敬礼した",
  ],
  [
    "日本がきみに感謝している",
    "富士山がきみに会釈した",
    "日本列島がきみの方を向いた",
    "新幹線がきみのために一駅増えた",
  ],
  [
    "地球がきみを誇りに思っている",
    "地球の自転がきみに合わせ始めた",
    "七つの海がきみを讃えている",
    "地球がきみ待ちで回っている",
  ],
  [
    "太陽系会議で表彰が決まりました",
    "月がきみを照らすために満ちた",
    "土星の輪がきみ用に予約された",
    "冥王星がきみのおかげで惑星に戻った",
  ],
  [
    "銀河がきみの名前を語り継ぐ",
    "天の川がきみの通り道になった",
    "ブラックホールもきみの頑張りは吸い込めなかった",
    "銀河の端まできみの噂が届いた",
  ],
  [
    "宇宙はきみが生まれた日を祝日にした",
    "ビッグバンはきみのための前フリだった",
    "宇宙の全原子がきみを応援している",
    "宇宙がきみにおつかれと言った",
  ],
];

const buttonLabels = [
  "はげまして",
  "もっと",
  "もっとちょうだい",
  "足りない",
  "まだ足りない",
  "全然足りない",
  "もっと大きく",
  "地球規模で",
  "銀河規模で",
  "宇宙をよこせ",
];

const tiredWords = [
  "…えらい",
  "えらい（小声）",
  "えら…",
  "褒めの在庫が切れました。補充は明日です",
];

const ssrWords = [
  "きみの存在そのものが国宝に指定されました",
  "全人類がきみの方角に向かって拍手しています",
  "神様がきみのサインを欲しがっています",
  "今日のきみは、歴史の教科書の太字です",
  "時空がきみのために一瞬止まりました",
  "今日はもう休んでいいよ。ちゃんと頑張ったから",
];

const normalWords = praises.flat();
const allWords = [...normalWords, ...ssrWords];

// ---- 実績の一覧 ----
const achievements = [
  { id: "first", name: "はじめての褒め", hint: "1回褒められる" },
  { id: "uchuu", name: "宇宙に到達", hint: "10回褒められる" },
  { id: "kenja", name: "賢者タイム", hint: "宇宙のその先へ" },
  { id: "zaiko", name: "在庫切れ", hint: "褒めを使い切る" },
  { id: "tensei", name: "輪廻転生", hint: "在庫切れのあと、もう一度" },
  { id: "renda", name: "用法・用量を守れなかった", hint: "連打する" },
  { id: "houchi", name: "放置プレイ", hint: "10秒なにもしない" },
  { id: "ssr", name: "選ばれし者", hint: "SSRを引く" },
  {
    id: "complete",
    name: "褒められマスター",
    hint: "通常の褒め言葉をすべて集める",
  },
  { id: "shinya", name: "夜ふかしの勇者", hint: "？？？" },
  { id: "yasumu", name: "本当に休んでね", hint: "？？？" },
];

// ---- 要素 ----
const message = document.getElementById("message");
const button = document.getElementById("praiseBtn");
const badge = document.getElementById("badge");
const toast = document.getElementById("toast");
const zukan = document.getElementById("zukan");
const zukanBtn = document.getElementById("zukanBtn");
const zukanClose = document.getElementById("zukanClose");
const zukanCount = document.getElementById("zukanCount");
const zukanList = document.getElementById("zukanList");
const achievementList = document.getElementById("achievementList");

// ---- 状態 ----
let count = 0;
let lastClick = 0;
let idleTimer;
let toastTimer;
let unlocked = loadList("homeAchievements");
let seen = loadList("homeZukan");

// ---- クリックしたとき ----
button.addEventListener("click", () => {
  const now = Date.now();

  // 連打チェック
  if (now - lastClick < 400) {
    lastClick = now;
    say("褒めは用法・用量を守ってください", { rate: 1.2, pitch: 1.0 });
    unlock("renda");
    return;
  }
  lastClick = now;
  resetIdleTimer();

  count++;

  // 在庫切れのあとは転生
  if (count > praises.length + tiredWords.length) {
    rebirth();
    return;
  }

  document.body.dataset.level = count;
  checkAchievements();

  if (count <= praises.length) {
    if (Math.random() < 0.03) {
      showSSR();
    } else {
      const word = pickRandom(praises[count - 1]);
      say(word, voiceFor(count));
      record(word);
    }
    button.textContent = buttonLabels[count] ?? "もう一回…？";
  } else {
    const index = Math.min(count - praises.length - 1, tiredWords.length - 1);
    say(tiredWords[index], { rate: 0.8, pitch: 0.8 });
    button.textContent = "まだ…？";
  }

  if (count === 10) {
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
  }
});

// ---- 図鑑を開く・閉じる ----
zukanBtn.addEventListener("click", () => {
  renderZukan();
  zukan.showModal();
});

zukanClose.addEventListener("click", () => {
  zukan.close();
});

// ---- 回数で解除される実績 ----
function checkAchievements() {
  if (count === 1) unlock("first");
  if (count === 10) unlock("uchuu");
  if (count === 11) unlock("kenja");
  if (count === praises.length + tiredWords.length) unlock("zaiko");
  if (new Date().getHours() < 4) unlock("shinya");
}

// ---- 転生 ----
function rebirth() {
  count = 0;
  document.body.dataset.level = 0;
  say("転生しました。また褒めさせてください", { rate: 1.0, pitch: 1.2 });
  button.textContent = buttonLabels[0];
  unlock("tensei");
}

// ---- 表示して、しゃべる ----
function say(text, voice) {
  message.textContent = text;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  utter.rate = voice.rate;
  utter.pitch = voice.pitch;
  speechSynthesis.speak(utter);
}

// ---- 段階ごとの声 ----
function voiceFor(level) {
  if (level === 10) return { rate: 0.6, pitch: 0.3 };
  if (level >= 8) return { rate: 1.6, pitch: 2.0 };
  if (level >= 4) return { rate: 1.4, pitch: 1.7 };
  return { rate: 1.0, pitch: 1.2 };
}

// ---- 配列からランダムに1つ選ぶ ----
function pickRandom(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

// ---- SSR演出 ----
function showSSR() {
  const word = pickRandom(ssrWords);
  say("【SSR】" + word, { rate: 0.9, pitch: 1.5 });
  record(word);
  document.body.classList.add("is-ssr");
  setTimeout(() => document.body.classList.remove("is-ssr"), 2000);
  confetti({
    particleCount: 120,
    spread: 70,
    colors: ["#ffd700", "#fff4b0", "#f7c948"],
  });

  unlock("ssr");
  if (word === ssrWords[ssrWords.length - 1]) unlock("yasumu");
}

// ---- 放置で追い褒め ----
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    say("…まだいる？ えらいよ", { rate: 0.9, pitch: 1.0 });
    unlock("houchi");
  }, 10000);
}

// ---- 保存・読み込み ----
function loadList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {
    return [];
  }
}

function saveList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

// ---- 図鑑に記録 ----
function record(word) {
  if (seen.includes(word)) return;

  seen.push(word);
  saveList("homeZukan", seen);

  if (normalWords.every((w) => seen.includes(w))) unlock("complete");
}

// ---- 実績の解除 ----
function unlock(id) {
  if (unlocked.includes(id)) return;

  unlocked.push(id);
  saveList("homeAchievements", unlocked);

  const achievement = achievements.find((a) => a.id === id);
  showToast(`🏆 実績解除：${achievement.name}`);
  updateBadge();
}

function updateBadge() {
  badge.textContent = `実績 ${unlocked.length}/${achievements.length}`;
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-show"), 2500);
}

// ---- 図鑑の中身を作る ----
function renderZukan() {
  zukanCount.textContent = `${seen.length}/${allWords.length}`;

  zukanList.innerHTML = "";
  allWords.forEach((word) => {
    const li = document.createElement("li");
    if (seen.includes(word)) {
      li.textContent = word;
      if (ssrWords.includes(word)) li.classList.add("is-ssr-word");
    } else {
      li.textContent = "？？？";
      li.classList.add("is-locked");
    }
    zukanList.append(li);
  });

  achievementList.innerHTML = "";
  achievements.forEach((a) => {
    const li = document.createElement("li");
    if (unlocked.includes(a.id)) {
      li.textContent = `🏆 ${a.name}`;
    } else {
      li.textContent = `🔒 ${a.hint}`;
      li.classList.add("is-locked");
    }
    achievementList.append(li);
  });
}

// ---- 最初に1回だけ ----
updateBadge();
resetIdleTimer();
dleTimer();
