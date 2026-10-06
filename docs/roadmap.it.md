# Roadmap

[English](roadmap.md) | [Italiano](roadmap.it.md)

Questa roadmap segue lo sviluppo di un assistente personale di IA portatile. Le tappe di sicurezza richiedono revisione; il prototipo attuale serve solo con dati sintetici.

## Stato attuale

- [x] Prototipo browser locale per ricordi categorizzati e preferenze comportamentali/vocali.
- [x] Recupero lessicale locale e anteprima dei ricordi approvati; dati sensibili esclusi per impostazione predefinita.
- [x] API condivisa di sessione cifrata sopra un'interfaccia che persiste solo involucri cifrati.
- [x] Contratti indipendenti dal fornitore per memoria e adattatori ai modelli.
- [x] Prototipo di backup cifrato manuale e importazione.
- [x] Bozza bilingue del modello delle minacce e del progetto di sync multi-dispositivo.
- [ ] Revisione indipendente della crittografia browser; fino ad allora solo dati sintetici.
- [ ] Schema completo dell'identità portatile: nome, persona, identità vocale, avatar e riferimenti protetti agli asset.
- [ ] Associazione di chiavi per dispositivo, sync cifrata, recupero, conflitti, revoca e protezione dal rollback.
- [ ] Adattatori ai modelli con autorizzazione esatta per ogni richiesta remota; il prototipo attuale non invia richieste ad alcun modello.
- [ ] Importatore locale, revisionabile e multi-formato delle conversazioni.
- [ ] Archivio cifrato degli asset facoltativi per modelli vocali e avatar, con consenso e controlli di portabilità separati.

## Tappe

### 1. Memoria e identità portatile

- Versionare record per memoria categorizzata, provenienza, scadenza, sensibilità e revisione dell'utente.
- Tenere comportamento e identità dell'assistente separati dai fatti, ma nello stesso vault portatile.
- Verificare la continuità in una nuova conversazione, su un altro dispositivo e con un modello differente.

### 2. Vault locale cifrato

- Revisionare progetto crittografico e gestione delle chiavi.
- Mantenere i flussi locali di creazione, sblocco, blocco, modifica, cancellazione, backup, importazione e recupero.
- Escludere contenuti privati da log, telemetria, rapporti di arresto anomalo e repository pubblico.

### 3. Sync e portabilità tra dispositivi

- Associare una coppia di chiavi indipendente per dispositivo, approvata da un dispositivo fidato già autorizzato.
- Cifrare e autenticare ogni revisione; conservare rami e conflitti invece di sovrascrivere silenziosamente.
- Progettare recupero, rotazione chiavi, revoca dispositivi, protezione replay/rollback e metadati residui.

### 4. Adattatori per modelli e ricerca

- Mantenere sul dispositivo il recupero e il confronto tra risultati pubblici e ricordi privati.
- Permettere ai modelli locali di usare il contesto selezionato senza rete.
- Mostrare query, destinatario e contesto esatti prima di ogni chiamata esterna; niente consenso permanente.

### 5. Identità vocale e avatar

- Conservare preferenze descrittive portabili e identificativi stabili di motore/profilo.
- Trattare modelli vocali e file avatar come asset cifrati facoltativi, separati dai ricordi.
- Richiedere diritti, consenso, regole di conservazione, revoca e cancellazione specifici.
