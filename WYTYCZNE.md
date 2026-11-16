# Wytyczne techniczne: jak tworzyć nowe lekcje

Kurs „Bezpieczeństwo w sieci” to zestaw statycznych stron HTML dla klas 7–8 (13–15 lat).
Nie ma serwera ani bazy danych, nie trzeba niczego budować ani instalować: każdą lekcję otwiera się w przeglądarce.

**Najszybszy start:** skopiuj [`szablon-lekcji.html`](szablon-lekcji.html) jako `lekcja-N.html` i wypełnij miejsca oznaczone `[…]`.

---

## 1. Pliki w repozytorium

```
index.html              strona główna: spis modułów i lekcji
lekcja-1.html … N.html  lekcje (jeden plik = jedna lekcja)
szablon-lekcji.html     szkielet nowej lekcji (nie jest podlinkowany na stronie głównej)
wspolne/baza.css        kolory, czcionki, nagłówek, stopka – strona główna i lekcje
wspolne/lekcja.css      elementy lekcji: kafelki, tabele, przyciski, zadania, karta wyniku, misja, ściąga
wspolne/lekcja.js       funkcje wspólne: pytania, ocena tak/nie, karta wyniku
```

⚠️ **Katalog `wspolne/` musi zawsze być w repozytorium.** Bez niego wszystkie lekcje stracą wygląd i przestaną działać.

---

## 2. Zasady złote (najważniejsze)

1. **Zaczynaj od aktualnego pliku z GitHuba**, nie od kopii z dysku. Wgranie starszej wersji przez „Add files via upload” po cichu cofa wcześniejsze poprawki.
2. **Nie kopiuj wspólnego CSS ani JS do lekcji.** W `<style>` lekcji są tylko style używane wyłącznie w tej lekcji. Jeśli ten sam styl pojawia się w drugiej lekcji, przenieś go do `wspolne/lekcja.css`.
3. **Tekst ucznia i dane wstawiaj przez `textContent`, nigdy przez `innerHTML`.** Dotyczy zwłaszcza imienia na karcie wyniku i pól tekstowych.
4. **Nic nie wysyłaj poza stronę.** Żadnych formularzy, analityki, czcionek ani skryptów z zewnętrznych serwerów. Wszystko, co uczeń wpisze, zostaje w jego przeglądarce.
5. **Nigdy nie proś o prawdziwe hasło, kod ani dane.** Przy każdym polu, w które uczeń mógłby wpisać coś prawdziwego, dodaj ostrzeżenie (wzór: `.warn` w lekcji 1).

---

## 3. Struktura lekcji

Każda lekcja ma ten sam układ (szablon go zawiera):

| Część | Znacznik | Uwagi |
|---|---|---|
| Nagłówek | `<header>` | link `class="back"` do `index.html`, etykieta `BEZPIECZEŃSTWO W SIECI · LEKCJA N`, tytuł-pytanie, czas czytania |
| Wprowadzenie | 3–4 × `<section>` z `<h2><span class="num">1</span> …` | numeracja 1, 2, 3, 4; ok. 5–6 minut czytania |
| Zadania | 3 × `<section id="zadanie1…3">` z `<span class="num">✎</span>` | zawsze trzy; zadanie 3 to zwykle „Co zrobisz?” |
| Karta wyniku | `<section id="karta">` z `<span class="num">★</span>` | identyfikatory `status`, `name`, `bCard`, `cardMsg`, `card` – nie zmieniać |
| Misja domowa | `<section id="misja">` z `<span class="num">🕵️</span>` | `.misja-box` + ściąga `.sciaga` do druku |
| Stopka | `<footer>` | link „← Wróć do listy lekcji” |

**Nazewnictwo**
- Plik: `lekcja-N.html` (małe litery, bez polskich znaków).
- `<title>`: `Lekcja N: Tytuł w formie pytania?` – taki sam tytuł jak w `<h1>` i na stronie głównej.
- Identyfikatory i klasy dodawane w lekcji: po polsku albo krótkie angielskie, bez polskich znaków (`#zadanie1`, `.misja-box`).

**Kolejność skryptów** (na końcu `<body>`):
```html
<script src="wspolne/lekcja.js"></script>
<script>
  /* dane zadań → punkty → zadania → karta wyniku → ściąga */
</script>
```

**Wydruk ściągi:** `<body class="druk-sciagi">`, ściąga w `<div class="sciaga" id="sciaga">`, przycisk w `<div class="btns noprint">`, a w skrypcie `$("bPrint").onclick = () => window.print();`. Przy wydruku widać tylko ściągę.

---

## 4. Wspólne style (`wspolne/lekcja.css`)

Kolory zawsze przez zmienne z `baza.css`, nigdy wpisane na sztywno:

| Zmienna | Do czego |
|---|---|
| `--navy` | nagłówki, przyciski „Dalej” |
| `--ink`, `--muted` | tekst główny, tekst pomocniczy |
| `--bg`, `--card`, `--line` | tła i obramowania |
| `--teal`, `--teal-l` | „dobrze”, sukces |
| `--red`, `--red-l` | „źle”, ostrzeżenie |
| `--yellow`, `--orange`, `--link` | wyróżnienia, linki |

Gotowe klasy:

| Klasa | Wygląd / zastosowanie |
|---|---|
| `.grid` + `.tile` (`.ico`, `h3`, `p`) | siatka kafelków z emoji |
| `ul.rules` | lista zasad z ✔ |
| `.tip` | żółta ramka „zapamiętaj” |
| `.note` | mały szary tekst, przypisy |
| `.flow` (`.step`, `.arr`) | ścieżka kroków ze strzałkami |
| `table`, `code`, `.t-ok`, `.t-bad` | tabele przykładów |
| `.btns`, `.b-next`, `.b-ghost`, `.b-strong`, `.b-weak` | przyciski |
| `.progress > div` | pasek postępu |
| `.q`, `.result`, `.result .big` | quiz krok po kroku i jego wynik |
| `.scen`, `.opts`, `.opts.two`, `.opt`, `.right`, `.wrong` | karta pytania z odpowiedziami |
| `.fb.good`, `.fb.bad` | informacja zwrotna |
| `.msg-app`, `.msg-body`, `.msg-from`, `.bubble` | wygląd wiadomości (ramkę `.msg` definiuje lekcja) |
| `.chat`, `.cb`, `.chat-opts` … | czat tworzony przez `makeChat` – nie trzeba pisać HTML |
| `.misja-box`, `.sciaga`, `.sciaga .foot` | misja domowa i ściąga |

---

## 5. Wspólne funkcje (`wspolne/lekcja.js`)

| Funkcja | Co robi |
|---|---|
| `$(id)` | skrót od `document.getElementById(id)` |
| `shuffle(tablica)` | kopia tablicy w losowej kolejności |
| `scrollToEl(el, block)` | przewija do elementu (bez animacji, gdy uczeń ją wyłączył) |
| `makeFb()` | pusty blok informacji zwrotnej z `aria-live` |
| `setFb(el, good, tytuł, tekst)` | wypełnia blok: zielony/czerwony, pogrubiony tytuł + tekst |
| `makeScen(kontener, lista, onAnswer)` | pytania „Co zrobisz?”; **odpowiedzi w losowej kolejności** |
| `makeVerdict(kontener, lista, cfg)` | ocena „tak / nie” (prawdziwa/fałszywa strona, dobre/słabe hasło) |
| `makeCategory(kontener, lista, cfg)` | wybór jednej z kilku kategorii (np. „żart / krytyka / cyberprzemoc”) |
| `makeChat(kontener, cfg)` | rozmowa na czacie z wyborem odpowiedzi; zwraca `start()` (lekcje 4, 10, 11, 13) |
| `el(tag, klasa, tekst)` | tworzy element z klasą i tekstem (przez `textContent`) |
| `initScoreCard({title, tasks, pts, done, max})` | karta wyniku; zwraca `updateStatus()` |
| `renderCard(el, tytuł, imię, wynik, szczegóły)` | sama karta (gdy lekcja ma własny układ, jak lekcja 1) |
| `readName(input)`, `bindNameInput(input, fn)` | pole imienia: walidacja i Enter |

**Format danych dla `makeScen`:**
```js
{q:"📩 Sytuacja…", a:["odpowiedź", "odpowiedź poprawna", "odpowiedź"], ok:1, why:"Wyjaśnienie."}
```

**`makeVerdict` – konfiguracja:**
```js
makeVerdict($("lista"), DANE, {
  labels: ["👍 Dobre", "👎 Słabe"],   // napisy przycisków „tak” i „nie”
  isYes: x => x.ok,                    // czy poprawna odpowiedź to „tak”
  head:  x => elementNadPrzyciskami,   // np. adres strony, hasło
  title: (good, x) => "…",             // opcjonalnie: własny tytuł informacji zwrotnej
  onAnswer: (good, x) => { … }         // liczenie punktów
});
```

**Punkty i karta wyniku** – w każdej lekcji ten sam wzór:
```js
const pts  = {z1:0, z2:0, z3:0};
const done = {z1:false, z2:false, z3:false};
const max  = {z1:…, z2:…, z3:…};
// po ukończeniu zadania:  done.z1 = true; updateStatus();
const updateStatus = initScoreCard({ title:"Lekcja N: …", tasks:[["z1","Zadanie 1: …"], …], pts, done, max });
```
**`makeCategory`** – jak `makeVerdict`, ale z dowolną liczbą przycisków: `labels: [...]` i `answer: x => indeks`.

**`makeChat` – rozmowa:**
```js
const startChat = makeChat($("chat"), {
  who: "Maja 🌸", avatar: "🌸",            // opcjonalnie: avatarBg, status, typing, app, question
  steps: [{sys:["dymek systemowy"], them:["wiadomość"], opts:[{t:"odpowiedź", ok:true, fb:"wyjaśnienie", me:"mój dymek"}]}],
  endSys: "…", summary: "…",
  onStart: () => { pts.z2 = 0; done.z2 = false; updateStatus(); },
  onEnd: p => { pts.z2 = p; done.z2 = true; updateStatus(); }
});
startChat();   // wywołaj po initScoreCard
```
Dobrych odpowiedzi w kroku może być kilka (`ok:true`). Odpowiedzi pojawiają się w losowej kolejności.

**Nazwy zmiennych:** na najwyższym poziomie skryptu nie używaj nazw zajętych przez przeglądarkę (`top`, `name`, `status`, `parent`, `self`, `length`, `history`, `location`) – `const top = …` zatrzyma cały skrypt.

`initScoreCard` wywołaj **przed** pierwszym kodem, który od razu woła `updateStatus()` (np. przed `startChat()` w lekcji 4).

Nową funkcję dopisuj do `wspolne/lekcja.js` dopiero, gdy jest potrzebna w co najmniej dwóch lekcjach.

---

## 6. Zadania – zasady

- **Trzy zadania na lekcję**, każde z informacją zwrotną po każdej odpowiedzi: *co jest dobrze i dlaczego*, a nie samo „źle”.
- **Odpowiedzi podobnej długości.** Poprawna nie może być zawsze najdłuższa ani najbardziej szczegółowa – uczniowie szybko to wyłapują.
- **Losowa kolejność odpowiedzi** – `makeScen` robi to sam; we własnych zadaniach użyj `shuffle()`.
- **Opis punktacji zgodny z kodem.** Jeśli za błąd odejmujesz punkty, napisz to w poleceniu dokładnie tak, jak liczy program.
- **Przycisk „Spróbuj ponownie”** w zadaniach, które mają sens do powtórzenia (quiz, czat).
- **Rzeczy interaktywne muszą działać z klawiatury** (patrz punkt 8).

---

## 7. Treść i język

- **Odbiorca: 13–15 lat.** Krótkie zdania, jedno pojęcie na raz, analogie z życia (zamek, klucz, sejf, wędka).
- **Przykłady z ich świata:** Roblox, Fortnite, Discord, Instagram, TikTok, BLIK, InPost, dziennik elektroniczny. Bohaterowie przykładów: Ola, Kuba, Maja, Zosia.
- **Ton bez straszenia i wstydu:** „to może się przytrafić każdemu”, „powiedz dorosłemu – to żaden wstyd”.
- **Forma neutralna płciowo**, gdy się da: „Gdy klikniesz…” zamiast „Gdy kliknąłeś…”, albo forma podwójna „kliknąłeś/kliknęłaś”.
- **Typografia polska:** cudzysłów „…”, myślnik – (półpauza ze spacjami), wielokropek …
- **Odwołuj się do wcześniejszych lekcji** linkiem, np. `<a href="lekcja-1.html#2fa">lekcja 1</a>`.
- **Sprawdzaj fakty.** Numery i adresy muszą być prawdziwe i aktualne (np. **8080** – CERT Polska, `haveibeenpwned.com`). Fikcyjne domeny w przykładach oszustw kończ na nietypowych końcówkach (`.xyz`, `.top`, `.ru`), żeby nie trafić w prawdziwą firmę.
- **Misja domowa:** 10–15 minut, z domownikiem, bez zapisywania haseł, kodów i numerów. Na następnej lekcji uczeń mówi tylko o wyniku (np. „ile kont”), nigdy o danych.

---

## 8. Dostępność

- **Informacja zwrotna czytana przez czytnik ekranu:** bloki `.fb` i wyniki mają `aria-live="polite"` (`makeFb()` robi to sam).
- **Klawiatura:** wszystko klikalne to `<button>` albo element z `role="button"`, `tabindex="0"` i obsługą Enter i spacji (wzór: zaznaczanie flag w lekcji 3).
- **Nie tylko kolor:** obok koloru zawsze znak lub słowo (✅ ❌ ✔ ✖, „Dobrze!”).
- **Kontrast:** tekst min. 4,5:1. Używaj zmiennych kolorów; jasnych odcieni (np. żółtego) nie używaj na tekst na białym tle.
- **Animacje:** krótkie; `baza.css` sam je wyłącza, gdy uczeń ograniczył ruch w systemie. Do przewijania używaj `scrollToEl()`.
- **Emoji dekoracyjne w ikonach** nie niosą treści – sens musi wynikać z tekstu obok.
- Ścieżki i schematy (`.flow`, sejf w lekcji 2) opisz w `aria-label`.

---

## 9. Telefony

Uczniowie często otwierają lekcje na telefonie.
- Sprawdź szerokość **360 px**: strona nie może przewijać się w poziomie.
- Długie adresy i hasła: `word-break:break-all` (jest w `code` i `.url`).
- Układy dwukolumnowe przełączaj na jedną kolumnę w `@media (max-width:560px)` lub `640px`.

---

## 10. Udostępnienie lekcji

1. Dodaj plik `lekcja-N.html` do repozytorium.
2. W `index.html` odblokuj kafelek lekcji (instrukcja jest w komentarzu w pliku):
   - `<div class="lesson soon">` → `<a class="lesson" href="lekcja-N.html">`,
   - zamykające `</div>` tego kafelka → `</a>`,
   - `Już wkrótce` → `Start →`.
   Licznik gotowych lekcji zaktualizuje się sam.
3. Jeśli lekcja zmienia tytuł lub opis, popraw go też na kafelku w `index.html`.

---

## 11. Lista kontrolna przed publikacją

- [ ] Plik zaczęty od aktualnej wersji z GitHuba lub od `szablon-lekcji.html`
- [ ] Usunięte wszystkie `[…]`, komentarze `SZABLON:` i linia `<meta name="robots">`
- [ ] `<title>`, `<h1>`, etykieta w nagłówku i kafelek w `index.html` mają ten sam numer i tytuł
- [ ] Podłączone `wspolne/baza.css`, `wspolne/lekcja.css`, `wspolne/lekcja.js`
- [ ] W `<style>` lekcji nie ma reguł skopiowanych ze wspólnych plików
- [ ] Trzy zadania; każde da się ukończyć, a wynik trafia na kartę
- [ ] Karta wyniku: bez imienia – podświetlone pole; przed ukończeniem – „Najpierw dokończ…”
- [ ] Odpowiedzi w losowej kolejności i podobnej długości
- [ ] Ściąga drukuje się sama (Ctrl+P → podgląd)
- [ ] Wszystko działa samą klawiaturą (Tab, Enter, spacja)
- [ ] Na telefonie (360 px) nie ma przewijania w poziomie
- [ ] Konsola przeglądarki (F12) bez czerwonych błędów
- [ ] Fakty, numery i adresy sprawdzone
- [ ] Linki do innych lekcji działają
