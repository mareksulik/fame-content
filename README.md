# FAME content

Dizajnový systém a zdroje pre obsah FAME na sociálnych sieťach (LinkedIn, Instagram), odvodený z webu fameworks.sk (`fame-web`). Každý post je HTML stránka so stranami `.slide`, z ktorej skript vyrenderuje PDF (LinkedIn carousel) a PNG.

- Design System v Claude: https://claude.ai/artifact/9TpxHpkshrQVVvhePFKfR4 (tokeny webu aj sociálnych sietí, brand book, komponenty)
- Skill pre Claude Code: `.claude/skills/fame-social` (načíta sa automaticky, keď otvoríš tento repozitár v Claude Code; globálne si ho sprístupníš symlinkom do `~/.claude/skills/fame-social`)
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

Video v Blenderi (3D samolepky, ploché svetlo; potrebuje Blender a ffmpeg):

```bash
blender -b -P posts/2026-10-blender-evidence-based/scene.py -- render
ffmpeg -framerate 30 -i posts/2026-10-blender-evidence-based/out/frames/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart posts/2026-10-blender-evidence-based/out/fame-blender-evidence-based.mp4
```

Video v Remotion (React; Free License pre neziskové organizácie; používa `system/tokens.css` a `components.css`):

```bash
cd remotion && npm install && npx remotion render src/index.ts EvidenceBased ../posts/2026-10-remotion-evidence-based/out/fame-remotion-evidence-based.mp4 --public-dir ../system --codec h264 --crf 18
```

Remotion kóduje s plným farebným rozsahom (`yuvj420p`); pre sociálne siete prekóduj na štandardný rozsah:

```bash
ffmpeg -i in.mp4 -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -color_range tv -c:v libx264 -crf 18 -movflags +faststart out.mp4
```

Animovaný graf v Manime (MIT; potrebuje `brew install cairo pango pkgconf` a ffmpeg):

```bash
python3 -m venv .venv && .venv/bin/pip install manim
.venv/bin/manim -qh --format mp4 -r 1080,1350 --fps 30 posts/2026-10-manim-humor-v-reklame/scene.py HumorVReklame
```

Náhľady šablón pre katalóg:

```bash
npm run render:system
```

## Posty

| Priečinok | Kanál | Obsah |
| --- | --- | --- |
| `posts/2026-10-linkedin-ebbie` | LinkedIn PDF carousel 1080 × 1080, rozloženie A2, 5 strán | Predstavenie Ebbie |
| `posts/2026-10-manim-humor-v-reklame` | Video 4:5, 8 s, Manim, animovaný graf z odpovede Ebbie | Oplatí sa v reklame humor? |
| `posts/2026-10-remotion-evidence-based` | Video 4:5, 8,5 s, Remotion (`remotion/`) | Evidence-based marketing prichádza na Slovensko |
| `posts/2026-10-blender-evidence-based` | Video 4:5 1080 × 1350, 8,5 s, Blender (3D samolepky, ploché svetlo), bez zvuku | Evidence-based marketing prichádza na Slovensko |
| `posts/2026-10-video-evidence-based` | Video 4:5 1080 × 1350, 8,5 s, MP4 bez zvuku | Evidence-based marketing prichádza na Slovensko |
| `posts/2026-10-linkedin-principy` | LinkedIn PDF carousel 1080 × 1080, rozloženie A, 12 strán | Našich 10 princípov z manifestu |

## Licencie

Fonty Bricolage Grotesque a Newsreader sú pod SIL Open Font License 1.1 (`system/fonts/OFL-*.txt`). Logo, sticker art, fotka členov, screenshoty Ebbie a hotové posty patria Friends of Applied Marketing sciencE, o. z.; sú tu na tvorbu obsahu FAME, nie na voľné použitie inde.
