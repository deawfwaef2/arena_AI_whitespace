"""R14 #148 / R15: build the CrazyGames upload ZIP (index.html + art-pack.js + art-cities.js + music-pack/*.mp3 + sfx-pack/) with zopfli deflate (max compression,
standard ZIP readers can open it). Usage: python3 tools/make-crazygames-zip.py  -> broke-to-billionaire-crazygames.zip"""
import os, zipfile, zlib, sys, errno, shutil
try:
    import zopfli.zlib as zz
    def deflate(b): return zz.compress(b, numiterations=15)[2:-4]  # strip zlib header/adler -> raw deflate
except ImportError:
    def deflate(b): c = zlib.compressobj(9, zlib.DEFLATED, -15, 9); return c.compress(b) + c.flush()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'broke-to-billionaire-crazygames.zip')
files = ['index.html', 'art-pack.js', 'art-cities.js'] + sorted('music-pack/' + f for f in os.listdir(os.path.join(root, 'music-pack'))) + sorted('sfx-pack/' + f for f in os.listdir(os.path.join(root, 'sfx-pack')))
# Optional external scratch directory keeps the live workspace below its size cap.
tmp = os.path.join(os.environ['CRAZYGAMES_TMPDIR'], 'broke-to-billionaire-crazygames.zip.tmp') if os.environ.get('CRAZYGAMES_TMPDIR') else out + '.tmp'
with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_STORED) as z:
    for name in files:
        data = open(os.path.join(root, name), 'rb').read()
        comp = deflate(data) if not name.endswith('.mp3') else None
        if comp is None or len(comp) > len(data) * 0.98:
            # already-compressed audio: store as-is
            zi = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0)); zi.external_attr = 0o644 << 16
            z.writestr(zi, data, compress_type=zipfile.ZIP_STORED); print(f'{name}: stored {len(data)}', file=sys.stderr); continue
        zi = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED; zi.external_attr = 0o644 << 16
        # write pre-deflated data: use low-level API
        zi.file_size = len(data); zi.CRC = zlib.crc32(data) & 0xffffffff; zi.compress_size = len(comp)
        z.fp.seek(z.start_dir); zi.header_offset = z.start_dir
        zi.flag_bits = 0; z.fp.write(zi.FileHeader(False)); z.fp.write(comp); z.start_dir = z.fp.tell()
        z.filelist.append(zi); z.NameToInfo[name] = zi; z._didModify = True
        print(f'{name}: {len(data)} -> {len(comp)}', file=sys.stderr)
# Validate BEFORE publication so a broken build never replaces the last good ZIP.
with zipfile.ZipFile(tmp) as z: assert z.testzip() is None
try:
    os.replace(tmp, out)
except OSError as e:
    if e.errno != errno.EXDEV: raise
    shutil.copyfile(tmp, out + '.tmp')
    os.replace(out + '.tmp', out)
    os.remove(tmp)
with zipfile.ZipFile(out) as z: assert z.testzip() is None
print(out, os.path.getsize(out))
