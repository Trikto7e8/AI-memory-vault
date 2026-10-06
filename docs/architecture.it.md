# Note di architettura

[English](architecture.md) | [Italiano](architecture.it.md)

Queste note definiscono una direzione da implementare e revisionare; non sono un'attestazione di sicurezza.

## Aree separate ma portabili

1. **Memoria personale:** record categorizzati, provenienza, date, sensibilità e scadenza.
2. **Identità dell'assistente:** nome, personalità, istruzioni, limiti, stile, voce/timbro e avatar.
3. **Vault e chiavi:** cifratura locale, sblocco, backup, recupero, associazione dei dispositivi e sincronizzazione.
4. **Adattatori:** interfacce verso diversi modelli AI, motori vocali, ricerca e client mobili.

Tutte le aree devono poter essere usate senza dipendere da un solo assistente o modello. Un adattatore riceve soltanto la richiesta e il contesto approvato; non ha accesso autonomo al vault o alle chiavi.

## Identità persistente

Il profilo dell'assistente viaggia con la memoria e descrive la sua personalità e identità. Per la voce, salvare sia preferenze descrittive (timbro, accento, ritmo) sia identificativi stabili che un motore compatibile possa riutilizzare. Se serve lo stesso timbro su motori o dispositivi diversi, il modello vocale deve essere trattato come un asset privato separato, cifrato e trasferibile solo con il consenso dell'utente. Le descrizioni e gli ID non garantiscono da soli la riproduzione identica.

Nome, descrizione e asset dell'avatar seguono lo stesso principio. Foto, modelli vocali e altri asset non sono ricordi testuali e non vanno inseriti in issue, esempi o commit pubblici. La clonazione è facoltativa e richiede diritti e consenso specifici della persona rappresentata.

## Chiavi pubbliche/private e passphrase

Una coppia di chiavi pubblica/privata non è una password. La chiave pubblica può essere condivisa; la privata deve restare segreta. I dati si cifrano con una chiave casuale simmetrica; poi si protegge una copia di quella chiave per ciascun dispositivo autorizzato tramite la sua chiave pubblica. La chiave privata corrispondente permette al dispositivo di recuperare la chiave dati.

Una passphrase protegge localmente le chiavi private. Non è la chiave pubblica né la chiave del vault. Durante lo sblocco, il prototipo verifica che la chiave pubblica e quella privata nell'involucro cifrato formino una coppia. Ogni dispositivo deve avere coppie di chiavi distinte per cifratura e firma. Il servizio di sync non deve ricevere chiavi private o passphrase. L'associazione, il recupero, la revoca e la rotazione sono descritti nella [specifica di sync](sync-protocol.it.md) e restano da implementare e revisionare.

## Record categorizzati

Ogni ricordo ha ID stabile, schema versionato, categoria, titolo, contenuto, tag, provenienza, date, stato e livello di sensibilità. Gli allegati multimediali sono asset cifrati separati referenziati da ID, non percorsi locali o URL pubblici. Un suggerimento estratto da una conversazione resta in revisione finché l'utente non lo approva. Correzioni e cancellazioni sono esplicite.

Il punto d'ingresso runtime [`src/index.js`](../src/index.js) espone il nucleo portatile: operazioni sui ricordi indipendenti dal fornitore e un unico validatore condiviso per lo snapshot v1. Una sessione cifrata riunisce creazione/sblocco, lettura, scrittura serializzata, anteprima locale, cambio passphrase, backup e blocco sopra un'interfaccia di archivio sostituibile. Creazione atomica e aggiornamenti compare-and-swap rilevano sessioni locali obsolete invece di sovrascrivere modifiche concorrenti. L'archivio riceve solo byte dell'involucro cifrato; l'adattatore riutilizzabile IndexedDB è esportato dal nucleo, mentre un archivio mobile richiederà una propria implementazione. L'adattatore legge anche gli involucri in formato oggetto salvati dal prototipo precedente, normalizzandoli a byte JSON. Le importazioni richiedono la passphrase valida e, se sostituiscono un vault esistente, una conferma esplicita dell'utente.

Le operazioni rifiutano campi non previsti nei record e nella provenienza e verificano i limiti prima del salvataggio, così le estensioni non possono aggiungere silenziosamente dati in chiaro non dichiarati allo snapshot.

## Ricerca e condivisione

Il recupero dei record avviene localmente. Nella ricerca pubblica il client presenta la query esatta e rimuove il contesto privato per impostazione predefinita; confronta i risultati con i ricordi sul dispositivo. Un invio a un modello remoto mostra destinatario e testo preciso e richiede un consenso per quella sola richiesta. Il fornitore vede in chiaro ciò che riceve.

## Sincronizzazione

Il client cifra e autentica ogni revisione prima di inviarla. Le chiavi pubbliche dei dispositivi autorizzati ricevono ciascuna un involucro della chiave dati; il servizio conserva ciphertext e metadati di routing. Il protocollo deve autenticare membership, versioni e revisioni, rilevare replay, conservare conflitti offline e consentire revoca e recupero. Finché queste proprietà non sono implementate e revisionate, non dichiarare attiva la sync end-to-end.
