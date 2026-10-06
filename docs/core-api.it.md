# Uso del nucleo locale del vault

[English](core-api.md) | [Italiano](core-api.it.md)

Questo è un runtime browser sperimentale, non una libreria di sicurezza revisionata. Usa solo dati sintetici. L'API non è collegata a fornitori di modelli e non invia ricordi a servizi di rete.

## Creare e sbloccare un vault nel browser

Servi il repository da `localhost` o da un'altra origine sicura, poi importa il runtime in un modulo browser. L'esempio usa un ricordo sintetico; chiedi la passphrase con un modulo controllato dall'utente e non inserirla nel codice né salvarla.

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
const passphrase = passphraseInput.value; // Letta dal modulo password; non va salvata.
const now = new Date().toISOString();
const initialSnapshot = {
  format: "memoria-vault",
  schemaVersion: 1,
  vaultId: crypto.randomUUID(),
  exportedAt: now,
  profile: {
    schemaVersion: 1,
    language: "it",
    behavior: { rules: [], boundaries: [] },
  },
  memories: [],
};

const session = await createEncryptedVault({
  store,
  passphrase, // Inserita dall'utente; minimo 12 caratteri.
  snapshot: initialSnapshot,
  validateSnapshot: validateVaultSnapshot,
});

await session.saveMemory({
  kind: "note",
  category: "esempio",
  title: "Esempio sintetico",
  content: "Testo di prova, non un ricordo personale.",
  source: { type: "user-authored", capturedAt: now },
});

await session.lock();
passphraseInput.value = "";
```

Dopo che l'utente ha inserito di nuovo la passphrase nel modulo, riapri il vault:

```js
const unlockPassphrase = passphraseInput.value;
const reopened = await openEncryptedVault({
  store,
  passphrase: unlockPassphrase,
  validateSnapshot: validateVaultSnapshot,
});
passphraseInput.value = "";
```

`createIndexedDBVaultStore` persiste solo byte dell'involucro cifrato. Gli altri client possono implementare il contratto `EncryptedVaultStore`, ma ogni implementazione deve offrire creazione atomica, compare-and-swap e cancellazione condizionale. Non salvare nello storage snapshot in chiaro o passphrase.

## Limiti attuali

- L'adattatore browser usa IndexedDB e Web Crypto; non implementa lo storage mobile.
- I backup sono cifrati e manuali. Non sono implementati sync automatica, associazione dei dispositivi, recupero, gestione dei conflitti o protezione dal rollback.
- L'API del contesto può creare anteprime locali e grant vincolati a un solo adattatore, con scadenza di cinque minuti e consumo singolo. Il prototipo non è collegato ad alcun adattatore di modelli.
- Il blocco rimuove i riferimenti in chiaro della sessione, ma JavaScript non può garantire la cancellazione della memoria del processo.
- Non usare dati personali reali finché crittografia e client non saranno revisionati in modo indipendente.
