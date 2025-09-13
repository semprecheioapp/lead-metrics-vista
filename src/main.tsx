import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SecurityHelpers } from './utils/securityHelpers.ts';

// Initialize security monitoring
SecurityHelpers.initializeSecurity();

// Production-ready initialization
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(<App />);

// Service Worker management - only in production
const SW_ENABLED = true;

if (import.meta.env.PROD && SW_ENABLED && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Clear existing service workers and caches first
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      Promise.all(registrations.map(registration => registration.unregister()))
        .then(() => {
          return caches.keys();
        })
        .then((cacheNames) => {
          return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        })
        .then(() => {
          // Register new service worker after cleanup
          setTimeout(() => {
            navigator.serviceWorker.register('/sw.js')
              .then(() => {
                // SW registered successfully
              })
              .catch(() => {
                // SW registration failed - continue without SW
              });
          }, 1000);
        })
        .catch(() => {
          // Error during SW cleanup - continue without SW
        });
    });
  });
}

