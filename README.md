# AI Memoria Vault

**The personal, portable memory of your AI assistant.**

[English](README.md) | [Italiano](README.it.md)

AI Memoria Vault is an open-source project for carrying the memory and identity of your AI assistant/agent: user-selected memories, personality, style, a recognizable voice, and an avatar. The goal is to find the same assistant across devices and use different models without tying its memory to one provider.

> The repository includes an experimental local prototype that has not been reviewed or audited. Use synthetic data only; do not enter real personal data.

## What we want to build

- User-curated, categorized personal memory.
- A portable assistant profile: personality, instructions, boundaries, and preferences.
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

The [`app/`](app/) folder contains a local web prototype to create, search, edit, approve, archive, and delete memories; save personality and voice-identity settings; generate a local preview of relevant memories; and export/import an encrypted backup. The preview does not contact models or external services. The format does not depend on a model. Automatic sync, model adapters, actual avatar/voice-model portability, and multi-format import are not implemented yet.

On Windows, start a static server from the repository root:

```powershell
py -m http.server 8000
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
