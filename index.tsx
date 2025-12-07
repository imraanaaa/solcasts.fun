import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// We rely on index.html script tag to polyfill Buffer globally before this script runs.
// This prevents double-import issues in the browser environment.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);