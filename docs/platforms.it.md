# Sviluppo multipiattaforma

[English](platforms.md) | [Italiano](platforms.it.md)

## Regola del progetto

Memory Vault è un livello di memoria indipendente e locale. Formato, cifratura, importazione/esportazione e consenso devono funzionare senza dipendere da avatar, prodotti di assistenza, modelli o fornitori. I comportamenti specifici dei client appartengono ad adattatori facoltativi. Questa regola guida le decisioni e la revisione delle integrazioni.

## Percorso per piattaforma

| Destinazione | Evidenze attuali | Aiuto richiesto / prossimo traguardo |
| --- | --- | --- |
| Cellulari e tablet Android | Fattibilità nella issue #5; nessuna release nativa | Provare persistenza browser e backup cifrato, poi proporre client nativo indipendente o adattatore di archiviazione |
| iPhone e iPad (iOS/iPadOS) | Nessuna matrice dispositivi validata o release nativa | Valutare percorso locale browser/nativo, import/export file, cancellazione automatica dello storage, blocco e accessibilità |
| PC Windows | Avvio locale Python documentato; nessun pacchetto desktop | Test browser riproducibili, file cifrati e proposta di distribuzione desktop indipendente |
| macOS | Guide integrate con #4/#6; verifica reale pendente in #3 | Verificare ciclo di vita browser e backup cifrato; valutare pacchetti desktop e custodia delle chiavi |
| Linux | Guide integrate con #4/#6; verifica reale pendente in #3 | Testare distribuzioni/browser scelti; documentare pacchetti desktop e persistenza |
| Browser compatibili / web | Prototipo web locale e nucleo riutilizzabile esistenti | Matrice basata su prove; migliorare tastiera, lettori di schermo e schermi piccoli |

Sono benvenute proposte per altre piattaforme. Non dichiariamo disponibilità su App Store, Google Play, installer desktop o compatibilità universale. La distribuzione va scelta dopo una proposta di fattibilità; il formato comune resta indipendente dalla piattaforma.

## Verifiche comuni

Usare dati sintetici e annotare versioni di sistema/browser, data, passaggi ed errori. Non allegare ricordi reali, esportazioni personali, identificativi dei dispositivi o credenziali.

- [ ] Creare, sbloccare e bloccare il vault; verificare la passphrase errata.
- [ ] Creare, cercare, modificare, approvare, archiviare ed eliminare ricordi sintetici.
- [ ] Verificare blocco per inattività, background/ripresa e riavvio.
- [ ] Esportare un backup cifrato, importarlo in un secondo ambiente e confrontare i ricordi sintetici.
- [ ] Cambiare passphrase e verificare vecchi/nuovi backup, distinguendo l'operazione dalla rotazione delle chiavi del dispositivo.
- [ ] Documentare limiti, cancellazione dello storage e recupero; escludere contenuti privati dai log.
- [ ] Provare tastiera, lettore di schermo, focus, zoom e schermi piccoli.
- [ ] Verificare assenza di invii involontari di memoria; future chiamate esterne richiedono anteprima esatta e consenso per la singola richiesta.

Il trasferimento di backup prova la portabilità manuale, non la sincronizzazione automatica. Custodia nativa delle chiavi e registrazione dei dispositivi richiedono progettazione e revisione; il prototipo riutilizza la coppia di chiavi del backup.

## Lavoro oltre i client

1. Stabilizzare schemi versionati, migrazioni e dati sintetici per interoperabilità.
2. Importazione locale guidata delle conversazioni con provenienza, duplicati e approvazione.
3. Registrazione dei dispositivi, sync cifrata, conflitti, revoca e recupero da implementare e revisionare.
4. Adattatori facoltativi per modelli locali/remoti senza vincolare i ricordi al modello.
5. Note audio personali cifrate e metadati facoltativi delle preferenze separati dai motori multimediali.

Il prototipo resta sperimentale e senza audit indipendente. Un traguardo richiede prove pubblicate, non solo una build riuscita. Vedi [roadmap](roadmap.it.md) e [contributi](../CONTRIBUTING.it.md).

## Continuità tra dispositivi

Il profilo portatile dell’assistente IA, LLM o agente abitualmente usato raccoglie preferenze di contesto, tono vocale, personalità, comportamento, istruzioni e limiti. Può includere descrizioni generiche e facoltative relative alla voce e all’avatar; immagini dell’avatar e preferenze di animazione future richiedono un progetto di estensione e compatibilità. Conservare una preferenza non significa implementare sintesi vocale, rendering o animazioni: queste funzioni spettano ai client esterni. La memoria resta indipendente da modelli, fornitori e avatar specifici.

L’obiettivo è accompagnare sempre l’utente, con una futura sincronizzazione cifrata tra dispositivi autorizzati. Oggi il trasferimento avviene tramite backup manuale cifrato. Le prove multipiattaforma devono verificare la conservazione dei ricordi e dei campi del profilo già supportati, senza dichiarare operative le future immagini o animazioni.
