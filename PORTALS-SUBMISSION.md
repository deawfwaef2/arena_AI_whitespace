# Portal submission kit (R16): Broke to Billionaire: The $100 Start

Contact email for every portal: **3298336285@qq.com**
Play URL (for portals that accept a link): https://deawfwaef2.github.io/arena_AI_whitespace/

## Upload ZIPs (GitHub Release `portals-r16`)
https://github.com/deawfwaef2/arena_AI_whitespace/releases/tag/portals-r16

| Portal | ZIP | Ad SDK in the build | Notes |
|---|---|---|---|
| Poki | broke-to-billionaire-poki.zip | Poki SDK v2: commercialBreak, rewardedBreak, gameplayStart/Stop | You apply with a form first; Poki reviews it, then gives access to the upload dashboard |
| GameDistribution | broke-to-billionaire-gamedistribution.zip | GD SDK: pre-roll on first Play, mid-roll on game over, rewarded | **Needs the Game ID** from the GD dashboard; rebuild with `GAMEID_GAMEDISTRIBUTION=<id> python3 tools/make-platform-zips.py gamedistribution` |
| GameMonetize | broke-to-billionaire-gamemonetize.zip | GM SDK: showBanner interstitial (no rewarded ads) | **Needs the Game ID**; rebuild with `GAMEID_GAMEMONETIZE=<id> …` |
| GamePix | broke-to-billionaire-gamepix.zip | GamePix SDK v3: interstitialAd, rewardAd | |
| itch.io | broke-to-billionaire-itch.zip | none | Upload as an HTML game and tick "This file will be played in the browser"; viewport 1280×720 plus a fullscreen button |
| Newgrounds | broke-to-billionaire-newgrounds.zip | none | HTML5 game upload |
| Y8 | broke-to-billionaire-y8.zip | none | |
| other portals | broke-to-billionaire-html5.zip | none | |

In every build:
- Ads pause the game and mute all audio.
- CrazyGames code and URLs are stripped from the build.
- The CrazyGames leaderboard tab is hidden.

## Images (`store-kit/`)
- **Thumbnails:** thumb-512x512, 628x628, 1024x1024, 512x384, 630x500, 400x300, 800x450, 1280x720, 1280x550, 1920x1080 and 180x135 (all .jpg).
- **Screenshots:** `screenshots/shot-1…5-1280x720.jpg`
- **Icon:** `icon-512.png`
- **Trailers:** `promo-1920x1080.mp4` and `promo-1080x1920.mp4` (repo root)

## Title
Broke to Billionaire: The $100 Start

## Short description (EN)
Start with $100 on a 3D city street. Take risky deals, hire partners and climb 11 wealth classes from survival to billionaire.

## 简短介绍 (ZH)
从 100 美元起步，在 3D 城市街头做出一个个冒险决定，招募伙伴，从温饱线一路爬到亿万富豪的 11 个阶层。

## Long description (EN)
You have $100, worn sneakers and one street ahead of you. How far can you climb?

Broke to Billionaire is a quick-decision money-climbing game set on living 3D streets in six world cities: Taipei, Tokyo, Las Vegas, Singapore, New York and Monaco. Every step brings a new card, such as a street job, an investment, a casino, a hospital, a shop or a chance meeting. Choose fast, stake smart and watch your fortune grow or crash.

Climb 11 wealth classes, from Survival to Untouchable. Each class unlocks new mechanics, new music and bigger deals. But time is the real currency: every rest ages you, and losing all 3 hearts ends the run.

Features:
- 6 hand-styled 3D cities
- 11 wealth classes with unlock ceremonies
- 15+ partners with their own stories
- Casinos, auctions, luxuries and a trophy cabinet
- Story events that never repeat within a run
- Plays on desktop and mobile (landscape), in English and Chinese

## Controls
- **Mouse / touch:** tap cards and buttons, drag the stake slider and tap INVEST.
- **Keyboard:** Enter, Space or → confirms; Esc opens the menu.

## Category and tags
- **Category:** Simulation (alternatives: Casual, Idle / Clicker)
- **Tags:** money, simulation, billionaire, idle, clicker, casual, 3d, business, tycoon, strategy, life simulator, mobile

## Age and content
13+. The simulated casino and betting use in-game currency only. There are no real-money purchases.

## Tech
- HTML5 (vanilla JS + WebGL)
- Landscape, 16:9, desktop and mobile
- Saves to localStorage
- Languages: EN and ZH
- Size: about 31 MB, mostly music, which streams after the first screen

---
## Submission status and steps (R16)
Developer details for every form:
- **Name:** Eric Smith
- **Studio:** Deawfwaef Games
- **Country:** China
- **Email:** 3298336285@qq.com
- **Website:** https://deawfwaef2.github.io/arena_AI_whitespace/

| Portal | Status | What the user does |
|---|---|---|
| Poki | **Access request SUBMITTED 2026-09-25** (form at developers.poki.com/guide/share; answered: Indie Studio, Web, "Releasing new titles, Using our developer tools") | Wait for Poki's email in the QQ inbox (usually a few days). Once access is granted, upload `broke-to-billionaire-poki.zip` in the Poki for Developers dashboard |
| GameDistribution | Form filled automatically, but it stopped at a Google image CAPTCHA, which must be solved by a human | Register at https://gamedistribution.com/developers/partnership/ → confirm the QQ email → **Add Game** → copy the **Game ID** → send it to the assistant, who rebuilds the ZIP with it → upload the ZIP plus images from `store-kit/` and the text above |
| GameMonetize | Needs an account (CAPTCHA and email verification) | Sign up on gamemonetize.com as a developer → **Upload game** → copy the **Game ID** → send it to the assistant for a rebuild → upload |
| GamePix | Needs an account | https://partners.gamepix.com/ → Developers → join → submit `broke-to-billionaire-gamepix.zip` |
| itch.io | Needs an account (CAPTCHA) | https://itch.io/register → https://itch.io/game/new → Kind of project: HTML → upload `broke-to-billionaire-itch.zip` → tick "played in the browser" → viewport 1280×720 → Mobile friendly (landscape) → pricing "No payments" or "Donate" |
| Newgrounds | Needs an account (CAPTCHA) | https://www.newgrounds.com/passport/signup → Upload → Game (HTML5) → `broke-to-billionaire-newgrounds.zip` |
| Y8 | Needs an account | y8.com → sign in → Upload → `broke-to-billionaire-y8.zip` |

### Status update 2026-09-25 (later)
- **GameMonetize: registered + game submitted for review.** Game ID `hai9eh8zbtplmv2fxkttr7wz4boytfaw` (baked into the GM build via config.json). SDK was verified in the dashboard (a test ad played in the game), all fields and 3 thumbnails filled in, and **Request activation** was pressed (status: in review). The user still has to fill in Payment settings.
- **GameDistribution: registration form submitted.** The user solved the image CAPTCHA and the site answered "Check your email for further instructions". Next: click the email link, then Add Game, then get the Game ID and rebuild.
- **Poki:** access request submitted; waiting for reply.
- **GamePix / Newgrounds:** need the user's date of birth (18+ rule). **itch.io:** Cloudflare blocks the automated browser. **Y8:** needs an account.
- Account password: told to the user in chat only (never in the repo).
