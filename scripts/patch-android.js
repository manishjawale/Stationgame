// Adds the AdMob App ID to AndroidManifest.xml (required, or the app crashes on start).
// Replace TEST_APP_ID with your own AdMob App ID before release.
const fs = require('fs'), path = require('path');
const APP_ID = process.env.ADMOB_APP_ID || 'ca-app-pub-3940256099942544~3347511713'; // Google test App ID
const f = path.join(__dirname, '..', 'android/app/src/main/AndroidManifest.xml');
if (!fs.existsSync(f)) { console.log('No android folder yet — run "npm run android:add" first.'); process.exit(0); }
let x = fs.readFileSync(f, 'utf8');
const tag = `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${APP_ID}"/>`;
if (x.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  x = x.replace(/<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"[^>]*\/>/, tag);
} else {
  x = x.replace(/<application([^>]*)>/, m => m + '\n        ' + tag);
}
// lock to portrait
x = x.replace(/<activity(?![^>]*screenOrientation)/, '<activity android:screenOrientation="portrait"');
fs.writeFileSync(f, x);
console.log('AndroidManifest patched with AdMob App ID ' + APP_ID);
