# Roadmap

[English](roadmap.md) | [Italiano](roadmap.it.md)

This roadmap tracks development of a portable, assistant-independent memory vault. Security-sensitive milestones require review; the current prototype is for synthetic data only.

## Current status

- [x] Local browser prototype for categorized text memories and assistant behavior/voice preferences.
- [x] Local lexical retrieval and preview of approved memories; sensitive data excluded by default.
- [x] Shared encrypted-session API over an interface that persists encrypted envelopes only.
- [x] Provider-independent memory and model-adapter contracts.
- [x] Encrypted manual backup and import prototype.
- [x] Initial bilingual threat model and multi-device sync design.
- [ ] Independent review of browser cryptography; use synthetic data until reviewed.
- [ ] Support personal voice notes as separate encrypted audio assets, distinct from samples used for the assistant's voice.
- [ ] Stabilize optional, generic client-profile metadata without coupling the memory format to a particular assistant or mobile application.
- [ ] Device-specific key enrollment, encrypted sync, recovery, conflict resolution, revocation, and rollback protection.
- [ ] Model adapters with exact authorization for every remote request; the current prototype sends requests to no model.
- [ ] Local, reviewable, multi-format conversation importer.
- [ ] Specify optional external media-asset references and their consent/security boundaries; actual voice models and avatar implementation belong to separate clients.

## Milestones

### 1. Portable memory and optional profile metadata

- Version records for categorized memory, provenance, expiry, sensitivity, and user review.
- Add personal voice notes as user-owned memories with consent, local encryption, and explicit provenance.
- Keep assistant behavior and identity separate from factual memories but inside the same portable vault.
- Verify continuity across a fresh conversation, another device, and a different model.

### 2. Local encrypted vault

- Review the cryptographic design and key management.
- Preserve local create, unlock, lock, edit, delete, backup, import, and recovery flows.
- Keep private content out of logs, telemetry, crash reports, and public repository data.

### 3. Device sync and portability

- Enroll an independent key pair for each device, approved by an existing trusted device.
- Encrypt and authenticate every revision; preserve branches and conflicts instead of silent last-write-wins.
- Design recovery, key rotation, device revocation, anti-replay/rollback, and residual metadata.

### 4. Model and search adapters

- Keep retrieval and private/public result matching on-device.
- Let local models use selected context without network access.
- Preview exact query, destination, and context before each external call; no standing consent.

### 5. Optional client profile and external media boundaries

- Preserve generic descriptive preferences and stable reference identifiers without implementing media playback or rendering.
- Keep voice engines, avatars, and client user interfaces outside the vault; expose optional integration contracts only.
- Require specific rights, consent, retention, revocation, and deletion policies for any future integration.
