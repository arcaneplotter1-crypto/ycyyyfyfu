const DB_NAME = 'LiquidGlassCache';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

export const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getCachedVideo = async (url: string): Promise<{url: string, type: string} | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);
      request.onsuccess = () => {
        if (request.result instanceof Blob) {
          resolve({ url: URL.createObjectURL(request.result), type: request.result.type });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

export const cacheVideo = async (url: string, blob: Blob) => {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(blob, url);
  } catch (e) {
    console.error('Failed to cache video:', e);
  }
};
