"""FAME video v Manime: Oplatí sa v reklame humor? (4:5, 1080 × 1350, 30 fps, ~9 s).

Zdroj tvrdení: zdieľaná odpoveď Ebbie z 20. 9. 2026 (ebbie.sk, screenshot system/media/ebbie-answer-2026-09-21.png):
„Veľká meta-analýza stoviek meraní potvrdzuje, že vplyv humoru na obľúbenosť reklamy je približne dvakrát silnejší
než jeho vplyv na postoj k značke.“ Stĺpce ukazujú iba tento pomer (2 : 1), žiadne vymyslené absolútne hodnoty,
a nie sú naklonené, aby porovnanie nebolo skreslené.

Spustenie z koreňa repozitára (Manim v jeho venv):
  manim -qh --format mp4 -r 1080,1350 --fps 30 posts/2026-10-manim-humor-v-reklame/scene.py HumorVReklame
"""
import os

from manim import (
    DOWN, LEFT, RIGHT, UP, FadeIn, GrowFromEdge, ImageMobject, Rectangle, Scene, Text, VGroup, config, rate_functions,
    register_font,
)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FONT_FILE = os.path.join(ROOT, "system", "fonts", "BricolageGrotesque-ExtraBold.ttf")
FONT = "Bricolage Grotesque 96pt ExtraBold"
LOGO = os.path.join(ROOT, "system", "brand", "logo.png")

# 1 jednotka = 100 px plátna 1080 × 1350, rovnaká mierka ako HTML posty.
config.pixel_width, config.pixel_height = 1080, 1350
config.frame_width, config.frame_height = 10.8, 13.5
config.frame_rate = 30
config.background_color = "#FFFFFF"

RED, TEAL, YELLOW, INK, BLACK = "#EE3433", "#00A69C", "#FAE27B", "#242021", "#000000"
LEFT_X = -5.4 + 0.72  # okraj plátna 72 px
PX = 0.01


def line(s, px, color=INK):
    """Riadok textu: výšku škálujeme podľa veľkého písmena, aby sa diakritika nerátala do veľkosti."""
    ref = Text("H", font=FONT)
    t = Text(s, font=FONT, color=color)
    k = (px * PX * 0.7) / ref.height
    return t.scale(k)


def tile(content, color, pad_x=0.48, pad_y=0.32, tilt=0.0):
    box = Rectangle(width=content.width + 2 * pad_x, height=content.height + 2 * pad_y, fill_color=color, fill_opacity=1, stroke_width=0)
    box.move_to(content)
    g = VGroup(box, content)
    if tilt:
        g.rotate(tilt * 3.14159 / 180)
    return g


def left_at(m, x, y):
    m.move_to([x + m.width / 2, y, 0])
    return m


class HumorVReklame(Scene):
    def construct(self):
        with register_font(FONT_FILE):
            self.build()

    def slap(self, m, run_time=0.45):
        self.play(FadeIn(m, scale=1.3), run_time=run_time, rate_func=rate_functions.ease_out_back)

    def build(self):
        logo = ImageMobject(LOGO).scale_to_fit_height(1.52)
        logo.move_to([LEFT_X + logo.width / 2 - 0.16, 6.75 - 0.72 - 0.52, 0])
        self.add(logo)

        # Otázka v žltej naklonenej dlaždici
        q = VGroup(line("Oplatí sa", 96), line("v reklame humor?", 96)).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        q_tile = tile(q, YELLOW, pad_x=0.5, pad_y=0.42, tilt=-2)
        left_at(q_tile, LEFT_X - 0.12, 2.95)
        self.wait(0.2)
        self.slap(q_tile)

        # Porovnanie z metaanalýzy: rovnaká základňa, pomer 2 : 1, stĺpce bez náklonu
        intro = line("Vplyv humoru podľa metaanalýzy", 40)
        left_at(intro, LEFT_X, 1.05)
        self.play(FadeIn(intro, shift=UP * 0.3), run_time=0.4)

        full = 6.2
        b1_label = line("na obľúbenosť reklamy", 44)
        left_at(b1_label, LEFT_X, 0.3)
        b1 = Rectangle(width=full, height=1.1, fill_color=RED, fill_opacity=1, stroke_width=0)
        left_at(b1, LEFT_X, -0.55)
        b2_label = line("na postoj k značke", 44)
        left_at(b2_label, LEFT_X, -1.55)
        b2 = Rectangle(width=full / 2, height=1.1, fill_color=TEAL, fill_opacity=1, stroke_width=0)
        left_at(b2, LEFT_X, -2.4)

        self.play(FadeIn(b1_label), GrowFromEdge(b1, LEFT), run_time=0.9, rate_func=rate_functions.ease_out_cubic)
        self.play(FadeIn(b2_label), GrowFromEdge(b2, LEFT), run_time=0.9, rate_func=rate_functions.ease_out_cubic)

        # „približne 2×“ patrí k dlhšiemu (červenému) stĺpcu
        times = tile(VGroup(line("približne", 36), line("2× silnejší", 48)).arrange(DOWN, aligned_edge=LEFT, buff=0.16), YELLOW, pad_x=0.3, pad_y=0.24, tilt=3)
        times.move_to([LEFT_X + full + 0.25 + times.width / 2, -0.55, 0])
        self.wait(0.2)
        self.slap(times)

        # Béžový blok: čo to znamená pre prax (veta z tej istej odpovede), zdroj a výzva
        block = Rectangle(width=11.2, height=3.5, fill_color="#EAE0CE", fill_opacity=1, stroke_width=0)
        block.move_to([0, -6.75 + 3.5 / 2 - 0.1, 0])  # horná hrana −3,35: tyrkysový stĺpec (spodok −2,95) ostane celý
        take = VGroup(line("Humor pomôže preraziť nezáujem,", 52), line("no samotný nákup nezaručí.", 52)).arrange(DOWN, aligned_edge=LEFT, buff=0.24)
        left_at(take, LEFT_X, -4.05)
        src = line("Zdroj: zdieľaná odpoveď Ebbie, 20. 9. 2026", 26)
        left_at(src, LEFT_X, -5.12)
        url = tile(line("ebbie.sk", 44, color=BLACK), RED, pad_x=0.4, pad_y=0.26)
        left_at(url, LEFT_X, -5.92)
        self.wait(0.2)
        self.play(GrowFromEdge(block, DOWN), run_time=0.45, rate_func=rate_functions.ease_out_cubic)
        self.play(FadeIn(take, shift=UP * 0.3), run_time=0.5)
        self.play(FadeIn(src), run_time=0.3)
        self.slap(url)
        self.wait(2.6)
