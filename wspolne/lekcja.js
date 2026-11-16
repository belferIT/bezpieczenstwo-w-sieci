/* =====================================================================
   Bezpieczeństwo w sieci – funkcje wspólne lekcji
   Ładowany przed skryptem lekcji:  <script src="wspolne/lekcja.js"></script>
   Tekst wpisany przez ucznia trafia na stronę tylko przez textContent
   (nigdy przez innerHTML).
   ===================================================================== */

const $ = id => document.getElementById(id);

/* Kopia tablicy w losowej kolejności (algorytm Fishera–Yatesa). */
function shuffle(arr){
  const a = arr.slice();
  for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; }
  return a;
}

/* Przewija do elementu – płynnie, chyba że uczeń wyłączył animacje w systemie. */
function scrollToEl(el, block = "start"){
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({behavior: reduce ? "auto" : "smooth", block});
}

/* Pusty blok informacji zwrotnej, odczytywany przez czytniki ekranu. */
function makeFb(){
  const fb = document.createElement("div");
  fb.className = "fb"; fb.setAttribute("aria-live", "polite");
  return fb;
}

/* Informacja zwrotna: pogrubiony tytuł + zwykły tekst. */
function setFb(el, good, title, text){
  el.className = "fb " + (good ? "good" : "bad");
  el.innerHTML = "";
  const s = document.createElement("strong"); s.textContent = title.trim() + " ";
  el.appendChild(s);
  if (text) el.appendChild(document.createTextNode(text));
}

/* Pytania „Co zrobisz?”.
   list: [{q:"pytanie", a:["odpowiedź", …], ok:indeksPoprawnej, why:"wyjaśnienie"}]
   Odpowiedzi pojawiają się w losowej kolejności.
   onAnswer(good) – wywoływane po każdej odpowiedzi (liczenie punktów). */
function makeScen(container, list, onAnswer){
  list.forEach(s => {
    const card = document.createElement("div"); card.className = "scen";
    const p = document.createElement("p"); p.textContent = s.q; card.appendChild(p);
    const opts = document.createElement("div"); opts.className = "opts";
    const fb = makeFb();
    const btns = s.a.map((txt, k) => {
      const b = document.createElement("button"); b.className = "opt"; b.textContent = txt;
      b.onclick = () => {
        btns.forEach(x => x.disabled = true);
        btns[s.ok].classList.add("right");
        const good = k === s.ok;
        if (!good) b.classList.add("wrong");
        setFb(fb, good, good ? "✅ Dobrze!" : "❌ Nie tym razem.", s.why);
        if (onAnswer) onAnswer(good);
      };
      return b;
    });
    shuffle(btns).forEach(b => opts.appendChild(b));
    card.appendChild(opts); card.appendChild(fb);
    container.appendChild(card);
  });
}

/* Ocena „tak / nie” (np. prawdziwa czy fałszywa strona, dobre czy słabe hasło).
   list   – elementy do oceny; każdy musi mieć pole why (wyjaśnienie)
   cfg.labels   – [napis dla „tak”, napis dla „nie”]
   cfg.isYes(x) – czy poprawna odpowiedź to „tak”
   cfg.head(x)  – element pokazany nad przyciskami
   cfg.title(good, x) – opcjonalny tytuł informacji zwrotnej
   cfg.onAnswer(good, x) – po każdej odpowiedzi */
function makeVerdict(container, list, cfg){
  list.forEach(x => {
    const card = document.createElement("div"); card.className = "scen";
    card.appendChild(cfg.head(x));
    const opts = document.createElement("div"); opts.className = "opts two";
    const fb = makeFb();
    const yes = cfg.isYes(x);
    const btns = [true, false].map((val, n) => {
      const b = document.createElement("button"); b.className = "opt"; b.textContent = cfg.labels[n];
      b.onclick = () => {
        btns.forEach(y => y.disabled = true);
        btns[yes ? 0 : 1].classList.add("right");
        const good = val === yes;
        if (!good) b.classList.add("wrong");
        const title = cfg.title ? cfg.title(good, x) : (good ? "✅ Dobrze!" : "❌ Nie tym razem.");
        setFb(fb, good, title, x.why);
        if (cfg.onAnswer) cfg.onAnswer(good, x);
      };
      opts.appendChild(b);
      return b;
    });
    card.appendChild(opts); card.appendChild(fb);
    container.appendChild(card);
  });
}

/* ---------- Karta wyniku ---------- */

/* Odczytuje imię z pola. Puste pole: podświetla je i zwraca "". */
function readName(input){
  const name = input.value.trim();
  if (!name) { input.focus(); input.style.borderColor = "var(--red)"; }
  return name;
}
/* Enter w polu imienia zatwierdza; pisanie zdejmuje czerwone podświetlenie. */
function bindNameInput(input, onSubmit){
  input.addEventListener("keydown", e => { if (e.key === "Enter") onSubmit(); input.style.borderColor = ""; });
}

/* Rysuje kartę wyniku w elemencie el. */
function renderCard(el, title, name, score, details = []){
  el.innerHTML = "";
  const add = (txt, css) => {
    const d = document.createElement("div"); d.textContent = txt;
    if (css) d.style.cssText = css; else d.className = "note";
    el.appendChild(d);
  };
  add("KARTA WYNIKU · " + title);
  add(name, "font-size:22px;font-weight:800;margin:6px 0");
  add(score, "font-size:40px;font-weight:800;color:var(--teal)");
  details.forEach(t => add(t));
  add(new Date().toLocaleString("pl-PL", {dateStyle:"short", timeStyle:"short"}));
  add("Pokaż tę kartę nauczycielowi.");
  el.style.display = "block";
}

/* Karta wyniku na końcu lekcji. Wymaga w HTML elementów:
   #status, #name, #bCard, #cardMsg, #card.
   tasks: [["z1", "Zadanie 1: …"], …]; pts, done, max – obiekty z kluczami zadań.
   Zwraca funkcję updateStatus(), którą lekcja woła po ukończeniu zadania. */
function initScoreCard({title, tasks, pts, done, max}){
  function updateStatus(){
    const ul = $("status"); ul.innerHTML = "";
    tasks.forEach(([k, label]) => {
      const li = document.createElement("li");
      li.className = done[k] ? "on" : "";
      li.textContent = label + " – " + (done[k] ? `${pts[k]} / ${max[k]} pkt` : "jeszcze nieukończone");
      ul.appendChild(li);
    });
    $("card").style.display = "none";
  }
  function showCard(){
    const name = readName($("name"));
    if (!name) return;
    const msg = $("cardMsg");
    const missing = tasks.filter(([k]) => !done[k]).map(([, l]) => l.split(":")[0]);
    if (missing.length) {
      msg.className = "fb bad";
      msg.textContent = "Najpierw dokończ: " + missing.join(", ") + ".";
      return;
    }
    msg.className = "fb"; msg.textContent = "";
    const keys = tasks.map(([k]) => k);
    const sum = o => keys.reduce((s, k) => s + o[k], 0);
    const detail = tasks.map(([k, l]) => `${l.split(":")[0]}: ${pts[k]}/${max[k]}`).join(" · ");
    renderCard($("card"), title, name, `${sum(pts)} / ${sum(max)}`, [detail]);
  }
  $("cardMsg").setAttribute("aria-live", "polite");
  $("bCard").onclick = showCard;
  bindNameInput($("name"), showCard);
  updateStatus();
  return updateStatus;
}
