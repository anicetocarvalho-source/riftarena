// RIFT Arena — Push Notification Service Worker

const NOTIFICATION_ICONS = {
  team_invite: "👥",
  match_result: "⚔️",
  tournament_update: "🏆",
  rank_overtake: "📈",
};

self.addEventListener("push", function (event) {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = {
      title: "RIFT Arena",
      message: event.data ? event.data.text() : "",
    };
  }

  const icon = NOTIFICATION_ICONS[data.type] || "🔔";
  const title = icon + " " + (data.title || "RIFT Arena");

  const options = {
    body: data.message || "",
    icon: "/icon-192x192.png",
    badge: "/favicon.svg",
    data: data,
    vibrate: [100, 50, 100],
    tag: data.notification_id || "rift-" + Date.now(),
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  var pushData = event.notification.data || {};
  var extraData = pushData.data || {};
  var url = "/dashboard";

  switch (pushData.type) {
    case "team_invite":
      url = extraData.team_id ? "/teams/" + extraData.team_id : "/teams";
      break;
    case "match_result":
      url = extraData.tournament_id
        ? "/tournaments/" + extraData.tournament_id
        : "/dashboard";
      break;
    case "tournament_update":
      url = extraData.tournament_id
        ? "/tournaments/" + extraData.tournament_id
        : "/tournaments";
      break;
    case "rank_overtake":
      url = "/rankings";
      break;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (
            client.url.indexOf(self.location.origin) !== -1 &&
            "focus" in client
          ) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(clients.claim());
});
