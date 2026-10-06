# Roadmap draft

[English](roadmap.md) | [Italiano](roadmap.it.md)

This is a proposal for discussion, not a promise about delivery dates.

## 0. Agree on the boundaries

- Confirm the project purpose and relationship to Solfivia.
- Agree on initial memory categories and the rule that users review suggestions before they become durable memories.
- Publish the threat model and define what end-to-end encryption will and will not mean.
- Choose an open-source license and contribution process.
- Decide supported platforms and what “portable” must mean for the first release.

## 1. Local data model

- Define a versioned schema for memories, provenance, timestamps, user preferences, and behavior settings.
- Prototype the “save one project, retrieve it in a fresh conversation, inspect and correct it” continuity test.
- Specify user review, correction, deletion, and retention flows.
- Create synthetic example data and migration rules.

## 2. Local vault

- Select an established cryptographic library and write a reviewable cryptographic design.
- Implement local create, unlock, lock, export, import, backup, and recovery flows.
- Verify that secrets and private content do not enter logs, telemetry, or crash reports.
- Obtain independent security review before using real personal data.

## 3. Device portability and sync

- Define encrypted vault transfer between devices.
- Design device enrollment, revocation, conflict handling, backups, and recovery.
- Keep decryption keys out of the sync service and document remaining metadata.

## 4. Assistant integrations

- Define a permissioned interface for retrieving selected memories.
- Keep local retrieval available without network access.
- Preview the exact context and destination before sending anything to an external model or search provider.
- Add local model and search integrations where practical.

## 5. Audio

- Separate recordings, transcripts, user preferences, and derived voice data in the schema.
- Prefer local processing and make retention choices visible.
- Require separate consent for use of voice identity or voice generation.
