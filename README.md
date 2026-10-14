# AI Memory Vault

**The personal, portable memory of your AI assistant.**

[English](README.md) | [Italiano](README.it.md)

![AI Memory Vault: personal memory carried across devices](assets/memory-vault-cover.png)

<p align="center"><strong>One personal memory. Your devices. Your choice of AI.</strong></p>

<p align="center"><a href="docs/platforms.md">Explore the platform plan</a> · <a href="https://github.com/Trikto7e8/AI-memory-vault/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22">Find a way to help</a> · <a href="https://github.com/Trikto7e8/AI-memory-vault/discussions">Join the discussion</a> · <a href="CONTRIBUTING.md">Contribute</a></p>

AI Memory Vault is an open-source project for keeping AI preferences and personal memories under the user's control, together with voice, personality, and behavior settings for the AI assistant they usually use. The memory is designed to work locally and accompany users across their devices, independently of the selected model. Users should be able to switch AI/LLM models without losing the memories in their vault or the familiarity they have built with their assistant. Future synchronization is designed to transfer encrypted data only, so the storage service cannot read its contents; automatic synchronization is not implemented yet.

> The repository includes an experimental local prototype that has not been reviewed or audited. Use synthetic data only; do not enter real personal data.

## Help build Memory Vault across platforms

AI Memory Vault is an independent, local memory project designed to stay with the user and, in the future, synchronize across their devices. The goal is user-controlled memory on Android phones and tablets, iPhone/iPad, Windows PCs, macOS, Linux, and compatible browsers.

**These are development targets, not a claim of tested support.** Today this repository contains a local browser prototype and reusable memory core. Native apps, store packages, automatic encrypted sync, and production-ready integrations remain work to do.

We welcome developers, device testers, accessibility contributors, translators, and security reviewers. Start with the [platform plan](docs/platforms.md), [help-wanted issues](https://github.com/Trikto7e8/AI-memory-vault/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22), or [Discussions](https://github.com/Trikto7e8/AI-memory-vault/discussions). A reproducible test report on one device is a useful contribution.

## What we want to build

- User-curated, categorized personal memory with AI preferences: context, vocal tone, personality and, in the future, avatar images and animations.
- The ability to change AI/LLM models without losing the memory or the sense of familiarity built with the assistant.
- A portable profile for the AI assistant, LLM, or agent the user usually works with: recognizable voice, personality, behavior, instructions, boundaries, and preferences.
- Optional, generic profile descriptions (including voice and avatar preferences) that other applications may read; voice synthesis, avatar rendering, and interaction belong to those applications.
- A format independent of models and providers, for local, free, or commercial models.
- Cross-device synchronization with end-to-end encryption, explicit device enrollment, and private keys kept under the user's control.
- A signed, conflict-aware revision history inspired by hash chains, without a public blockchain or public personal-data ledger.
- Local memory retrieval and remote sharing only after previewing and approving what is sent.
- Guided, local import from different assistant conversation-export formats.
- Open formats and documented interfaces so the community can contribute.

## Scope: a memory vault, not an assistant application

AI Memory Vault is a **standalone, model- and brand-neutral memory component**. It stores and exports user-approved memories and optional preference metadata.

## Privacy and assistant identity

Memory and profile stay on-device by default. Future sync must carry only encrypted packages; the service may still observe metadata such as size and timing. When a remote model is used, the request and approved data are sent in plaintext to the provider for processing: the UI must preview the exact text and ask for consent for that request only.

Optional voice settings are descriptive preferences for an external client: timbre, accent and pronunciation, language, pace, and engine identifiers. The local prototype stores timbre and accent in separate profile fields. It does not create, play, or manage a voice model or avatar. Any future exchange of private media assets with a separate client would need its own consent, security review, and storage design. Descriptions alone cannot reproduce a voice or render an avatar.

## Local prototype

The prototype automatically locks the vault after ten minutes without interaction and clears rendered form values. This reduces exposure on an unattended screen; it cannot guarantee erasure of every plaintext copy from browser process memory.

While unlocked, you can change the passphrase. The app re-encrypts the locally stored private-key envelope and leaves the vault data key and encrypted memory payload unchanged. Previously exported backups still require their original passphrase; export a fresh backup after changing it. This is not device-key rotation.

The [`app/`](app/) folder contains a local web prototype to create, search, edit, approve, archive, and delete text memories; save assistant personality and voice preferences; generate a local preview; and export/import an encrypted backup. It does not yet support voice notes or audio attachments. The preview does not contact models or external services. The format does not depend on a model. Automatic sync, model adapters, media asset portability, and multi-format import are not implemented yet. An animated avatar, voice playback, and the mobile assistant UI are outside this repository's scope.

From the repository root, start a static server. On Windows:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

On macOS or Linux, use Python 3:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

The `--bind 127.0.0.1` option restricts this development server to your own device (not the local network). Then open `http://127.0.0.1:8000/app/` on that same device. Do not expose this experimental prototype to other devices or the internet. The prototype encrypts the vault locally and its manual backup is portable, but it does not sync devices and reuses the same passphrase-protected key pair. Separate per-device keys and sync are described in [sync-protocol](docs/sync-protocol.md) as a design, not as operational features. Web Crypto has not been reviewed or audited: use synthetic data only and keep backups outside the repository.

## Documentation

The reusable runtime entry point is [`src/index.js`](src/index.js); [`src/index.ts`](src/index.ts) adds the sync contracts and an optional voice-related consent contract (not a speech engine). The core provides an encrypted vault session over a storage interface that handles encrypted-envelope bytes only. Atomic creation and compare-and-swap updates prevent two local sessions from silently overwriting each other. The reusable IndexedDB adapter is exported from the core and retains compatibility with envelopes saved by the earlier prototype. Memory operations and local retrieval are independent of any model. The browser prototype uses the same runtime entry point and requires no package installation.

- [Project vision](docs/vision.md)
- [Using the local vault core](docs/core-api.md)
- [Architecture](docs/architecture.md)
- [Threat model](docs/threat-model.md)
- [Vault, model, and search boundary](docs/provider-boundary.md)
- [Encrypted sync design](docs/sync-protocol.md)
- [Optional voice metadata and consent boundary](docs/voice-module.md)
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
