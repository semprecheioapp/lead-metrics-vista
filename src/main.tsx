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

// Temporarily disable service worker registration and cleanup old SW to fix white screen
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        console.log('Unregistering existing SW:', registration);
        registration.unregister();
      });
      // Optional: clear caches to avoid stale pages
      if (window.caches) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    });
  });
}

