# Using the local vault core

[English](core-api.md) | [Italiano](core-api.it.md)

This is an experimental browser runtime, not an audited security library. Use synthetic data only. The API has no model-provider connection and does not send memory to a network service.

## Create and unlock a browser vault

Serve the repository from `localhost` or another secure origin, then import the runtime from a browser module. The sample below uses a synthetic record; obtain the passphrase from a user-controlled form and never hard-code or store it.

```js
import {
  createEncryptedVault,
  createIndexedDBVaultStore,
  openEncryptedVault,
  validateVaultSnapshot,
} from "./src/index.js";

const store = createIndexedDBVaultStore({
  databaseName: "example-vault",
  objectStoreName: "encrypted-snapshots",
  key: "primary",
});

const passphraseInput = document.querySelector("#passphrase");
const passphrase = passphraseInput.value; // Read from the user's password form; never store it.
const now = new Date().toISOString();
const initialSnapshot = {
  format: "memoria-vault",
  schemaVersion: 1,
  vaultId: crypto.randomUUID(),
  exportedAt: now,
  profile: {
    schemaVersion: 1,
    language: "en",
    behavior: { rules: [], boundaries: [] },
  },
  memories: [],
};

const session = await createEncryptedVault({
  store,
  passphrase, // Supplied by the user; at least 12 characters.
  snapshot: initialSnapshot,
  validateSnapshot: validateVaultSnapshot,
});

await session.saveMemory({
  kind: "note",
  category: "example",
  title: "Synthetic example",
  content: "This is test text, not a personal memory.",
  source: { type: "user-authored", capturedAt: now },
});

await session.lock();
passphraseInput.value = "";
```

After the user enters the passphrase again in the password form, unlock the vault:

```js
const unlockPassphrase = passphraseInput.value;
const reopened = await openEncryptedVault({
  store,
  passphrase: unlockPassphrase,
  validateSnapshot: validateVaultSnapshot,
});
passphraseInput.value = "";
```

`createIndexedDBVaultStore` persists only encrypted-envelope bytes. Other clients can implement the `EncryptedVaultStore` contract, but each implementation must provide atomic create, compare-and-swap, and conditional clear operations. Do not put a plaintext snapshot or passphrase in storage.

## Current boundaries

- The browser adapter uses IndexedDB and Web Crypto; it is not a mobile-storage implementation.
- Backups are encrypted and manual. Automatic device sync, device enrollment, recovery, conflict handling, and rollback protection are not implemented.
- The context API can prepare local previews and issue grants that are bound to one adapter, expire after five minutes, and can be consumed once. No model adapter is connected by this prototype.
- Locking drops the session's plaintext references, but JavaScript cannot guarantee process-memory erasure.
- Do not use real personal data until the cryptography and client have been independently reviewed.
