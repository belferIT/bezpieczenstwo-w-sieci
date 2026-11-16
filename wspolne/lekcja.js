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

/* Wybór jednej z kilku kategorii (np. „Fakt / Opinia”, nazwa sztuczki).
   list   – elementy do oceny; każdy musi mieć pole why (wyjaśnienie)
   cfg.labels    – napisy przycisków (kolejność stała)
   cfg.answer(x) – indeks poprawnej kategorii
   cfg.head(x)   – element pokazany nad przyciskami
   cfg.title(good, x) – opcjonalny tytuł informacji zwrotnej
   cfg.onAnswer(good, x) – po każdej odpowiedzi */
function makeCategory(container, list, cfg){
  list.forEach(x => {
    const card = document.createElement("div"); card.className = "scen";
    card.appendChild(cfg.head(x));
    const opts = document.createElement("div");
    opts.className = "opts" + (cfg.labels.length % 2 === 0 ? " two" : "");
    const fb = makeFb();
    const ok = cfg.answer(x);
    const btns = cfg.labels.map((label, n) => {
      const b = document.createElement("button"); b.className = "opt"; b.textContent = label;
      b.onclick = () => {
        btns.forEach(y => y.disabled = true);
        btns[ok].classList.add("right");
        const good = n === ok;
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

/* Ocena „tak / nie” – szczególny przypadek makeCategory.
   cfg.labels – [napis dla „tak”, napis dla „nie”]; cfg.isYes(x) – czy poprawne jest „tak”.
   Pozostałe pola jak w makeCategory. */
function makeVerdict(container, list, cfg){
  makeCategory(container, list, {...cfg, answer: x => cfg.isYes(x) ? 0 : 1});
}

/* Elementy pomocnicze: element z klasą i tekstem (zawsze przez textContent). */
function el(tag, cls, text){
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/* ---------- Rozmowa na czacie ----------
   Uczeń wybiera odpowiedzi, a rozmowa toczy się dalej. Punkt za dobry wybór za pierwszym razem.
   container – pusty <div>, w którym powstanie czat
   cfg.who     – imię rozmówcy (nagłówek i „… pisze…”)
   cfg.avatar  – emoji awatara;  cfg.avatarBg – kolor tła awatara (opcjonalnie)
   cfg.status  – podpis pod imieniem (domyślnie „aktywna teraz”)
   cfg.app     – opcjonalnie nazwa aplikacji nad czatem
   cfg.typing  – opcjonalnie napis „… pisze…” (np. w czacie grupowym „Ktoś pisze…”)
   cfg.steps   – [{sys:["dymek systemowy", …], them:["wiadomość", …],
                   opts:[{t:"odpowiedź", ok:true/false, fb:"wyjaśnienie", me:"mój dymek (opcjonalnie)"}]}]
   cfg.question – pytanie nad odpowiedziami (domyślnie „Co odpowiesz albo zrobisz?”)
   cfg.endSys  – dymek systemowy na końcu;  cfg.summary – tekst podsumowania
   cfg.onStart() – na początku każdej rozgrywki;  cfg.onEnd(punkty, max) – po zakończeniu
   Zwraca funkcję start(). */
function makeChat(container, cfg){
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const chat = el("div", "chat");
  const top = el("div", "chat-top");
  const av = el("div", "av", cfg.avatar || "🙂");
  if (cfg.avatarBg) av.style.background = cfg.avatarBg;
  const who = el("div"); who.appendChild(el("b", "", cfg.who)); who.appendChild(document.createTextNode(cfg.status || "aktywna teraz"));
  top.appendChild(av); top.appendChild(who);
  const log = el("div", "chat-log"); log.setAttribute("aria-live", "polite");
  if (cfg.app) chat.appendChild(el("div", "msg-app", cfg.app));
  chat.appendChild(top); chat.appendChild(log);
  const optsBox = el("div", "chat-opts");
  const end = el("div", "chat-end");
  const sum = el("div", "fb good");
  const againWrap = el("div", "btns"); againWrap.style.marginTop = "14px";
  const again = el("button", "b-ghost", "↺ Zagraj jeszcze raz");
  againWrap.appendChild(again); end.appendChild(sum); end.appendChild(againWrap);
  container.appendChild(chat); container.appendChild(optsBox); container.appendChild(end);

  let step = 0, points = 0, firstTry = true, run = 0;
  const bubble = (cls, txt) => { const d = el("div", "cb " + cls, txt); log.appendChild(d); return d; };

  async function playStep(){
    const my = run;                       // przerywa animację po „Zagraj jeszcze raz”
    const s = cfg.steps[step];
    optsBox.innerHTML = "";
    for (const t of (s.sys || [])) { await wait(700); if (my !== run) return; bubble("sys", t); }
    for (const t of (s.them || [])) {
      const typing = el("div", "typing", cfg.typing || cfg.who + " pisze…");
      log.appendChild(typing);
      await wait(650); if (my !== run) return;
      typing.remove(); bubble("them", t);
    }
    await wait(300); if (my !== run) return;
    showOpts();
  }
  function showOpts(){
    const s = cfg.steps[step]; firstTry = true;
    optsBox.innerHTML = "";
    const p = el("p", "", cfg.question || "Co odpowiesz albo zrobisz?"); p.style.cssText = "margin:0;font-weight:700";
    const opts = el("div", "opts");
    const fb = makeFb();
    shuffle(s.opts).forEach(o => {                // losowa kolejność odpowiedzi
      const b = el("button", "opt", o.t);
      b.onclick = () => {
        if (!o.ok) {
          firstTry = false;
          b.disabled = true; b.classList.add("wrong");
          setFb(fb, false, "❌ Lepiej nie.", o.fb + " Wybierz jeszcze raz.");
          return;
        }
        if (firstTry) points++;
        opts.querySelectorAll("button").forEach(x => x.disabled = true);
        b.classList.add("right");
        setFb(fb, true, firstTry ? "✅ Dobrze! (+1 pkt)" : "✅ Tak jest!", o.fb);
        if (o.me) bubble("me", o.me);
        const next = el("button", "b-next", step === cfg.steps.length - 1 ? "Zakończ rozmowę →" : "Dalej →");
        next.style.marginTop = "12px";
        next.onclick = () => {
          step++;
          if (step < cfg.steps.length) { playStep(); scrollToEl(log, "end"); }
          else finish();
        };
        fb.appendChild(document.createElement("br")); fb.appendChild(next);
      };
      opts.appendChild(b);
    });
    optsBox.appendChild(p); optsBox.appendChild(opts); optsBox.appendChild(fb);
  }
  function finish(){
    optsBox.innerHTML = "";
    if (cfg.endSys) bubble("sys", cfg.endSys);
    setFb(sum, true, `Wynik: ${points} / ${cfg.steps.length}.`, cfg.summary || "");
    end.style.display = "block";
    if (cfg.onEnd) cfg.onEnd(points, cfg.steps.length);
  }
  function start(){
    run++; step = 0; points = 0;
    log.innerHTML = ""; end.style.display = "none";
    if (cfg.onStart) cfg.onStart();
    playStep();
  }
  again.onclick = start;
  return start;
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
