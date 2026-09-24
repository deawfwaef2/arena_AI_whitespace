# R13 trailer: REAL captured gameplay (qa/capture-r13.mjs → /tmp/frames/<seg>) → 1920x1080 + 1080x1920.
# Virtual camera follows the action (tap button → money flying to the top-left counter → slider → result),
# kinetic captions, soft zoom-crossfades between scenes (no hard cuts), end card with call to action.
# python3 tools/trailer-r13.py  → promo-1920x1080.mp4, promo-1080x1920.mp4
import os, glob, json, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); FPS = 30; XF = 10
FONT = 'assets/space-grotesk.woff2' if False else '/tmp/sg.ttf'
FR = os.environ.get('FRAMES', '/home/user/frames')
SRC_W, SRC_H = 1280, 720
MONEY = (170, 52)   # top-left money counter in the 1280x720 game view

def font(sz, w='Bold'):
    f = ImageFont.truetype(FONT, sz)
    try: f.set_variation_by_name(w)
    except Exception: pass
    return f

def ease(k): return k*k*(3-2*k)

def load(seg):
    fs = sorted(glob.glob(f'{FR}/{seg}/*.jpg'))
    try: hints = json.load(open(f'{FR}/{seg}.json'))
    except Exception: hints = [{}]*len(fs)
    return fs, hints

# ---- per-scene camera targets: (cx, cy, zoom) for each source frame ----
def cam_tap(h):
    out = []; last_tap = -99; tx, ty = 900, 480
    for i, x in enumerate(h):
        if x.get('tap') and x['tap'][0] > 500: last_tap = i; tx, ty = x['tap']
        since = i - last_tap
        if i < 6: out.append((640, 360, 1.0))
        elif since <= 3: out.append((tx - 60, ty - 40, 1.75))
        elif since <= 26: out.append((MONEY[0] + 120, MONEY[1] + 70, 2.1))   # follow the cash to the counter
        else: out.append((640, 360, 1.15))
    return out

def cam_level(h):
    return [(640, 360, 1.0 + 0.25 * ease(min(1, i / len(h) * 1.6))) for i in range(len(h))]

def cam_invest(h):
    out = []; inv = next((i for i, x in enumerate(h) if x.get('invest')), 28)
    for i, x in enumerate(h):
        if i < 4: out.append((640, 360, 1.0))
        elif x.get('drag') or (x.get('tap') and i < inv): px, py = (x.get('drag') or x['tap']); out.append((px, py - 60, 1.8))
        elif i < inv + 2: out.append((1000, 520, 1.7))
        elif i < inv + 14: out.append((820, 380, 1.3))
        elif i < inv + 40: out.append((MONEY[0] + 120, MONEY[1] + 70, 2.0))
        else: out.append((640, 360, 1.1))
    return out

def cam_allin(h):
    out = []; inv = next((i for i, x in enumerate(h) if x.get('invest')), 28)
    for i, x in enumerate(h):
        if i < 4: out.append((640, 360, 1.0))
        elif x.get('drag'): px, py = x['drag']; out.append((px, py - 60, 1.9))
        elif i < inv + 2: out.append((1000, 520, 2.0))
        elif i < inv + 16: out.append((MONEY[0] + 140, MONEY[1] + 80, 2.2))
        else: out.append((640, 360, 1.0))
    return out

def money_events(fs):
    import numpy as np
    prev = None; ev = []
    for i, f in enumerate(fs):
        a = np.asarray(Image.open(f).convert('L').crop((10, 8, 340, 80)), dtype=np.int16)
        if prev is not None and np.abs(a - prev).mean() * 10 > 120 and (not ev or i - ev[-1] > 4): ev.append(i)
        prev = a
    return ev

def follow_money(cams, ev, before=9, after=9, z=2.1):
    cams = list(cams)
    for m in ev:
        for i in range(max(0, m - before), min(len(cams), m + after)):
            cams[i] = (MONEY[0] + 130, MONEY[1] + 75, z)
    return cams

def smooth(tr, a=0.18):
    out = []; c = list(tr[0])
    for t in tr:
        c = [c[k] + (t[k] - c[k]) * a for k in range(3)]; out.append(tuple(c))
    return out

# caption schedule per scene: list of (start_frac, end_frac, text, sub, colour)
TRIM = {'tap': 80, 'bigwin': 46}
SCENES = [
    ('tap',    cam_tap,    1, [(0.02, .45, 'TAP TAP TAP!', 'work the street for your first dollars', '#ffd54a'), (.45, .98, 'CASH IN!', 'every coin flies into your pocket', '#7dffa0')]),
    ('level',  cam_level,  1, [(0.05, .95, 'LEVEL UP!', 'new classes · new cities · new toys', '#ffd54a')]),
    ('invest', cam_invest, 1, [(0.02, .45, 'RISK IT…', 'slide your stake', '#ffffff'), (.47, .98, 'BIG PROFIT!', 'the right bet changes everything', '#7dffa0')]),
    ('bigwin', cam_invest, 1, [(0.02, .98, 'BIGGER BETS. BIGGER WINS.', 'from street deals to Vegas', '#ffd54a')]),
    ('allin',  cam_allin,  1, [(0.02, .42, 'ALL IN?', 'one slide… 100%', '#ffffff'), (.42, .98, '…GONE.', 'the city takes it all back', '#ff5a4a')]),
]

def crop(img, cx, cy, z, aspect):
    h = SRC_H / z; w = h * aspect
    if w > SRC_W: w = SRC_W; h = w / aspect
    x0 = min(max(cx - w / 2, 0), SRC_W - w); y0 = min(max(cy - h / 2, 0), SRC_H - h)
    return img.crop((int(x0), int(y0), int(x0 + w), int(y0 + h)))

def caption(draw, W, y, text, sub, col, k, big):
    # k: 0..1 life of caption → pop in / fade out
    a = min(1, k * 8, (1 - k) * 8)
    if a <= 0: return
    s = 1 + 0.25 * max(0, 1 - k * 10)
    f = font(int(big * s)); fs_ = font(int(big * 0.36), 'Medium')
    tw = draw.textlength(text, font=f)
    x = (W - tw) / 2
    al = int(255 * a)
    for dx, dy in ((0, 7), (0, 5)):
        draw.text((x + dx, y + dy), text, font=f, fill=(0, 0, 0, int(al * .75)))
    draw.text((x, y), text, font=f, fill=col + ('%02x' % al), stroke_width=int(big * .05), stroke_fill=(20, 12, 0, al))
    if sub:
        sw = draw.textlength(sub, font=fs_)
        draw.text(((W - sw) / 2, y + big * 1.12), sub, font=fs_, fill=(255, 255, 255, al), stroke_width=3, stroke_fill=(0, 0, 0, int(al * .8)))

def compose_scene_frames():
    """returns list of scenes, each a list of (PIL src frame, cam(cx,cy,z), captions-at-frame)"""
    scenes = []
    for name, camf, rep, caps in SCENES:
        if os.environ.get('ONLY') and name not in os.environ['ONLY'].split(','): continue
        fs, h = load(name)
        if not fs: continue
        if len(h) < len(fs): h = h + [{}] * (len(fs) - len(h))
        fs = fs[:TRIM.get(name, len(fs))]; h = h[:len(fs)]
        ev = money_events(fs)
        cams = camf(h)
        cams = follow_money(cams, ev, 9, 12 if name != 'tap' else 9)
        cams = smooth(cams)
        items = []
        n = len(fs)
        for i, f in enumerate(fs):
            r = rep
            if name == 'allin':   # slow motion around the crash
                inv = next((j for j, x in enumerate(h) if x.get('invest')), 28)
                if inv + 4 <= i <= inv + 22: r = 2
            for _ in range(r): items.append((f, cams[i], i / n))
        scenes.append((name, caps, items))
    return scenes

def render(W, H, out):
    vertical = H > W
    scenes = compose_scene_frames()
    dur = (sum(len(x[2]) for x in scenes) - XF * (len(scenes) - 1) + int(FPS * 3.6)) / FPS
    proc = subprocess.Popen([FF, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                             '-i', 'assets/music/vegas.mp3', '-map', '0:v', '-map', '1:a', '-shortest',
                             '-af', f'afade=t=in:d=0.4,afade=t=out:st={dur-1.6:.2f}:d=1.6', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
                             '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    cache = {}
    def src(p):
        if p not in cache:
            if len(cache) > 40: cache.clear()
            cache[p] = Image.open(p).convert('RGB')
        return cache[p]
    def frame_img(item, caps, extra_zoom=1.0):
        f, (cx, cy, z), k = item
        im = src(f)
        z = z * extra_zoom
        if not vertical:
            fr = crop(im, cx, cy, z, 16 / 9).resize((W, H), Image.LANCZOS)
            cap_y, big = int(H * 0.70), 128
        else:
            bg = im.resize((int(H * 16 / 9), H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(28))
            bg = ImageEnhance.Brightness(bg).enhance(.45).crop(((bg.width - W) // 2, 0, (bg.width - W) // 2 + W, H))
            fg = crop(im, cx, cy, max(1.0, z * 0.95), 3 / 4).resize((W, int(W * 4 / 3)), Image.LANCZOS)
            fr = bg; fy = (H - fg.height) // 2 + 40; fr.paste(fg, (0, fy))
            d0 = ImageDraw.Draw(fr); d0.rectangle((0, fy - 4, W, fy), fill='#ffd54a'); d0.rectangle((0, fy + fg.height, W, fy + fg.height + 4), fill='#ffd54a')
            cap_y, big = 120, 108
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        for (a, b, t, s, col) in caps:
            if a <= k <= b: caption(d, W, cap_y if not vertical else (cap_y if t else 0), t, s, col, (k - a) / (b - a), big)
        # small brand bug
        bf = font(30 if not vertical else 36); bt = 'BROKE TO BILLIONAIRE'
        d.text((W - d.textlength(bt, font=bf) - 34, H - 58 if not vertical else H - 120), bt, font=bf, fill=(255, 226, 138, 200), stroke_width=2, stroke_fill=(0, 0, 0, 160))
        fr = fr.convert('RGBA'); fr.alpha_composite(ov)
        return fr.convert('RGB')
    total = 0
    seq = []
    for si, (name, caps, items) in enumerate(scenes):
        seq.append((name, caps, items))
    prev_tail = None
    for si, (name, caps, items) in enumerate(seq):
        for i, it in enumerate(items):
            img = frame_img(it, caps)
            if si > 0 and i < XF and prev_tail is not None:   # zoom-crossfade from previous scene
                k = ease((i + 1) / (XF + 1))
                a = frame_img(prev_tail, prev_caps, 1 + 0.25 * k)
                img = Image.blend(a, img, k)
            if si < len(seq) - 1 and i >= len(items) - XF:
                continue   # the tail is drawn blended into the next scene's head
            proc.stdin.write(img.tobytes()); total += 1
        prev_tail = items[-1]; prev_caps = caps
    # end card (crossfade from last frame)
    last = frame_img(prev_tail, prev_caps)
    art = Image.open('assets/art/menu-bg.webp').convert('RGB')
    for i in range(int(FPS * 3.6)):
        t = i / FPS
        z = 1.0 + 0.04 * t
        if vertical:
            base = art.resize((int(H * art.width / art.height * z), int(H * z)), Image.LANCZOS)
            x0 = (base.width - W) // 2; base = base.crop((x0, 0, x0 + W, H))
        else:
            base = art.resize((int(W * z), int(W * z * art.height / art.width)), Image.LANCZOS)
            x0 = (base.width - W) // 2; y0 = max(0, (base.height - H) // 2); base = base.crop((x0, y0, x0 + W, y0 + H))
        base = ImageEnhance.Brightness(base).enhance(.8)
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        d.rectangle((0, int(H * .5), W, H), fill=(0, 0, 0, 120))
        l1 = '$100 → $1,000,000,000?'; f1 = font(84 if not vertical else 76)
        d.text(((W - d.textlength(l1, font=f1)) / 2, H * .55), l1, font=f1, fill='#ffe29a', stroke_width=4, stroke_fill='#2a1a02')
        l2 = 'Can YOU make it?'; f2 = font(54 if not vertical else 60, 'Medium')
        d.text(((W - d.textlength(l2, font=f2)) / 2, H * .55 + (110 if not vertical else 100)), l2, font=f2, fill='white', stroke_width=3, stroke_fill='black')
        # pulsing PLAY button + tapping finger ring
        pulse = 1 + 0.06 * math.sin(t * 7)
        bw, bh = int((520 if not vertical else 700) * pulse), int((120 if not vertical else 150) * pulse)
        bx, by = (W - bw) // 2, int(H * (.8 if not vertical else .78))
        d.rounded_rectangle((bx, by + 10, bx + bw, by + bh + 10), 30, fill='#7a520c')
        d.rounded_rectangle((bx, by, bx + bw, by + bh), 30, fill='#f2c14e', outline='#fff3c4', width=4)
        f3 = font(int(bh * .5)); tt = 'PLAY FREE ▶' if False else 'PLAY FREE'
        d.text((bx + (bw - d.textlength(tt, font=f3)) / 2, by + bh * .2), tt, font=f3, fill='#2a1a02')
        if 1.2 < t < 3.4:
            rr = int(30 + 60 * ((t * 1.6) % 1)); ra = int(255 * (1 - (t * 1.6) % 1)); cxr, cyr = bx + bw * .72, by + bh * .6
            d.ellipse((cxr - rr, cyr - rr, cxr + rr, cyr + rr), outline=(255, 255, 255, ra), width=6)
        fr = base.convert('RGBA'); fr.alpha_composite(ov); fr = fr.convert('RGB')
        if i < 12: fr = Image.blend(last, fr, ease((i + 1) / 13))
        proc.stdin.write(fr.tobytes()); total += 1
    proc.stdin.close(); proc.wait(); print(out, total, 'frames', total / FPS, 's')

if __name__ == '__main__':
    import sys
    from fontTools.ttLib import TTFont
    if not os.path.exists('/tmp/sg.ttf'):
        f = TTFont('assets/space-grotesk.woff2'); f.flavor = None; f.save('/tmp/sg.ttf')
    which = sys.argv[1:] or ['h', 'v']
    if 'h' in which: render(1920, 1080, 'promo-1920x1080.mp4')
    if 'v' in which: render(1080, 1920, 'promo-1080x1920.mp4')
