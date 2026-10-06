# Memoria Vault

**Un archivio personale e portabile per la memoria degli assistenti.**

[English](README.md) | [Italiano](README.it.md)

Memoria Vault è un progetto aperto per custodire ricordi personali, preferenze, note vocali e impostazioni sul comportamento dell’assistente sotto il controllo della persona. Il vault nasce per funzionare localmente, accompagnare la persona sui suoi dispositivi e sincronizzarsi senza rendere leggibili i contenuti al servizio di archiviazione.

In futuro potrà diventare un modulo personale di Solphivia, pur restando un progetto indipendente.

> Questo repository contiene al momento la visione del progetto e i suoi obiettivi di sicurezza. Non è ancora un prodotto di cifratura implementato o verificato. Non inserire dati personali reali.

## Cosa vogliamo costruire

- Un vault locale con ricordi, preferenze e impostazioni sulla personalità dell’assistente, scelti dall’utente.
- Ricordi categorizzati con provenienza, data e possibilità di revisione, correzione, scadenza o cancellazione.
- Esportazione e importazione cifrate per spostare il vault tra dispositivi.
- Sincronizzazione facoltativa in cui il servizio conserva dati cifrati senza poterli decifrare.
- Un confine chiaro tra i dati privati del vault e le informazioni inviate a un modello o servizio di ricerca esterno.
- Recupero locale che possa confrontare ricordi privati con risultati pubblici sul dispositivo, senza inviare i ricordi.
- Note vocali e tracce audio sotto il controllo dell’utente, con elaborazione locale come impostazione iniziale.
- Un formato aperto e interfacce documentate, così che altre persone e progetti possano contribuire.

## La promessa di privacy a cui puntiamo

La cifratura dei dati archiviati e la sincronizzazione cifrata non rendono private, end-to-end, tutte le interazioni del vault. Se l’utente sceglie di inviare un ricordo come contesto a un modello o servizio di ricerca esterno, quel contenuto lascia il dispositivo e ricade nelle modalità di trattamento del fornitore. La prima versione dovrebbe quindi mantenere i dati personali sul dispositivo per impostazione predefinita, mostrare cosa verrebbe condiviso e richiedere una scelta esplicita prima dell’invio.

Il progetto dovrà documentare quali informazioni possono vedere il dispositivo, l’app, il servizio di sincronizzazione e ogni fornitore esterno di modelli o ricerca. Faremo affermazioni sulla privacy solo quando saranno sostenute dall’implementazione e dal modello delle minacce.

## Ambito iniziale

La prima tappa sarà un piccolo vault locale con:

1. Un formato dati documentato e versionato per ricordi e preferenze sul comportamento.
2. Funzioni locali per creare, leggere, modificare, cancellare, esportare e importare i dati.
3. Cifratura e recupero delle chiavi progettati prima di conservare dati reali.
4. Nessun caricamento automatico dei contenuti del vault; ove possibile, i risultati pubblici verranno confrontati con i ricordi sul dispositivo.
5. Un percorso per ispezionare e selezionare localmente i dati esportati da OpenAI, senza caricare l’archivio.

Registrazione vocale, riconoscimento e generazione del parlato, sincronizzazione tra dispositivi e integrazioni con modelli o ricerca esterni verranno dopo la revisione del modello dei dati e delle chiavi.

## Principi di progettazione

- **Il vault appartiene alla persona.** L’utente può ispezionare, modificare, esportare, cancellare e spostare i propri dati.
- **Prima locale.** Leggere e modificare i ricordi non deve richiedere una connessione.
- **Privacy predefinita.** La sincronizzazione trasporta dati cifrati; le richieste esterne non includono contesto personale senza una scelta dell’utente.
- **Condivisione limitata e visibile.** L’utente vede i ricordi o estratti selezionati per ogni richiesta esterna.
- **Formati portabili e aperti.** Il vault non deve dipendere da un solo modello, fornitore, dispositivo o azienda.
- **Sicurezza dichiarata con precisione.** Documentiamo i metadati visibili, i compromessi del recupero e i limiti in caso di dispositivo o app compromessi.
- **Consenso per i dati vocali.** Audio e dati derivati dalla voce sono sensibili; registrazione e utilizzo devono essere visibili, revocabili e controllati dalla persona interessata.

## Contribuire

Il progetto è nella fase di proposta. Prima di accettare contributi di implementazione, pubblicheremo un modello delle minacce, uno schema dei dati, un progetto crittografico e una guida per contribuire. Le modifiche che riguardano la sicurezza dovranno essere revisionate da persone con competenze pertinenti.

Consulta la [visione del progetto](docs/vision.it.md), le [note di architettura](docs/architecture.it.md) e i [principi di sicurezza](docs/security-principles.it.md).

## Stato

Concept e struttura iniziale del repository. Non sono ancora presenti codice applicativo, crittografia implementata, protocollo di sincronizzazione o audit di sicurezza.
