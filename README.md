# Memoria Vault

**A portable, personal memory vault for assistants.**

[English](README.md) | [Italiano](README.it.md)

Memoria Vault is an open project for keeping personal memories, preferences, voice notes, and assistant behavior under the person's control. The vault is designed to work locally, travel between a person's devices, and synchronize without giving a storage provider readable access to its contents.

It may later serve as a personal-assistant module for Solfivia, while remaining useful as an independent project.

> This repository currently describes the project and its security goals. It is not yet an implemented or audited encryption product. Do not put real personal data in it.

## What we want to build

- A local-first vault containing user-curated memories, preferences, and assistant-personality settings.
- Categorized memories with source, date, confidence, and user controls to review, correct, expire, or delete them.
- Encrypted export and import, so the user can move the vault between devices.
- Optional synchronization where the sync service stores ciphertext and cannot decrypt vault contents.
- A clear boundary between private vault data and information sent to an external model or search service.
- Local retrieval that can match private memories against public search results on-device, without sending the memories themselves.
- User-controlled voice notes and audio traces, with local processing as the default.
- An open format and documented interfaces so other people and projects can contribute.

## Privacy promise we are aiming for

Encryption at rest and encrypted sync do not make every use of the vault end-to-end private. If a user chooses to send a memory as context to an external model or search provider, that selected content leaves the device and becomes subject to that provider's handling. The first version should therefore keep personal context local by default, show what would be shared, and require an explicit choice before sending it.

The project must document what each component can see: the device, the app, the sync provider, and any external model or search provider. We should make privacy claims only after the implementation and threat model support them.

## Initial scope

The first milestone is a small local vault with:

1. A documented, versioned data format for memories and behavior preferences.
2. Local create, read, edit, delete, export, and import flows.
3. Encryption and key recovery designed before storing real data.
4. A privacy boundary for integrations, with no automatic upload of vault contents and on-device matching of public results where possible.
5. An import path that lets the user inspect and select data from an OpenAI data export; importing is local and never uploads the archive.

Voice recording, speech recognition, voice generation, multi-device sync, and external model/search integrations should follow only after the data and key model is reviewed.

## Design principles

- **The person owns the vault.** The user can inspect, edit, export, delete, and move their data.
- **Local first.** Reading and editing memories should not require a network connection.
- **Private by default.** Sync carries encrypted data; external requests carry no personal context unless the user chooses it.
- **Small, explicit sharing.** Show the exact memories or excerpts selected for any external request.
- **Portable, open formats.** Avoid tying the vault to one model, provider, device, or company.
- **Honest security.** Document metadata that remains visible, recovery trade-offs, and limits when a device or app is compromised.
- **Consent for voice data.** Audio and voice-derived data are sensitive; recording and use should be visible, revocable, and controlled by the person represented.

## Contributing

The project is at the proposal stage. Before accepting implementation contributions, we will publish a threat model, data schema, cryptographic design, and contribution guide. Security-sensitive changes should be reviewed by people with relevant expertise.

See [the project vision](docs/vision.md), [architecture notes](docs/architecture.md), and [security principles](docs/security-principles.md).

## Status

Early concept and repository scaffold. No application code, cryptography, synchronization protocol, or security audit is present yet.
