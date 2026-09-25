"""R16: build one upload ZIP per web-game portal.
Usage: python3 tools/make-platform-zips.py [target ...]  -> release/platforms/broke-to-billionaire-<target>.zip
Each ZIP = build/<target>/index.html (portal ad SDK wired via src/platform.js, CrazyGames code stripped)
          + shared art-pack.js, art-cities.js, music-pack/*.mp3, sfx-pack/*.js.
Game IDs (GameDistribution / GameMonetize) come from config.json platforms.<target>.gameId  (or env GAMEID_<TARGET>).
The ZIPs are large (~31 MB) so they are NOT committed; they are uploaded as GitHub Release assets."""
import os, sys, subprocess, zipfile
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALL = ['poki', 'gamedistribution', 'gamemonetize', 'gamepix', 'itch', 'newgrounds', 'y8', 'html5', 'playgama']
targets = sys.argv[1:] or ALL
outdir = os.path.join(root, 'release', 'platforms'); os.makedirs(outdir, exist_ok=True)
shared = ['art-pack.js', 'art-cities.js'] + sorted('music-pack/' + f for f in os.listdir(os.path.join(root, 'music-pack'))) + sorted('sfx-pack/' + f for f in os.listdir(os.path.join(root, 'sfx-pack')))
for t in targets:
    cmd = ['node', 'build.mjs', '--production', '--target=' + t]
    gid = os.environ.get('GAMEID_' + t.upper())
    if gid: cmd.append('--gameid=' + gid)
    subprocess.run(cmd, cwd=root, check=True, stdout=subprocess.DEVNULL)
    out = os.path.join(outdir, f'broke-to-billionaire-{t}.zip')
    with zipfile.ZipFile(out + '.tmp', 'w') as z:
        for name, path in [('index.html', os.path.join(root, 'build', t, 'index.html'))] + [(n, os.path.join(root, n)) for n in shared + (['playgama-bridge-config.json'] if t == 'playgama' else [])]:
            zi = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0)); zi.external_attr = 0o644 << 16
            data = open(path, 'rb').read()
            if name.endswith('.mp3'): z.writestr(zi, data, compress_type=zipfile.ZIP_STORED)
            else: z.writestr(zi, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    os.replace(out + '.tmp', out)
    with zipfile.ZipFile(out) as z: assert z.testzip() is None
    print(f'{t}: {out} {os.path.getsize(out)/1e6:.1f} MB')
