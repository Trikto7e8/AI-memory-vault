/** Browser persistence adapter for the shared encrypted-vault session API. */

const DEFAULTS = Object.freeze({
  databaseName: "memoria-vault-local",
  objectStoreName: "encrypted-snapshots",
  key: "primary",
  version: 1,
});

const encoder = new TextEncoder();

/**
 * Create an IndexedDB store implementing the atomic encrypted-envelope contract.
 * Older prototype values stored as envelope objects are normalized to UTF-8 JSON bytes.
 */
export function createIndexedDBVaultStore(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some((key) => !["databaseName", "objectStoreName", "key", "version"].includes(key))) {
    throw new Error("Unsupported IndexedDB vault-store options.");
  }
  const config = { ...DEFAULTS, ...options };
  if (typeof config.databaseName !== "string" || !config.databaseName.trim()
    || typeof config.objectStoreName !== "string" || !config.objectStoreName.trim()
    || !(typeof config.key === "string" || typeof config.key === "number")
    || !Number.isSafeInteger(config.version) || config.version < 1) {
    throw new Error("IndexedDB vault-store options are invalid.");
  }

  return Object.freeze({
    async readEncryptedEnvelope() {
      const db = await openDatabase(config);
      return transact(db, config.objectStoreName, "readonly", (store) => store.get(config.key), (value) => normalizeValue(value));
    },
    async createEncryptedEnvelope(bytes) {
      requireBytes(bytes);
      const db = await openDatabase(config);
      await transact(db, config.objectStoreName, "readwrite", (store) => store.add(new Uint8Array(bytes), config.key));
    },
    async compareAndSwapEncryptedEnvelope(expectedBytes, nextBytes) {
      requireBytes(expectedBytes);
      requireBytes(nextBytes);
      const db = await openDatabase(config);
      return transact(db, config.objectStoreName, "readwrite", (store) => store.get(config.key), (current, store) => {
        const currentBytes = normalizeValue(current);
        const matches = currentBytes !== undefined && bytesEqual(currentBytes, expectedBytes);
        if (matches) store.put(new Uint8Array(nextBytes), config.key);
        return matches;
      });
    },
    async clearEncryptedEnvelope(expectedBytes) {
      requireBytes(expectedBytes);
      const db = await openDatabase(config);
      return transact(db, config.objectStoreName, "readwrite", (store) => store.get(config.key), (current, store) => {
        const currentBytes = normalizeValue(current);
        const matches = currentBytes !== undefined && bytesEqual(currentBytes, expectedBytes);
        if (matches) store.delete(config.key);
        return matches;
      });
    },
  });
}

function openDatabase(config) {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("IndexedDB is unavailable in this environment."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.databaseName, config.version);
    let settled = false;
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(config.objectStoreName)) request.result.createObjectStore(config.objectStoreName);
    };
    request.onsuccess = () => {
      if (settled) {
        request.result.close();
        return;
      }
      if (!request.result.objectStoreNames.contains(config.objectStoreName)) {
        request.result.close();
        settled = true;
        reject(new Error("The requested IndexedDB object store does not exist."));
        return;
      }
      settled = true;
      resolve(request.result);
    };
    request.onerror = () => {
      if (settled) return;
      settled = true;
      reject(request.error ?? new Error("Could not open the IndexedDB vault store."));
    };
    request.onblocked = () => {
      if (settled) return;
      settled = true;
      reject(new Error("Opening the IndexedDB vault store is blocked by another tab."));
    };
  });
}

function transact(db, objectStoreName, mode, enqueue, transform = (value) => value) {
  return new Promise((resolve, reject) => {
    let transaction;
    try {
      transaction = db.transaction(objectStoreName, mode);
    } catch (error) {
      db.close();
      reject(error);
      return;
    }
    const store = transaction.objectStore(objectStoreName);
    let result;
    let hasResult = false;
    let request;
    try {
      request = enqueue(store);
    } catch (error) {
      try { transaction.abort(); } catch { /* The transaction may already have finished. */ }
      db.close();
      reject(error);
      return;
    }
    request.onsuccess = () => {
      try {
        result = transform(request.result, store);
        hasResult = true;
      } catch (error) {
        try { transaction.abort(); } catch { /* The transaction may already have finished. */ }
        reject(error);
      }
    };
    transaction.oncomplete = () => {
      db.close();
      resolve(hasResult ? result : undefined);
    };
    transaction.onerror = () => { db.close(); reject(transaction.error ?? new Error("IndexedDB transaction failed.")); };
    transaction.onabort = () => { db.close(); reject(transaction.error ?? new Error("IndexedDB transaction was aborted.")); };
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function normalizeValue(value) {
  if (value === undefined) return undefined;
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
  return encoder.encode(JSON.stringify(value));
}

function requireBytes(value) {
  if (!(value instanceof Uint8Array)) throw new Error("The encrypted-envelope store accepts Uint8Array values only.");
}

function bytesEqual(left, right) {
  if (left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) if (left[index] !== right[index]) return false;
  return true;
}
