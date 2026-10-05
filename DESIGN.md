# FAME: dizajnový systém v1 (sociálne siete)

Verzia 1.0, 5. 10. 2026. Živý katalóg: `system/index.html`. Design System v Claude: https://claude.ai/artifact/9TpxHpkshrQVVvhePFKfR4.

Pravidlá pre obsah na sociálne siete (LinkedIn, Instagram). Systém vychádza z webu `fame-web` (`web/src/app/(frontend)/styles.css`, záväzné pravidlá v `AGENTS.md`, živý web fameworks.sk k 5. 10. 2026). Konkrétne hodnoty sú v `system/tokens.css`, komponenty v `system/components.css`. Toto je dokument s pravidlami.

## Princíp

Identitu nesie logo: naklonené obdĺžniky ako nalepené samolepky, ostré rohy, ťažké čierne písmo. Post z neho preberá tri veci: hranaté naklonené dlaždice v troch farbách, tučný grotesk na nadpisy a pokojnú serifovú prózu na bielom. Plátno má 1080 px a na mobile sa zobrazí zhruba na 360 až 400 px, teda v mierke ~0,35. Text pod 24 px na plátne je na telefóne nečitateľný.

## Formáty

| Formát | Rozmer | Trieda | Použitie |
| --- | --- | --- | --- |
| Štvorec | 1080 × 1080 | `.slide` | LinkedIn PDF carousel, IG post |
| Na výšku 4:5 | 1080 × 1350 | `.slide .slide--portrait` | podujatie, post s viac textom |
| Story 9:16 | 1080 × 1920 | `.slide .slide--story` | IG/LinkedIn stories (zatiaľ bez šablóny) |

Okraj plátna je 72 px, vnútorná šírka 936 px. V jednom PDF majú všetky strany rovnaký formát.

## Farby

| Token | Hodnota | Použitie |
| --- | --- | --- |
| `--red` | #EE3433 | dlaždica, primárna URL kapsula; text na nej `--on-red` čierna (5,2 : 1) |
| `--teal` | #00A69C | dlaždica; ink na nej 5,3 : 1. Samostatne znamená stav, nie dekor |
| `--yellow` | #FAE27B | dlaždica; ink 12,5 : 1 |
| `--beige` | #EAE0CE | iba pozadie bloku `.f-block` a panela `.f-panel` |
| `--taupe` | #BFB2AC | iba krátky neutrálny panel |
| `--tan` | #C3996B | definovaná, **nepoužíva sa** |
| `--ink` | #242021 | text, linky, obrys kapsuly (16,1 : 1 na bielej) |
| `--paper` | #ffffff | plátno |
| `--muted` | #645f60 | sekundárny text iba na bielej (6,3), béžovej (4,8) a žltej (4,9); nikdy na tyrkysovej (2,1) |

Pravidlá z webu platia aj tu:

1. Dlaždice iba červená, tyrkysová, žltá. Béžová a taupe nikdy ako dlaždica.
2. Text na farbe je vždy tmavý: čierna na červenej, inak ink. Farby palety nikdy ako farba textu.
3. Susedné dlaždice nikdy rovnakou farbou. V carouseli cyklus **žltá → tyrkysová → červená** a znova; ak sú na strane tri dlaždice vedľa seba, platí rovnaký cyklus.
4. Linky sú ink. Červená je hlavná akcia, nie dekor.
5. Nové farby nepridávať.

## Typografia

Bricolage Grotesque na nadpisy, štítky a URL, Newsreader na prózu; obe ako variabilné woff2 z fontsource (OFL), rovnaké súbory ako web.

| Rola | Veľkosť / riadkovanie | Pravidlo |
| --- | --- | --- |
| Display | 112 / 0,98, váha 800 | titulná strana, max 2 riadky |
| Title | 80 / 1,02, váha 800 | nadpis strany, max 2 riadky |
| Subtitle | 64 / 1,06, váha 700 | nadpis v dlaždici, max 4 riadky |
| Number | 64, váha 800 | číslo v dlaždici `01–10` |
| Body | 36 / 1,4, Newsreader | próza, max ~5 riadkov |
| Meta | 26 / 1,3, váha 600 | štítok, počítadlo, URL, päta |
| Small | 24, váha 600 | `dt` v paneli; najmenší text |

Slovenská typografia: za jednopísmenovými predložkami a spojkami (a, i, k, o, s, u, v, z) a medzi číslom a jednotkou píš `&nbsp;` (`a&nbsp;tvrdenia`, `10&nbsp;princípov`). V texte FAME bez hviezdičky (hviezdička je iba v logu). Bez emoji a výkričníkov.

## Komponenty

| Prvok | Trieda | Pravidlo |
| --- | --- | --- |
| Hlavička | `.f-header`, `.f-logo`, `.f-counter` | logo vľavo (152 px vysoké), počítadlo `1 / 5` alebo štítok vpravo |
| Štítok | `.f-label` | krátke pomenovanie nad nadpisom („Najbližšie“) |
| Nadpis | `.f-display`, `.f-title`, `.f-subtitle` | pomenovanie, nie slogan |
| Próza | `.f-body` | Newsreader, citácia alebo skrátenie zdroja |
| Dlaždica | `.f-tile.f-tile--yellow|teal|red` (+ `.f-tile--cw`) | naklonená o 2°, striedavo `-` a `+`; voliteľne `.f-tile__number` |
| Dlaždica s popisom | `.f-tile__head` (`.f-tile__number` + `.f-tile__title` 52 px) + `.f-tile__text` (serif 32 px) | dve až tri na strane `.slide--stack`, delia si celú výšku; pri troch iba nadpis; texty z webu doslovne |
| Screenshot ako samolepka | `.f-shot` > `.f-shot__crop` (+ `--iw --cx --cy --cw --ch`) | skutočný screenshot, nemenený súbor, orezaný v CSS na výrez okna; rám red/teal/yellow (`--tone`), náklon `--shot-tilt`, vybieha za okraj; poloha v `<style>` postu |
| Sticker art | `.f-art` | iba titulka, vybieha za pravý okraj; text ho neprekrýva |
| Blok | `.f-block` | béžový blok na bielom plátne (záver, výzva) |
| Panel | `.f-panel` (`dl`) | fakty: termín, miesto, lístky |
| URL kapsula | `.f-url`, `.f-url--primary` | hranatá, obrys 3 px ink; červená iba jedna na stranu |
| Päta | `.f-footer` | ink linka 3 px, vľavo názov série, vpravo URL |
| Fotka | `.f-photo` | iba skutočné fotky FAME |

Bez zaoblení, bez tieňov, bez ikon. Hranatý tvar je identita, nie nedbalosť.

## Logo a médiá

| Súbor | Charakter | Kam |
| --- | --- | --- |
| `brand/logo.png` | originálne logo, 2510 × 1008 | hlavička každej strany |
| `brand/logo-rosette.png` | rozeta samolepiek s textom, 1968 × 1438 | samostatný vizuál, profil; nie ako hlavička |
| `media/stickers-bleed.png` | dve samolepky FAME, odrezané vpravo | titulka carouselu, vybieha za pravý okraj |
| `media/photo-clenovia.jpg` | selfie členov zo stretnutia | komunita, stretnutia; text cez ľudí nie |
| `media/ebbie-answer-2026-09-21.png` | okno ebbie.sk, zdieľaná odpoveď „Oplatí sa v reklame humor?“ (1077 × 1153, okno x56 y38 w965 h1041) | ukážka odpovede Ebbie |
| `media/ebbie-window-2026-09-21.png` | okno ebbie.sk, úvodná obrazovka (rovnaké rozmery) | iba výrez od y 600 (otázka, sformulovanie); úvodný text s počtom prác nezobrazovať |

- Logo sa nikdy nekreslí nanovo, neprefarbuje ani neorezáva. `logo.png` má **nepriehľadné biele pozadie**, preto plátno je vždy biele a béžová prichádza iba ako blok alebo panel.
- Žiadne generované obrázky, vymyslené billboardy ani portréty. Zamietnutý koncept `exec-11dfbee1-…png` sa nepoužíva ani ako referencia. `FAME_preview_3.pdf` je iba zdroj štýlu, nie kompozície.
- Ďalšie skutočné zdroje vo `fame-web`: portréty výboru `web/content-assets/people/`, screenshoty Ebbie `web/content-assets/ebbie-*.png` (nemenené, iba orezané CSS).

## Texty

- Iba zo zdrojov: manifest (`fame-web/web/src/content/manifest.json`), web fameworks.sk, Payload. Nevymýšľať fakty, čísla, rečníkov, miesta ani ceny. Neznámy termín je `TBA`.
- Tón: odborný, priamy, bez superlatívov. Vykanie v množnom čísle („Spýtajte sa Ebbie skôr, než sa rozhodnete.“). Nadpisy pomenúvajú.
- „Speakeri deklarujú konflikt záujmov.“ sa nepoužíva.
- Ebbie: počet zdrojov neuvádzať (overených je 748 prác, nie 1 000+), plánované funkcie nepredstavovať ako hotové. Limity pre nečlenov číslami neuvádzať; píš „Vyskúšať si ju môže každý. Členovia FAME majú neobmedzený prístup.“

## Rozloženia

Príklady sú v `system/templates/`. V jednom carouseli iba jedno rozloženie.

**A: dlaždice** (`a-dlazdice.html`, 1080 × 1080). Titulka so sticker art a display nadpisom, obsahové strany s naklonenou dlaždicou (číslo + nadpis) a prózou pod ňou, záver s béžovým blokom a URL kapsulami. Na princípy, zistenia, tipy.

```
logo                       1 / 5      logo                       2 / 5
             [samolepky vybiehajú →]   ┌ dlaždica (žltá, −2°) ─────┐
Našich 10                             │ 01                        │
princípov                             │ Nadpis princípu           │
Próza, 1–2 riadky                     └───────────────────────────┘
──────────────────────────────        Próza zo zdroja
Séria              fameworks.sk/url   ──────────────────────────────
                                      Séria              fameworks.sk/url
```

**A2: predstavenie produktu** (`.slide--stack`, príklad `posts/2026-10-linkedin-ebbie/`). Titulka iba s predstavením (dlaždica s názvom, próza, URL), strany s ukážkou rozhrania (dlaždica s pomenovaním, próza, screenshot ako samolepka), potom stĺpec dvoch až troch dlaždíc s vlastnosťami (pri troch iba nadpisy). Cyklus farieb pokračuje cez strany.

**B: podujatie** (`b-podujatie.html`, 1080 × 1350). Termín v naklonenej dlaždici, štítok, názov, text, panel faktov, päta s červenou URL.

```
logo                     Podujatie
┌ TBA ┐ (tyrkysová, −2°)
Najbližšie
Názov podujatia
Text
[Termín  Lístky]  (béžový panel)
──────────────────────────────
Podujatia FAME     [fameworks.sk/eventy]
```

## Video

Krátke video je jeden `.slide` (najčastejšie `.slide--portrait`) so scénami ako absolútne vrstvy a CSS animáciami; časovanie je iba v `animation-delay`. `scripts/video.mjs` posúva čas cez Web Animations API po snímkach (30 fps), takže výstup je presný, a ffmpeg ho zloží do MP4 (H.264, yuv420p) + poster z poslednej snímky. Príklad: `posts/2026-10-video-evidence-based/`.

- Pohyb je „nalepenie“ samolepky: `slap` (zväčšenie 1,35 → 1, dorovnanie náklonu), text `rise`, sticker art `slide-in` sprava, odchod scény `out-up`.
- Málo bieleho, veľa grafiky: samolepky (dlaždice, sticker art, tyrkysový pás) vybiehajú za okraje a pokrývajú väčšinu plátna. Biela je iba medzera medzi samolepkami.
- Každá scéna nesie posolstvo; scéna, ktorá len opakuje meno (napr. samotné „FAME!“), sa vynecháva. Dve až tri scény po 3–5 s, záver drží aspoň 2,5 s s URL.
- Prechod medzi scénami je pohyb samolepiek (odletia nabok, nové sa nasunú), nie prázdne prelínanie.
- Bez zvuku, kým nie je dodaná skutočná hudba alebo hlas; text musí fungovať bez zvuku.
- Rovnaké pravidlá ako pri statických postoch: farby dlaždíc, tmavý text na farbe, biele plátno pod logom, nič pod 24 px.

## Súbory systému

| Súbor | Obsah |
| --- | --- |
| `system/tokens.css` | fonty, farby, typografia, rozostupy |
| `system/components.css` | plátno, komponenty, rozloženia A a B |
| `system/templates/` | šablóny + náhľady v `out/` |
| `system/index.html` | katalóg farieb, písma, komponentov a rozložení |
| `system/fonts`, `brand`, `media` | Bricolage Grotesque, Newsreader (OFL), logá, sticker art, fotka |
| `scripts/render.mjs` | HTML → PDF + PNG cez lokálny Chrome |
| `scripts/video.mjs` | animovaný HTML → MP4 + poster (Chrome + ffmpeg) |

Zmena systému (nový prvok, pravidlo) znamená v jednom kroku upraviť CSS, tento dokument, katalóg a Design System artefakt, potom spustiť `npm run render:system` a skontrolovať náhľady. Ak sa zmení web (paleta, fonty, pravidlá v `fame-web/AGENTS.md`), web má prednosť a systém sa zosynchronizuje.

## Postup pre nový post

1. Vytvor `posts/RRRR-MM-kanal-tema/` a skopíruj doň šablónu zo `system/templates/` (alebo najbližší existujúci post).
2. Uprav obsah v `.html`. Triedy a štruktúru nemeň. Nový prvok najprv pridaj do `system/components.css` a sem.
3. `npm run render -- posts/<priecinok>` vytvorí v `out/` PDF a PNG pre každú stranu.
4. Skontroluj **výsledné PDF strana po strane** (to dostane používateľ), nie iba PNG: čitateľnosť pri 360 px, zalomenia, poradie farieb dlaždíc, nič cez ľudí na fotke, screenshoty a samolepky na mieste. PDF sa skladá z PNG (`scripts/render.mjs`), nie z tlačového režimu Chrome, ktorý láme prvky presahujúce stranu.
5. Text príspevku ulož do `caption.md` vedľa HTML.
