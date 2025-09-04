import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SecurityHelpers } from './utils/securityHelpers.ts';

// Initialize security monitoring
SecurityHelpers.initializeSecurity();

console.log("Main.tsx loading...");
console.log("React version:", React.version);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

console.log("Creating root...");
const root = createRoot(rootElement);

console.log("Rendering app...");
root.render(<App />);

// Service Worker management - only in production
const SW_ENABLED = true;

if (import.meta.env.PROD && SW_ENABLED && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Clear existing service workers and caches first
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      Promise.all(registrations.map(registration => registration.unregister()))
        .then(() => {
          console.log('All existing service workers cleared');
          return caches.keys();
        })
        .then((cacheNames) => {
          return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        })
        .then(() => {
          console.log('All caches cleared');
          // Register new service worker after cleanup
          setTimeout(() => {
            navigator.serviceWorker.register('/sw.js')
              .then((registration) => {
                console.log('SW registered successfully:', registration);
              })
              .catch((error) => {
                console.log('SW registration failed:', error);
              });
          }, 1000);
        })
        .catch((error) => {
          console.error('Error during SW cleanup:', error);
        });
    });
  });
}

