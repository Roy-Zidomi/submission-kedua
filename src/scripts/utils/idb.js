import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const STORE_NAME = 'offline-stories';

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  },
});

export const idbAddStory = async (story) => {
  const db = await dbPromise;
  return db.add(STORE_NAME, story);
};

export const idbGetAllStories = async () => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

export const idbDeleteStory = async (id) => {
  const db = await dbPromise;
  return db.delete(STORE_NAME, id);
};
