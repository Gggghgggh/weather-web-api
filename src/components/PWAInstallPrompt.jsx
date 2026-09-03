import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Check,
  Cloud,
  Download,
  Share,
  Smartphone,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';


function isIOSDevice() {
  if (
    typeof navigator ===
    'undefined'
  ) {
    return false;
  }


  return (
    /iPad|iPhone|iPod/
      .test(
        navigator.userAgent
      )
    ||
    (
      navigator.platform ===
        'MacIntel'
      &&
      navigator.maxTouchPoints >
        1
    )
  );
}


function isStandaloneMode() {
  if (
    typeof window ===
    'undefined'
  ) {
    return false;
  }


  return (
    window.matchMedia(
      '(display-mode: standalone)'
    ).matches
    ||
    window.navigator
      .standalone === true
  );
}


function PWAInstallPrompt() {
  const [
    deferredPrompt,
    setDeferredPrompt,
  ] = useState(null);


  const [
    installed,
    setInstalled,
  ] = useState(
    isStandaloneMode()
  );


  const [
    showInstallCard,
    setShowInstallCard,
  ] = useState(false);


  const [
    showIOSHelp,
    setShowIOSHelp,
  ] = useState(false);


  const [
    online,
    setOnline,
  ] = useState(
    navigator.onLine
  );


  const ios =
    useMemo(
      () =>
        isIOSDevice(),
      []
    );


  useEffect(() => {
    function handleBeforeInstallPrompt(
      event
    ) {
      event.preventDefault();

      setDeferredPrompt(
        event
      );


      /*
       * Don't repeatedly show the card
       * after the user dismissed it
       * recently.
       */
      const dismissedAt =
        Number(
          localStorage.getItem(
            'angamaps-install-dismissed'
          ) || 0
        );


      const sevenDays =
        7 *
        24 *
        60 *
        60 *
        1000;


      if (
        Date.now() -
          dismissedAt >
        sevenDays
      ) {
        setShowInstallCard(
          true
        );
      }
    }


    function handleInstalled() {
      setInstalled(
        true
      );

      setDeferredPrompt(
        null
      );

      setShowInstallCard(
        false
      );
    }


    function handleOnline() {
      setOnline(true);
    }


    function handleOffline() {
      setOnline(false);
    }


    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );


    window.addEventListener(
      'appinstalled',
      handleInstalled
    );


    window.addEventListener(
      'online',
      handleOnline
    );


    window.addEventListener(
      'offline',
      handleOffline
    );


    /*
     * iOS doesn't expose
     * beforeinstallprompt.
     */
    if (
      ios &&
      !isStandaloneMode()
    ) {
      const dismissedAt =
        Number(
          localStorage.getItem(
            'angamaps-install-dismissed'
          ) || 0
        );


      const sevenDays =
        7 *
        24 *
        60 *
        60 *
        1000;


      if (
        Date.now() -
          dismissedAt >
        sevenDays
      ) {
        const timer =
          window.setTimeout(
            () => {
              setShowInstallCard(
                true
              );
            },
            2500
          );


        return () => {
          window.clearTimeout(
            timer
          );

          window.removeEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt
          );

          window.removeEventListener(
            'appinstalled',
            handleInstalled
          );

          window.removeEventListener(
            'online',
            handleOnline
          );

          window.removeEventListener(
            'offline',
            handleOffline
          );
        };
      }
    }


    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        'appinstalled',
        handleInstalled
      );

      window.removeEventListener(
        'online',
        handleOnline
      );

      window.removeEventListener(
        'offline',
        handleOffline
      );
    };

  }, [
    ios,
  ]);


  async function handleInstall() {
    if (ios) {
      setShowIOSHelp(true);
      return;
    }


    if (
      !deferredPrompt
    ) {
      return;
    }


    try {
      await deferredPrompt.prompt();

      const choice =
        await deferredPrompt
          .userChoice;


      if (
        choice.outcome ===
        'accepted'
      ) {
        setShowInstallCard(
          false
        );
      }


      setDeferredPrompt(
        null
      );

    } catch {
      /*
       * Browser controls the actual
       * installation process.
       */
    }
  }


  function dismissInstallCard() {
    setShowInstallCard(
      false
    );


    localStorage.setItem(
      'angamaps-install-dismissed',
      Date.now().toString()
    );
  }


  return (
    <>
      {/* CONNECTION STATUS */}

      {!online && (
        <div
          className="
            pwa-network-banner
            fixed
            left-1/2
            top-[86px]
            z-[9000]
            flex
            -translate-x-1/2
            items-center
            gap-2
            rounded-full
            border
            px-4
            py-2
            shadow-xl
          "
        >
          <WifiOff
            size={13}
          />

          <span className="text-[10px] font-semibold">
            Offline — live data will resume when you're connected
          </span>
        </div>
      )}


      {/* INSTALL CARD */}

      {!installed &&
        showInstallCard && (
          <div
            className="
              pwa-install-wrapper
              fixed
              bottom-4
              left-4
              right-4
              z-[8500]
              sm:left-auto
              sm:right-5
              sm:w-[380px]
            "
          >
            <div className="pwa-install-card relative overflow-hidden rounded-[28px] border p-5 shadow-2xl">

              <div className="pwa-install-glow" />


              <button
                type="button"
                onClick={
                  dismissInstallCard
                }
                className="
                  secondary-text
                  absolute
                  right-3
                  top-3
                  z-20
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  border
                "
                aria-label="Dismiss install prompt"
              >
                <X
                  size={13}
                />
              </button>


              <div className="relative z-10">

                <div className="flex items-start gap-4">

                  <div className="pwa-app-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">

                    <Cloud
                      size={22}
                    />

                  </div>


                  <div className="min-w-0 pr-7">

                    <p className="primary-text text-sm font-semibold">
                      Install AngaMaps
                    </p>

                    <p className="secondary-text mt-1 text-[10px] leading-5">
                      Add AngaMaps to your phone for faster access and an app-like experience.
                    </p>

                  </div>

                </div>


                <div className="mt-4 grid grid-cols-3 gap-2">

                  <div className="pwa-benefit rounded-2xl border p-2.5">

                    <Smartphone
                      size={13}
                      className="text-sky-500"
                    />

                    <p className="primary-text mt-2 text-[9px] font-semibold">
                      Home screen
                    </p>

                  </div>


                  <div className="pwa-benefit rounded-2xl border p-2.5">

                    <Wifi
                      size={13}
                      className="text-sky-500"
                    />

                    <p className="primary-text mt-2 text-[9px] font-semibold">
                      Faster launch
                    </p>

                  </div>


                  <div className="pwa-benefit rounded-2xl border p-2.5">

                    <Check
                      size={13}
                      className="text-sky-500"
                    />

                    <p className="primary-text mt-2 text-[9px] font-semibold">
                      App mode
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={
                    handleInstall
                  }
                  className="
                    pwa-install-button
                    mt-4
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    px-4
                    py-3
                    text-xs
                    font-semibold
                  "
                >
                  {ios
                    ? (
                      <Share
                        size={15}
                      />
                    )
                    : (
                      <Download
                        size={15}
                      />
                    )
                  }

                  {ios
                    ? 'How to install'
                    : 'Install AngaMaps'
                  }

                </button>

              </div>

            </div>
          </div>
        )}


      {/* IOS INSTALL INSTRUCTIONS */}

      {showIOSHelp && (
        <div
          className="
            fixed
            inset-0
            z-[9500]
            flex
            items-end
            justify-center
            bg-black/50
            p-3
            backdrop-blur-sm
            sm:items-center
          "
          onClick={() =>
            setShowIOSHelp(
              false
            )
          }
        >

          <div
            className="
              pwa-install-card
              w-full
              max-w-[420px]
              rounded-[30px]
              border
              p-6
              shadow-2xl
            "
            onClick={
              (event) =>
                event.stopPropagation()
            }
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="secondary-text text-[9px] font-semibold uppercase tracking-[0.16em]">
                  iPhone / iPad
                </p>

                <h2 className="primary-text mt-1 text-lg font-semibold">
                  Add AngaMaps to your Home Screen
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowIOSHelp(
                    false
                  )
                }
                className="secondary-text flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
              >
                <X
                  size={14}
                />
              </button>

            </div>


            <div className="mt-6 space-y-3">

              <div className="pwa-step flex gap-3 rounded-2xl border p-4">

                <div className="pwa-step-number">
                  1
                </div>

                <div>

                  <p className="primary-text text-xs font-semibold">
                    Open the Share menu
                  </p>

                  <p className="secondary-text mt-1 text-[10px] leading-5">
                    Tap the Share icon in your browser.
                  </p>

                </div>

              </div>


              <div className="pwa-step flex gap-3 rounded-2xl border p-4">

                <div className="pwa-step-number">
                  2
                </div>

                <div>

                  <p className="primary-text text-xs font-semibold">
                    Choose Add to Home Screen
                  </p>

                  <p className="secondary-text mt-1 text-[10px] leading-5">
                    Scroll through the Share menu and select “Add to Home Screen”.
                  </p>

                </div>

              </div>


              <div className="pwa-step flex gap-3 rounded-2xl border p-4">

                <div className="pwa-step-number">
                  3
                </div>

                <div>

                  <p className="primary-text text-xs font-semibold">
                    Tap Add
                  </p>

                  <p className="secondary-text mt-1 text-[10px] leading-5">
                    AngaMaps will appear alongside the other apps on your device.
                  </p>

                </div>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                setShowIOSHelp(
                  false
                )
              }
              className="pwa-install-button mt-5 w-full rounded-2xl px-4 py-3 text-xs font-semibold"
            >
              Got it
            </button>

          </div>

        </div>
      )}
    </>
  );
}


export default PWAInstallPrompt;