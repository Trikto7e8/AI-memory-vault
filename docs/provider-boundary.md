# Vault, identity, model, and search boundary

[English](provider-boundary.md) | [Italiano](provider-boundary.it.md)

This specification describes how memory and assistant identity can remain user-owned while devices or models change. The prototype can generate a local preview of relevant memories. Controls for connecting models and remote adapters are not implemented yet.

## Components

1. **Personal vault:** AI preferences, categorized memories (including future personal voice notes), and a portable profile for the assistant the user usually works with, encrypted while locked.
2. **Context gate:** retrieves relevant memories locally and shows them before sharing.
3. **Model adapter:** translates the request for the selected model. The core passes it no keys or vault handle, but this is an API boundary, not a sandbox: code loaded in the same JavaScript origin can still use ambient browser APIs. Only trusted adapters may run there; a future provider integration needs a genuinely isolated execution boundary and a narrow, consent-bound message channel before claiming technical confinement.
4. **Sync transport:** eventually exchanges encrypted packages between authorized devices.
5. **Identity adapters:** connect the portable profile to available voice/avatar engines. They do not own memory.

The format is independent of models and providers. A free model may still process data on remote servers; the app must show where inference happens before sending anything.

## Procedure for every AI request

1. The model asks the gate for context needed for a stated purpose; it cannot browse the vault.
2. Local retrieval selects approved, unexpired records and excludes sensitive items by default. The preview currently available in the app does not call a model or external service; it displays relevant memories on-device only. A future model request will not be able to request sensitive records; only a separate local user-controlled option may add them to a preview for approval.
3. When a local model is connected, only the selected subset may be passed to the on-device process. The current prototype does not include a local model.
4. With a remote model, the UI shows the destination and exact request/context text.
5. The user can edit the request and each selected memory excerpt, then approves or declines for that request only; consent does not become permanent. This may also include selected personality fields shown in the same preview.
6. The single-use grant expires after five minutes and is frozen and bound to the specific adapter. The runner sends the model only the purpose, approved request, selected profile fields, and memory excerpt titles/text; memory IDs, approval ID and time, and other internal metadata stay local. The model does not receive voice/avatar asset IDs. A local log stores at most the destination, selected field names, and decision, not private content.

When text or memories are sent to a remote service, that service receives them in plaintext for processing. Vault encryption protects stored data, not data deliberately transmitted.

## External search without sending memories

The client creates a public query without automatically adding private data, previews the exact query, and asks before sending it. A query itself can reveal personal details. Public results are compared with memories on-device; memory content stays local. The user may choose to include excerpts, but sees and explicitly approves them.

## Assistant identity and voice

The portable profile includes personality and preferences, not just instructions for one model. Name, description, avatar, timbre, language, pace, and voice/engine ID make up assistant identity. Each adapter translates settings according to available capabilities; the same description does not guarantee identical output.

Personal voice notes are the user's memories, but the prototype does not store voice notes or audio attachments. Samples used to create or adapt the assistant's voice are different assets: they are never collected automatically and require separate rights and consent. A personal voice model or avatar is distinct from both memories and voice notes; portability requires encryption, authorized sync, and specific consent.

## Sync and visible data

Each authorized device must have distinct key pairs for encryption and signing. The server receives only encrypted packages and documented technical metadata (sizes, timing, frequency, and routing identifiers). Device enrollment, revocation, and conflicts are specified in [sync protocol](sync-protocol.md); automatic sync does not exist yet.

## Limits

An unlocked device, compromised operating system, malicious app, or hostile extension can expose plaintext. Do not claim end-to-end protection for features that are not implemented and reviewed.
