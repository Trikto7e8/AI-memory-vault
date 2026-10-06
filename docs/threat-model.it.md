# Modello delle minacce — bozza

[English](threat-model.md) | [Italiano](threat-model.it.md)

Questo documento è una prima mappa dei confini di fiducia, non una certificazione. Il prototipo attuale non è revisionato; usare solo dati sintetici. Va aggiornato insieme a ogni nuova funzione di rete, sync, audio o integrazione.

## Dati da proteggere

- Ricordi e allegati, categorie, tag, provenienza, date e scadenze.
- Profilo dell'assistente: preferenze, personalità, limiti e impostazioni vocali.
- Modelli vocali e avatar che danno continuità all'identità dell'assistente: asset separati e potenzialmente molto sensibili.
- Chiavi del vault, chiavi private dei dispositivi, passphrase e materiale di recupero.
- Le query esterne possono rivelare informazioni anche quando il testo dei ricordi non viene allegato.

## Attori e confini

| Componente | Può vedere | Non deve ricevere |
| --- | --- | --- |
| App e dispositivo sbloccato | Dati in chiaro necessari alle funzioni in uso | — |
| Storage locale bloccato | Ciphertext e metadati tecnici locali | Contenuto decifrato o passphrase persistente |
| Servizio di sync | Pacchetti cifrati, identificativi e metadati residui documentati | Chiavi private, passphrase o snapshot in chiaro |
| Modello locale | Solo il contesto selezionato per la richiesta sul dispositivo | Accesso autonomo al vault |
| Modello o ricerca remota | Solo testo/query che l'utente ha approvato in quella richiesta | Contesto privato implicito o accesso persistente al vault |
| Repository pubblico | Codice, specifiche e dati di esempio sintetici | Esportazioni personali, backup, chiavi, audio o ricordi reali |

## Minacce considerate

- Furto di un backup o lettura dei dati di storage da parte di chi non conosce la chiave.
- Server di sync curioso o compromesso che legge, altera, sostituisce, riordina, ripete o blocca pacchetti.
- Dispositivo smarrito, revocato, condiviso o sbloccato lasciato incustodito.
- Errore di selezione o UI ingannevole che invia più memoria del previsto a un servizio remoto.
- Password debole, passphrase dimenticata, backup condiviso o perdita di tutti i dispositivi autorizzati.
- Importazione di file malformati o contenuti conversazionali che tentano di influenzare l'assistente.
- Conflitti offline, ripristino di una versione obsoleta e cancellazione incompleta di copie o backup.
- Campioni vocali o dati di terze persone raccolti senza diritto o consenso valido.

## Fuori garanzia / limiti

Il prototipo blocca automaticamente il vault dopo dieci minuti senza interazioni e svuota i valori visualizzati. La memoria del processo del browser potrebbe comunque contenere copie in chiaro: questo timeout protegge una schermata lasciata incustodita, non garantisce la cancellazione sicura della memoria.

La cifratura del vault non protegge da malware, estensioni ostili, keylogger, sistema operativo compromesso, screenshot, accessibilità fisica durante lo sblocco o memoria già decifrata. Non nasconde automaticamente dimensioni, tempi, frequenza e relazioni tra dispositivi al servizio di sync. Un provider remoto vede i dati che l'utente sceglie di inviare e può conservare log secondo i propri termini. La revoca non richiama copie già scaricate.

Quando l'utente blocca il prototipo, i valori decifrati vengono rimossi dalla pagina prima di abbandonare il riferimento attivo al vault. Questo riduce l'esposizione accidentale nella pagina nascosta, ma JavaScript nel browser non può garantire in modo affidabile che ogni copia in chiaro sia stata cancellata dalla memoria del processo.

## Requisiti di sicurezza

1. Nessuna rete necessaria per creare, consultare, correggere o cancellare ricordi locali.
2. Cifratura autenticata con chiavi casuali; passphrase usata per proteggere materiale di chiave locale tramite KDF adatta e parametri versionati.
3. Segreti assenti da log, telemetria, URL, crash report, analytics e repository.
4. Export cifrato, anteprima dell'import e convalida completa prima di sostituire dati esistenti.
5. Nessun invio remoto di default. Mostrare destinatario e testo preciso, chiedere approvazione per una sola richiesta e registrare solo metadati minimali della scelta.
6. Per sync, autenticare l'associazione dei dispositivi; il server non può aggiungere chiavi fidate unilateralmente. Gestire revoca, replay, rollback, conflitti e recupero.
7. Dati vocali opt-in con diritto/consenso separato, cifratura e cancellazione dedicate.
8. Audit indipendente, revisione delle dipendenze e valutazione del modello di minacce prima di dati personali reali.

## Stato delle verifiche

Il prototipo usa Web Crypto per un flusso locale di backup, ma non ha revisione indipendente. Sync multi-dispositivo, gate con interfaccia di consenso remoto, recupero, revoca e importatore conversazioni non sono operativi. I controlli documentati per queste funzioni sono requisiti futuri, non protezioni già fornite.
