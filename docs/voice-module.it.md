# Metadati vocali facoltativi e confine del consenso

[English](voice-module.md) | [Italiano](voice-module.it.md)

Questo contratto facoltativo descrive preferenze relative alla voce e confini del consenso per client esterni. AI Memory Vault non è un'app di sintesi o clonazione vocale, né un avatar o un assistente mobile. Le note vocali personali sarebbero ricordi dell'utente; il prototipo attuale non archivia audio né modelli vocali.

## Dati di identità e asset distinti

Nel profilo portatile, timbro e preferenze per accento e pronuncia sono memorizzati separatamente.

- Il profilo può conservare lingua, timbro/descrizione, ritmo, ID stabile della voce e dell'engine, nome e descrizione dell'assistente.
- Avatar e modello vocale sono asset separati dal profilo e dai ricordi. Per essere portabili devono essere cifrati nel vault e trasferiti solo a dispositivi autorizzati.
- Etichette e descrizioni non assicurano la stessa voce: la continuità reale può richiedere un modello vocale compatibile che il dispositivo sappia eseguire.
- Il prototipo attuale memorizza solo preferenze descrittive; non archivia né genera un modello vocale o un avatar.

## Condizioni per un client vocale esterno

- Funzione facoltativa e disattivata inizialmente.
- Usare voci proprie, con permesso esplicito della persona rappresentata, o modelli sintetici con licenza compatibile. Il consenso all'uso della voce è distinto dal consenso a usare i ricordi.
- Mostrare engine, luogo di elaborazione, finalità e dati/asset selezionati; elaborazione locale come impostazione preferita.
- Decifrare il campione solo dopo il consenso. Se il motore è remoto, i byte del campione lasciano il dispositivo in chiaro per l'elaborazione; i dettagli della base giuridica e la finalità restano locali.
- Passare al motore i vincoli espliciti `allowTraining: false` e `allowRetentionAfterJob: false`. Questi flag non possono obbligare un fornitore remoto a rispettarli: usare un fornitore le cui condizioni e configurazione supportino i requisiti di mancato addestramento e conservazione dell'utente.
- Nessun invio remoto o addestramento con un asset privato senza consenso separato, specifico e revocabile.
- Cifrare nel vault il modello restituito prima di conservarlo; cancellare dalla memoria temporanea i buffer in chiaro appena possibile.
- Consentire revoca e cancellazione dell'asset, indicando chiaramente che non si possono richiamare copie già scaricate o già ricevute da un servizio.

Il contratto TypeScript facoltativo per il consenso è in `src/voice/`. Non implementa un motore né il rendering di avatar. Il gate richiede un consenso monouso, a breve scadenza, legato al motore, al campione selezionato, alla lingua, alla descrizione vocale e al luogo di elaborazione. Ogni tentativo di usare il consenso lo consuma, anche se la destinazione non corrisponde; per riprovare serve una nuova conferma esplicita. Nessun motore è collegato.
