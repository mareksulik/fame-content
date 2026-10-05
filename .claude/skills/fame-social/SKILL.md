---
name: fame-social
description: Use when creating ANY social media or visual content for FAME (Friends of Applied Marketing sciencE, fameworks.sk) – LinkedIn post, PDF carousel, Instagram post, story, 4:5 graphic, short video, event announcement, "príspevok pre FAME", "carousel o manifeste", "post o podujatí", "obsah pre FAME", "slidy do PDF pre FAME", "video pre FAME". Applies the FAME design system from the fame-content repository (github.com/mareksulik/fame-content; Claude Design system "FAME": https://claude.ai/artifact/9TpxHpkshrQVVvhePFKfR4) derived from fameworks.sk, instead of other design systems or ad-hoc design.
---

# FAME – dizajnový systém, použitie na sociálne siete

Implementácia je repozitár **fame-content** (https://github.com/mareksulik/fame-content; lokálne napr. `~/Documents/GitHub/fame-content`, ak ho nemáš, naklonuj ho). Pred prácou prečítaj `DESIGN.md` (záväzné pravidlá) a pozri `system/index.html` (katalóg). Rovnaký systém je aj ako Design System v Claude: https://claude.ai/artifact/9TpxHpkshrQVVvhePFKfR4 (otvorí sa, iba ak ti ho vyzdieľali). Vizuálny zdroj je web fameworks.sk; kto má prístup k súkromnému repozitáru `fame-web`, nájde tam `web/src/app/(frontend)/styles.css` a pravidlá v `AGENTS.md`. Pri konflikte má web prednosť.

## Workflow

1. Vytvor `posts/RRRR-MM-kanal-tema/`, skopíruj šablónu zo `system/templates/` alebo najbližší existujúci post:
   - `a-dlazdice.html` (carousel 1080 × 1080): titulka so sticker art, obsahové strany s naklonenou dlaždicou (číslo + nadpis) a prózou, záver s béžovým blokom a URL kapsulami. Princípy, zistenia, tipy.
   - `posts/2026-10-linkedin-ebbie/` (rozloženie A2, predstavenie produktu): titulka iba s predstavením, ukážky rozhrania (screenshot ako samolepka), vlastnosti po dve až tri na stranu.
   - `b-podujatie.html` (4:5, 1080 × 1350): termín v naklonenej dlaždici, názov, text, panel faktov, červená URL.
   V jednom carouseli iba jedno rozloženie a jeden formát.
2. Nahraď texty, triedy nemeň. Nový prvok najprv do `system/components.css` + `DESIGN.md` + katalógu (a do Design System artefaktu, ak ho spravuješ).
3. `npm install` (prvýkrát), potom `npm run render -- posts/<priecinok>` → `out/*.pdf` + PNG po stranách (playwright-core s lokálnym Google Chrome). PDF sa skladá z PNG.
4. Over **výsledné PDF strana po strane** (napr. render PDF stránok), nie iba PNG: čitateľnosť pri 360 px, zalomenia, poradie farieb, screenshoty a samolepky na mieste. Až potom pošli PDF používateľovi.
5. Text príspevku do `caption.md`.

**Krátke video:** skopíruj `posts/2026-10-video-evidence-based/video.html` (scény ako vrstvy v jednom `.slide`, časovanie iba v `animation-delay`), potom `npm run video -- posts/<priecinok> [sekundy] [fps]` (potrebuje `ffmpeg`) → `out/*.mp4` + poster. Over kľúčové snímky cez `ffmpeg -ss <t> -frames:v 1`. Pravidlá v `DESIGN.md`, sekcia Video.

## Pravidlá (skrátene)

- Plátno vždy biele (`logo.png` má nepriehľadné biele pozadie a nesmie sa upravovať); béžová iba ako `.f-block` alebo `.f-panel`. Okraj 72 px, nič menšie ako 24 px.
- Málo bieleho, veľa grafiky: dlaždice, sticker art a screenshoty v rámoch vybiehajú za okraje. Žiadna strana ani scéna, ktorá len opakuje meno.
- Dlaždice iba red #EE3433, teal #00A69C, yellow #FAE27B; susedné nikdy rovnakou farbou, náklon −2° / +2° striedavo. Text na farbe tmavý (na červenej čierna). Béžová/taupe nikdy dlaždica, tan sa nepoužíva. Žiadne nové farby.
- Všetko hranaté: bez zaoblení, tieňov a ikon. Červená URL kapsula iba jedna na stranu.
- Nadpisy Bricolage Grotesque 800/700, próza Newsreader. Display 112, title 80, subtitle 64, body 36, meta 26.
- Texty iba zo zdrojov (manifest FAME, web fameworks.sk, Payload). Nevymýšľať fakty, rečníkov, miesta, ceny ani fotky; neznámy termín `TBA`. URL overiť na živom webe (`/manifest`, `/clenstvo`, `/eventy`, `/ebbie`, `ebbie.sk`).
- V texte FAME bez hviezdičky. Bez emoji a výkričníkov (iba ak ich zadávateľ výslovne napíše). Vetu „Speakeri deklarujú konflikt záujmov.“ nepoužívať. Pri Ebbie neuvádzať počet zdrojov ani čísla limitov pre nečlenov; píš „Vyskúšať si ju môže každý. Členovia FAME majú neobmedzený prístup.“
- Slovenčina: `&nbsp;` za a/i/k/o/s/u/v/z a medzi číslom a jednotkou.
- Iba skutočné obrazy zo `system/brand` a `system/media` (logo, sticker art, fotka členov, screenshoty Ebbie). Žiadne generované obrázky.
- Pozor: v `sed` náhradách je `&` špeciálny znak – pri `&nbsp;` použi Python alebo Edit.
