# Smoke Less showcase

A static, bilingual showcase for the offline Android app. No runtime dependencies, backend, database, analytics scripts, feedback links, or form service.

## Preview and check

Install Node.js 22 or newer, then run from this directory:

```powershell
npm run dev
# Open http://127.0.0.1:58200
npm test
npm run build
```

If Windows PowerShell blocks `npm.ps1`, use `npm.cmd run dev`, `npm.cmd test`, and `npm.cmd run build` instead.

There is no `npm install` step. The build only copies public files into `dist/`; README, tests, scripts and Git files are excluded. `dist/` is generated and ignored.

## Cloudflare Pages

This folder is its own repository: `https://github.com/cmndrpaul/smokeless.cmndrpaul.git`. The parent Flutter repository ignores `/website/`.

1. Open Cloudflare **Workers & Pages → Create application → Pages → Import an existing Git repository**.
2. Select `cmndrpaul/smokeless.cmndrpaul` and production branch **main**.
3. Framework preset: **None**. Root directory: leave blank (repository root).
4. Build command: **`node scripts/build.mjs`**. Build output directory: **`dist`**.
5. Deploy. Cloudflare supplies the public `*.pages.dev` address. Future pushes to `main` trigger deployments after Git integration is enabled.

No environment variables, secrets or Pages Functions are required. Leave Web Analytics disabled if you want to preserve the website’s “no analytics scripts” description. A custom domain is optional and can be connected through Pages settings.

Official references: [Static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/).

## Update the content

- Edit English copy in `index.html`; update the matching key in `translations.js` for Taglish. Tests check translation coverage.
- `script.js` manages theme/language preferences, the accessible screenshot tabs and calculator. Only theme and language are saved in localStorage. Calculator inputs remain in memory.
- Screenshots are real Flutter app captures using illustrative records for **Alex**, not user data. There are 24 WebP files: six screens × English/Taglish × light/dark. Naming: `assets/screenshots/{screen}-{en|tag}-{light|dark}.webp`.
- The first Home image loads immediately; other screenshot variants load on selection. The preview handles rapid selections so a slower image never overwrites the current choice.
- Update the MediaFire link, version, approximate size, build date and release notes in `index.html` for new APKs. The provided MediaFire URL is linked as supplied; ensure it contains the latest signed universal APK before announcing the site. The listed size reflects the prepared local APK, not an independently verified MediaFire upload.
- App installation/reminder tests on a real Android phone remain a separate release check. Browser screenshots do not verify notification delivery.
- `_headers` sets Cloudflare security headers. No fonts, JavaScript libraries or trackers are loaded from third-party CDNs. Opening the download link leaves this website for MediaFire.

## Push future website changes

Run these commands from **this website folder**, not the Flutter project:

```powershell
git add .
git commit -m "Update Smoke Less showcase"
git push
```

Keep keystores, `key.properties`, local databases and APK signing passwords outside this repository. The app APK is distributed through MediaFire, not committed here.
