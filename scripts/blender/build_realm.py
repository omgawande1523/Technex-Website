"""
Builds the 3D assets for the TECHNEX "Realm" home page.

Run with Blender 5.x (GUI not needed):
    blender -b -P scripts/blender/build_realm.py
or with the bpy module:
    python scripts/blender/build_realm.py

Inputs : assets-src/polyhaven/**   (CC0, fetched by scripts/realm/fetch-polyhaven.mjs)
         scripts/blender/fonts/Barge-Black.ttf
Outputs: public/realm/raw/*.glb      (then optimised by scripts/realm/optimize.mjs)
         public/realm/blend/realm.blend (the full scene, open it in Blender to tweak)

Objects keep stable names; the web code looks them up by name.
"""
import math
import os
import random
import sys

import bpy
import bmesh
from mathutils import Vector, Matrix

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PH = os.path.join(ROOT, "assets-src", "polyhaven")
FONT = os.path.join(ROOT, "scripts", "blender", "fonts", "Barge-Black.ttf")
OUT = os.path.join(ROOT, "assets-src", "blender", "raw")
BLEND_OUT = os.path.join(ROOT, "assets-src", "blender")
os.makedirs(OUT, exist_ok=True)
os.makedirs(BLEND_OUT, exist_ok=True)

random.seed(26)
GOLD = (1.0, 0.72, 0.32, 1.0)


# --------------------------------------------------------------------------- utils
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)


def collection(name):
    col = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if col.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(col)
    return col


def link(obj, col):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col.objects.link(obj)
    return obj


def mat_principled(name, color=(0.8, 0.8, 0.8, 1), metallic=0.0, roughness=0.5,
                   coat=0.0, emission=None, emission_strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Roughness"].default_value = roughness
    if "Coat Weight" in b.inputs:
        b.inputs["Coat Weight"].default_value = coat
    if emission:
        b.inputs["Emission Color"].default_value = emission
        b.inputs["Emission Strength"].default_value = emission_strength
    return m


def mat_textured(name, folder, prefix, uv_scale=1.0, tint=None, roughness_mult=1.0):
    """PBR material from Poly Haven 1k jpgs (diff / nor_gl / rough)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (uv_scale, uv_scale, uv_scale)
    nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])

    def tex(kind, non_color=False):
        p = os.path.join(PH, folder, f"{prefix}_{kind}_1k.jpg")
        if not os.path.exists(p):
            return None
        n = nt.nodes.new("ShaderNodeTexImage")
        n.image = bpy.data.images.load(p, check_existing=True)
        if non_color:
            n.image.colorspace_settings.name = "Non-Color"
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
        return n

    d = tex("diff")
    if d:
        if tint:
            mix = nt.nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MULTIPLY"
            mix.inputs["Factor"].default_value = 1.0
            nt.links.new(d.outputs["Color"], mix.inputs[6])
            mix.inputs[7].default_value = tint
            nt.links.new(mix.outputs[2], b.inputs["Base Color"])
        else:
            nt.links.new(d.outputs["Color"], b.inputs["Base Color"])
    r = tex("rough", True)
    if r:
        nt.links.new(r.outputs["Color"], b.inputs["Roughness"])
    n = tex("nor_gl", True)
    if n:
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nt.links.new(n.outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    return m


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def apply_modifiers(obj):
    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def shade_smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def smart_uv(obj, angle=66.0, margin=0.02):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(angle), island_margin=margin)
    bpy.ops.object.mode_set(mode="OBJECT")


def new_mesh_obj(name, bm, col):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    col.objects.link(obj)
    return obj


def uv_sphere(name, col, radius=1.0, seg=64, rings=32):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=radius, calc_uvs=True)
    return new_mesh_obj(name, bm, col)


def export(col, filename):
    bpy.ops.object.select_all(action="DESELECT")
    for o in col.all_objects:
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(OUT, filename),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_extras=True,
        export_image_format="AUTO",
    )
    print("exported", filename)


def smoothstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


# --------------------------------------------------------------------------- Inky
def build_inky():
    """A living ink drop: glossy body with a curled droplet tip, eyes, little feet."""
    col = collection("Inky")
    root = bpy.data.objects.new("Inky", None)
    col.objects.link(root)

    body = uv_sphere("Inky_Body", col, 1.0, 96, 64)
    for v in body.data.vertices:
        x, y, z = v.co
        # pear shape: fuller below the equator
        widen = 1.0 + 0.12 * smoothstep(0.4, -0.7, z)
        x *= widen
        y *= widen * 0.92
        # flatten the base where it sits
        if z < -0.62:
            z = -0.62 + (z + 0.62) * 0.3
        # droplet tip that curls back
        t = smoothstep(0.55, 1.0, z)
        z += 0.62 * t * t
        x *= 1.0 - 0.55 * t
        y *= 1.0 - 0.55 * t
        y += 0.22 * t * t * t  # lean the tip backwards (+Y is the back)
        v.co = (x, y, z)
    sub = body.modifiers.new("sub", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 1
    apply_modifiers(body)
    shade_smooth(body)
    body.parent = root

    m_body = mat_principled("InkBody", (0.012, 0.012, 0.016, 1), 0.0, 0.18, coat=1.0)
    m_eye = mat_principled("InkEye", (0.0, 0.0, 0.0, 1), 0.0, 0.05, coat=1.0)
    m_shine = mat_principled("InkShine", (1, 1, 1, 1), 0, 0.3, emission=(1, 0.96, 0.85, 1), emission_strength=4.0)
    m_gold = mat_principled("InkGold", GOLD, 1.0, 0.22)
    assign(body, m_body)

    for side, sx in (("L", -1), ("R", 1)):
        eye = uv_sphere(f"Inky_Eye{side}", col, 1.0, 48, 24)
        eye.scale = (0.13, 0.07, 0.19)
        eye.location = (0.3 * sx, -0.86, 0.18)
        eye.rotation_euler = (0, 0, math.radians(-12 * sx))
        bpy.context.view_layer.update()
        assign(eye, m_eye)
        shade_smooth(eye)
        eye.parent = root

        shine = uv_sphere(f"Inky_Shine{side}", col, 1.0, 24, 12)
        shine.scale = (0.035, 0.02, 0.045)
        shine.location = (0.3 * sx + 0.04, -0.93, 0.27)
        assign(shine, m_shine)
        shade_smooth(shine)
        shine.parent = root

        foot = uv_sphere(f"Inky_Foot{side}", col, 1.0, 48, 24)
        foot.scale = (0.26, 0.34, 0.16)
        foot.location = (0.4 * sx, -0.12, -0.74)
        assign(foot, m_body)
        shade_smooth(foot)
        foot.parent = root

        # small gold ring "anklet" — a nod to the gold ink
        ring = bpy.data.objects.new(f"Inky_Anklet{side}", bpy.data.meshes.new(f"Inky_Anklet{side}"))
        col.objects.link(ring)
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, cap_ends=False, radius=1.0, segments=48)
        bm.to_mesh(ring.data)
        bm.free()
        ring.location = (0.4 * sx, -0.12, -0.62)
        ring.scale = (0.22, 0.28, 1)
        sk = ring.modifiers.new("skin", "SKIN")
        for sv in ring.data.skin_vertices[0].data:
            sv.radius = (0.035, 0.035)
        s2 = ring.modifiers.new("sub", "SUBSURF")
        s2.levels = 2
        apply_modifiers(ring)
        shade_smooth(ring)
        assign(ring, m_gold)
        ring.parent = root

    smart_uv(body)
    export(col, "inky.glb")
    return col


# --------------------------------------------------------------------------- Portal
def build_portal():
    col = collection("Portal")
    root = bpy.data.objects.new("Portal", None)
    col.objects.link(root)

    stone = mat_textured("PortalStone", "rock_face_03", "rock_face_03", uv_scale=1.4, tint=(0.16, 0.15, 0.16, 1))
    marble = mat_textured("PortalMarble", "marble_01", "marble_01", uv_scale=1.0, tint=(0.07, 0.065, 0.07, 1))
    gold = mat_principled("PortalGold", GOLD, 1.0, 0.2)

    R = 3.2       # mid radius of the ring
    T = 0.62      # radial thickness
    D = 0.7       # depth
    N = 22
    base_h = 0.0
    steps = [(5.2, 0.28), (4.5, 0.28), (3.8, 0.28)]
    for i, (rad, h) in enumerate(steps):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=96, radius1=rad, radius2=rad, depth=h)
        st = new_mesh_obj(f"Portal_Step{i}", bm, col)
        st.location = (0, 0, base_h + h / 2)
        bev = st.modifiers.new("bev", "BEVEL")
        bev.width = 0.03
        bev.segments = 3
        bev.limit_method = "ANGLE"
        apply_modifiers(st)
        shade_smooth(st)
        smart_uv(st)
        assign(st, marble)
        st.parent = root
        base_h += h
    # gold trim along the top step edge
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=False, radius=3.8, segments=128)
    trim = new_mesh_obj("Portal_StepTrim", bm, col)
    trim.location = (0, 0, base_h + 0.005)
    sk = trim.modifiers.new("skin", "SKIN")
    for sv in trim.data.skin_vertices[0].data:
        sv.radius = (0.03, 0.03)
    apply_modifiers(trim)
    shade_smooth(trim)
    assign(trim, gold)
    trim.parent = root

    cz = base_h + R + T / 2 - 0.25  # ring centre height; the lowest blocks sink into the top step
    centre = bpy.data.objects.new("Portal_Center", None)
    centre.location = (0, 0, cz)
    col.objects.link(centre)
    centre.parent = root

    gap = math.radians(1.1)
    seg = 2 * math.pi / N
    for i in range(N):
        a0 = i * seg + gap / 2
        a1 = (i + 1) * seg - gap / 2
        jitter = random.uniform(-0.04, 0.06)
        r_in, r_out = R - T / 2, R + T / 2 + jitter
        if i == N // 4:  # keystone at the top
            r_out += 0.32
        bm = bmesh.new()
        steps_a = 6
        verts_f, verts_b = [], []
        ring = []
        for k in range(steps_a + 1):
            a = a0 + (a1 - a0) * k / steps_a
            ring.append((math.cos(a), math.sin(a)))
        outline = [(c * r_out, s * r_out) for c, s in ring] + [(c * r_in, s * r_in) for c, s in reversed(ring)]
        for (x, y) in outline:
            verts_f.append(bm.verts.new((x, -D / 2, y)))
            verts_b.append(bm.verts.new((x, D / 2, y)))
        bm.faces.new(verts_f)
        bm.faces.new(list(reversed(verts_b)))
        n = len(outline)
        for k in range(n):
            bm.faces.new((verts_f[k], verts_f[(k + 1) % n], verts_b[(k + 1) % n], verts_b[k]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        blk = new_mesh_obj(f"Portal_Block{i:02d}", bm, col)
        blk.location = (0, random.uniform(-0.03, 0.03), cz)
        blk.rotation_euler = (0, random.uniform(-0.012, 0.012), 0)
        bev = blk.modifiers.new("bev", "BEVEL")
        bev.width = 0.045
        bev.segments = 3
        bev.limit_method = "ANGLE"
        apply_modifiers(blk)
        smart_uv(blk)
        assign(blk, stone)
        blk.parent = root

        # gold stud on the joint, front face
        a = (i + 1) * seg
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=0.07, radius2=0.07, depth=0.06)
        stud = new_mesh_obj(f"Portal_Stud{i:02d}", bm, col)
        rr = R + 0.12
        stud.location = (math.cos(a) * rr, -D / 2 - 0.02, cz + math.sin(a) * rr)
        stud.rotation_euler = (math.radians(90), 0, 0)
        bev = stud.modifiers.new("bev", "BEVEL")
        bev.width = 0.015
        bev.segments = 2
        apply_modifiers(stud)
        shade_smooth(stud)
        assign(stud, gold)
        stud.parent = root

    # inner and outer gold rings on the front face
    for name, rad, thick in (("Portal_GoldInner", R - T / 2 - 0.02, 0.045), ("Portal_GoldOuter", R + T / 2 + 0.12, 0.03)):
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, cap_ends=False, radius=rad, segments=160)
        ring = new_mesh_obj(name, bm, col)
        ring.rotation_euler = (math.radians(90), 0, 0)
        ring.location = (0, -D / 2 - 0.01, cz)
        sk = ring.modifiers.new("skin", "SKIN")
        for sv in ring.data.skin_vertices[0].data:
            sv.radius = (thick, thick)
        s2 = ring.modifiers.new("sub", "SUBSURF")
        s2.levels = 1
        apply_modifiers(ring)
        shade_smooth(ring)
        assign(ring, gold)
        ring.parent = root

    # two obelisks flanking the gate
    for side, sx in (("L", -1), ("R", 1)):
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts:
            if v.co.z > 0:
                v.co.x *= 0.55
                v.co.y *= 0.55
        ob = new_mesh_obj(f"Portal_Obelisk{side}", bm, col)
        ob.scale = (0.55, 0.55, 3.4)
        ob.location = (4.6 * sx, 0.6, base_h + 1.7)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.select_all(action="DESELECT")
        ob.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bev = ob.modifiers.new("bev", "BEVEL")
        bev.width = 0.04
        bev.segments = 3
        apply_modifiers(ob)
        smart_uv(ob)
        assign(ob, stone)
        ob.parent = root
        # gold cap
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=0.24, radius2=0.0, depth=0.4)
        cap = new_mesh_obj(f"Portal_ObeliskCap{side}", bm, col)
        cap.location = (4.6 * sx, 0.6, base_h + 3.4 + 0.2)
        cap.rotation_euler = (0, 0, math.radians(45))
        assign(cap, gold)
        cap.parent = root

    export(col, "portal.glb")
    return col


# --------------------------------------------------------------------------- Letters
def build_letters():
    col = collection("Letters")
    gold = mat_principled("LetterGold", GOLD, 1.0, 0.18)
    font = bpy.data.fonts.load(FONT)

    def text_obj(name, body, size=1.0, extrude=0.14):
        cu = bpy.data.curves.new(name, "FONT")
        cu.body = body
        cu.font = font
        cu.size = size
        cu.extrude = extrude
        cu.bevel_depth = 0.022
        cu.bevel_resolution = 3
        cu.align_x = "CENTER"
        cu.align_y = "CENTER"
        ob = bpy.data.objects.new(name, cu)
        col.objects.link(ob)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.select_all(action="DESELECT")
        ob.select_set(True)
        bpy.ops.object.convert(target="MESH")
        ob = bpy.context.view_layer.objects.active
        ob.rotation_euler = (math.radians(90), 0, 0)  # stand up, face -Y
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        return ob

    letters = []
    for i, ch in enumerate("TECHNEX"):
        ob = text_obj(f"Letter_{i}_{ch}", ch, 1.0)
        bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
        letters.append(ob)
    # lay out with Barge spacing
    widths = [o.dimensions.x for o in letters]
    gap = 0.08
    total = sum(widths) + gap * (len(widths) - 1)
    x = -total / 2
    for o, w in zip(letters, widths):
        o.location = (x + w / 2, 0, 0)
        x += w + gap
    for o in letters:
        smart_uv(o)
        assign(o, gold)
        shade_smooth(o)
        # keep hard edges crisp on the caps
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        try:
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
        except Exception:
            pass

    for name, body, size in (("Edition_26", "26", 0.55),):
        o = text_obj(name, body, size, 0.1)
        bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
        o.location = (0, 0, -0.95)
        assign(o, gold)
        try:
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
        except Exception:
            pass

    export(col, "letters.glb")
    return col


# --------------------------------------------------------------------------- Screen
def build_screen():
    """Event billboard: lacquered frame, gold trim and a 3:2 'Screen' plane (UV 0..1)."""
    col = collection("Screen")
    lacquer = mat_principled("ScreenFrame", (0.015, 0.015, 0.018, 1), 0.2, 0.22, coat=1.0)
    gold = mat_principled("ScreenGold", GOLD, 1.0, 0.25)
    screen_mat = mat_principled("ScreenSurface", (0.1, 0.1, 0.1, 1), 0, 0.4)
    W, H = 3.0, 2.0

    def box(name, sx, sy, sz, loc, mat, bevel=0.03):
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        ob = new_mesh_obj(name, bm, col)
        ob.scale = (sx, sy, sz)
        ob.location = loc
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.select_all(action="DESELECT")
        ob.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        b = ob.modifiers.new("bev", "BEVEL")
        b.width = bevel
        b.segments = 4
        apply_modifiers(ob)
        shade_smooth(ob)
        try:
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
        except Exception:
            pass
        assign(ob, mat)
        return ob

    box("Screen_Frame", W + 0.24, 0.16, H + 0.24, (0, 0.04, 0), lacquer, 0.05)
    box("Screen_Trim", W + 0.3, 0.05, H + 0.3, (0, 0.11, 0), gold, 0.02)
    # screen plane, facing -Y, UV covering 0..1
    me = bpy.data.meshes.new("Screen_Surface")
    bm = bmesh.new()
    v = [bm.verts.new(p) for p in ((-W / 2, -0.085, -H / 2), (W / 2, -0.085, -H / 2), (W / 2, -0.085, H / 2), (-W / 2, -0.085, H / 2))]
    f = bm.faces.new(v)
    uv = bm.loops.layers.uv.new("UVMap")
    for loop, (u, w) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop[uv].uv = (u, w)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    if me.polygons[0].normal.y > 0:
        me.flip_normals()
    ob = bpy.data.objects.new("Screen_Surface", me)
    col.objects.link(ob)
    assign(ob, screen_mat)
    # hanging cables
    for sx in (-1, 1):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.012, radius2=0.012, depth=4.0)
        c = new_mesh_obj(f"Screen_Cable{'L' if sx < 0 else 'R'}", bm, col)
        c.location = (sx * (W / 2 - 0.2), 0.04, H / 2 + 2.1)
        assign(c, gold)
    export(col, "screen.glb")
    return col


# --------------------------------------------------------------------------- Rocks
def build_rocks():
    col = collection("Rocks")
    ids = [d for d in ("moon_rock_01", "moon_rock_03", "moon_rock_05", "rock_07", "namaqualand_boulder_02")
           if os.path.exists(os.path.join(PH, d, f"{d}.gltf"))]
    for i, rid in enumerate(ids):
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=os.path.join(PH, rid, f"{rid}.gltf"))
        new = [o for o in bpy.data.objects if o not in before and o.type == "MESH"]
        new.sort(key=lambda o: len(o.data.vertices), reverse=True)
        for extra in new[1:]:
            bpy.data.objects.remove(extra)
        for o in new[:1]:
            link(o, col)
            o.name = f"Rock_{i}"
            o.parent = None
            o.location = (0, 0, 0)
            o.rotation_euler = (0, 0, 0)
            # normalise size to ~1 unit radius
            bpy.context.view_layer.update()
            dim = max(o.dimensions)
            s = 2.0 / dim if dim else 1.0
            o.scale = (s, s, s)
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.select_all(action="DESELECT")
            o.select_set(True)
            bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
            bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
            o.location = (0, 0, 0)
            tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
            target = 6000
            if tris > target:
                dec = o.modifiers.new("dec", "DECIMATE")
                dec.ratio = target / tris
                apply_modifiers(o)
            shade_smooth(o)
    # remove import leftovers (empties)
    for o in list(bpy.data.objects):
        if o.type == "EMPTY" and not o.users_collection:
            bpy.data.objects.remove(o)
    export(col, "rocks.glb")
    return col


# --------------------------------------------------------------------------- Bust (hero)
def import_normalised(rid, col, name, height):
    path = os.path.join(PH, rid, f"{rid}.gltf")
    if not os.path.exists(path):
        print("missing", rid)
        return None
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == "MESH"]
    meshes.sort(key=lambda o: len(o.data.vertices), reverse=True)
    o = meshes[0]
    for extra in new:
        if extra is not o:
            bpy.data.objects.remove(extra)
    link(o, col)
    o.parent = None
    o.name = name
    bpy.context.view_layer.update()
    s = height / o.dimensions.z if o.dimensions.z else 1.0
    o.scale = (o.scale[0] * s, o.scale[1] * s, o.scale[2] * s)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    o.location = (0, 0, 0)
    shade_smooth(o)
    return o


def build_bust():
    """The hero: Poly Haven's CC0 Marble Bust 01, 3 m tall, centred, facing -Y (web +Z)."""
    col = collection("Bust")
    import_normalised("marble_bust_01", col, "Hero_Bust", 3.0)
    export(col, "bust.glb")
    return col


def build_heads():
    """Gilded sculpture heads that crown the gate obelisks."""
    col = collection("Heads")
    for rid, name in (("lion_head", "Head_Lion"), ("horse_head", "Head_Horse")):
        import_normalised(rid, col, name, 0.9)
    export(col, "heads.glb")
    return col


# --------------------------------------------------------------------------- preview
def preview_scene():
    """Arrange everything in one scene for a quick render (docs/realm-preview.png)."""
    scene = bpy.context.scene
    bust = bpy.data.objects.get("Hero_Bust")
    if bust:
        bust.location = (0, -1.2, 4.0)
    letters = [o for o in bpy.data.objects if o.name.startswith("Letter_") or o.name == "Edition_26"]
    for o in letters:
        o.location.y += 1.5
        o.location.z += 8.6
    for o in bpy.data.objects:
        if o.name.startswith("Screen_"):
            o.location.x += 9
            o.location.z += 3
        if o.name.startswith("Rock_"):
            i = int(o.name.split("_")[1])
            o.location = (-8 + i * 0.6, 3 + i, 1 + i * 1.3)
    world = bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    hdr = os.path.join(ROOT, "public", "realm", "hdr", "studio_small_09_1k.hdr")
    if os.path.exists(hdr):
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(hdr)
        nt.links.new(env.outputs["Color"], nt.nodes["Background"].inputs["Color"])
        nt.nodes["Background"].inputs["Strength"].default_value = 0.6
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 32
    cam = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam)
    cam.location = (0, -17, 5.2)
    cam.rotation_euler = (math.radians(83), 0, 0)
    scene.camera = cam
    sun = bpy.data.objects.new("Key", bpy.data.lights.new("Key", "AREA"))
    sun.data.energy = 2500
    sun.data.size = 6
    sun.data.color = (1.0, 0.85, 0.6)
    sun.location = (6, -8, 10)
    sun.rotation_euler = (math.radians(50), 0, math.radians(35))
    scene.collection.objects.link(sun)
    scene.render.engine = "BLENDER_EEVEE" if "BLENDER_EEVEE" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "CYCLES"
    if scene.render.engine == "CYCLES":
        scene.cycles.samples = 24
        scene.cycles.device = "CPU"
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.filepath = os.path.join(ROOT, "docs", "realm-preview.png")
    os.makedirs(os.path.join(ROOT, "docs"), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BLEND_OUT, "realm.blend"))
    if "--render" in sys.argv:
        bpy.ops.render.render(write_still=True)
        print("rendered preview")


if __name__ == "__main__":
    reset()
    build_portal()
    build_letters()
    build_screen()
    build_rocks()
    build_bust()
    preview_scene()
    print("REALM BUILD OK")
