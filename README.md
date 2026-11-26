# Next Station 🚆

A tap puzzle game set on a Mumbai local platform. Let passengers off first, board everyone onto the right train, ride from Churchgate to Virar.

This repo is a ready-to-build **Capacitor** Android app with **AdMob** ads (banner, interstitial, rewarded).

```
www/index.html     the game (one file)
www/ads.js         AdMob bridge — put your ad unit ids here
scripts/           copy offline libs, patch AndroidManifest with AdMob App ID
resources/         app icon + splash (1024 / 2732 px)
docs/privacy.html  privacy policy (host with GitHub Pages)
```

## 1. Install tools (once)
- Node.js 20+ — https://nodejs.org
- Android Studio (includes Android SDK + JDK) — https://developer.android.com/studio

## 2. Build and run on your phone
```bash
git clone https://github.com/manishjawale/Stationgame.git
cd Stationgame
npm install
npm run android:add     # creates android/ and adds the AdMob App ID
npm run assets          # generates icons + splash from resources/
npm run sync
npm run open            # opens Android Studio → press ▶ Run with your phone connected (USB debugging on)
```
Try it in a browser first: `npm run serve` → http://localhost:8080 (browser shows test ads made by the game).

After any change to `www/`, run `npm run sync` again.

## 3. Switch to real ads (only before release)
1. Create an app in **AdMob** → copy the **App ID** and create 3 ad units: Banner, Interstitial, Rewarded.
2. In `www/ads.js`: paste the 3 ad unit ids into `IDS` and set `TESTING = false`.
3. Patch the App ID: `ADMOB_APP_ID=ca-app-pub-XXXX~YYYY npm run sync`
4. In AdMob → Privacy & messaging, create a **GDPR consent message** (the game shows it automatically in EEA/UK).
5. Host the privacy policy: GitHub repo → Settings → Pages → Branch `main`, folder `/docs`. URL: `https://manishjawale.github.io/Stationgame/privacy.html`. Fill in the [placeholders] first.
6. Add `app-ads.txt` to a website you own and link it in AdMob (recommended).

⚠️ Never tap your own live ads — use test ids while developing.

## 4. Release build for Google Play
Android Studio → **Build → Generate Signed App Bundle (.aab)** → create a new keystore.
**Back up the keystore file and passwords** — you need them for every future update.

Before each update, raise `versionCode` and `versionName` in `android/app/build.gradle`.

## 5. Publish
1. Play Console account (one-time $25).
2. New personal accounts: closed test with **12+ testers opted in for 14 days in a row**. Invite 15–20 people.
3. Store listing: icon (512 px), feature graphic (1024×500), 4–8 phone screenshots, short + full description, content rating, **Contains ads = Yes**, privacy policy URL, Data safety form (Advertising ID used by AdMob).
4. Apply for production access → review → live.

## Ad placements (already in the game)
| Type | When | Rule |
|---|---|---|
| Interstitial | After tapping **Depart** | Not before station 4, max once per 3 stations, 2 min apart |
| Rewarded | 2× coins · free hint (coins < 15) · skip station when stuck | Reward only after the ad completes |
| Banner | Bottom of screen | Never over the play area |

Change the timing in `www/index.html` → `const ADS = { firstLevel:3, every:3, minGap:120000 }`.
