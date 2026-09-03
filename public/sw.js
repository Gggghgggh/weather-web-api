const VERSION = 'angamaps-v1';

const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/angamaps-pwa-192.png',
  '/angamaps-pwa-512.png',
];


/*
 * Install
 *
 * Cache only the minimum application shell.
 */
self.addEventListener(
  'install',
  (event) => {
    event.waitUntil(
      caches
        .open(STATIC_CACHE)
        .then((cache) =>
          cache.addAll(APP_SHELL)
        )
    );

    self.skipWaiting();
  }
);


/*
 * Activation
 *
 * Remove old AngaMaps caches.
 */
self.addEventListener(
  'activate',
  (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter(
                (cacheName) =>
                  cacheName !== STATIC_CACHE &&
                  cacheName !== RUNTIME_CACHE
              )
              .map(
                (cacheName) =>
                  caches.delete(cacheName)
              )
          )
        )
    );

    self.clients.claim();
  }
);


/*
 * Utility:
 * Return cached app shell if navigation
 * fails because the user is offline.
 */
async function handleNavigation(
  request
) {
  try {
    const networkResponse =
      await fetch(request);

    if (
      networkResponse &&
      networkResponse.ok
    ) {
      const cache =
        await caches.open(
          RUNTIME_CACHE
        );

      cache.put(
        '/',
        networkResponse.clone()
      );
    }

    return networkResponse;

  } catch {
    const cachedPage =
      await caches.match('/');

    if (cachedPage) {
      return cachedPage;
    }

    return new Response(
      `
        <!doctype html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            >
            <title>AngaMaps Offline</title>
            <style>
              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                padding: 24px;
                background: #050914;
                color: #f8fafc;
                font-family:
                  Inter,
                  system-ui,
                  sans-serif;
              }

              .card {
                width: min(100%, 420px);
                padding: 28px;
                border-radius: 28px;
                border:
                  1px solid
                  rgba(255,255,255,.08);
                background: #0d1423;
                box-shadow:
                  0 25px 70px
                  rgba(0,0,0,.35);
              }

              .icon {
                width: 52px;
                height: 52px;
                display: grid;
                place-items: center;
                border-radius: 17px;
                margin-bottom: 20px;
                background:
                  rgba(14,165,233,.12);
                font-size: 25px;
              }

              h1 {
                margin: 0;
                font-size: 23px;
              }

              p {
                margin:
                  12px 0 0;
                color: #94a3b8;
                font-size: 14px;
                line-height: 1.7;
              }

              button {
                width: 100%;
                margin-top: 22px;
                border: 0;
                border-radius: 14px;
                padding: 13px 16px;
                background: #f8fafc;
                color: #020617;
                font-weight: 700;
                cursor: pointer;
              }
            </style>
          </head>

          <body>
            <main class="card">
              <div class="icon">
                ☁
              </div>

              <h1>
                You're offline
              </h1>

              <p>
                AngaMaps needs an internet
                connection for live weather,
                nearby places, routes and map
                information.
              </p>

              <p>
                The application interface is
                still available and will
                reconnect automatically when
                your connection returns.
              </p>

              <button
                onclick="window.location.reload()"
              >
                Try again
              </button>
            </main>
          </body>
        </html>
      `,
      {
        headers: {
          'Content-Type':
            'text/html; charset=utf-8',
        },
      }
    );
  }
}


/*
 * Utility:
 * Cache same-origin static assets.
 */
async function handleStaticAsset(
  request
) {
  const cachedResponse =
    await caches.match(request);

  if (cachedResponse) {
    /*
     * Update the cache in the
     * background.
     */
    fetch(request)
      .then(
        async (networkResponse) => {
          if (
            networkResponse &&
            networkResponse.ok
          ) {
            const cache =
              await caches.open(
                RUNTIME_CACHE
              );

            await cache.put(
              request,
              networkResponse
            );
          }
        }
      )
      .catch(() => {});

    return cachedResponse;
  }


  try {
    const networkResponse =
      await fetch(request);

    if (
      networkResponse &&
      networkResponse.ok
    ) {
      const cache =
        await caches.open(
          RUNTIME_CACHE
        );

      await cache.put(
        request,
        networkResponse.clone()
      );
    }

    return networkResponse;

  } catch {
    return new Response(
      '',
      {
        status: 503,
        statusText: 'Offline',
      }
    );
  }
}


/*
 * Fetch handler
 */
self.addEventListener(
  'fetch',
  (event) => {
    const request =
      event.request;

    const url =
      new URL(
        request.url
      );


    /*
     * Only GET requests may be cached.
     */
    if (
      request.method !== 'GET'
    ) {
      return;
    }


    /*
     * NEVER CACHE LIVE ANGAMAPS API DATA.
     *
     * Weather
     * forecasts
     * alerts
     * location search
     * nearby places
     * routing
     * weather tiles
     *
     * all remain network requests.
     */
    if (
      url.origin ===
        self.location.origin &&
      url.pathname.startsWith(
        '/api/'
      )
    ) {
      return;
    }


    /*
     * Do not create our own persistent
     * cache for external map/weather
     * providers.
     */
    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }


    /*
     * SPA navigation.
     */
    if (
      request.mode ===
      'navigate'
    ) {
      event.respondWith(
        handleNavigation(
          request
        )
      );

      return;
    }


    /*
     * Cache compiled JS, CSS, fonts
     * and local image assets.
     */
    const destination =
      request.destination;

    const cacheableTypes = [
      'script',
      'style',
      'font',
      'image',
    ];


    if (
      cacheableTypes.includes(
        destination
      )
    ) {
      event.respondWith(
        handleStaticAsset(
          request
        )
      );
    }
  }
);


/*
 * Allow the application to request
 * immediate activation after an update.
 */
self.addEventListener(
  'message',
  (event) => {
    if (
      event.data?.type ===
      'SKIP_WAITING'
    ) {
      self.skipWaiting();
    }
  }
);