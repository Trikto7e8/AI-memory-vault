# Note di architettura

[English](architecture.md) | [Italiano](architecture.it.md)

Queste note traducono gli obiettivi attuali in una direzione discutibile e verificabile. Non sono una specifica d’implementazione: formato delle chiavi, algoritmi e dettagli del protocollo devono ancora essere esaminati da esperti prima di scrivere il codice.

## Tenere separate quattro aree

1. **Dati di memoria:** record controllati dall’utente, categorie, provenienza, date e conservazione.
2. **Profilo dell’assistente:** tono, lingua, preferenze di comportamento e limiti, separati dai ricordi fattuali.
3. **Vault e chiavi:** cifratura locale, sblocco, recupero, esportazione e sincronizzazione cifrata facoltativa.
4. **Integrazioni dell’assistente:** modelli locali, client mobili, ricerca pubblica e, se scelti, modelli remoti.

Questa separazione permette allo stesso vault di funzionare con Solphivia, un altro assistente locale o applicazioni future, senza consegnare l’intero archivio a ciascuno.

## Chiavi pubbliche/private e password

Una coppia di chiavi pubblica/privata non è una password. La chiave pubblica si può condividere; quella privata deve restare segreta. In un vault cifrato, la chiave privata può servire ad autorizzare un dispositivo o a proteggere una piccola chiave casuale del vault. La sola chiave pubblica non può decifrare il vault.

I file grandi vengono in genere cifrati con una chiave simmetrica casuale. Una costruzione di cifratura autenticata e verificata protegge il file; la chiave dei dati viene poi protetta separatamente per ogni dispositivo autorizzato usando la sua chiave pubblica. Ogni dispositivo usa la propria chiave privata per recuperare la chiave dei dati. Questo schema ibrido è più pratico che cifrare direttamente ogni byte con crittografia a chiave pubblica.

Una password o passphrase può sbloccare localmente una chiave del dispositivo o derivare una chiave di protezione con una funzione di derivazione adatta alle password. Non è la chiave pubblica, la chiave privata né l’unico meccanismo di cifratura. Password deboli, perdita del materiale di recupero e dispositivi sbloccati compromessi restano rischi da considerare.

Il progetto dovrà stabilire come generare, conservare tramite gli strumenti sicuri del sistema operativo, salvare, ruotare, revocare e recuperare le chiavi dei dispositivi. Il servizio di sincronizzazione non deve ricevere chiavi di decifratura. Un nuovo dispositivo dovrà essere autorizzato da un dispositivo già riconosciuto o da un processo di recupero esplicito; altrimenti il servizio di sincronizzazione potrebbe aggiungere di nascosto un lettore.

## Memoria locale categorizzata

Ogni ricordo dovrebbe essere un record identificabile, così che l’utente possa controllarlo e rimuoverlo. Il record dovrebbe prevedere:

- ID stabile e versione dello schema;
- categoria ed eventuali etichette definite dall’utente;
- contenuto e tipo (testo, riferimento, audio, trascrizione o allegato);
- provenienza e date di creazione e modifica;
- eventuale scadenza, confidenza ed etichetta di sensibilità;
- collegamenti a progetti o record correlati;
- stato esplicito: curato dall’utente, suggerito o importato.

Le categorie sensibili devono essere facoltative. Un ricordo estratto da una conversazione resta un suggerimento finché l’utente non lo accetta. L’assistente dovrebbe recuperare solo i record pertinenti all’attività corrente, rendendo semplice ispezionare e modificare l’insieme selezionato.

## Ricerca pubblica senza inviare ricordi privati

Per una ricerca web pubblica, la query viene ricavata dalla richiesta corrente senza includere i contenuti del vault. I risultati pubblici vengono poi confrontati con i ricordi pertinenti sul dispositivo. Per esempio:

```text
Richiesta dell’utente
  ├─ Query pubblica senza contesto privato → motore di ricerca
  └─ Ricordi pertinenti → recupero locale
                          ↓
               confronto/sintesi locale
```

Se l’utente chiede un ragionamento personalizzato da remoto, l’app mostra prima la destinazione e gli estratti esatti. Richiede una conferma valida per quella richiesta. Non deve mai suggerire che la cifratura end-to-end protegga contenuti che l’utente invia deliberatamente a un fornitore remoto.

## Sincronizzazione tra dispositivi

Quando verrà aggiunta la sincronizzazione, il dispositivo mittente cifrerà i record prima del caricamento. Il servizio di sincronizzazione conserverà dati cifrati non leggibili e il minimo di metadati necessario per identificare e sincronizzare gli oggetti. Dovrà essere documentato cosa resta visibile: dimensioni, date, identificativi dell’account e modalità di accesso. I dati scaricati saranno verificati e decifrati solo su un dispositivo autorizzato.

## Spunti dalle conversazioni precedenti su Solphivia

- Verificare la continuità salvando un progetto e recuperandolo in una nuova conversazione, lasciando all’utente la possibilità di vedere e correggere il contesto.
- Tenere la memoria indipendente dall’assistente o dal modello, così che telefono, notebook e futuri client possano usare lo stesso formato.
- Inferenza locale, ricerca nei documenti e un servizio di memoria ospitato sul notebook sono integrazioni facoltative, non requisiti del vault portabile.
- Qualità e identità della voce sono distinte dall’archiviazione dei ricordi. Registrazioni, trascrizioni e preferenze vocali richiedono permessi separati.
