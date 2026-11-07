// Social posts and ads link to metafora/get.html (or a short alias like metafora/threads/):
// each phone goes straight to its own store, a computer sees the page with both buttons.
// The tag (?src=threads&c=launch, or window.METAFORA_SRC set by an alias page) goes along:
// the App Store gets a campaign link (pt + ct), shown in App Store Connect › App Analytics › Campaigns
// with page views, downloads, sales and proceeds per campaign;
// Google Play gets utm_source/utm_campaign in the install referrer, shown in Play Console
// › Statistics/Store analysis per UTM campaign.
(function () {
  // Provider token of the developer account (same for all apps): App Store Connect › App Analytics
  // › Acquisition › Campaigns › Generate Campaign Link shows it as "pt=".
  var APPLE_PROVIDER_TOKEN = "129568531";
  var APP_ID = "6819642218";
  var PACKAGE = "com.metafora.app";

  var q = new URLSearchParams(location.search);
  var tag = function (v) { return (v || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24); };
  var src = tag(q.get("src") || window.METAFORA_SRC), c = tag(q.get("c") || window.METAFORA_CAMPAIGN);
  var play = "https://play.google.com/store/apps/details?id=" + PACKAGE;
  var apple = "https://apps.apple.com/app/id" + APP_ID;
  if (src) {
    var ref = "utm_source=" + src + "&utm_medium=social" + (c ? "&utm_campaign=" + c : "");
    play += "&referrer=" + encodeURIComponent(ref);
    apple = "https://apps.apple.com/app/apple-store/id" + APP_ID + "?pt=" + APPLE_PROVIDER_TOKEN + "&ct=" + (c ? src + "-" + c : src) + "&mt=8";
  }
  window.METAFORA_LINKS = { apple: apple, play: play, src: src };

  var ua = navigator.userAgent || "";
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
  if (ios) location.replace(apple);
  else if (/Android/.test(ua)) location.replace(play);
  else document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('a[href^="https://apps.apple.com"]').forEach(function (a) { a.href = apple; });
    document.querySelectorAll('a[href^="https://play.google.com"]').forEach(function (a) { a.href = play; });
  });
})();
