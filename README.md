# FAME content

Dizajnový systém a zdroje pre obsah FAME na sociálnych sieťach (LinkedIn, Instagram), odvodený z webu fameworks.sk (`fame-web`). Každý post je HTML stránka so stranami `.slide`, z ktorej skript vyrenderuje PDF (LinkedIn carousel) a PNG.

- Design System v Claude: https://claude.ai/artifact/9TpxHpkshrQVVvhePFKfR4 (tokeny webu aj sociálnych sietí, brand book, komponenty)
- Skill: `~/.claude/skills/fame-social`
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

Animovaný post (jeden `.slide` s CSS animáciami) do MP4 a posteru, potrebuje `ffmpeg`:

```bash
npm run video -- posts/2026-10-video-evidence-based 8.5
```

Náhľady šablón pre katalóg:

```bash
npm run render:system
```

## Posty

| Priečinok | Kanál | Obsah |
| --- | --- | --- |
| `posts/2026-10-video-evidence-based` | Video 4:5 1080 × 1350, 8,5 s, MP4 bez zvuku | Evidence-based marketing prichádza na Slovensko |
| `posts/2026-10-linkedin-principy` | LinkedIn PDF carousel 1080 × 1080, rozloženie A, 12 strán | Našich 10 princípov z manifestu |

## Licencie

Fonty Bricolage Grotesque a Newsreader sú pod SIL Open Font License 1.1 (`system/fonts/OFL-*.txt`). Logo, sticker art a fotka patria FAME.
