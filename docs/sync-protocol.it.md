# Specifica di progetto: associazione dei dispositivi e sync cifrata

[English](sync-protocol.md) | [Italiano](sync-protocol.it.md)

Questa specifica descrive il comportamento desiderato. Non è implementato nel prototipo: oggi esiste solo un backup cifrato manuale che usa la stessa coppia di chiavi protetta da passphrase. Finché il protocollo non è implementato, revisionato e verificato, usare solo dati sintetici.

## Chiavi: cosa può fare ciascuna

- Ogni dispositivo genera coppie di chiavi distinte per cifrare e firmare. Le chiavi private non vengono inviate al server; le chiavi pubbliche si condividono per autorizzare il dispositivo e verificare gli aggiornamenti firmati.
- Il vault genera una chiave casuale di contenuto. Questa chiave cifra i dati del vault; viene poi avvolta separatamente con la chiave pubblica di ciascun dispositivo autorizzato.
- Solo la chiave privata corrispondente può aprire la copia avvolta della chiave del vault. La chiave pubblica non è una password e non può decifrare.
- Una passphrase protegge localmente la chiave privata, preferibilmente con l'archivio sicuro del sistema operativo. Non è la chiave pubblica né la chiave del vault.

Questa distinzione permette di aggiungere o revocare un dispositivo senza condividere una singola chiave privata tra tutti i dispositivi.

## Procedura di associazione prevista

1. Il nuovo dispositivo crea localmente le coppie di chiavi per cifratura e firma e mostra un QR code con identificativo e impronte di entrambe le chiavi pubbliche.
2. Un dispositivo già autorizzato legge il QR code. La persona confronta e conferma il nuovo dispositivo su entrambi gli schermi; il dispositivo esistente firma un'approvazione che associa entrambe le nuove chiavi pubbliche al vault.
3. Il dispositivo già autorizzato avvolge localmente la chiave casuale del vault con la chiave pubblica del nuovo dispositivo. La chiave privata e la passphrase non attraversano il server.
4. Il nuovo dispositivo scarica ciphertext, pacchetto avvolto e manifest firmato. Verifica la firma e l'identità del vault prima di decifrare.
5. La persona conserva una procedura di recupero separata. Perdere tutti i dispositivi autorizzati e il recupero può rendere i dati irrecuperabili.

Il QR code deve autenticare l'impronta della chiave, non trasportare la chiave privata o il vault in chiaro. Un flusso alternativo via rete dovrà autenticare la chiave fuori banda o essere autorizzato da un dispositivo già fidato: il solo account sul server non deve poter aggiungere dispositivi.

## Procedura di sincronizzazione prevista

1. Il dispositivo sbloccato crea una nuova revisione dello snapshot e genera un nonce casuale nuovo per AES-GCM.
2. Il ciphertext viene autenticato insieme a un manifest che lega identificativo del vault, revisione della membership firmata, schema, ID revisione univoco e tutti gli ID delle revisioni genitrici. Un dispositivo autorizzato firma il manifest canonico, il ciphertext e gli involucri di chiave per i destinatari.
3. Il pacchetto contiene ciphertext e una copia della chiave del vault avvolta per ogni dispositivo attivo. Le chiavi private e il testo in chiaro non vengono caricati.
4. Il servizio conserva e restituisce byte cifrati. Riceve necessariamente metadati di instradamento e può osservare dimensioni, orari, frequenza, identificativi dei dispositivi e revisioni, secondo il design finale.
5. Prima di scrivere, il client invia tutti gli ID testa remoti conosciuti come condizione compare-and-swap. Scritture concorrenti creano teste/rami di conflitto da risolvere localmente; non si applica silenziosamente “vince l'ultimo aggiornamento”.
6. La fusione avviene sul dispositivo dopo la decifratura. Record distinti si possono unire per ID; modifiche concorrenti allo stesso record restano entrambe visibili finché la persona non sceglie.

## Storico delle revisioni senza blockchain pubblica

Il progetto riprende un'idea utile delle blockchain — collegare revisioni firmate alle rispettive revisioni genitrici — senza inserire il vault dell'utente in un registro pubblico. Ogni pacchetto cifrato è firmato da un dispositivo autorizzato e indica gli ID delle revisioni genitrici. I dispositivi ricordano le teste più recenti che hanno accettato; così, quando confrontano gli storici, possono rilevare modifiche, rami concorrenti e alcuni tentativi di rollback.

È un grafo di revisioni firmate, non una blockchain: non ci sono rete pubblica di consenso, mining, token o registro globale. Una blockchain pubblica non serve per la cifratura end-to-end né per personalizzare l'assistente. Aggiungerebbe costi e permanenza, mentre i metadati pubblici delle transazioni potrebbero rivelare schemi di attività. Ricordi personali, impostazioni del profilo, asset di voce/avatar, chiavi, identificativi stabili e hash derivati da questi dati non devono mai essere scritti su una blockchain pubblica. Inoltre, cancellare un dato locale o ruotare le chiavi non può eliminare una transazione pubblica immutabile.

Per la terminologia, il NIST descrive la blockchain come un registro digitale distribuito i cui blocchi collegati sono convalidati tramite consenso e replicati tra i partecipanti della rete ([panoramica NIST sulla blockchain](https://www.nist.gov/blockchain)).

Il grafo firmato rende rilevabili le manomissioni solo nello storico che i dispositivi riescono a verificare. Non può obbligare il servizio di sincronizzazione a consegnare aggiornamenti, dimostrare che non esista una revisione più recente o impedire a un servizio malevolo di nascondere dati. Garanzie anti-rollback più forti richiedono un protocollo revisionato e un checkpoint fidato o un meccanismo di trasparenza che non riveli contenuti privati.

Una firma e l'insieme delle teste memorizzato localmente aiutano a rilevare pacchetti alterati o regressioni, ma un server può comunque ritardare o negare aggiornamenti. La protezione anti-rollback tra dispositivi offline richiede un protocollo verificabile e va revisionata. La codifica canonica dei byte e le regole di verifica delle firme vanno definite prima dell'implementazione. Le revisioni di membership elencano le chiavi pubbliche autorizzate e sono firmate da un dispositivo già fidato nella revisione genitrice; il client verifica la catena prima di accettare modifiche.

## Revoca, recupero e cancellazione

- **Revocare un dispositivo:** un dispositivo fidato pubblica una nuova membership firmata. Per impedire al revocato di leggere aggiornamenti futuri, si genera una nuova chiave di contenuto e la si distribuisce solo ai dispositivi rimasti. La revoca non può cancellare copie, chiavi o testo già ottenuti dal dispositivo revocato.
- **Recuperare:** usare materiale di recupero separato dai dispositivi e dalla passphrase quotidiana, conservato dall'utente. Formato e procedure di ripristino vanno decisi e testati prima della sync pubblica.
- **Cancellare:** pubblicare una tombstone e cancellare i dati dai dispositivi controllati. Il servizio potrebbe conservare versioni precedenti o backup; eliminazione remota verificabile non è garantita senza un impegno del servizio.
- **Conflitti:** nessuna modifica privata deve essere scartata automaticamente. Conservare versioni concorrenti con provenienza e chiedere una scelta quando la fusione non è sicura.

## Modelli e ricerca esterni

Il recupero dei ricordi deve avvenire sul dispositivo. Per cercare sul web, il client prepara una query pubblica/sanificata senza allegare i record privati; l'interfaccia mostra la query esatta e chiede conferma prima della richiesta remota, perché anche una query può rivelare informazioni. I risultati pubblici vengono confrontati con i ricordi localmente. Se l'utente sceglie di inviare un estratto a un LLM remoto, quel testo lascia il dispositivo in chiaro per essere elaborato dal fornitore e l'interfaccia deve dichiararlo.

## Criteri prima di dire “end-to-end”

Il contratto propone RSA-OAEP con chiavi da 3072 bit per avvolgere la chiave, ECDSA P-256/SHA-256 per le firme e AES-256-GCM per cifrare i contenuti. Scelte e implementazione richiedono revisione esperta. Servono poi implementazione e revisione indipendente di formato firmato, associazione autenticata, cifratura autenticata, nonce, protezione da replay/rollback, rotazione e revoca, backup/recupero, migrazioni e metadati esposti. Questo documento da solo non prova che sync o cifratura end-to-end siano operative.

## Limiti attuali

- La sync automatica e l'associazione dei dispositivi non esistono ancora.
- Il backup `.mvault` del prototipo riusa la coppia di chiavi protetta da passphrase; non applica il modello multi-dispositivo sopra descritto.
- Il prototipo non è sottoposto ad audit e non è adatto a dati personali reali.
- Non inserire archivi di conversazioni, chiavi o audio personali in GitHub. Vedere `.gitignore` e le istruzioni per contribuire.
