# Voice identity continuity module

[English](voice-module.md) | [Italiano](voice-module.it.md)

This module concerns the voice the assistant speaks with: the goal is to carry its timbre, recognizable voice, and avatar across devices and models. Personal voice notes are the user's memories; the prototype does not store voice notes or voice models.

## Identity settings and separate assets

The portable profile stores timbre separately from accent and pronunciation preferences.

- The profile can store language, timbre/description, pace, stable voice and engine IDs, assistant name, and description.
- Avatar and voice model are assets separate from the profile and memories. To be portable, they must be encrypted in the vault and transferred only to authorized devices.
- Labels and descriptions cannot guarantee the same voice; actual continuity may require a compatible voice model that the device can run.
- The current prototype stores descriptive preferences only; it does not store or generate a voice model or avatar.

## Requirements for a future voice engine

- Optional and disabled by default.
- Use voices owned by the user, with explicit permission from the represented person, or synthetic models under a compatible license. Voice-use consent is separate from consent to use memories.
- Show the engine, processing location, purpose, and selected data/assets; prefer local processing.
- Decrypt the sample only after consent. With a remote engine, sample bytes leave the device in plaintext for processing; rights-basis and purpose details stay local.
- Pass the engine explicit `allowTraining: false` and `allowRetentionAfterJob: false` constraints. These request flags cannot force a remote provider to comply; use a provider whose terms and configuration support the user's no-training and no-retention requirements.
- No remote transfer or training with a private asset without separate, specific, revocable consent.
- Encrypt the returned model in the vault before storage; clear plaintext buffers as soon as practical.
- Allow revocation and asset deletion, and clearly state that copies already downloaded or received by a service cannot be recalled.

The initial TypeScript contract is in `src/voice/`. The gate requires a short-lived, single-use consent bound to the engine, selected sample, language, voice description, and processing location. Any attempt to consume the consent spends it, including a target mismatch; retrying requires a new explicit confirmation. No engine is connected.
