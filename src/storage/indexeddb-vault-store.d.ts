import type { EncryptedVaultStore } from "../core/types.js";

export interface IndexedDBVaultStoreOptions {
  databaseName?: string;
  objectStoreName?: string;
  key?: string | number;
  version?: number;
}

export function createIndexedDBVaultStore(options?: IndexedDBVaultStoreOptions): EncryptedVaultStore;
