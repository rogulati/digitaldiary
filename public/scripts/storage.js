/**
 * storage.js — IndexedDB wrapper for Digital Diary
 *
 * Stores stories (with audio blobs) and kid profiles.
 * Uses proper IndexedDB transactions (not Dexie-style tx.complete).
 */

const DB_NAME = 'digitalDiaryDB';
const DB_VERSION = 2;

/**
 * Open (or create) the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Stories store
      if (!db.objectStoreNames.contains('stories')) {
        const storyStore = db.createObjectStore('stories', { keyPath: 'id', autoIncrement: true });
        storyStore.createIndex('kidId', 'kidId', { unique: false });
        storyStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Kids store
      if (!db.objectStoreNames.contains('kids')) {
        db.createObjectStore('kids', { keyPath: 'id' });
      }

      // Pending audio (temporary, for passing between pages)
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Pending Audio (temp storage between record → review) ---

/**
 * Save a pending audio blob for review.
 * @param {Blob} blob
 */
export async function savePendingAudio(blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite');
    tx.objectStore('pending').put({ key: 'latestAudio', blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve the pending audio blob.
 * @returns {Promise<Blob|null>}
 */
export async function getPendingAudio() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readonly');
    const req = tx.objectStore('pending').get('latestAudio');
    req.onsuccess = () => resolve(req.result?.blob || null);
    req.onerror = () => reject(req.error);
  });
}

// --- Stories ---

/**
 * Save a story to the database.
 * @param {Object} story - { kidId, title, text, audioBlob, createdAt }
 */
export async function saveStory(story) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stories', 'readwrite');
    tx.objectStore('stories').add(story);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all stories, optionally filtered by kid ID.
 * @param {string|null} kidId
 * @returns {Promise<Object[]>}
 */
export async function getStories(kidId = null) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stories', 'readonly');
    const store = tx.objectStore('stories');
    const results = [];

    const request = store.openCursor();
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (!kidId || cursor.value.kidId === kidId) {
          results.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a story by ID.
 * @param {number} id
 */
export async function deleteStory(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stories', 'readwrite');
    tx.objectStore('stories').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Delete all stories.
 */
export async function clearAllStories() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stories', 'readwrite');
    tx.objectStore('stories').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Kids ---

/**
 * Get all kid profiles.
 * @returns {Promise<Object[]>}
 */
export async function getKids() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kids', 'readonly');
    const results = [];
    const request = tx.objectStore('kids').openCursor();
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a kid profile.
 * @param {Object} kid - { id, name, emoji }
 */
export async function addKid(kid) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kids', 'readwrite');
    tx.objectStore('kids').put(kid);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Delete a kid profile by ID.
 * @param {string} id
 */
export async function deleteKid(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kids', 'readwrite');
    tx.objectStore('kids').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
