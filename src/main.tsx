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
