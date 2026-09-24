# Builds smooth 15 s trailers from REAL captured gameplay frames (qa/capture-frames.mjs -> /tmp/frames/<seg>).
# Frames are 15 fps game-time; output 30 fps => 2x speed-up. Segments are joined with soft crossfades (no hard cuts).
# python3 tools/gameplay-trailer.py -> promo-1920x1080.mp4 + promo-1080x1920.mp4
import os, glob, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); FPS = 30; XF = 12  # crossfade frames (0.4 s)
FONT = 'assets/space-grotesk.ttf'
SEGS = [('poor', 'Start with $100', 'tap to work · every coin counts'),
        ('invest', 'Invest & climb', 'pick your stake · read the odds'),
        ('promo', 'Street life happens', 'promoters, parks, shops, partners'),
        ('vegas', 'Feeling lucky?', 'every city plays by its own rules'),
        ('rich', '$100 → $2B', '11 wealth classes to conquer')]
def font(sz, w='Bold'):
    f = ImageFont.truetype(FONT, sz)
    try: f.set_variation_by_name(w)
    except Exception: pass
    return f
def frames(seg):
    fs = sorted(glob.glob(f'/tmp/frames/{seg}/*.jpg'))
    # expand each 15 fps capture frame to 2 output frames with a blend => smooth 30 fps at 2x game speed
    return fs
def seq():
    out = []  # list of (kind, data) per output frame
    lists = [(s, frames(s[0])) for s in SEGS]
    items = []
    for (meta, fs) in lists:
        items.append((meta, fs))
    timeline = []
    for idx, (meta, fs) in enumerate(items):
        for j, f in enumerate(fs):
            timeline.append((idx, j, f))
    return items
def load(f, cache={}):
    if f not in cache:
        if len(cache) > 60: cache.clear()
        cache[f] = Image.open(f).convert('RGB')
    return cache[f]
def base_frames():
    items = seq(); res = []  # each: (img, segidx, local_t)
    prev_tail = None
    for idx, (meta, fs) in enumerate(items):
        seg_frames = []
        for j, f in enumerate(fs):  # 2x speed => one output frame per capture frame at 30 fps (capture is 15 fps game time)
            seg_frames.append((f, idx, j))
        res.append(seg_frames)
    # stitch with crossfades
    out = []
    for k, sf in enumerate(res):
        if k == 0: out.extend([(a, None, 0, i, len(sf)) for i, a in enumerate(sf)]); continue
        # overlap last XF of out with first XF of sf
        for i in range(XF):
            a = out[-XF + i]; out[-XF + i] = (a[0], sf[i], (i + 1) / (XF + 1), a[3], a[4])
        out.extend([(a, None, 0, i + XF, len(sf)) for i, a in enumerate(sf[XF:])])
    return out
def compose(entry):
    a, b, t, li, ln = entry
    im = load(a[0])
    if b is not None:
        im = Image.blend(im, load(b[0]), t)
    return im, (b if (b is not None and t > .5) else a)[1]
def caption(d, W, H, seg, alpha, vertical):
    _, cap, sub = SEGS[seg]
    a = int(255 * alpha)
    if a <= 0: return
    if vertical:
        cy = int(H * .74)
        text(d, (W // 2, cy), cap, font(96), (255, 210, 80, a), 8, a)
        text(d, (W // 2, cy + 90), sub, font(46, 'Medium'), (255, 255, 255, a), 5, a)
    else:
        x, y = 70, H - 170
        d.rounded_rectangle([x - 30, y - 30, x + 30 + max(d.textlength(cap, font=font(84)), d.textlength(sub, font=font(40, 'Medium'))), y + 128], radius=28, fill=(12, 14, 22, int(a * .72)))
        d.text((x, y), cap, font=font(84), fill=(255, 210, 80, a))
        d.text((x, y + 84), sub, font=font(40, 'Medium'), fill=(255, 255, 255, a))
def text(d, xy, s, f, fill, stroke, a):
    d.text(xy, s, font=f, fill=fill, anchor='mm', stroke_width=stroke, stroke_fill=(10, 10, 20, a))
def render(W, H, name):
    tl = base_frames(); n = len(tl)
    print(name, 'frames', n, 'secs', n / FPS)
    cmd = [FF, '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-ss', '6', '-i', 'assets/music/class5.mp3',
           '-af', f'afade=t=in:d=0.5,afade=t=out:st={n / FPS - 1.5}:d=1.5', '-map', '0:v', '-map', '1:a', '-shortest',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', name]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    vertical = H > W
    seg_start = {}
    for i, e in enumerate(tl):
        im, seg = compose(e)
        seg_start.setdefault(seg, i)
        if vertical:
            bg = im.resize((W // 10, int(W / 10 * H / W * 1)), Image.BILINEAR)
            bg = im.crop((200, 0, 200 + 405, 720)).resize((W // 8, H // 8)).filter(ImageFilter.GaussianBlur(2)).resize((W, H), Image.BILINEAR)
            bg = ImageEnhance.Brightness(bg).enhance(.4)
            fw = W; fh = int(W * 720 / 1280)
            # slow push-in on the gameplay window
            z = 1.0 + 0.9 * 0  # keep full frame visible
            fg = im.resize((fw, fh), Image.LANCZOS)
            out = bg; out.paste(fg, (0, int(H * .36)))
            d = ImageDraw.Draw(out, 'RGBA')
            text(d, (W // 2, int(H * .13)), 'BROKE TO', font(120), (255, 255, 255, 255), 9, 255)
            text(d, (W // 2, int(H * .205)), 'BILLIONAIRE', font(140), (255, 205, 60, 255), 10, 255)
            text(d, (W // 2, int(H * .28)), 'The $100 Start', font(54, 'Medium'), (255, 255, 255, 230), 5, 230)
        else:
            out = im.resize((W, H), Image.LANCZOS); d = ImageDraw.Draw(out, 'RGBA')
        # caption fades in/out inside each segment
        lt = (i - seg_start[seg]) / FPS
        seg_len = sum(1 for x in tl if (x[1] if x[1] is not None and x[2] > .5 else x[0])[1] == seg) / FPS
        al = min(1, max(0, (lt - .15) / .35)) * min(1, max(0, (seg_len - lt - .1) / .35))
        caption(d, W, H, seg, al, vertical)
        # end card fade
        endt = (n - i) / FPS
        if endt < 1.6:
            k = 1 - endt / 1.6; d.rectangle([0, 0, W, H], fill=(8, 8, 14, int(200 * k)))
            fsz = int((110 if vertical else 120) * (0.9 + 0.1 * k))
            text(d, (W // 2, H // 2 - (60 if not vertical else 0)), 'PLAY FREE NOW', font(fsz), (255, 205, 60, int(255 * k)), 10, int(255 * k))
            text(d, (W // 2, H // 2 + (60 if not vertical else 110)), 'Broke to Billionaire: The $100 Start', font(48 if vertical else 50, 'Medium'), (255, 255, 255, int(255 * k)), 5, int(255 * k))
        p.stdin.write(out.tobytes())
    p.stdin.close(); p.wait(); print(name, p.returncode)
if __name__ == '__main__':
    import sys
    w = sys.argv[1:] or ['h', 'v']
    if 'h' in w: render(1920, 1080, 'promo-1920x1080.mp4')
    if 'v' in w: render(1080, 1920, 'promo-1080x1920.mp4')
