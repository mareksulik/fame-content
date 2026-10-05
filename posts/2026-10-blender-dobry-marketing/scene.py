"""FAME video v Blenderi: Dobrý marketing si zaslúži FAME! (4:5, 1080 × 1350, 30 fps, 10 s).

Text (zadanie, doslovne): „Dobrý marketing si zaslúži FAME!“, „Sme otvorená komunita pre lepšie marketingové
rozhodnutia.“, „Staň sa členom“ + fameworks.sk/clenstvo.

3D kvádre na bielom stole, kamera pod uhlom prechádza tromi zhlukmi. Svetlo je ploché: horné steny majú presne hex
z palety (emisia, view transform Standard), bočné steny tmavší odtieň tej istej farby podľa normály, bez vrhaných tieňov.
Logo je originálny logo.png ako textúra na doske (nekreslí sa nanovo).

  blender -b -P posts/2026-10-blender-dobry-marketing/scene.py -- stills
  blender -b -P posts/2026-10-blender-dobry-marketing/scene.py -- render
"""
import math
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(HERE, "out")
FONT = os.path.join(ROOT, "system", "fonts", "BricolageGrotesque-ExtraBold.ttf")
LOGO = os.path.join(ROOT, "system", "brand", "logo.png")
MODE = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "stills"

FPS, FRAMES = 30, 300
HEX = {"red": "#EE3433", "teal": "#00A69C", "yellow": "#FAE27B", "ink": "#242021", "black": "#000000", "paper": "#FFFFFF"}
SIDE = 0.72  # jas bočných stien voči hornej
Y_B, Y_C = 17.0, 34.0  # zhluky na stole


def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgba(name, k=1.0):
    h = HEX[name].lstrip("#")
    return tuple([lin(int(h[i:i + 2], 16)) * k for i in (0, 2, 4)] + [1.0])


# ---------- scéna ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        scn.render.engine = engine
        break
    except TypeError:
        continue
scn.render.resolution_x, scn.render.resolution_y, scn.render.resolution_percentage = 1080, 1350, 100
scn.render.fps = FPS
scn.frame_start, scn.frame_end = 0, FRAMES - 1
scn.view_settings.view_transform = "Standard"
scn.view_settings.look = "None"
for attr, value in (("use_motion_blur", True),):
    try:
        setattr(scn.render, attr, value)
    except AttributeError:
        pass
try:
    scn.render.motion_blur_shutter = 0.4
except AttributeError:
    pass
try:
    scn.eevee.taa_render_samples = 32
except AttributeError:
    pass

world = bpy.data.worlds.new("paper")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
scn.world = world

font = bpy.data.fonts.load(FONT)
MATS = {}


def mat(name):
    """Emisná farba; bočné steny (normála mimo osi Z) tmavší odtieň tej istej farby."""
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["A"].default_value = rgba(name, SIDE)
    mix.inputs["B"].default_value = rgba(name)
    rng = nt.nodes.new("ShaderNodeMapRange")
    rng.inputs["From Min"].default_value = 0.6
    rng.inputs["From Max"].default_value = 0.95
    em = nt.nodes.new("ShaderNodeEmission")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(geo.outputs["Normal"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], rng.inputs["Value"])
    nt.links.new(rng.outputs["Result"], mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], em.inputs["Color"])
    nt.links.new(em.outputs[0], out.inputs[0])
    MATS[name] = m
    return m


def block(name, x, y, w, d, h, color, rot=0.0):
    """Kváder ležiaci na stole (spodok v z = 0), w × d pôdorys, h výška."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, h / 2))
    o = bpy.context.object
    o.name = name
    o.scale = (w, d, h)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.rotation_euler = (0, 0, math.radians(rot))
    o.data.materials.append(mat(color))
    return o


def label(name, body, size, color, parent, x, y=0.0, align_x="LEFT", align_y="CENTER"):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body, cu.font, cu.size = body, font, size
    cu.align_x, cu.align_y = align_x, align_y
    cu.extrude = 0.015
    cu.space_line = 1.0
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(mat(color))
    o.parent = parent
    top = parent.dimensions.z / 2 if parent else 0
    o.location = (x, y, top + 0.02)
    return o


def key(o, frame, **props):
    for attr, value in props.items():
        setattr(o, attr, value)
        o.keyframe_insert(data_path=attr, frame=frame)


def fcurves(o):
    ad = o.animation_data
    if not ad or not ad.action:
        return []
    curves = getattr(ad.action, "fcurves", None)
    if curves is None:
        curves = [fc for layer in ad.action.layers for strip in layer.strips for bag in strip.channelbags for fc in bag.fcurves]
    return curves


def ease(o, interp, easing="EASE_OUT", path=None):
    for fc in fcurves(o):
        if path and fc.data_path != path:
            continue
        for kp in fc.keyframe_points:
            kp.interpolation = interp
            kp.easing = easing


def visible_from(o, frame):
    for ob in [o, *o.children]:
        ob.hide_render = True
        ob.keyframe_insert(data_path="hide_render", frame=0)
        ob.hide_render = False
        ob.keyframe_insert(data_path="hide_render", frame=frame)


def drop(o, start, dur=18, height=9.0, spin=25):
    """Kváder spadne zhora, pri páde sa dotáča a dopadne s odrazom."""
    x, y, z = o.location
    r = o.rotation_euler.z
    key(o, start, location=(x, y, z + height), rotation_euler=(math.radians(spin * 0.4), math.radians(-spin * 0.3), r + math.radians(spin)))
    key(o, start + dur, location=(x, y, z), rotation_euler=(0, 0, r))
    ease(o, "BOUNCE", path="location")
    ease(o, "CUBIC", path="rotation_euler")
    visible_from(o, start)


def rise(o, start, dur=16):
    """Kváder vyrastie zo stola."""
    sx, sy, _ = o.scale
    key(o, start, scale=(sx, sy, 0.01))
    key(o, start + dur, scale=(sx, sy, 1))
    ease(o, "BACK", path="scale")
    visible_from(o, start)


# ---------- zhluk A: Dobrý marketing si zaslúži FAME! ----------
a1 = block("a1", 0.25, 2.35, 9.8, 2.3, 0.7, "yellow", rot=-4)
label("a1-t", "Dobrý marketing", 1.32, "ink", a1, -3.9)
a2 = block("a2", -0.15, -0.05, 10.4, 2.3, 0.7, "red", rot=3)
label("a2-t", "si zaslúži FAME!", 1.32, "black", a2, -4.1)
deco_a = [
    block("a3", 4.2, -3.1, 2.6, 1.3, 1.1, "teal", rot=14),
    block("a4", -3.9, -3.4, 3.4, 1.0, 0.5, "yellow", rot=-9),
    block("a5", -4.6, 5.0, 2.2, 2.2, 1.4, "teal", rot=22),
    block("a6", 3.6, 5.3, 3.0, 1.2, 0.6, "red", rot=-12),
    block("a7", 0.4, -5.6, 5.0, 1.4, 0.8, "teal", rot=4),
    block("a8", -5.6, -6.8, 6.0, 2.6, 0.9, "red", rot=-6),
    block("a9", 5.8, -6.2, 4.4, 2.4, 1.2, "yellow", rot=9),
    block("a10", -6.4, 1.2, 2.4, 4.2, 1.0, "teal", rot=-3),
    block("a11", 6.6, 1.0, 2.6, 3.6, 0.8, "yellow", rot=6),
    block("a12", 1.2, 7.6, 7.0, 2.2, 0.7, "teal", rot=-5),
]
drop(a1, 6, spin=30)
drop(a2, 16, spin=-26)
for i, b in enumerate(deco_a):
    drop(b, 2 + i * 5, dur=16, height=5.0, spin=40 if i % 2 else -40)  # ozdobné kvádre nízko, aby neprelietali cez kameru

# ---------- zhluk B: Sme otvorená komunita pre lepšie marketingové rozhodnutia. ----------
b1 = block("b1", 0.0, Y_B + 0.2, 10.6, 5.6, 0.6, "teal", rot=-2)
label("b1-t", "Sme otvorená komunita\npre lepšie marketingové\nrozhodnutia.", 0.9, "ink", b1, -4.45, 0.0)
deco_b = [
    block("b2", -3.8, Y_B + 4.4, 3.6, 1.2, 1.0, "yellow", rot=8),
    block("b3", 3.9, Y_B - 3.7, 3.2, 1.3, 1.2, "red", rot=-10),
    block("b4", 4.4, Y_B + 4.0, 1.6, 1.6, 1.6, "red", rot=30),
    block("b5", -2.0, Y_B - 5.2, 8.6, 2.2, 0.8, "yellow", rot=3),
    block("b6", 6.4, Y_B + 0.6, 2.2, 4.0, 1.1, "yellow", rot=-7),
    block("b7", -6.3, Y_B - 0.4, 2.0, 3.6, 0.9, "red", rot=5),
    block("b8", 0.5, Y_B + 6.6, 6.4, 1.8, 0.7, "red", rot=-4),
]
rise(b1, 122)
for i, b in enumerate(deco_b):
    rise(b, 128 + i * 5)  # vyrastú zo stola: pri páde by prekryli text o komunite

# ---------- zhluk C: logo, Staň sa členom ----------
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, Y_C + 2.6, 0.1))
logo = bpy.context.object
logo.name = "logo"
img = bpy.data.images.load(LOGO)
lw = 8.6
logo.scale = (lw, lw * img.size[1] / img.size[0], 0.2)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.uv.cube_project(cube_size=1.0, scale_to_bounds=True)
bpy.ops.object.mode_set(mode="OBJECT")
# UV hornej steny: obrázok presne na celú dosku
for poly in logo.data.polygons:
    if poly.normal.z > 0.9:
        uv = logo.data.uv_layers.active.data
        for li in poly.loop_indices:
            co = logo.data.vertices[logo.data.loops[li].vertex_index].co
            uv[li].uv = (co.x / lw + 0.5, co.y / (lw * img.size[1] / img.size[0]) + 0.5)
m = bpy.data.materials.new("logo")
m.use_nodes = True
nt = m.node_tree
nt.nodes.clear()
tex = nt.nodes.new("ShaderNodeTexImage")
tex.image = img
tex.interpolation = "Cubic"
em = nt.nodes.new("ShaderNodeEmission")
out = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(tex.outputs["Color"], em.inputs[0])
nt.links.new(em.outputs[0], out.inputs[0])
logo.data.materials.append(m)
logo.data.materials.append(mat("paper"))  # bočné steny dosky biele, textúra iba hore
for poly in logo.data.polygons:
    poly.material_index = 0 if poly.normal.z > 0.9 else 1
key(logo, 212, rotation_euler=(math.radians(-100), 0, math.radians(-6)), location=(0, Y_C + 2.6, 3.0))
key(logo, 230, rotation_euler=(0, 0, 0), location=(0, Y_C + 2.6, 0.1))
ease(logo, "BACK")
visible_from(logo, 212)

c1 = block("c1", 0.0, Y_C - 1.6, 8.4, 2.0, 0.8, "red", rot=-2)
label("c1-t", "Staň sa členom", 1.05, "black", c1, 0.0, align_x="CENTER")
drop(c1, 232, height=4.5, spin=-20)  # nízko, aby nepreletel cez logo
c2 = block("c2", 0.0, Y_C - 3.6, 6.6, 1.0, 0.25, "yellow", rot=1.5)
label("c2-t", "fameworks.sk/clenstvo", 0.5, "ink", c2, 0.0, align_x="CENTER")
rise(c2, 248, dur=12)
for i, (x, y, w, d, h, col, rot) in enumerate([(-4.4, Y_C + 5.8, 2.4, 1.2, 0.9, "teal", 18), (4.5, Y_C - 3.3, 1.6, 1.6, 1.5, "teal", -25), (-4.6, Y_C - 4.4, 2.6, 1.0, 0.6, "red", 10),
                                                    (-1.0, Y_C - 6.4, 9.0, 2.2, 0.8, "teal", -3), (5.6, Y_C + 5.4, 3.4, 2.0, 1.0, "yellow", 12), (-6.6, Y_C + 0.8, 2.0, 4.0, 0.9, "yellow", -6), (6.6, Y_C + 0.2, 1.8, 3.4, 1.2, "red", 4)]):
    drop(block(f"c-deco{i}", x, y, w, d, h, col, rot), 222 + i * 7, dur=16, height=4.0, spin=30)

# ---------- kamera: pohľad pod uhlom, prejazdy medzi zhlukmi ----------
cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 35
cam_data.sensor_fit = "VERTICAL"
cam_data.sensor_height = 36
cam = bpy.data.objects.new("cam", cam_data)
bpy.context.collection.objects.link(cam)
scn.camera = cam
TILT = math.radians(32)


def cam_at(frame, ty, dist, yaw=0.0, tilt=TILT):
    loc = (math.sin(math.radians(yaw)) * dist * math.sin(tilt), ty - dist * math.sin(tilt) * math.cos(math.radians(yaw)), dist * math.cos(tilt))
    key(cam, frame, location=loc, rotation_euler=(tilt, 0, math.radians(-yaw)))


cam_at(0, 0.0, 16.5, yaw=-8)
cam_at(105, 0.0, 15.6, yaw=0)  # text na kvádroch celý v zábere
cam_at(135, Y_B, 14.8, yaw=-4)
cam_at(200, Y_B, 15.2, yaw=0)
cam_at(228, Y_C, 15.0, yaw=-3)
cam_at(FRAMES - 1, Y_C, 14.2, yaw=2)
ease(cam, "SINE", "EASE_IN_OUT")

# ---------- render ----------
os.makedirs(OUT, exist_ok=True)
scn.render.image_settings.file_format = "PNG"
if MODE == "render":
    os.makedirs(os.path.join(OUT, "frames"), exist_ok=True)
    scn.render.filepath = os.path.join(OUT, "frames", "f")
    bpy.ops.render.render(animation=True)
else:
    for f in (12, 40, 100, 128, 175, 215, 240, 299):
        scn.frame_set(f)
        scn.render.filepath = os.path.join(OUT, f"still-{f:03d}.png")
        bpy.ops.render.render(write_still=True)
