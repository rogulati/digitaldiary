/**
 * app.js — Shared utilities for Digital Diary PWA
 */

/**
 * Display a toast notification.
 * @param {string} message
 * @param {'info'|'error'} type
 */
export function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;

  // Auto-hide after 3 seconds
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

/**
 * Show the current kid's name on the page.
 */
export async function showCurrentKid() {
  const kidNameEl = document.getElementById('kidName');
  if (!kidNameEl) return;

  const kidId = localStorage.getItem('selectedKid');
  if (!kidId) {
    kidNameEl.textContent = 'Tap 👧 to pick who\'s telling a story';
    return;
  }

  try {
    const { getKids } = await import('./storage.js');
    const kids = await getKids();
    const kid = kids.find(k => k.id === kidId);
    kidNameEl.textContent = kid ? `${kid.emoji} ${kid.name}'s turn` : '';
  } catch {
    kidNameEl.textContent = '';
  }
}

/**
 * Update the offline banner visibility based on network status.
 */
export function updateOnlineStatus() {
  function update() {
    const banner = document.getElementById('offlineBanner');
    if (banner) {
      banner.classList.toggle('hidden', navigator.onLine);
    }
  }

  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

/**
 * Register the service worker.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  });
}
