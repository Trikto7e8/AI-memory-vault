# AI Memory Vault

**Personal, portable memory for your AI assistant.**

[English](README.md) | [Italiano](README.it.md)

AI Memory Vault is an open-source project for keeping, under the user's control, AI preferences, personal memories, and voice notes, together with voice, personality, and behavior settings for the AI assistant they usually use. The memory is designed to work locally and travel with the user across devices, independently of the selected model. Users should be able to switch AI/LLM models without losing the memories kept in the vault or the sense of familiarity they have built with their assistant. Future synchronization is designed to transfer encrypted data only, so the storage service cannot read its contents; automatic synchronization is not implemented yet.

> The repository includes an experimental local prototype that has not been reviewed or audited. Use synthetic data only; do not enter real personal data.

## What we want to build

- User-curated, categorized personal memory, including AI preferences and personal voice notes.
- The ability to change AI/LLM models without losing the memory or the sense of familiarity built with the assistant.
- A portable profile for the assistant the user usually works with: recognizable voice, personality, behavior, instructions, boundaries, and preferences.
- A recognizable assistant identity: voice/timbre and avatar, carried with the profile.
- A format independent of models and providers, for local, free, or commercial models.
- Cross-device synchronization with end-to-end encryption, explicit device enrollment, and private keys kept under the user's control.
- A signed, conflict-aware revision history inspired by hash chains, without a public blockchain or public personal-data ledger.
- Local memory retrieval and remote sharing only after previewing and approving what is sent.
- Guided, local import from different assistant conversation-export formats.
- Open formats and documented interfaces so the community can contribute.

## Privacy and assistant identity

Memory and profile stay on-device by default. Future sync must carry only encrypted packages; the service may still observe metadata such as size and timing. When a remote model is used, the request and approved data are sent in plaintext to the provider for processing: the UI must preview the exact text and ask for consent for that request only.

Voice means the voice the assistant speaks with and its continuity across devices: timbre, accent and pronunciation, voice profile or private voice model, language, pace, and engine identifier. The local prototype stores timbre and accent as separate profile fields. Any voice model and avatar are separate, optional, encrypted private assets; creating or sharing them requires specific consent. A label or description alone cannot guarantee that different engines reproduce the same voice.

## Local prototype

The prototype automatically locks the vault after ten minutes without interaction and clears rendered form values. This reduces exposure on an unattended screen; it cannot guarantee erasure of every plaintext copy from browser process memory.

While unlocked, you can change the passphrase. The app re-encrypts the locally stored private-key envelope and leaves the vault data key and encrypted memory payload unchanged. Previously exported backups still require their original passphrase; export a fresh backup after changing it. This is not device-key rotation.

The [`app/`](app/) folder contains a local web prototype to create, search, edit, approve, archive, and delete text memories; save assistant personality and voice preferences; generate a local preview; and export/import an encrypted backup. It does not yet support voice notes or audio attachments. The preview does not contact models or external services. The format does not depend on a model. Automatic sync, model adapters, actual avatar/voice-model portability, and multi-format import are not implemented yet.

From the repository root, start a static server. On Windows:

```powershell
py -m http.server 8000
```

On macOS or Linux, use Python 3:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/app/`. The prototype encrypts the vault locally and its manual backup is portable, but it does not sync devices and reuses the same passphrase-protected key pair. Separate per-device keys and sync are described in [sync-protocol](docs/sync-protocol.md) as a design, not as operational features. Web Crypto has not been reviewed or audited: use synthetic data only and keep backups outside the repository.

## Documentation

The reusable runtime entry point is [`src/index.js`](src/index.js); [`src/index.ts`](src/index.ts) adds the sync contracts and the optional voice module with separate consent. The core provides an encrypted vault session over a storage interface that handles encrypted-envelope bytes only. Atomic creation and compare-and-swap updates prevent two local sessions from silently overwriting each other. The reusable IndexedDB adapter is exported from the core and retains compatibility with envelopes saved by the earlier prototype. Memory operations and local retrieval are independent of any model. The browser prototype uses the same runtime entry point and requires no package installation.

- [Project vision](docs/vision.md)
- [Using the local vault core](docs/core-api.md)
- [Architecture](docs/architecture.md)
- [Threat model](docs/threat-model.md)
- [Vault, model, and search boundary](docs/provider-boundary.md)
- [Encrypted sync design](docs/sync-protocol.md)
- [Voice identity continuity](docs/voice-module.md)
- [Roadmap](docs/roadmap.md)
- [Data schema](schemas/vault-snapshot-v1.schema.json)
- [Shared snapshot validator](src/core/snapshot-validation.js)
- [Reusable encrypted vault session](src/core/encrypted-vault.js)
- [Public runtime entry point](src/index.js)
- [Encrypted backup envelope schema](schemas/encrypted-envelope-v1.schema.json)
- [Reusable encrypted-envelope implementation](src/crypto/encrypted-envelope.js)

## Contributing

This is a prototype. Do not commit real memories, personal exports, backups, keys, voice samples, or voice models. Cryptography and sync changes need security review. Read [CONTRIBUTING](CONTRIBUTING.md).

## Status

Local web prototype and TypeScript core in development. AI adapters, automatic sync, multi-format import, and independent security audit remain incomplete. Do not use real personal data.
