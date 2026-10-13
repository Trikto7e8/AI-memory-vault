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
- Il recupero locale usa corrispondenze lessicali esatte, normalizza accenti e maiuscole in modo indipendente dalle impostazioni locali del dispositivo e ignora la punteggiatura attorno alle parole; non è una ricerca semantica e non effettua richieste di rete.
- I backup sono cifrati e manuali. Non sono implementati sync automatica, associazione dei dispositivi, recupero, gestione dei conflitti o protezione dal rollback.
- Lo schema attuale conserva ricordi testuali e impostazioni del profilo; note vocali e allegati audio non sono ancora supportati.
- L'API del contesto può creare anteprime locali e grant vincolati a un solo adattatore, con scadenza di cinque minuti e consumo singolo. Il prototipo non è collegato ad alcun adattatore di modelli.
- Il blocco rimuove i riferimenti in chiaro della sessione, ma JavaScript non può garantire la cancellazione della memoria del processo.
- Non usare dati personali reali finché crittografia e client non saranno revisionati in modo indipendente.

## Profilo portatile e compatibilità

Il profilo portatile dell’assistente IA, LLM o agente abitualmente usato raccoglie preferenze di contesto, tono vocale, personalità, comportamento, istruzioni e limiti. Può includere descrizioni generiche e facoltative relative alla voce e all’avatar; immagini dell’avatar e preferenze di animazione future richiedono un progetto di estensione e compatibilità. Conservare una preferenza non significa implementare sintesi vocale, rendering o animazioni: queste funzioni spettano ai client esterni. La memoria resta indipendente da modelli, fornitori e avatar specifici.

Lo schema e il runtime attuali restano invariati. Le future immagini dell’avatar e preferenze di animazione non sono nuove funzioni già disponibili: occorrono schema versionato, validazione, import/export e client compatibili. Un cambio di modello conserva i dati del profilo; non garantisce che ogni modello riproduca lo stesso comportamento o la stessa voce.
