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

// Enhanced Service Worker management for Chrome compatibility
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Clear existing service workers first (especially important for Chrome)
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      Promise.all(registrations.map(registration => registration.unregister()))
        .then(() => {
          console.log('All existing service workers cleared');
          // Clear caches after unregistering service workers
          return caches.keys();
        })
        .then((cacheNames) => {
          return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        })
        .then(() => {
          console.log('All caches cleared');
          // Now register the new service worker after a delay
          setTimeout(() => {
            navigator.serviceWorker.register('/sw.js')
              .then((registration) => {
                console.log('New SW registered successfully:', registration);
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

