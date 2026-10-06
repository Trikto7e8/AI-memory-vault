# Visione del progetto

[English](vision.md) | [Italiano](vision.it.md)

## Scopo

AI Memory Vault è un progetto aperto per custodire, sotto il controllo dell’utente, preferenze relative all’IA, ricordi personali e note vocali, insieme alle impostazioni di voce, personalità e comportamento dell’assistente di IA che usa abitualmente. La memoria è progettata per funzionare localmente e accompagnare l’utente sui suoi dispositivi, senza dipendere dal modello scelto. L’utente potrà cambiare modello LLM/IA senza perdere i ricordi conservati né la confidenza costruita con il proprio assistente. La futura sincronizzazione è progettata per trasferire solo dati cifrati, in modo che il servizio di archiviazione non possa leggerne i contenuti; non è ancora implementata.

La prova centrale è semplice: salvo un progetto e le mie preferenze, apro una nuova sessione su un altro dispositivo e con un altro modello, ritrovo il contesto pertinente e posso verificare, correggere o cancellare ciò che è stato recuperato.

## Memoria e personalità sotto il controllo dell'utente

L'utente decide cosa diventa un ricordo, ne vede provenienza e data, e può correggere, far scadere o cancellare ogni elemento. Il contesto temporaneo non diventa automaticamente memoria permanente. Le impostazioni della personalità — tono, stile, limiti, lingua e regole — si modificano indipendentemente dai ricordi fattuali.

Le categorie servono a organizzare, non a costruire profili nascosti: progetti, idee, preferenze, persone e relazioni scelte dall'utente, conoscenze di riferimento e continuità temporanea. Ogni suggerimento estratto da una conversazione resta in revisione finché l'utente non lo approva.

## Identità persistente dell'assistente

Il profilo deve poter trasportare un'identità coerente: nome, descrizione, personalità, stile, voce/timbro, avatar e identificativi compatibili con i motori installati. Una descrizione vocale aiuta, ma non basta a riprodurre la stessa voce. Per mantenere il timbro tra dispositivi può servire un modello vocale privato cifrato, installato localmente o sincronizzato come asset cifrato quando l'utente lo autorizza.

Le note vocali personali sono ricordi dell’utente; le impostazioni di timbro e il modello vocale descrivono invece la voce con cui parla l’assistente. Sono contenuti distinti. Il prototipo attuale non archivia note vocali né modelli vocali. Un eventuale modello vocale/clonato e le immagini/avatar sono asset separati dai record di memoria, facoltativi e soggetti a consenso, diritti, cifratura, sincronizzazione e cancellazione specifici. Nessun asset viene caricato o usato per addestramento senza autorizzazione esplicita.

## Indipendenza dai modelli e portabilità

Lo schema della memoria, le impostazioni dell'assistente e il meccanismo di sincronizzazione non dipendono da un singolo LLM o provider. Gli adattatori traducono il profilo nel formato necessario al modello scelto. Le capacità variano: un modello potrebbe non rispettare alcune preferenze o non supportare una certa voce, ma il profilo portatile rimane dell'utente.

Importazione ed esportazione sono locali e versionate. Gli importatori mostrano un'anteprima e permettono di scegliere cosa conservare. La sincronizzazione tra dispositivi usa cifratura end-to-end con coppie di chiavi per dispositivo; il servizio di trasporto non deve poter decifrare i contenuti. Finché protocollo, chiavi, recupero e revoca non sono implementati e revisionati, la sync resta un obiettivo progettuale.

## Ricerca e modelli esterni

La memoria viene cercata sul dispositivo. Per interrogare il web, il client mostra la query esatta e invia solo la parte pubblica/sanificata approvata, senza allegare automaticamente i ricordi; i risultati vengono confrontati localmente. Qualunque invio di ricordi a un modello o servizio remoto richiede una schermata con destinatario e testo esatto e un consenso per quella singola richiesta. Una volta inviati, quei dati sono visibili al servizio per l'elaborazione: il vault non può mantenerli end-to-end privati.

## Obiettivi iniziali

- Un nucleo locale persistente e categorizzato.
- Preferenze IA e note vocali personali conservate localmente e sotto il controllo dell’utente.
- Un profilo portatile di personalità e identità dell'assistente.
- Backup cifrato trasferibile e sync cifrata multi-dispositivo dopo revisione.
- Adattatori intercambiabili per modelli locali o remoti con approvazione esplicita.
- Asset vocali/avatar privati, facoltativi e distinti dalla memoria.
- Importazione locale e revisionabile da diversi formati.

Il repository contiene un prototipo sperimentale; non è stato sottoposto ad audit e non va usato con dati personali reali.
