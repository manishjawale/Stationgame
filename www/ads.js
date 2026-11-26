/* Next Station — AdMob bridge.
   The game calls window.AdBridge (see the ADS block in index.html):
     showInterstitial(done)         full-screen ad between stations
     showRewarded(onReward, done)   player-chosen ad: 2x coins, free hint, skip station
     showBanner(placeholderEl)      bottom banner
   In a normal browser there is no native AdMob, so AdBridge is not defined
   and the game shows its own test ad instead.

   BEFORE RELEASE: replace the TEST ids below with your own AdMob ids
   and set TESTING to false. Never tap your own live ads. */
(function () {
  const TESTING = true;
  const IDS = {
    // Google's official test ad units (safe to use while developing)
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
  };

  const cap = window.Capacitor;
  const AdMob = cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.AdMob;
  if (!AdMob) return; // browser: game uses its built-in test ad

  let ready = false;
  const init = (async () => {
    try {
      await AdMob.initialize({ initializeForTesting: TESTING });
      // Consent form for EEA/UK players (Google UMP). Safe to call everywhere.
      try {
        const info = await AdMob.requestConsentInfo();
        if (info.isConsentFormAvailable && info.status === 'REQUIRED') await AdMob.showConsentForm();
      } catch (e) { /* consent not configured yet */ }
      ready = true;
      preloadInterstitial();
      preloadRewarded();
    } catch (e) { console.warn('AdMob init failed', e); }
  })();

  // Event names used by @capacitor-community/admob (v6/v7)
  const EV = {
    intDismissed: 'interstitialAdDismissed', intFailedShow: 'interstitialAdFailedToShow',
    rwReward: 'onRewardedVideoAdReward', rwDismissed: 'onRewardedVideoAdDismissed', rwFailedShow: 'onRewardedVideoAdFailedToShow'
  };

  let intLoaded = false, rwLoaded = false;
  async function preloadInterstitial() {
    try { await AdMob.prepareInterstitial({ adId: IDS.interstitial, isTesting: TESTING }); intLoaded = true; }
    catch (e) { intLoaded = false; }
  }
  async function preloadRewarded() {
    try { await AdMob.prepareRewardVideoAd({ adId: IDS.rewarded, isTesting: TESTING }); rwLoaded = true; }
    catch (e) { rwLoaded = false; }
  }

  // Wait for the first of several events, with a safety timeout so the game never freezes.
  function once(names, ms) {
    return new Promise(res => {
      const hs = []; let doneFlag = false;
      const finish = n => { if (doneFlag) return; doneFlag = true; hs.forEach(h => h.then ? h.then(x => x.remove()) : h.remove()); res(n); };
      names.forEach(n => hs.push(AdMob.addListener(n, () => finish(n))));
      setTimeout(() => finish('timeout'), ms);
    });
  }

  window.AdBridge = {
    async showInterstitial(done) {
      await init;
      if (!ready || !intLoaded) { done(); preloadInterstitial(); return; }
      intLoaded = false;
      const closed = once([EV.intDismissed, EV.intFailedShow], 60000);
      try { await AdMob.showInterstitial(); await closed; } catch (e) { /* skip */ }
      done(); preloadInterstitial();
    },
    async showRewarded(onReward, done) {
      await init;
      if (!ready || !rwLoaded) {
        // No ad available: be kind and give the reward anyway.
        onReward(); done && done(); preloadRewarded(); return;
      }
      rwLoaded = false;
      let rewarded = false;
      const h = AdMob.addListener(EV.rwReward, () => { rewarded = true; });
      const closed = once([EV.rwDismissed, EV.rwFailedShow], 90000);
      try { await AdMob.showRewardVideoAd(); await closed; } catch (e) { /* skip */ }
      Promise.resolve(h).then(x => x.remove());
      if (rewarded) onReward();
      done && done(); preloadRewarded();
    },
    async showBanner(el) {
      await init;
      if (!ready) return;
      try {
        await AdMob.showBanner({ adId: IDS.banner, adSize: 'ADAPTIVE_BANNER', position: 'BOTTOM_CENTER', margin: 0, isTesting: TESTING });
        if (el) el.style.display = 'none';                  // native banner replaces the placeholder
        document.documentElement.style.setProperty('--adpad', '64px'); // keep game buttons above the banner
      } catch (e) { /* no banner */ }
    }
  };
})();
