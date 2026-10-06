# Principi di sicurezza e questioni aperte

[English](security-principles.md) | [Italiano](security-principles.it.md)

Questo documento elenca requisiti, non un progetto crittografico né un audit. Nessuna implementazione dovrà essere considerata sicura per dati personali finché modello delle minacce e progetto non saranno stati esaminati e verificati.

## Minacce da considerare

- Dispositivo perso o rubato, inclusi backup locali e file temporanei.
- Dispositivo sbloccato compromesso o codice malevolo in esecuzione nell’app.
- Servizio di sincronizzazione curioso o compromesso.
- Divulgazioni accidentali tramite log, rapporti di arresto anomalo, analisi, notifiche o pacchetti diagnostici.
- Passphrase debole, materiale di recupero perso o ripristino errato su un dispositivo condiviso.
- Metadati esposti: identificativi account, dimensioni degli oggetti, orari e modalità di sincronizzazione.
- Invio intenzionale o accidentale di contesto privato a modelli, servizi di ricerca, trascrizione o sintesi vocale esterni.

Il modello delle minacce deve spiegare quali di questi rischi il prodotto può ridurre e quali no. In particolare, la cifratura lato client non protegge il testo in chiaro su un dispositivo compromesso mentre l’utente lo sta leggendo.

## Decisioni richieste prima dell’implementazione

1. Definire formato del vault, versioni, controlli d’integrità e migrazioni.
2. Scegliere librerie crittografiche e schemi consolidati; non inventare primitive o protocolli.
3. Definire generazione delle chiavi, derivazione dalla passphrase, archiviazione sul dispositivo, recupero, rotazione e cancellazione sicura.
4. Stabilire come il modello ibrido con chiavi pubbliche/private e chiavi simmetriche autorizzerà e revocherà i dispositivi senza consegnare chiavi di decifratura al servizio di sincronizzazione.
5. Documentare i metadati visibili durante la sincronizzazione e decidere se cifrare o mascherare nomi, date e dimensioni degli oggetti.
6. Decidere come funzionano backup cifrati e risoluzione dei conflitti.
7. Definire con precisione cosa vede l’utente e approva prima di inviare contenuti privati a un fornitore esterno.
8. Stabilire regole per audio, trascrizioni, rappresentazioni vettoriali e dati vocali derivati.

## Requisiti operativi

- Non inserire mai in Git chiavi, segreti, vault reali o audio personali.
- Usare dati di esempio sintetici e contrassegnarli chiaramente.
- Escludere per impostazione predefinita contenuti privati da log, telemetria, analisi e rapporti di arresto anomalo.
- Spiegare export, cancellazione, backup e recupero prima che l’utente vi faccia affidamento.
- Tenere sotto controllo le dipendenze crittografiche e aggiornarle in risposta agli avvisi di sicurezza.
- Organizzare una revisione indipendente prima di dichiarare la cifratura end-to-end.

Questi principi seguono indicazioni consolidate: partire dal modello delle minacce, usare crittografia verificata e pianificare generazione, archiviazione, distribuzione, rotazione, recupero e distruzione delle chiavi. Vedi [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) e [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html).
