# Modulo di continuità dell'identità vocale

[English](voice-module.md) | [Italiano](voice-module.it.md)

Questo modulo riguarda la voce con cui parla l'assistente: l'obiettivo è portarne timbro, voce riconoscibile e avatar tra dispositivi e modelli. Le note vocali personali sono invece ricordi dell'utente; il prototipo non archivia note vocali né modelli vocali.

## Dati di identità e asset distinti

Nel profilo portatile, timbro e preferenze per accento e pronuncia sono memorizzati separatamente.

- Il profilo può conservare lingua, timbro/descrizione, ritmo, ID stabile della voce e dell'engine, nome e descrizione dell'assistente.
- Avatar e modello vocale sono asset separati dal profilo e dai ricordi. Per essere portabili devono essere cifrati nel vault e trasferiti solo a dispositivi autorizzati.
- Etichette e descrizioni non assicurano la stessa voce: la continuità reale può richiedere un modello vocale compatibile che il dispositivo sappia eseguire.
- Il prototipo attuale memorizza solo preferenze descrittive; non archivia né genera un modello vocale o un avatar.

## Condizioni per un futuro motore vocale

- Funzione facoltativa e disattivata inizialmente.
- Usare voci proprie, con permesso esplicito della persona rappresentata, o modelli sintetici con licenza compatibile. Il consenso all'uso della voce è distinto dal consenso a usare i ricordi.
- Mostrare engine, luogo di elaborazione, finalità e dati/asset selezionati; elaborazione locale come impostazione preferita.
- Decifrare il campione solo dopo il consenso. Se il motore è remoto, i byte del campione lasciano il dispositivo in chiaro per l'elaborazione; i dettagli della base giuridica e la finalità restano locali.
- Passare al motore i vincoli espliciti `allowTraining: false` e `allowRetentionAfterJob: false`. Questi flag non possono obbligare un fornitore remoto a rispettarli: usare un fornitore le cui condizioni e configurazione supportino i requisiti di mancato addestramento e conservazione dell'utente.
- Nessun invio remoto o addestramento con un asset privato senza consenso separato, specifico e revocabile.
- Cifrare nel vault il modello restituito prima di conservarlo; cancellare dalla memoria temporanea i buffer in chiaro appena possibile.
- Consentire revoca e cancellazione dell'asset, indicando chiaramente che non si possono richiamare copie già scaricate o già ricevute da un servizio.

Il contratto TypeScript iniziale è in `src/voice/`. Il gate richiede un consenso monouso, a breve scadenza, legato al motore, al campione selezionato, alla lingua, alla descrizione vocale e al luogo di elaborazione. Ogni tentativo di usare il consenso lo consuma, anche se la destinazione non corrisponde; per riprovare serve una nuova conferma esplicita. Nessun motore è collegato.
