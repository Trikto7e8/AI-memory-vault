# Project vision

[English](vision.md) | [Italiano](vision.it.md)

## Purpose

Memoria Vault is a user-owned memory layer for personal assistants. It stores facts the user chooses to remember, preferences that shape the assistant's behavior, and optionally voice notes or other media. The same vault should be usable by different assistant applications over time.

The intended experience is a personal assistant that feels familiar because the person carries their own memory and settings with them—not because a provider silently accumulates a profile. The first proof should be small: save one project, start a fresh conversation, retrieve the right context, and let the user inspect and correct what was recalled.

## Relationship to Solfivia

Memoria Vault should be designed as an independent component with documented interfaces. Solfivia may be its first integration, but the vault's format and core should not depend on Solfivia or any one model provider.

## Memory is user-governed

The user decides what becomes a memory, can correct it, can see its source and age, and can remove it. The design should support temporary context as well as durable memories, so a one-time conversation does not automatically become part of a lasting profile.

Behavior and personality settings are data the user controls: tone, preferred level of detail, boundaries, language preferences, and other choices. They should remain distinct from factual memories so users can edit or reset each independently.

## A useful first set of categories

Categories should help people find and govern memories, not turn the user's life into a hidden profile. A starting set to test is:

- **Projects:** goals, status, decisions, open questions, and next steps.
- **Ideas:** concepts and experiments the user wants to keep.
- **Preferences:** language, tone, accessibility, and working preferences.
- **People and relationships:** only information the user deliberately chooses to retain.
- **Reference knowledge:** facts and documents the user wants available later.
- **Conversation continuity:** short-lived context with a clear expiry or promotion action.
- **Voice and media:** recordings, transcripts, and user-selected derived notes, kept as distinct data types.

Each memory should carry provenance (where it came from), a timestamp, and a user-visible confidence or status where useful. The user should be able to choose categories, create their own, and decide what the assistant can retrieve in each context. Automatic extraction should always be reviewable before it becomes durable memory.

## Data portability

The vault should have a documented, versioned format with stable identifiers and migration rules. Import and export should work without an account or server. Importers should preview their findings and let the user choose what to keep.

An OpenAI data export is a possible first import source. The project should not assume a particular export schema until a sample is provided and its formats are inspected. An importer should run locally and should not forward the export or its contents to an external service.

## Voice and audio

Voice traces may include recordings, transcripts, voice preferences, or other user-created audio. The product must distinguish these data types and explain where processing happens. Raw recordings should not be retained by default when a derived transcript or setting is enough. Any voice model or voice cloning feature would need separate, explicit consent and careful abuse controls.

## External services

Search and model providers can be useful, but a request containing private memories is a disclosure. The interface should make that disclosure concrete: identify the destination and preview the exact context that will leave the device. The user should be able to make a one-time choice without changing the default for future requests.

For public web search, the preferred path is to send a query that does not include private memories, then compare returned public results with local memories on the device. If personalization requires sharing private context, the app must preview exactly what will be sent and ask for an explicit, one-time choice.

An encrypted vault cannot hide plaintext from an external provider after the user sends it there. The project must not describe that flow as end-to-end private.

## Candidate local-first topology

Earlier Solphivia discussions considered a local memory service on a notebook that a phone could reach, as well as local models and document tools. These are useful integration ideas, not fixed dependencies. The portable vault should remain usable on one device without a server; optional device-to-device sync can be added later, and any relay or server should only receive ciphertext.

## Non-goals for the first milestone

- Building or training a foundation model.
- Automatically recording or inferring memories from every conversation.
- A cloud account that can recover the user's vault without their key or recovery material.
- Claiming protection from malware or a compromised, unlocked device.
- Sending private memories to a provider without a clear, per-use user choice.
