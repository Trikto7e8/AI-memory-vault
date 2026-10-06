# Roadmap

[English](roadmap.md) | [Italiano](roadmap.it.md)

This roadmap tracks work toward a portable personal AI assistant. Security-sensitive milestones require review; the current prototype is for synthetic data only.

## Current status

- [x] Local browser prototype for categorized text memories and assistant behavior/voice preferences.
- [x] Local lexical retrieval and preview of approved memories; sensitive data excluded by default.
- [x] Shared encrypted-session API over an interface that persists encrypted envelopes only.
- [x] Provider-independent memory and model-adapter contracts.
- [x] Encrypted manual backup and import prototype.
- [x] Initial bilingual threat model and multi-device sync design.
- [ ] Independent review of browser cryptography; use synthetic data until reviewed.
- [ ] Support personal voice notes as separate encrypted audio assets, distinct from samples used for the assistant's voice.
- [ ] Complete portable assistant identity schema: name, persona, voice identity, avatar, and protected asset references.
- [ ] Device-specific key enrollment, encrypted sync, recovery, conflict resolution, revocation, and rollback protection.
- [ ] Model adapters with exact authorization for every remote request; the current prototype sends requests to no model.
- [ ] Local, reviewable, multi-format conversation importer.
- [ ] Encrypted asset store for optional voice models and avatars, with separate consent and portability controls.

## Milestones

### 1. Portable assistant identity and memory

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

### 5. Voice and avatar identity

- Store portable descriptive settings and stable engine/profile identifiers.
- Treat voice models and avatar files as optional encrypted assets, separate from memories.
- Require specific rights, consent, retention, revocation, and deletion policies.
