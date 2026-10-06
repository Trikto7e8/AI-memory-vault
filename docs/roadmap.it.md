# Bozza di roadmap

[English](roadmap.md) | [Italiano](roadmap.it.md)

Questa è una proposta da discutere, non una promessa di date di consegna.

## 0. Concordare i confini

- Confermare lo scopo del progetto e il rapporto con Solphivia.
- Concordare le prime categorie di memoria e la regola per cui l’utente rivede i suggerimenti prima che diventino ricordi permanenti.
- Pubblicare il modello delle minacce e definire cosa significa e cosa non significa cifratura end-to-end.
- Scegliere licenza open source e processo di contribuzione.
- Decidere piattaforme supportate e cosa significhi “portabile” nella prima versione.

## 1. Modello dei dati locali

- Definire uno schema versionato per ricordi, provenienza, date, preferenze dell’utente e impostazioni di comportamento.
- Specificare revisione, correzione, cancellazione e conservazione dei ricordi.
- Prototipare la prova “salva un progetto, recuperalo in una nuova conversazione, esaminalo e correggilo”.
- Creare dati di esempio sintetici e regole di migrazione.

## 2. Vault locale

- Scegliere una libreria crittografica consolidata e scrivere un progetto crittografico verificabile.
- Implementare creazione, sblocco, blocco, esportazione, importazione, backup e recupero locali.
- Verificare che segreti e contenuti privati non finiscano in log, telemetria o rapporti di arresto anomalo.
- Ottenere una revisione di sicurezza indipendente prima di usare dati personali reali.

## 3. Portabilità e sincronizzazione

- Definire il trasferimento cifrato del vault tra dispositivi.
- Progettare registrazione e revoca dei dispositivi, gestione dei conflitti, backup e recupero.
- Tenere le chiavi di decifratura fuori dal servizio di sincronizzazione e documentare i metadati residui.

## 4. Integrazioni con assistenti

- Definire un’interfaccia con permessi per recuperare ricordi selezionati.
- Mantenere il recupero locale disponibile senza rete.
- Mostrare il contesto esatto e la destinazione prima di inviare dati a un fornitore esterno di modelli o ricerca.
- Aggiungere, dove praticabile, integrazioni con modelli e ricerca locali.

## 5. Audio

- Separare registrazioni, trascrizioni, preferenze e dati vocali derivati nello schema.
- Preferire elaborazione locale e rendere visibili le scelte di conservazione.
- Richiedere un consenso separato per l’uso dell’identità vocale o la generazione della voce.
