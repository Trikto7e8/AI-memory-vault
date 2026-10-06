# Confine tra vault, identità, modelli e ricerca

[English](provider-boundary.md) | [Italiano](provider-boundary.it.md)

Questa specifica descrive come memoria e identità dell'assistente possano restare di proprietà dell'utente mentre cambiano dispositivo o modello. Il prototipo può generare un'anteprima locale dei ricordi pertinenti. I controlli per collegare modelli e adattatori remoti non sono ancora implementati.

## Componenti

1. **Vault personale:** preferenze IA, ricordi categorizzati (incluse in futuro note vocali personali) e profilo portatile dell'assistente abitualmente usato, cifrati quando il vault è bloccato.
2. **Gate di contesto:** recupera localmente i ricordi pertinenti e li mostra prima della condivisione.
3. **Adattatore del modello:** traduce la richiesta per il modello scelto. Il nucleo non gli passa chiavi o riferimenti al vault, ma questo è un confine API, non una sandbox: il codice caricato nella stessa origine JavaScript può comunque usare le API del browser. Qui devono essere eseguiti solo adattatori fidati; una futura integrazione con fornitori richiede un isolamento effettivo e un canale di messaggi ristretto e vincolato al consenso prima di poter dichiarare un confinamento tecnico.
4. **Trasporto di sync:** in futuro scambia pacchetti cifrati tra dispositivi autorizzati.
5. **Adattatori di identità:** collegano il profilo portatile ai motori voce/avatar disponibili. Non possiedono la memoria.

Il formato è indipendente da modelli e fornitori. Un modello gratuito può comunque elaborare dati su server remoti: prima di inviare, l'app deve mostrare dove avviene l'inferenza.

## Procedura per ogni richiesta AI

1. Il modello chiede al gate il contesto necessario per uno scopo dichiarato; non può esplorare il vault.
2. Il recupero locale seleziona record approvati e non scaduti, escludendo quelli sensibili per impostazione predefinita. L'anteprima attualmente disponibile nell'app non chiama modelli o servizi esterni: mostra solo sul dispositivo i ricordi pertinenti. Una futura richiesta del modello non potrà richiedere record sensibili: solo un'opzione locale separata, controllata dall'utente, potrà aggiungerli all'anteprima da approvare.
3. Quando sarà collegato un modello locale, solo il sottoinsieme selezionato potrà essere passato al processo sul dispositivo. Il prototipo attuale non include un modello locale.
4. Con un modello remoto, l'interfaccia mostra il destinatario e il testo esatto della richiesta e del contesto.
5. L'utente può modificare la richiesta e ogni estratto selezionato, poi approvare o rifiutare per quella sola richiesta; il consenso non diventa permanente. Può includere anche campi selezionati della personalità, mostrati nella stessa anteprima.
6. Il grant monouso scade dopo cinque minuti, è congelato e vincolato allo specifico adattatore. Il runner invia al modello solo scopo, richiesta approvata, campi di profilo selezionati e titolo/testo degli estratti: ID dei ricordi, ID e orario dell'approvazione e altri metadati interni restano locali. Il modello non riceve ID asset vocali o avatar. Il log locale conserva al massimo destinatario, campi selezionati e decisione, non i contenuti privati.

Quando testo o ricordi vengono inviati a un servizio remoto, quel servizio li riceve in chiaro per elaborarli. La cifratura del vault protegge i dati archiviati, non quelli trasmessi deliberatamente.

## Ricerca esterna senza inviare ricordi

Il client crea una query pubblica senza aggiungere automaticamente dati privati, mostra la query esatta e richiede approvazione prima di inviarla. Anche una query può rivelare dettagli personali. I risultati pubblici vengono confrontati con i ricordi sul dispositivo; il contenuto dei ricordi rimane locale. L'utente può scegliere di includere estratti, ma li vede e li approva esplicitamente.

## Identità e voce dell'assistente

Il profilo portatile comprende personalità e preferenze, non solo istruzioni per un singolo modello. Nome, descrizione, avatar, timbro, lingua, ritmo e ID voce/motore costituiscono l'identità dell'assistente. Ogni adattatore traduce le impostazioni secondo le capacità disponibili; la stessa descrizione non garantisce identico risultato.

Le note vocali personali sono ricordi dell'utente, ma il prototipo non archivia note o allegati audio. I campioni vocali usati per creare o adattare la voce dell'assistente sono asset diversi: non vengono raccolti automaticamente e richiedono diritti e consenso separati. Un modello vocale personale o un asset avatar è distinto sia dai ricordi sia dalle note vocali; per trasferirlo servono cifratura, sync autorizzata e consenso specifico.

## Sync e dati visibili

Ogni dispositivo autorizzato deve avere coppie di chiavi distinte per cifrare e firmare. Il server riceve solo pacchetti cifrati e metadati tecnici documentati (dimensioni, tempi, frequenza e identificativi di instradamento). La specifica di associazione, revoca e conflitti è in [sync protocol](sync-protocol.it.md); la sync automatica non esiste ancora.

## Limiti

Dispositivo sbloccato, sistema operativo compromesso, app malevola o estensioni ostili possono esporre testo in chiaro. Non dichiarare protezione end-to-end per funzioni non implementate e revisionate.
