"use strict";

/* ================= Данные ================= */

const DHIKR = [
  { ar: "سُبْحَانَ ٱللَّهِ", ru: "Субханаллаh — «Пречист Аллаh»", short: "Субханаллаh" },
  { ar: "ٱلْحَمْدُ لِلَّهِ", ru: "Альхамдулиллаh — «Хвала Аллаhу»", short: "Альхамдулиллаh" },
  { ar: "ٱللَّهُ أَكْبَرُ", ru: "Аллаhу акбар — «Аллаh велик»", short: "Аллаhу акбар" },
  { ar: "لَا إِلَٰهَ إِلَّا ٱللَّهُ", ru: "Ла иляhа илля-Ллах — «Нет божества, кроме Аллаhа»", short: "Ла иляhа илля-Ллах" },
  { ar: "أَسْتَغْفِرُ ٱللَّهَ", ru: "Астагфируллаh — «Прошу прощения у Аллаhа»", short: "Астагфируллаh" },
];

const DUAS = [
  { ar: "رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ", ru: "Господи наш! Даруй нам добро в этом мире и добро в Последней жизни и защити нас от мучений Огня.", ref: "Аль-Бакара, 201" },
  { ar: "رَّبِّ زِدْنِى عِلْمًا", ru: "Господи, приумножь мне знание.", ref: "Та Ха, 114" },
  { ar: "رَبِّ ٱشْرَحْ لِى صَدْرِى ۝ وَيَسِّرْ لِىٓ أَمْرِى", ru: "Господи, раскрой мне грудь и облегчи мне мои дела.", ref: "Та Ха, 25–26" },
  { ar: "رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا", ru: "Господи наш! Не наказывай нас, если мы забыли или ошиблись.", ref: "Аль-Бакара, 286" },
];

const API = "https://api.alquran.cloud/v1";
const AUDIO = (n) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`;

/* ================= Утилиты ================= */

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch (e) { return null; }
}
function storeJSON(key, fallback) {
  try { return JSON.parse(store(key)) ?? fallback; } catch (e) { return fallback; }
}

/* ================= Дуа ================= */

$("dua-list").innerHTML = DUAS.map((d) => `
  <article class="card">
    <p class="ar" lang="ar" dir="rtl">${d.ar}</p>
    <p>${d.ru}</p>
    <span class="ref">${d.ref}</span>
  </article>`).join("");

/* ================= Тасбих ================= */

let dhikrIdx = Number(store("dhikr")) || 0;
if (dhikrIdx >= DHIKR.length) dhikrIdx = 0;
let count = Number(store("count_" + dhikrIdx)) || 0;
let target = Number(store("target")) || 33;
$("target").value = String(target);

function renderDhikr() {
  $("dhikr-pick").innerHTML = DHIKR.map((d, i) =>
    `<button type="button" data-i="${i}" class="${i === dhikrIdx ? "on" : ""}">${d.short}</button>`).join("");
  $("dhikr-ar").textContent = DHIKR[dhikrIdx].ar;
  $("dhikr-ru").textContent = DHIKR[dhikrIdx].ru;
  renderCount();
}
function renderCount() {
  $("count").textContent = count;
  $("target-info").textContent = target ? `Цель: ${target}` : "Без цели";
}
$("dhikr-pick").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  dhikrIdx = Number(b.dataset.i);
  store("dhikr", String(dhikrIdx));
  count = Number(store("count_" + dhikrIdx)) || 0;
  renderDhikr();
});
$("counter").addEventListener("click", () => {
  count++;
  store("count_" + dhikrIdx, String(count));
  renderCount();
  if (navigator.vibrate) navigator.vibrate(target && count % target === 0 ? [80, 50, 80] : 15);
});
$("reset").addEventListener("click", () => {
  count = 0;
  store("count_" + dhikrIdx, "0");
  renderCount();
});
$("target").addEventListener("change", (e) => {
  target = Number(e.target.value);
  store("target", String(target));
  renderCount();
});
renderDhikr();

/* ================= 99 имён Аллаhа ================= */

/* Русская транскрипция и смысловое значение. Порядок = номера в Aladhan API (1–99). */
const ASMA_RU = [
  ["Ар-Рахман", "Милостивый"],
  ["Ар-Рахим", "Милосердный"],
  ["Аль-Малик", "Царь, Владыка"],
  ["Аль-Куддус", "Пресвятой, Чистейший"],
  ["Ас-Салям", "Источник мира и безопасности"],
  ["Аль-Му’мин", "Дарующий веру и безопасность"],
  ["Аль-Муhаймин", "Хранитель, Надзирающий"],
  ["Аль-‘Азиз", "Могущественный"],
  ["Аль-Джаббар", "Могучий, Исправляющий"],
  ["Аль-Мутакаббир", "Превознесённый, Величественный"],
  ["Аль-Халик", "Творец"],
  ["Аль-Бари’", "Создатель, Устроитель"],
  ["Аль-Мусаввир", "Придающий образ"],
  ["Аль-Гаффар", "Многопрощающий"],
  ["Аль-Каhhар", "Всепобеждающий"],
  ["Аль-Ваhhаб", "Щедрый Дарователь"],
  ["Ар-Раззак", "Наделяющий уделом"],
  ["Аль-Фаттах", "Открывающий, Судья"],
  ["Аль-‘Алим", "Всезнающий"],
  ["Аль-Кабид", "Сжимающий, Удерживающий"],
  ["Аль-Басит", "Расширяющий, Щедро дарующий"],
  ["Аль-Хафид", "Понижающий"],
  ["Ар-Рафи‘", "Возвышающий"],
  ["Аль-Му‘изз", "Дарующий могущество"],
  ["Аль-Музилль", "Лишающий могущества"],
  ["Ас-Сами‘", "Всеслышащий"],
  ["Аль-Басир", "Всевидящий"],
  ["Аль-Хакам", "Судья"],
  ["Аль-‘Адль", "Справедливый"],
  ["Аль-Латиф", "Добрый, Проникающий в тонкости"],
  ["Аль-Хабир", "Ведающий, Осведомлённый"],
  ["Аль-Халим", "Кроткий, Терпеливый"],
  ["Аль-‘Азым", "Великий"],
  ["Аль-Гафур", "Прощающий"],
  ["Аш-Шакур", "Благодарный, Воздающий за добро"],
  ["Аль-‘Алий", "Высочайший"],
  ["Аль-Кабир", "Величайший"],
  ["Аль-Хафиз", "Хранитель"],
  ["Аль-Мукит", "Питающий, Наделяющий пищей"],
  ["Аль-Хасиб", "Достаточный, Ведущий расчёт"],
  ["Аль-Джалиль", "Величественный"],
  ["Аль-Карим", "Щедрый, Благородный"],
  ["Ар-Ракиб", "Наблюдающий"],
  ["Аль-Муджиб", "Отвечающий на мольбы"],
  ["Аль-Васи‘", "Всеобъемлющий"],
  ["Аль-Хаким", "Мудрый"],
  ["Аль-Вадуд", "Любящий"],
  ["Аль-Маджид", "Славный, Преславный"],
  ["Аль-Ба‘ис", "Воскрешающий"],
  ["Аш-Шаhид", "Свидетель"],
  ["Аль-Хакк", "Истина"],
  ["Аль-Вакиль", "Попечитель, Тот, на Кого уповают"],
  ["Аль-Кавий", "Сильный"],
  ["Аль-Матин", "Твёрдый, Непоколебимый"],
  ["Аль-Валий", "Покровитель"],
  ["Аль-Хамид", "Достохвальный"],
  ["Аль-Мухси", "Знающий счёт всему"],
  ["Аль-Мубди’", "Начинающий творение"],
  ["Аль-Му‘ид", "Возвращающий к жизни"],
  ["Аль-Мухйи", "Дарующий жизнь"],
  ["Аль-Мумит", "Умертвляющий"],
  ["Аль-Хайй", "Живой"],
  ["Аль-Кайюм", "Вечносущий"],
  ["Аль-Ваджид", "Обладающий всем, Находящий всё"],
  ["Аль-Маджид", "Благородный, Великодушный"],
  ["Аль-Вахид", "Единый"],
  ["Аль-Ахад", "Единственный"],
  ["Ас-Самад", "Самодостаточный, к Которому обращаются в нуждах"],
  ["Аль-Кадир", "Могущий"],
  ["Аль-Муктадир", "Всемогущий, Полновластный"],
  ["Аль-Мукаддим", "Выдвигающий вперёд"],
  ["Аль-Му’аххир", "Отодвигающий назад"],
  ["Аль-Аввал", "Первый"],
  ["Аль-Ахир", "Последний"],
  ["Аз-Заhир", "Явный"],
  ["Аль-Батын", "Скрытый"],
  ["Аль-Вали", "Правитель, Владеющий"],
  ["Аль-Мута‘али", "Превознесённый"],
  ["Аль-Барр", "Благодетельный"],
  ["Ат-Тавваб", "Принимающий покаяние"],
  ["Аль-Мунтакым", "Воздающий возмездием"],
  ["Аль-‘Афувв", "Стирающий грехи"],
  ["Ар-Ра’уф", "Сострадательный"],
  ["Малик аль-Мульк", "Владыка владычества"],
  ["Зуль-Джаляли валь-Икрам", "Обладатель величия и щедрости"],
  ["Аль-Муксит", "Справедливый"],
  ["Аль-Джами‘", "Собирающий"],
  ["Аль-Гани", "Самодостаточный, Богатый"],
  ["Аль-Мугни", "Обогащающий"],
  ["Аль-Мани‘", "Удерживающий, Оберегающий"],
  ["Ад-Дарр", "Посылающий невзгоды по Своей мудрости"],
  ["Ан-Нафи‘", "Дарующий пользу"],
  ["Ан-Нур", "Свет"],
  ["Аль-hади", "Ведущий прямым путём"],
  ["Аль-Бади‘", "Несравненный Творец"],
  ["Аль-Баки", "Вечный, Непреходящий"],
  ["Аль-Варис", "Наследующий всё"],
  ["Ар-Рашид", "Наставляющий на верный путь"],
  ["Ас-Сабур", "Терпеливый"],
];

(async function loadAsma() {
  // Арабское написание берём из API; если оно недоступно, русский список всё равно показывается.
  let arabic = [];
  try {
    const res = await fetch("https://api.aladhan.com/v1/asmaAlHusna");
    const json = await res.json();
    if (json.code === 200 && Array.isArray(json.data) && json.data.length === ASMA_RU.length) {
      arabic = json.data.map((n) => n.name);
    }
  } catch (e) { /* без арабского написания */ }
  $("asma-list").innerHTML = ASMA_RU.map(([tr, mn], i) => `
    <div class="nm">
      <span class="no">${i + 1}</span>
      ${arabic[i] ? `<span class="ar" lang="ar" dir="rtl">${esc(arabic[i])}</span>` : ""}
      <span class="tr">${esc(tr)}</span>
      <span class="mn">${esc(mn)}</span>
    </div>`).join("");
})();

/* ================= Коран ================= */

const SURAH_RU = [
  "Аль-Фатиха", "Аль-Бакара", "Аль Имран", "Ан-Ниса", "Аль-Маида", "Аль-Анам", "Аль-Араф", "Аль-Анфаль", "Ат-Тауба", "Юнус", "Худ", "Юсуф", "Ар-Раад", "Ибрахим", "Аль-Хиджр", "Ан-Нахль", "Аль-Исра", "Аль-Кахф", "Марьям", "Та Ха", "Аль-Анбийа", "Аль-Хаджж", "Аль-Муминун", "Ан-Нур", "Аль-Фуркан", "Аш-Шуара", "Ан-Намль", "Аль-Касас", "Аль-Анкабут", "Ар-Рум", "Лукман", "Ас-Саджда", "Аль-Ахзаб", "Саба", "Фатыр", "Я Син", "Ас-Саффат", "Сад", "Аз-Зумар", "Гафир", "Фуссылат", "Аш-Шура", "Аз-Зухруф", "Ад-Духан", "Аль-Джасия", "Аль-Ахкаф", "Мухаммад", "Аль-Фатх", "Аль-Худжурат", "Каф", "Аз-Зарият", "Ат-Тур", "Ан-Наджм", "Аль-Камар", "Ар-Рахман", "Аль-Вакиа", "Аль-Хадид", "Аль-Муджадала", "Аль-Хашр", "Аль-Мумтахана", "Ас-Сафф", "Аль-Джумуа", "Аль-Мунафикун", "Ат-Тагабун", "Ат-Таляк", "Ат-Тахрим", "Аль-Мульк", "Аль-Калям", "Аль-Хакка", "Аль-Маариж", "Нух", "Аль-Джинн", "Аль-Музаммиль", "Аль-Муддассир", "Аль-Кыяма", "Аль-Инсан", "Аль-Мурсалят", "Ан-Наба", "Ан-Назиат", "Абаса", "Ат-Таквир", "Аль-Инфитар", "Аль-Мутаффифин", "Аль-Иншикак", "Аль-Бурудж", "Ат-Тарик", "Аль-Аля", "Аль-Гашия", "Аль-Фаджр", "Аль-Баляд", "Аш-Шамс", "Аль-Ляйль", "Ад-Духа", "Аш-Шарх", "Ат-Тин", "Аль-Алак", "Аль-Кадр", "Аль-Баййина", "Аз-Зальзаля", "Аль-Адият", "Аль-Кариа", "Ат-Такасур", "Аль-Аср", "Аль-Хумаза", "Аль-Филь", "Курайш", "Аль-Маун", "Аль-Каусар", "Аль-Кафирун", "Ан-Наср", "Аль-Масад", "Аль-Ихляс", "Аль-Фаляк", "Ан-Нас",
];
const ruName = (n) => SURAH_RU[n - 1] || "Сура " + n;
let SURAHS = [];
const surahCache = new Map();
let current = null; // { n, ayahCount }

const norm = (s) => s
  .replace(/[ً-ٰٟۖ-ۭـ﻿]/g, "")
  .replace(/ٱ/g, "ا");

function stripBismillah(text) {
  const words = text.trim().split(/\s+/);
  if (words.length > 4 && norm(words.slice(0, 4).join(" ")) === "بسم الله الرحمن الرحيم") {
    return words.slice(4).join(" ");
  }
  return text;
}

function surahMeta(n) {
  return SURAHS[n - 1] || { number: n, englishName: "Сура " + n, englishNameTranslation: "", numberOfAyahs: 0, revelationType: "", name: "" };
}
const arName = (s) => (s.name || "").replace(/^\S+\s+/, "");

const sNorm = (t) => String(t).toLowerCase().replace(/ё/g, "е").replace(/[^a-z0-9а-я]/g, "");

function renderSurahList(filter) {
  const q = sNorm(filter || "");
  const items = SURAHS.filter((s) => {
    if (!q) return true;
    if (String(s.number) === q) return true;
    return sNorm(ruName(s.number) + s.englishName + s.englishNameTranslation).includes(q);
  });
  $("q-list").innerHTML = items.length ? items.map((s) => `
    <button class="q-item ${current && current.n === s.number ? "on" : ""} ${learned().includes(s.number) ? "done" : ""}" data-n="${s.number}">
      <span class="num">${learned().includes(s.number) ? "✓" : s.number}</span>
      <span class="nm">${esc(ruName(s.number))}<small>${esc(s.englishName)} · ${s.numberOfAyahs} ай.</small></span>
      <span class="ar" lang="ar">${esc(arName(s))}</span>
    </button>`).join("") : "Ничего не найдено.";
}

async function loadSurahList() {
  try {
    const res = await fetch(`${API}/surah`);
    const json = await res.json();
    if (json.code !== 200) throw new Error();
    SURAHS = json.data;
    renderSurahList("");
    renderBookmarks();
    renderContinue();
    renderLearned();
  } catch (e) {
    $("q-list").textContent = "Не удалось загрузить список сур. Проверьте интернет и обновите страницу.";
  }
}

// в русских переводах пишем «Аллаh» (с латинской h, как принято у автора сайта)
const fixAllah = (t, ed) => (String(ed).startsWith("ru.") ? String(t).replace(/ллах/g, "ллаh") : String(t));
const EDITIONS = ["ru.kuliev", "ru.osmanov", "ru.krachkovsky", "uz.sodik"];
let edition = "ru.kuliev";

async function fetchSurah(n, ed = edition) {
  const key = n + "|" + ed;
  if (surahCache.has(key)) return surahCache.get(key);
  const res = await fetch(`${API}/surah/${n}/editions/quran-uthmani,${ed}`);
  const json = await res.json();
  if (json.code !== 200 || !Array.isArray(json.data)) throw new Error("bad response");
  const ar = json.data.find((d) => d.edition && d.edition.identifier === "quran-uthmani") || json.data[0];
  const ru = json.data.find((d) => d.edition && d.edition.identifier === ed) || json.data[1];
  const ayahs = ar.ayahs.map((a, i) => ({
    n: a.numberInSurah,
    g: a.number,
    ar: a.text,
    ru: fixAllah(ru && ru.ayahs[i] ? ru.ayahs[i].text : "", ed),
  }));
  surahCache.set(key, ayahs);
  return ayahs;
}

function getBookmarks() { return storeJSON("q_bm", []); }
function isBookmarked(s, a) { return getBookmarks().some((b) => b.s === s && b.a === a); }
function toggleBookmark(s, a) {
  let list = getBookmarks();
  if (list.some((b) => b.s === s && b.a === a)) list = list.filter((b) => !(b.s === s && b.a === a));
  else list.push({ s, a });
  store("q_bm", JSON.stringify(list));
  renderBookmarks();
}
function renderBookmarks() {
  const list = getBookmarks();
  const box = $("q-bookmarks");
  box.hidden = !list.length;
  box.innerHTML = list.map((b) =>
    `<button data-s="${b.s}" data-a="${b.a}">★ ${esc(ruName(b.s))} ${b.s}:${b.a}</button>`).join("");
}
function renderContinue() {
  const last = storeJSON("q_last", null);
  const btn = $("q-continue");
  if (!last || !last.s) { btn.hidden = true; return; }
  btn.hidden = false;
  btn.textContent = `Продолжить: ${ruName(last.s)} ${last.s}:${last.a || 1}`;
}

async function openSurah(n, ayah) {
  n = Math.min(114, Math.max(1, Number(n) || 1));
  const meta = surahMeta(n);
  current = { n, count: meta.numberOfAyahs };
  const reader = $("q-reader");
  reader.hidden = false;
  $("q-title").textContent = `${n}. ${ruName(n)}` + (meta.name ? ` — ${arName(meta)}` : "");
  const type = meta.revelationType === "Meccan" ? "Мекканская" : meta.revelationType === "Medinan" ? "Мединская" : "";
  $("q-meta").textContent = [meta.englishNameTranslation, type, meta.numberOfAyahs ? meta.numberOfAyahs + " аятов" : ""].filter(Boolean).join(" · ");
  $("q-ayahs").innerHTML = "";
  $("q-bismillah").hidden = true;
  applyHifz();
  renderLearned();
  $("q-status").textContent = "Загрузка…";
  $("q-prev").disabled = n === 1;
  $("q-next").disabled = n === 114;

  const audio = $("q-audio");
  audio.pause();
  audio.src = AUDIO(n);
  stopAyah();

  renderSurahList($("q-search").value);
  reader.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const ayahs = await fetchSurah(n);
    if (!current || current.n !== n) return; // пользователь уже открыл другую суру
    const showBism = n !== 1 && n !== 9;
    $("q-bismillah").hidden = !showBism;
    const last = storeJSON("q_last", null);
    $("q-ayahs").innerHTML = ayahs.map((a, i) => {
      const text = i === 0 && showBism ? stripBismillah(a.ar) : a.ar;
      const read = last && last.s === n && last.a === a.n;
      const sp = text.trim().split(/\s+/);
      const arHtml = `<span class="w1">${esc(sp[0])}</span>` + (sp.length > 1 ? ` <span class="rest">${esc(sp.slice(1).join(" "))}</span>` : "");
      return `
        <div class="q-ayah ${read ? "read" : ""}" id="a-${a.n}" data-a="${a.n}">
          <div class="row">
            <p class="ar" lang="ar" dir="rtl">${arHtml}</p>
            <div class="side">
              <span class="no">${a.n}</span>
              <button class="bm ${isBookmarked(n, a.n) ? "on" : ""}" data-bm="${a.n}" aria-label="Закладка">${isBookmarked(n, a.n) ? "★" : "☆"}</button>
              <button class="pl" data-g="${a.g}" aria-label="Слушать аят">▶</button>
              <button class="sh" aria-label="Поделиться аятом">⤴</button>
            </div>
          </div>
          <p class="tr">${esc(a.ru)}</p>
        </div>`;
    }).join("");
    $("q-status").textContent = "";
    store("q_last", JSON.stringify({ s: n, a: (last && last.s === n && last.a) || 1 }));
    renderContinue();
    if (ayah) {
      const el = $("a-" + ayah);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("flash");
        setTimeout(() => el.classList.remove("flash"), 2500);
      }
    }
  } catch (e) {
    $("q-status").textContent = "Не удалось загрузить суру. Проверьте интернет и попробуйте ещё раз.";
  }
}

/* обработчики Корана */
$("q-list").addEventListener("click", (e) => {
  const b = e.target.closest(".q-item");
  if (b) openSurah(Number(b.dataset.n));
});
$("q-search").addEventListener("input", (e) => renderSurahList(e.target.value));
$("q-bookmarks").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) openSurah(Number(b.dataset.s), Number(b.dataset.a));
});
$("q-continue").addEventListener("click", () => {
  const last = storeJSON("q_last", null);
  if (last) openSurah(last.s, last.a);
});
$("q-prev").addEventListener("click", () => current && openSurah(current.n - 1));
$("q-next").addEventListener("click", () => current && openSurah(current.n + 1));
$("q-close").addEventListener("click", () => {
  $("q-audio").pause();
  stopAyah();
  $("q-reader").hidden = true;
  current = null;
  renderSurahList($("q-search").value);
  $("quran").scrollIntoView({ behavior: "smooth" });
});
$("q-tr").addEventListener("change", (e) => {
  $("q-reader").classList.toggle("no-tr", !e.target.checked);
  store("q_tr", e.target.checked ? "1" : "0");
});
$("q-size").addEventListener("input", (e) => {
  document.documentElement.style.setProperty("--ar-size", e.target.value + "px");
  store("q_size", e.target.value);
});
$("q-ayahs").addEventListener("click", (e) => {
  const row = e.target.closest(".q-ayah");
  if (!row || !current) return;
  const a = Number(row.dataset.a);
  if (e.target.closest(".pl")) { playAyah(e.target.closest(".pl")); return; }
  if (e.target.closest(".sh")) { shareAyah(row, e.target.closest(".sh")); return; }
  if (e.target.closest(".bm")) {
    toggleBookmark(current.n, a);
    const on = isBookmarked(current.n, a);
    const btn = e.target.closest(".bm");
    btn.classList.toggle("on", on);
    btn.textContent = on ? "★" : "☆";
    return;
  }
  if (hifz !== "off") row.classList.toggle("shown");
  document.querySelectorAll(".q-ayah.read").forEach((x) => x.classList.remove("read"));
  row.classList.add("read");
  logRead(current.n, a);
  store("q_last", JSON.stringify({ s: current.n, a }));
  renderContinue();
});
document.querySelectorAll("[data-open]").forEach((b) => {
  b.addEventListener("click", () => openSurah(Number(b.dataset.open), Number(b.dataset.ayah) || undefined));
});


/* озвучка аята с повтором, «выучено», «поделиться» */
const AYAH_AUDIO = (g) => `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${g}.mp3`;
let ayahPlay = null; // { btn, left }
function stopAyah() {
  const a = $("q-ayah-audio");
  a.pause();
  a.removeAttribute("src");
  if (ayahPlay) ayahPlay.btn.textContent = "▶";
  ayahPlay = null;
}
function playAyah(btn) {
  if (ayahPlay && ayahPlay.btn === btn) { stopAyah(); return; }
  stopAyah();
  $("q-audio").pause();
  const a = $("q-ayah-audio");
  const reps = Math.max(1, Math.min(10, Number($("q-rep").value) || 1));
  ayahPlay = { btn, left: reps };
  btn.textContent = "■";
  a.src = AYAH_AUDIO(btn.dataset.g);
  a.play().catch(() => stopAyah());
}
$("q-ayah-audio").addEventListener("ended", () => {
  if (!ayahPlay) return;
  ayahPlay.left--;
  if (ayahPlay.left > 0) { const a = $("q-ayah-audio"); a.currentTime = 0; a.play().catch(() => stopAyah()); }
  else stopAyah();
});
$("q-ayah-audio").addEventListener("error", () => { if (ayahPlay) stopAyah(); });
$("q-audio").addEventListener("play", stopAyah);
$("q-rep").addEventListener("change", (e) => store("q_rep", e.target.value));

function learned() { const l = storeJSON("q_learned", []); return Array.isArray(l) ? l.filter((x) => Number.isInteger(x)) : []; }
function renderLearned() {
  const l = learned();
  const c = $("q-learned-count");
  c.hidden = !l.length;
  c.textContent = `Выучено сур: ${l.length} из 114`;
  if (current) $("q-learned").textContent = l.includes(current.n) ? "Выучена ✓ (снять)" : "Отметить выученной";
}
$("q-learned").addEventListener("click", () => {
  if (!current) return;
  let l = learned();
  l = l.includes(current.n) ? l.filter((x) => x !== current.n) : [...l, current.n];
  store("q_learned", JSON.stringify(l));
  renderLearned();
  renderSurahList($("q-search").value);
});

async function shareAyah(row, btn) {
  if (!current) return;
  const ar = row.querySelector(".ar").textContent.replace(/\s+/g, " ").trim();
  const tr = row.querySelector(".tr").textContent.trim();
  const text = `${ar}\n\n${tr}\n\n— ${ruName(current.n)}, ${current.n}:${row.dataset.a}`;
  const done = (msg) => { const old = "⤴"; btn.textContent = msg; setTimeout(() => (btn.textContent = old), 1500); };
  try {
    if (navigator.share) { await navigator.share({ text }); return; }
  } catch (e) { if (e && e.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(text); done("✓"); return; } catch (e) {}
  const t = document.createElement("textarea");
  t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
  document.body.appendChild(t); t.select();
  try { document.execCommand("copy"); done("✓"); } catch (e) { done("!"); }
  t.remove();
}


/* поиск по тексту перевода: перевод скачивается целиком один раз */
const fullCache = new Map();
async function loadFull(ed) {
  if (fullCache.has(ed)) return fullCache.get(ed);
  const res = await fetch(`${API}/quran/${ed}`);
  const json = await res.json();
  if (json.code !== 200 || !json.data || !Array.isArray(json.data.surahs)) throw new Error("bad response");
  const list = [];
  json.data.surahs.forEach((sr) => (sr.ayahs || []).forEach((a) => list.push({ s: sr.number, a: a.numberInSurah, t: fixAllah(a.text || "", ed) })));
  if (list.length < 6000) throw new Error("incomplete");
  fullCache.set(ed, list);
  return list;
}
const tNorm = (t) => t.toLowerCase().replace(/ё/g, "е").replace(/h/g, "х"); // латинская h = х, чтобы «аллах» находил «Аллаh»
function highlight(text, q) {
  const i = tNorm(text).indexOf(q);
  if (i < 0 || tNorm(text).length !== text.length) return esc(text);
  return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
}
let tGen = 0;
async function textSearch() {
  const box = $("t-results");
  const q = tNorm($("t-search").value.trim());
  const gen = ++tGen;
  box.hidden = false;
  if (q.length < 3) { box.textContent = "Введите хотя бы 3 буквы."; return; }
  box.textContent = "Поиск… при первом запуске скачивается весь перевод.";
  try {
    const list = await loadFull(edition);
    if (gen !== tGen) return;
    const found = list.filter((x) => tNorm(x.t).includes(q));
    if (!found.length) { box.textContent = "Ничего не найдено."; return; }
    const shown = found.slice(0, 40);
    box.innerHTML = `<p class="muted">Найдено: ${found.length}${found.length > shown.length ? " (показаны первые " + shown.length + ")" : ""}</p>` +
      shown.map((x) => `<button class="t-hit" data-s="${x.s}" data-a="${x.a}"><b>${esc(ruName(x.s))} ${x.s}:${x.a}</b><span>${highlight(x.t, q)}</span></button>`).join("");
  } catch (e) {
    if (gen === tGen) box.textContent = "Не удалось выполнить поиск. Проверьте интернет и попробуйте ещё раз.";
  }
}
$("t-go").addEventListener("click", textSearch);
$("t-search").addEventListener("keydown", (e) => { if (e.key === "Enter") textSearch(); });
$("t-results").addEventListener("click", (e) => {
  const b = e.target.closest(".t-hit");
  if (b) openSurah(Number(b.dataset.s), Number(b.dataset.a));
});

/* цель чтения и серия дней */
const dateKey = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
function readLog() { const l = storeJSON("q_log", {}); return l && typeof l === "object" && !Array.isArray(l) ? l : {}; }
function dayCount(k) { const v = readLog()[k]; return Array.isArray(v) ? v.length : 0; }
function logRead(sura, ayah) {
  const log = readLog(), k = dateKey(new Date());
  const arr = Array.isArray(log[k]) ? log[k] : [];
  const id = sura + ":" + ayah;
  if (!arr.includes(id)) arr.push(id);
  log[k] = arr;
  Object.keys(log).sort().reverse().slice(60).forEach((old) => delete log[old]);
  store("q_log", JSON.stringify(log));
  renderGoal();
}
function renderGoal() {
  const goal = Number(store("q_goal")) || 0;
  const info = $("goal-info");
  if (!goal) { info.hidden = true; return; }
  const today = dayCount(dateKey(new Date()));
  const d = new Date();
  if (today < goal) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (streak < 61 && dayCount(dateKey(d)) >= goal) { streak++; d.setDate(d.getDate() - 1); }
  info.hidden = false;
  info.textContent = `Сегодня: ${today} из ${goal}` + (today >= goal ? " — цель выполнена ✓" : "") + (streak ? ` · Серия: ${streak} дн.` : "");
}
$("q-goal").addEventListener("change", (e) => { store("q_goal", e.target.value); renderGoal(); });

/* заучивание и выбор перевода */
let hifz = "off";
function applyHifz() {
  const r = $("q-reader");
  r.classList.remove("hifz-rest", "hifz-all");
  if (hifz !== "off") r.classList.add("hifz-" + hifz);
  $("hifz-hint").hidden = hifz === "off";
  document.querySelectorAll(".q-ayah.shown").forEach((x) => x.classList.remove("shown"));
}
$("q-hifz").addEventListener("change", (e) => {
  hifz = e.target.value;
  applyHifz();
  store("q_hifz", hifz);
});
$("q-lang").addEventListener("change", (e) => {
  edition = EDITIONS.includes(e.target.value) ? e.target.value : "ru.kuliev";
  store("q_lang", edition);
  if (current) openSurah(current.n);
});

/* сохранённые настройки чтения */
(function restoreQuranPrefs() {
  const size = store("q_size");
  if (size) {
    $("q-size").value = size;
    document.documentElement.style.setProperty("--ar-size", size + "px");
  }
  const ed = store("q_lang");
  if (EDITIONS.includes(ed)) { edition = ed; $("q-lang").value = ed; }
  const goal = store("q_goal");
  if (["5", "10", "20", "50"].includes(goal)) $("q-goal").value = goal;
  renderGoal();
  const rep = store("q_rep");
  if (["1", "3", "5", "10"].includes(rep)) $("q-rep").value = rep;
  const hf = store("q_hifz");
  if (hf === "rest" || hf === "all") { hifz = hf; $("q-hifz").value = hf; $("q-reader").classList.add("hifz-" + hf); }
  if (store("q_tr") === "0") {
    $("q-tr").checked = false;
    $("q-reader").classList.add("no-tr");
  }
})();

loadSurahList();

/* ================= Арабский алфавит ================= */

const LETTERS = [
  ["ا", "Алиф", "а (носитель гласной)", 0],
  ["ب", "Ба", "б", 1], ["ت", "Та", "т", 1], ["ث", "Са", "межзубный «с»", 1],
  ["ج", "Джим", "дж", 1], ["ح", "Ха", "глухой гортанный «х»", 1], ["خ", "Ха", "хрипящий «х»", 1],
  ["د", "Даль", "д", 0], ["ذ", "Заль", "межзубный «з»", 0],
  ["ر", "Ра", "р", 0], ["ز", "Зай", "з", 0],
  ["س", "Син", "с", 1], ["ش", "Шин", "ш", 1],
  ["ص", "Сад", "эмфатический «с»", 1], ["ض", "Дад", "эмфатический «д»", 1],
  ["ط", "Та", "эмфатический «т»", 1], ["ظ", "За", "эмфатический «з»", 1],
  ["ع", "Айн", "гортанный звук «’»", 1], ["غ", "Гайн", "горловой «г»", 1],
  ["ف", "Фа", "ф", 1], ["ق", "Каф", "глубокий «к»", 1], ["ك", "Кяф", "к", 1],
  ["ل", "Лям", "л", 1], ["م", "Мим", "м", 1], ["ن", "Нун", "н", 1],
  ["ه", "Ха", "мягкая «h» (выдох), как в Аллаh", 1],
  ["و", "Вав", "в / долгое «у»", 0], ["ي", "Йа", "й / долгое «и»", 1],
];
const ZWJ = "\u200d";
(function renderLetters() {
  $("letters").innerHTML = LETTERS.map(([ch, name, snd, joins], i) => {
    const iso = ch, fin = ZWJ + ch;
    const ini = joins ? ch + ZWJ : ch, med = joins ? ZWJ + ch + ZWJ : ZWJ + ch;
    return `<div class="letter">
      <span class="ln">${i + 1}</span>
      <span class="big ar" lang="ar">${iso}</span>
      <b>${esc(name)}</b><small>${esc(snd)}</small>
      <div class="forms ar" lang="ar" dir="rtl" title="конец · середина · начало · отдельно">
        <span>${fin}</span><span>${med}</span><span>${ini}</span><span>${iso}</span>
      </div>
      ${joins ? "" : "<em>не соединяется со следующей буквой</em>"}
    </div>`;
  }).join("");
  const B = "ب";
  const H = [
    ["َ", "Фатха", "краткое «а»: ба"], ["ِ", "Касра", "краткое «и»: би"], ["ُ", "Дамма", "краткое «у»: бу"],
    ["ْ", "Сукун", "нет гласной: б"], ["ّ", "Шадда", "удвоение согласной: бб"], ["ً", "Танвин фатх", "окончание «-ан»"],
  ];
  $("harakat").innerHTML = H.map(([m, n, d]) => `<div class="hk"><span class="big ar" lang="ar">${B}${m}</span><b>${esc(n)}</b><small>${esc(d)}</small></div>`).join("");
})();

/* ================= Викторина ================= */

const QUIZ = [
  // столпы
  { t: "Столпы", q: "Сколько столпов в исламе?", a: ["5", "4", "6", "7"] },
  { t: "Столпы", q: "Как называется обязательная милостыня?", a: ["Закят", "Саум", "Хадж", "Шахада"] },
  { t: "Столпы", q: "В каком месяце соблюдают обязательный пост?", a: ["Рамадан", "Мухаррам", "Раджаб", "Шаабан"] },
  { t: "Столпы", q: "В какой город совершают хадж?", a: ["Мекка", "Медина", "Иерусалим", "Каир"] },
  { t: "Столпы", q: "Сколько обязательных молитв совершают в сутки?", a: ["5", "3", "4", "6"] },
  // пророки
  { t: "Пророки", q: "Кто был первым человеком и пророком?", a: ["Адам", "Нух", "Ибрахим", "Идрис"] },
  { t: "Пророки", q: "Какой пророк вместе с сыном Исмаилом возводил Каабу?", a: ["Ибрахим", "Муса", "Иса", "Юсуф"] },
  { t: "Пророки", q: "Кому из пророков был ниспослан Таурат (Тора)?", a: ["Муса", "Дауд", "Иса", "Сулейман"] },
  { t: "Пророки", q: "Кому из пророков был ниспослан Инджиль (Евангелие)?", a: ["Иса", "Муса", "Яхья", "Закария"] },
  { t: "Пророки", q: "Кому был ниспослан Забур (Псалмы)?", a: ["Дауд", "Исхак", "Яков", "Худ"] },
  { t: "Пророки", q: "Как называют последнего из пророков?", a: ["Мухаммад ﷺ", "Иса", "Нух", "Ибрахим"] },
  // Коран
  { t: "Коран", q: "Сколько сур в Коране?", a: ["114", "99", "120", "30"] },
  { t: "Коран", q: "Как называется первая сура Корана?", a: ["Аль-Фатиха", "Аль-Бакара", "Аль-Ихляс", "Ан-Нас"] },
  { t: "Коран", q: "Какая сура самая длинная?", a: ["Аль-Бакара", "Аль-Имран", "Ан-Ниса", "Аль-Кахф"] },
  { t: "Коран", q: "Сколько аятов в суре «Аль-Ихляс»?", a: ["4", "3", "5", "7"] },
  { t: "Коран", q: "В каком месяце начал ниспосылаться Коран?", a: ["Рамадан", "Зуль-хиджа", "Мухаррам", "Раби-уль-авваль"] },
  { t: "Коран", q: "Какая сура начинается без «Бисмиллях»?", a: ["Ат-Тауба", "Аль-Анфаль", "Аль-Кафирун", "Аль-Каусар"] },
  // имена
  { t: "Имена Аллаhа", q: "Что означает имя «Ар-Рахман»?", a: ["Милостивый", "Всезнающий", "Могущественный", "Прощающий"] },
  { t: "Имена Аллаhа", q: "Что означает имя «Аль-‘Алим»?", a: ["Всезнающий", "Всеслышащий", "Всевидящий", "Мудрый"] },
  { t: "Имена Аллаhа", q: "Что означает имя «Ас-Сами‘»?", a: ["Всеслышащий", "Всевидящий", "Милосердный", "Великий"] },
  { t: "Имена Аллаhа", q: "Что означает имя «Аль-Гаффар»?", a: ["Многопрощающий", "Дарующий", "Могущественный", "Хранитель"] },
  { t: "Имена Аллаhа", q: "Что означает имя «Ар-Раззак»?", a: ["Дарующий удел", "Творец", "Судья", "Первый"] },
];
// первый вариант в каждом вопросе — правильный; порядок перемешивается при показе

let quizTopic = "Все", quizState = null;
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function renderQuizTopics() {
  const topics = ["Все", ...new Set(QUIZ.map((x) => x.t))];
  $("quiz-topics").innerHTML = topics.map((t) => `<button class="${t === quizTopic ? "on" : ""}" data-t="${esc(t)}">${esc(t)}</button>`).join("");
}
function quizBest() { const b = storeJSON("quiz_best", {}); return b && typeof b === "object" && !Array.isArray(b) ? b : {}; }
function startQuiz(source) {
  const review = Array.isArray(source);
  const pool = review ? source : QUIZ.filter((x) => quizTopic === "Все" || x.t === quizTopic);
  const qs = shuffle(pool).slice(0, 10).map((x) => ({ src: x, q: x.q, right: x.a[0], opts: shuffle(x.a) }));
  quizState = { qs, i: 0, score: 0, picked: null, wrong: [], review };
  renderQuiz();
}
function renderQuiz() {
  const box = $("quiz-box"), st = quizState;
  if (!st) {
    const b = quizBest()[quizTopic];
    box.innerHTML = (b ? `<p class="muted">Лучший результат по теме: ${b.score} из ${b.total}</p>` : "") + `<button class="btn" id="quiz-start">Начать</button>`;
    return;
  }
  if (st.i >= st.qs.length) {
    let best = "";
    if (!st.review) {
      const all = quizBest(), old = all[quizTopic];
      if (!old || st.score / st.qs.length > old.score / old.total) {
        all[quizTopic] = { score: st.score, total: st.qs.length };
        store("quiz_best", JSON.stringify(all));
        best = old ? " Новый рекорд!" : "";
      }
    }
    box.innerHTML = `<p class="quiz-score">${st.review ? "Работа над ошибками" : "Результат"}: <b>${st.score}</b> из ${st.qs.length}</p>` +
      (best ? `<p class="muted">${best.trim()}</p>` : "") +
      (st.wrong.length ? `<button class="btn" id="quiz-retry">Повторить ошибки (${st.wrong.length})</button> ` : "") +
      `<button class="btn ghost" id="quiz-start">Новый раунд</button>`;
    return;
  }
  const q = st.qs[st.i];
  box.innerHTML = `<p class="muted">Вопрос ${st.i + 1} из ${st.qs.length}</p>
    <h3 class="quiz-q">${esc(q.q)}</h3>
    <div class="quiz-opts">${q.opts.map((o) => {
      let cls = "";
      if (st.picked !== null) cls = o === q.right ? "ok" : o === st.picked ? "bad" : "";
      return `<button class="${cls}" data-o="${esc(o)}" ${st.picked !== null ? "disabled" : ""}>${esc(o)}</button>`;
    }).join("")}</div>
    ${st.picked !== null ? `<button class="btn" id="quiz-next">${st.i + 1 === st.qs.length ? "Результат" : "Дальше"}</button>` : ""}`;
}
$("quiz-topics").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  quizTopic = b.dataset.t; quizState = null;
  renderQuizTopics(); renderQuiz();
});
$("quiz-box").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.id === "quiz-start") return startQuiz();
  if (b.id === "quiz-retry" && quizState) return startQuiz(quizState.wrong.slice());
  if (b.id === "quiz-next") { quizState.i++; quizState.picked = null; return renderQuiz(); }
  if (b.dataset.o !== undefined && quizState && quizState.picked === null) {
    quizState.picked = b.dataset.o;
    if (b.dataset.o === quizState.qs[quizState.i].right) quizState.score++;
    else quizState.wrong.push(quizState.qs[quizState.i].src);
    renderQuiz();
  }
});
renderQuizTopics(); renderQuiz();

/* офлайн-режим и установка как приложение */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
