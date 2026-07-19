import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';

// Recover once from stale deploy chunks (e.g. old hashed lazy-loaded files).
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    const reloadKey = 'deenverse-preload-reload-once';
    const hasReloaded = sessionStorage.getItem(reloadKey) === '1';

    if (!hasReloaded) {
      sessionStorage.setItem(reloadKey, '1');
      window.location.reload();
      return;
    }

    sessionStorage.removeItem(reloadKey);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
