# Renders the 15 s fast-cut promo trailers from captured frames (qa/promo-capture.mjs -> /tmp/promo).
# python3 tools/promo-video.py  -> promo-1920x1080.mp4 + promo-1080x1920.mp4 in repo root
import math, subprocess, sys, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); FPS = 30; DUR = 15.0
P = '/tmp/promo/'; FONT = 'assets/space-grotesk.ttf'
def font(sz, w='Bold'):
    f = ImageFont.truetype(FONT, sz)
    try: f.set_variation_by_name(w)
    except Exception: pass
    return f
cache = {}
def load(n):
    if n not in cache: cache[n] = Image.open(P + n).convert('RGB')
    return cache[n]
# shot: (start, end, image, focus x,y (0..1), zoom from, zoom to, caption, subcaption, accent)
GOLD = (255, 205, 70); WHITE = (255, 255, 255); RED = (255, 80, 90); GREEN = (80, 230, 140)
SHOTS = [
 (0.0, 1.6, 'v-poor.png', .5, .55, 1.0, 1.12, 'YOU HAVE $100', 'and one street ahead', WHITE),
 (1.6, 2.8, 'poor.png', .12, .1, 1.9, 1.5, 'START BROKE', 'work, hustle, survive', WHITE),
 (2.8, 4.0, 'invest.png', .8, .75, 1.6, 1.9, 'TAP TO WORK', 'every coin counts', GOLD),
 (4.0, 5.2, 'vegas.png', .6, .5, 1.25, 1.5, 'BET IT ALL?', '47% · ×2 · your call', RED),
 (5.2, 6.3, 'tokyo.png', .15, .3, 1.8, 2.2, '6 WORLD CITIES', 'Tokyo · Vegas · Monaco …', WHITE),
 (6.3, 7.5, 'hosp.png', .55, .5, 1.3, 1.55, 'HEALTH ISN\'T FREE', 'pay for a chance · prices double', RED),
 (7.5, 8.6, 'biotech.png', .88, .5, 1.6, 1.9, 'BUY MORE TIME', '30% gene therapy…', GREEN),
 (8.6, 9.7, 'dept.png', .82, .6, 1.4, 1.7, 'SHOP · UNLOCK · FLEX', 'new mechanics every class', GOLD),
 (9.7, 10.8, 'rest.png', .5, .1, 1.7, 2.0, 'SKIP THE REST', 'watch an ad, keep moving', GOLD),
 (10.8, 12.6, 'monaco.png', .12, .1, 1.7, 1.3, '$100 → $2B', '11 wealth classes', GOLD),
 (12.6, 15.0, 'v-rich.png', .5, .5, 1.15, 1.0, 'BROKE TO BILLIONAIRE', 'PLAY FREE NOW', GOLD),
]
BEATS = [s[0] for s in SHOTS[1:]]
def ease(t): return 1 - (1 - t) ** 3
def crop_zoom(img, W, H, fx, fy, z):
    iw, ih = img.size; s = max(W / iw, H / ih) * max(z, 1.0)
    cw, ch = W / s, H / s
    x = min(max(fx * iw - cw / 2, 0), iw - cw); y = min(max(fy * ih - ch / 2, 0), ih - ch)
    return img.resize((W, H), Image.BILINEAR, box=(x, y, x + cw, y + ch))
def text_c(d, xy, txt, f, fill, stroke=8, anchor='mm'):
    d.text(xy, txt, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(10, 10, 20))
def frame(t, W, H):
    vertical = H > W
    sh = next(s for s in SHOTS if s[0] <= t < s[1]) if t < DUR else SHOTS[-1]
    st, en, im, fx, fy, z0, z1, cap, sub, acc = sh
    u = (t - st) / (en - st); z = z0 + (z1 - z0) * ease(u)
    img = load(im)
    # punch-in on cut
    pk = max(0, 1 - (t - st) / 0.18); z *= 1 + 0.08 * pk
    if vertical:
        bg = crop_zoom(img, W // 8, H // 8, fx, fy, 1.0).filter(ImageFilter.GaussianBlur(3)).resize((W, H))
        bg = ImageEnhance.Brightness(bg).enhance(.45)
        fh = int(W * 1.0); fg = crop_zoom(img, W, fh, fx, fy, z * 0.75)
        out = bg; out.paste(fg, (0, (H - fh) // 2))
    else:
        out = crop_zoom(img, W, H, fx, fy, z)
    # shake on cut
    if pk > 0 and st > 0:
        dx = int(random.uniform(-1, 1) * 14 * pk); dy = int(random.uniform(-1, 1) * 10 * pk)
        out = out.transform(out.size, Image.AFFINE, (1, 0, dx, 0, 1, dy))
    d = ImageDraw.Draw(out, 'RGBA')
    # vignette bars
    if not vertical:
        for i in range(300):
            d.line([(0, H - 300 + i), (W, H - 300 + i)], fill=(0, 0, 0, int(215 * min(1, i / 120))))
    base = min(W, H)
    # caption pop animation
    k = min(1, (t - st) / 0.22); sc = 0.6 + 0.4 * ease(k) + 0.05 * math.sin(k * math.pi)
    fsz = int((170 if vertical else 128) * sc * (0.8 if len(cap) > 14 else 1))
    if vertical:
        cy, sy = int(H * .17), int(H * .17) + 130
        d.rectangle([0, 0, W, int(H * .27)], fill=(0, 0, 0, 90))
    else: cy, sy = H - 165, H - 70
    if sh is SHOTS[-1]:
        cy = int(H * (.2 if vertical else .16)); sy = cy + (150 if vertical else 110)
    f = font(fsz)
    while d.textlength(cap, font=f) > W * .92 and fsz > 30:
        fsz -= 6; f = font(fsz)
    text_c(d, (W // 2, cy), cap, f, acc, stroke=10)
    if k >= 1 or t - st > .12:
        text_c(d, (W // 2, sy), sub, font(int(64 if vertical else 50), 'Medium'), WHITE, stroke=6)
    # money counter shot
    if cap.startswith('$100'):
        v = 100 * (2e9 / 100) ** ease(min(1, u * 1.3))
        s = '${:,.0f}'.format(v)
        fs2 = int(base * (.11 if vertical else .13)); text_c(d, (W // 2, int(H * (.5 if vertical else .45))), s, font(fs2), GOLD, stroke=12)
    # end card CTA button pulse
    if sh is SHOTS[-1] and u > .25:
        pu = 1 + .06 * math.sin(t * 12)
        bw, bh = int((620 if vertical else 560) * pu), int(130 * pu)
        cx, by = W // 2, int(H * (.82 if vertical else .8))
        d.rounded_rectangle([cx - bw // 2, by - bh // 2, cx + bw // 2, by + bh // 2], radius=bh // 2, fill=(255, 196, 40, 255), outline=(255, 255, 255, 255), width=6)
        text_c(d, (cx - 30, by), 'PLAY NOW', font(int(66 * pu)), (30, 20, 0), stroke=0)
        tx = cx + int(170 * pu); d.polygon([(tx, by - 28), (tx, by + 28), (tx + 44, by)], fill=(30, 20, 0))
    # flash on cut
    if st > 0 and t - st < 0.08:
        a = int(200 * (1 - (t - st) / 0.08)); d.rectangle([0, 0, W, H], fill=(255, 255, 255, a))
    # gold particle sparkle for money shots
    if acc == GOLD:
        rnd = random.Random(int(st * 100))
        for i in range(40):
            px = rnd.uniform(0, W); sp = rnd.uniform(.3, 1.0); py = (rnd.uniform(0, H) + (t - st) * H * .5 * sp) % H
            r = rnd.uniform(3, 9); d.ellipse([px - r, py - r, px + r, py + r], fill=(255, 215, 90, int(160 * sp)))
    # progress bar
    d.rectangle([0, 0, int(W * t / DUR), 8], fill=(255, 205, 70, 230))
    return out
def render(W, H, name):
    audio = 'assets/music/class5.mp3'
    cmd = [FF, '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-ss', '8', '-t', str(DUR), '-i', audio,
           '-af', f'afade=t=in:d=0.3,afade=t=out:st={DUR-1.2}:d=1.2,volume=1.2',
           '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', name]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    n = int(DUR * FPS)
    for i in range(n):
        p.stdin.write(frame(i / FPS, W, H).tobytes())
    p.stdin.close(); p.wait(); print(name, p.returncode)
if __name__ == '__main__':
    which = sys.argv[1:] or ['h', 'v']
    if 'h' in which: render(1920, 1080, 'promo-1920x1080.mp4')
    if 'v' in which: render(1080, 1920, 'promo-1080x1920.mp4')
