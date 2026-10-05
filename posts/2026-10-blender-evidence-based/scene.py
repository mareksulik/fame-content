"""FAME video v Blenderi: Evidence-based marketing prichádza na Slovensko (4:5, 8,5 s, 30 fps).

Spustenie z koreňa repozitára:
  blender -b -P posts/2026-10-blender-evidence-based/scene.py -- stills   # kontrolné snímky do out/still-*.png
  blender -b -P posts/2026-10-blender-evidence-based/scene.py -- render   # snímky do out/frames/, potom ffmpeg (README)

Ploché svetlo: všetky materiály sú emisné a view transform je Standard, takže farby sú presne hex z palety.
Rozloženie preberá 2D video posts/2026-10-video-evidence-based (súradnice v px plátna 1080 × 1350, 1 jednotka = 100 px).
"""
import math
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(HERE, "out")
FONT = os.path.join(ROOT, "system", "fonts", "BricolageGrotesque-ExtraBold.ttf")
ART = os.path.join(ROOT, "system", "media", "stickers-bleed.png")
MODE = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "stills"

FPS, FRAMES = 30, 255
W, H = 1080, 1350
OX_B = 14.0  # scéna B leží na „stole“ vpravo od scény A

PALETTE = {"red": "#EE3433", "teal": "#00A69C", "yellow": "#FAE27B", "ink": "#242021", "black": "#000000"}


def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgba(hexstr):
    h = hexstr.lstrip("#")
    return (lin(int(h[0:2], 16)), lin(int(h[2:4], 16)), lin(int(h[4:6], 16)), 1.0)


def P(x, y, ox=0.0):
    """px na plátne (x doprava, y nadol) → svetové X, Y."""
    return ox + (x - W / 2) / 100, (H / 2 - y) / 100


# ---------- scéna ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        scn.render.engine = engine
        break
    except TypeError:
        continue
scn.render.resolution_x, scn.render.resolution_y, scn.render.resolution_percentage = W, H, 100
scn.render.fps = FPS
scn.frame_start, scn.frame_end = 0, FRAMES - 1
scn.view_settings.view_transform = "Standard"
scn.view_settings.look = "None"
scn.render.film_transparent = False
try:
    scn.eevee.taa_render_samples = 16
except AttributeError:
    pass

world = bpy.data.worlds.new("paper")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
scn.world = world

font = bpy.data.fonts.load(FONT)
MATS = {}


def flat(name):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs[0].default_value = rgba(PALETTE[name])
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(em.outputs[0], out.inputs[0])
    MATS[name] = m
    return m


def box(name, cx, cy, w, h, color, z=0.0, rot=0.0, depth=0.05):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, cy, z))
    o = bpy.context.object
    o.name = name
    o.scale = (w, h, depth)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.rotation_euler = (0, 0, math.radians(rot))
    o.data.materials.append(flat(color))
    return o


def text(name, body, size, color, loc, parent=None, align_y="CENTER", z=0.03):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.font = font
    cu.size = size
    cu.align_x = "LEFT"
    cu.align_y = align_y
    cu.space_line = 0.95
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(flat(color))
    if parent:
        o.parent = parent
    o.location = (loc[0], loc[1], z)
    return o


def key(o, frame, **props):
    for attr, value in props.items():
        setattr(o, attr, value)
        o.keyframe_insert(data_path=attr, frame=frame)


def ease(o, interp="BACK", easing="EASE_OUT"):
    ad = o.animation_data
    if not ad or not ad.action:
        return
    curves = getattr(ad.action, "fcurves", None)
    if curves is None:  # Blender 5: kanály sú v slotoch akcie
        curves = [fc for layer in ad.action.layers for strip in layer.strips for bag in strip.channelbags for fc in bag.fcurves]
    for fc in curves:
        for kp in fc.keyframe_points:
            kp.interpolation = interp
            kp.easing = easing


def visible_from(o, frame):
    """Objekt (aj s textom na ňom) sa zobrazí až od svojej prvej animovanej snímky."""
    for ob in [o, *o.children]:
        ob.hide_render = True
        ob.keyframe_insert(data_path="hide_render", frame=0)
        ob.hide_render = False
        ob.keyframe_insert(data_path="hide_render", frame=frame)


def flip_in(o, start, dur=13, r0=-11, r=-5, z_end=0.0):
    """Samolepka sa preklopí do záberu ako karta a dorovná náklon (2D „slap“ v 3D)."""
    x, y, _ = o.location
    key(o, start, location=(x, y + 1.2, z_end + 3.0), rotation_euler=(math.radians(-85), 0, math.radians(r0)))
    key(o, start + dur, location=(x, y, z_end), rotation_euler=(0, 0, math.radians(r)))
    ease(o)
    visible_from(o, start)


# ---------- scéna A: tri samolepky cez celé plátno ----------
def sticker(name, color, top, height, rot, label, size, z, text_color="ink", align_y="CENTER", text_top=None):
    cx, cy = P(540, top + height / 2)
    s = box(name, cx, cy, 12.8, height / 100, color, z=z, rot=rot)
    ty = 0.0 if align_y == "CENTER" else (height / 2 - text_top) / 100
    text(name + "-text", label, size, text_color, (-4.68, ty), parent=s, align_y=align_y)
    return s


s1 = sticker("s1", "yellow", 96, 258, -5, "Evidence-based", 1.28, 0.00)
s2 = sticker("s2", "teal", 400, 258, 4, "marketing", 1.28, 0.08)
s3 = sticker("s3", "red", 700, 900, -3, "prichádza\nna Slovensko!", 1.12, 0.16, text_color="black", align_y="TOP", text_top=80)
flip_in(s1, 3, r0=-11, r=-5, z_end=0.00)
flip_in(s2, 13, r0=10, r=4, z_end=0.08)
flip_in(s3, 23, r0=-9, r=-3, z_end=0.16)

# ---------- scéna B: sticker art + tyrkysový pás + text ----------
img = bpy.data.images.load(ART)
art_w = 10.0
art_h = art_w * img.size[1] / img.size[0]
bpy.ops.mesh.primitive_plane_add(size=1)
art = bpy.context.object
art.name = "art"
art.scale = (art_w, art_h, 1)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
m = bpy.data.materials.new("art")
m.use_nodes = True
nt = m.node_tree
nt.nodes.clear()
tex = nt.nodes.new("ShaderNodeTexImage")
tex.image = img
tex.interpolation = "Cubic"
em = nt.nodes.new("ShaderNodeEmission")
tr = nt.nodes.new("ShaderNodeBsdfTransparent")
mix = nt.nodes.new("ShaderNodeMixShader")
out = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(tex.outputs["Color"], em.inputs[0])
nt.links.new(tex.outputs["Alpha"], mix.inputs[0])
nt.links.new(tr.outputs[0], mix.inputs[1])
nt.links.new(em.outputs[0], mix.inputs[2])
nt.links.new(mix.outputs[0], out.inputs[0])
for attr, value in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND")):
    try:
        setattr(m, attr, value)
    except (AttributeError, TypeError):
        pass
art.data.materials.append(m)
ax, ay = P(160 + art_w * 50, -50 + art_h * 50, OX_B)
art.location = (ax, ay, 0.3)
key(art, 96, location=(ax + 12, ay, 0.3), rotation_euler=(0, 0, math.radians(8)))
key(art, 114, location=(ax, ay, 0.3), rotation_euler=(0, 0, 0))
ease(art)
visible_from(art, 96)
art.keyframe_insert(data_path="location", frame=FRAMES - 1)
art.location = (ax - 0.36, ay, 0.3)
art.keyframe_insert(data_path="location", frame=FRAMES - 1)

bx, by = P(540, 660 + 450, OX_B)
band = box("band", bx, by, 13.2, 9.0, "teal", z=0.0, rot=-3)
key(band, 100, location=(bx, by - 9.0, 0.0))
visible_from(band, 100)
key(band, 116, location=(bx, by, 0.0))
ease(band, "EXPO")


def line(name, body, top, start, color="ink", size=0.8):
    x, y = P(72, top + 36, OX_B)
    o = text(name, body, size, color, (x, y), align_y="CENTER", z=0.2)
    key(o, start, location=(x, y - 0.5, -0.3))  # pod povrchom pásu, potom sa vynorí
    key(o, start + 10, location=(x, y, 0.2))
    ease(o, "BACK")
    visible_from(o, start)
    return o


line("l1a", "FAME – komunita ľudí", 726, 114)
line("l1b", "z marketingu,", 810, 117)
line("l2a", "ktorí stavajú", 900, 126)
hx, hy = P(72 + 370, 990 + 48, OX_B)
hl = box("hl", hx, hy, 7.7, 1.0, "yellow", z=0.2, rot=-2, depth=0.03)
text("hl-text", "na vede a dátach,", 0.8, "ink", (-3.5, 0.02), parent=hl, z=0.03)
flip_in(hl, 133, dur=12, r0=-7, r=-2, z_end=0.2)
line("l3", "nie na trendoch a pocitoch.", 1094, 141)
px, py = P(72 + 200, 1196 + 50, OX_B)
plate = box("plate", px, py, 4.0, 1.0, "red", z=0.2, rot=0, depth=0.04)
text("plate-text", "fameworks.sk", 0.56, "black", (-1.6, 0.0), parent=plate, z=0.03)
flip_in(plate, 162, dur=12, r0=5, r=0, z_end=0.2)

# ---------- kamera: približovanie, švih na scénu B, približovanie ----------
cam_data = bpy.data.cameras.new("cam")
cam_data.type = "PERSP"
cam_data.lens = 35
cam_data.sensor_fit = "VERTICAL"
cam_data.sensor_height = 36
cam = bpy.data.objects.new("cam", cam_data)
bpy.context.collection.objects.link(cam)
scn.camera = cam
FIT = 13.5 * 35 / 36  # vzdialenosť, pri ktorej záber presne pokryje plátno
key(cam, 0, location=(0, 0, FIT + 0.8), rotation_euler=(0, 0, math.radians(-1.5)))
key(cam, 88, location=(0, 0, FIT - 0.15), rotation_euler=(0, 0, 0))
key(cam, 108, location=(OX_B, 0, FIT + 0.1), rotation_euler=(0, 0, math.radians(1.0)))
key(cam, FRAMES - 1, location=(OX_B, -0.2, FIT + 0.05), rotation_euler=(0, 0, 0))  # kamera mierne nižšie: URL kapsula ostane celá v zábere
ease(cam, "SINE", "EASE_IN_OUT")

# ---------- render ----------
os.makedirs(OUT, exist_ok=True)
scn.render.image_settings.file_format = "PNG"
if MODE == "render":
    os.makedirs(os.path.join(OUT, "frames"), exist_ok=True)
    scn.render.filepath = os.path.join(OUT, "frames", "f")
    bpy.ops.render.render(animation=True)
else:
    for f in (12, 45, 80, 98, 108, 125, 150, 200, 254):
        scn.frame_set(f)
        scn.render.filepath = os.path.join(OUT, f"still-{f:03d}.png")
        bpy.ops.render.render(write_still=True)
