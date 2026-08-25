import { openDB } from "idb";

const DB_NAME = "campus-pilot";
const STORE = "queued-actions";

export async function queueOfflineAction(action: {
  type: string;
  payload: unknown;
}) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
  await db.add(STORE, { ...action, createdAt: new Date().toISOString() });
}

export async function queuedActionCount() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
  return db.count(STORE);
}
