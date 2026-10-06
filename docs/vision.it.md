# Visione del progetto

[English](vision.md) | [Italiano](vision.it.md)

## Scopo

Memoria Vault è uno strato di memoria di proprietà dell’utente per assistenti personali. Conserva informazioni che la persona sceglie di ricordare, preferenze che guidano il comportamento dell’assistente ed eventualmente note vocali o altri contenuti. Lo stesso vault dovrebbe poter essere usato da applicazioni diverse nel tempo.

L’esperienza che immaginiamo è quella di un assistente personale che ti conosce perché porti con te la tua memoria e le tue impostazioni, non perché un fornitore costruisce di nascosto un profilo su di te. La prima prova dovrebbe essere piccola: salvare un progetto, aprire una nuova conversazione, ritrovare il contesto giusto e poter controllare e correggere ciò che è stato recuperato.

## Rapporto con Solphivia

Memoria Vault dovrebbe essere un componente indipendente, con interfacce documentate. Solphivia potrà essere la prima integrazione, ma formato e nucleo del vault non dovranno dipendere da Solphivia o da un singolo fornitore di modelli.

## La memoria è governata dall’utente

L’utente decide cosa diventa un ricordo, può correggerlo, vederne la provenienza e l’età, e cancellarlo. La progettazione dovrebbe distinguere il contesto temporaneo dai ricordi duraturi, così che una singola conversazione non diventi automaticamente parte del profilo permanente.

Le impostazioni di comportamento e personalità sono dati controllati dall’utente: tono, livello di dettaglio, limiti, lingua e altre preferenze. Devono restare separate dai ricordi fattuali, così da poterle modificare o azzerare indipendentemente.

## Prime categorie da valutare

Le categorie devono aiutare le persone a trovare e governare i ricordi, non trasformare la loro vita in un profilo nascosto. Un primo insieme da provare:

- **Progetti:** obiettivi, stato, decisioni, domande aperte e prossimi passi.
- **Idee:** concetti ed esperimenti che l’utente vuole conservare.
- **Preferenze:** lingua, tono, accessibilità e modalità di lavoro.
- **Persone e relazioni:** solo informazioni che l’utente sceglie deliberatamente di conservare.
- **Conoscenze di riferimento:** fatti e documenti che l’utente vuole ritrovare.
- **Continuità delle conversazioni:** contesto di breve durata, con scadenza o promozione esplicita.
- **Voce e contenuti multimediali:** registrazioni, trascrizioni e note derivate scelte dall’utente, mantenute come tipi di dati distinti.

Ogni ricordo dovrebbe riportare la provenienza, una data e, quando utile, un livello di confidenza o uno stato visibile all’utente. L’utente dovrebbe poter scegliere le categorie, crearne di proprie e decidere cosa l’assistente può recuperare in ogni contesto. Le informazioni estratte automaticamente da una conversazione devono poter essere riviste prima di diventare ricordi permanenti.

## Portabilità dei dati

Il vault dovrebbe avere un formato documentato e versionato, con identificativi stabili e regole di migrazione. Importazione ed esportazione dovrebbero funzionare senza account o server. Gli strumenti di importazione dovrebbero mostrare un’anteprima e lasciare scegliere cosa conservare.

Un’esportazione dei dati OpenAI è una possibile prima fonte. Prima di assumere uno schema, dovremo esaminare un archivio di esempio. L’importazione dovrà essere locale e non inoltrare archivio o contenuti a servizi esterni.

## Voce e audio

Le tracce vocali possono comprendere registrazioni, trascrizioni, preferenze vocali o altri contenuti audio creati dall’utente. Il prodotto deve distinguere questi tipi e spiegare dove avviene l’elaborazione. Le registrazioni originali non dovrebbero essere conservate per impostazione predefinita quando basta una trascrizione o una preferenza derivata. Un modello vocale o una funzione di clonazione della voce richiederebbero consenso separato e controlli specifici contro gli abusi.

## Servizi esterni

Ricerca e modelli esterni possono essere utili, ma inviare ricordi privati è una divulgazione. L’interfaccia deve renderla concreta: indicare la destinazione e mostrare il contesto esatto che lascerà il dispositivo. L’utente deve poter scegliere una sola volta senza cambiare l’impostazione predefinita per le richieste future.

Per una ricerca web pubblica, il percorso preferito è inviare una query che non includa ricordi privati e confrontare poi i risultati pubblici con i ricordi locali sul dispositivo. Se la personalizzazione richiede di condividere contesto privato, l’app dovrà mostrare esattamente cosa invierà e chiedere una scelta esplicita per quella richiesta.

Un vault cifrato non può nascondere il testo in chiaro a un fornitore esterno dopo che l’utente glielo ha inviato. Il progetto non deve descrivere quel flusso come privato end-to-end.

## Possibile architettura locale

In precedenti conversazioni su Solphivia avevamo considerato un servizio di memoria locale su un notebook, consultabile anche dal telefono, insieme a modelli locali e strumenti per i documenti. Sono spunti d’integrazione, non dipendenze obbligatorie. Il vault portabile deve restare utilizzabile su un singolo dispositivo senza server; la sincronizzazione opzionale può arrivare in seguito e ogni server o relay dovrebbe ricevere soltanto dati cifrati.

## Fuori ambito per la prima tappa

- Costruire o addestrare un modello di base.
- Registrare o dedurre automaticamente ricordi da ogni conversazione.
- Un account cloud che possa recuperare il vault senza chiave o materiale di recupero dell’utente.
- Dichiarare protezione da malware o da un dispositivo sbloccato e compromesso.
- Inviare ricordi privati a modelli o servizi di ricerca senza una scelta chiara per ogni utilizzo.
