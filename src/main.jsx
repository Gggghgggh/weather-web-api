import {
  StrictMode,
} from 'react';

import {
  createRoot,
} from 'react-dom/client';

import App
  from './App.jsx';

import PWAInstallPrompt
  from './components/PWAInstallPrompt.jsx';

import './index.css';

import 'leaflet/dist/leaflet.css';


function registerServiceWorker() {
  /*
   * Don't register it during normal
   * Vite development.
   *
   * This prevents old cached JS from
   * interfering with hot reload.
   */
  if (
    !import.meta.env.PROD
  ) {
    return;
  }


  if (
    !(
      'serviceWorker'
      in navigator
    )
  ) {
    return;
  }


  window.addEventListener(
    'load',
    async () => {
      try {
        const registration =
          await navigator
            .serviceWorker
            .register(
              '/sw.js',
              {
                scope: '/',
              }
            );


        /*
         * Ask the browser to check
         * periodically for an updated
         * worker.
         */
        registration.update();


        console.log(
          'AngaMaps service worker registered.'
        );

      } catch (
        error
      ) {
        console.error(
          'AngaMaps service worker registration failed:',
          error
        );
      }
    }
  );
}


registerServiceWorker();


createRoot(
  document.getElementById(
    'root'
  )
).render(
  <StrictMode>

    <App />

    <PWAInstallPrompt />

  </StrictMode>
);