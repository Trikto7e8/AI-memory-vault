# AI Memory Vault

**La memoria personale e portatile dell’assistente di IA.**

[English](README.md) | [Italiano](README.it.md)

AI Memory Vault è un progetto open source per custodire, sotto il controllo dell’utente, preferenze relative all’IA, ricordi personali e note vocali, insieme alle impostazioni di voce, personalità e comportamento dell’assistente di IA che usa abitualmente. La memoria è progettata per funzionare localmente e accompagnare l’utente sui suoi dispositivi, senza dipendere dal modello scelto. L’utente potrà cambiare modello di IA/LLM senza perdere i ricordi custoditi né la confidenza costruita con il proprio assistente. La futura sincronizzazione è progettata per trasferire solo dati cifrati, in modo che il servizio di archiviazione non possa leggerne i contenuti; la sincronizzazione automatica non è ancora implementata.

> Il repository include un prototipo locale sperimentale, non revisionato né sottoposto ad audit. Usa solo dati sintetici; non inserire dati personali reali.

## Aiutaci a sviluppare Memory Vault su più piattaforme

AI Memory Vault è un progetto di memoria indipendente: non richiede avatar, marchi di assistenti, modelli o fornitori specifici. L'obiettivo è una memoria controllata dall'utente su cellulari e tablet Android, iPhone/iPad, PC Windows, macOS, Linux e browser compatibili.

**Sono obiettivi di sviluppo, non piattaforme dichiarate già supportate.** Oggi il repository contiene un prototipo browser locale e un nucleo di memoria riutilizzabile. App native, pacchetti per gli store, sincronizzazione cifrata automatica e integrazioni pronte per la produzione restano da realizzare.

Cerchiamo sviluppatori, tester su dispositivi reali, contributi per accessibilità e traduzioni, revisori di sicurezza. Parti dal [piano multipiattaforma](docs/platforms.it.md), dalle [richieste di aiuto](https://github.com/Trikto7e8/AI-memory-vault/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) o dalle [Discussions](https://github.com/Trikto7e8/AI-memory-vault/discussions). Anche una prova riproducibile su un solo dispositivo è un contributo utile.

## Cosa vogliamo costruire

- Memoria personale categorizzata e curata dall’utente, con preferenze IA e note vocali personali.
- Possibilità per l’utente di cambiare modello di IA/LLM senza perdere la memoria né la confidenza costruita con il proprio assistente.
- Profilo portatile dell’assistente abitualmente usato: voce riconoscibile, personalità, comportamento, istruzioni, limiti e preferenze.
- Descrizioni generiche e facoltative del profilo (incluse preferenze di voce e avatar) utilizzabili da altre applicazioni; sintesi vocale, rendering dell'avatar e interazione spettano a tali applicazioni.
- Formato indipendente da modelli e fornitori, per usare modelli locali, gratuiti o commerciali.
- Sincronizzazione tra dispositivi con cifratura end-to-end, associazione esplicita dei dispositivi e chiavi private che restano sotto il controllo dell'utente.
- Storico firmato delle revisioni, ispirato alle catene di hash e capace di conservare i conflitti, senza blockchain pubblica né registro pubblico di dati personali.
- Ricerca locale dei ricordi e condivisione remota solo dopo aver mostrato e approvato cosa viene inviato.
- Importazione guidata e locale da formati di esportazione di assistenti diversi.
- Formato aperto e interfacce documentate, così che la comunità possa contribuire.

## Ambito: un archivio di memoria, non un'app assistente

AI Memory Vault è un **componente autonomo di memoria, indipendente da modelli e marchi**. Conserva ed esporta ricordi approvati dall'utente e metadati facoltativi delle preferenze; non realizza un assistente mobile, un avatar sullo schermo, sintesi o clonazione vocale né una chat connessa a un LLM. Queste funzioni appartengono ad applicazioni client separate, che potranno integrare il vault soltanto tramite interfacce esplicite e consenso. Non è richiesto alcun assistente o personaggio specifico.

## Privacy e identità dell'assistente

Nel profilo vocale del prototipo, timbro e accento/pronuncia sono campi distinti.

La memoria e il profilo rimangono sul dispositivo per impostazione predefinita. La sincronizzazione futura dovrà trasportare solo pacchetti cifrati; il servizio potrà comunque osservare metadati come dimensioni e tempi. Quando si usa un modello remoto, la richiesta e i dati approvati vengono trasmessi in chiaro al fornitore per l'elaborazione: la schermata dovrà mostrare il testo esatto e chiedere un consenso valido per quella sola richiesta.

Le impostazioni vocali facoltative sono preferenze descrittive per un client esterno: timbro, accento e pronuncia, lingua, ritmo e identificativi del motore. Il prototipo locale conserva timbro e accento in campi distinti. Non crea, riproduce né gestisce modelli vocali o avatar. Un eventuale scambio futuro di asset multimediali privati con client separati richiederebbe consenso specifico, revisione di sicurezza e un progetto di archiviazione dedicato. Le sole descrizioni non riproducono una voce né visualizzano un avatar.

## Prototipo locale

Il prototipo blocca automaticamente il vault dopo dieci minuti senza interazioni e svuota i campi visualizzati. Riduce il rischio su una schermata lasciata incustodita, ma non garantisce la cancellazione di ogni copia in chiaro dalla memoria del processo del browser.

Con il vault sbloccato puoi cambiare passphrase. L'app ricifra l'involucro locale della chiave privata, lasciando invariati la chiave dati e il payload cifrato dei ricordi. I backup esportati in precedenza continuano a richiedere la passphrase originale: esporta un nuovo backup dopo il cambio. Questa operazione non ruota le chiavi dei dispositivi.

La cartella [`app/`](app/) contiene un prototipo web locale per creare, cercare, modificare, approvare, archiviare ed eliminare ricordi testuali, salvare preferenze di personalità e voce dell'assistente, generare un'anteprima locale ed esportare/importare un backup cifrato. Non supporta ancora note vocali o allegati audio. L'anteprima non contatta modelli o servizi esterni. Il formato non dipende da un modello. Non sono ancora implementati la sincronizzazione automatica, gli adattatori ai modelli, la portabilità di asset multimediali o l'importazione multi-formato. L'avatar animato, la riproduzione vocale e l'interfaccia mobile dell'assistente sono fuori dall'ambito di questo repository.

Dalla cartella principale del repository, avvia un server statico. Su Windows:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Su macOS o Linux, usa Python 3:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

L'opzione `--bind 127.0.0.1` limita il server di sviluppo al dispositivo in uso (non alla rete locale). Apri poi `http://127.0.0.1:8000/app/` sullo stesso dispositivo. Non esporre questo prototipo sperimentale ad altri dispositivi o a Internet. Il prototipo cifra localmente il vault e il backup manuale è trasferibile, ma non sincronizza i dispositivi e riusa la stessa coppia di chiavi protetta da passphrase. La coppia distinta per ogni dispositivo e la sync sono descritte come progetto in [sync-protocol](docs/sync-protocol.it.md), non sono funzioni operative. Web Crypto non è stata revisionata né sottoposta ad audit: usa solo dati sintetici e tieni i backup fuori dal repository.

## Documentazione

L'ingresso runtime riutilizzabile è [`src/index.js`](src/index.js); [`src/index.ts`](src/index.ts) aggiunge i contratti di sync e un contratto facoltativo di consenso relativo alla voce (non un motore di sintesi). Il nucleo offre una sessione di vault cifrata sopra un'interfaccia di archivio che riceve e salva solo byte dell'involucro cifrato. Creazione atomica e aggiornamenti compare-and-swap impediscono a due sessioni locali di sovrascriversi in silenzio. L'adattatore IndexedDB riutilizzabile è esportato dal nucleo e mantiene la compatibilità con gli involucri salvati dal prototipo precedente. Le operazioni sui ricordi e il recupero locale non dipendono da un modello. Il prototipo browser usa lo stesso ingresso runtime e non richiede installazioni di pacchetti.

- [Visione](docs/vision.it.md)
- [Uso del nucleo locale del vault](docs/core-api.it.md)
- [Architettura](docs/architecture.it.md)
- [Modello delle minacce](docs/threat-model.it.md)
- [Confine tra vault, modelli e ricerca](docs/provider-boundary.it.md)
- [Progetto di sincronizzazione cifrata](docs/sync-protocol.it.md)
- [Metadati vocali facoltativi e confine del consenso](docs/voice-module.it.md)
- [Roadmap](docs/roadmap.it.md)
- [Schema dati](schemas/vault-snapshot-v1.schema.json)
- [Validatore condiviso dello snapshot](src/core/snapshot-validation.js)
- [Sessione condivisa di vault cifrata](src/core/encrypted-vault.js)
- [Ingresso runtime pubblico](src/index.js)
- [Schema dell'involucro del backup cifrato](schemas/encrypted-envelope-v1.schema.json)
- [Implementazione riutilizzabile dell'involucro cifrato](src/crypto/encrypted-envelope.js)

## Contribuire

Il progetto è in fase di prototipo. Non caricare nel repository ricordi reali, esportazioni personali, backup, chiavi, campioni o modelli vocali. Le modifiche a crittografia e sincronizzazione richiedono revisione di sicurezza. Leggi [CONTRIBUTING](CONTRIBUTING.it.md).

## Stato

Prototipo web locale e nucleo TypeScript in sviluppo. Mancano adattatori AI, sincronizzazione automatica, importatore multi-formato e audit indipendente. Non usare dati personali reali.
