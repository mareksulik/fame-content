# FAME content

Dizajnový systém a zdroje pre obsah FAME na sociálnych sieťach (LinkedIn, Instagram), odvodený z webu fameworks.sk (`fame-web`). Každý post je HTML stránka so stranami `.slide`, z ktorej skript vyrenderuje PDF (LinkedIn carousel) a PNG.

- Pravidlá: [DESIGN.md](DESIGN.md)
- Katalóg: [system/index.html](system/index.html)
- Šablóny: `system/templates/a-dlazdice.html` (carousel s dlaždicami), `system/templates/b-podujatie.html` (podujatie 4:5)

## Renderovanie

Prvýkrát:

```bash
npm install
```

Post do PDF a PNG (používa lokálny Google Chrome, každý `.html` v priečinku je samostatný variant):

```bash
npm run render -- posts/2026-10-linkedin-principy
```

Náhľady šablón pre katalóg:

```bash
npm run render:system
```

## Licencie

Fonty Bricolage Grotesque a Newsreader sú pod SIL Open Font License 1.1 (`system/fonts/OFL-*.txt`). Logo, sticker art a fotka patria FAME.
