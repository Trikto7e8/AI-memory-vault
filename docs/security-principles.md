# Security principles and open questions

[English](security-principles.md) | [Italiano](security-principles.it.md)

This is a requirements document, not a cryptographic design or audit. No implementation should be considered safe for personal data until the threat model and design have been reviewed and tested.

## Threats to address

- A lost or stolen device, including local backups and temporary files.
- A compromised unlocked device or malicious code running in the app.
- A curious or compromised sync provider.
- Accidental disclosure through logs, crash reports, analytics, notifications, or diagnostic bundles.
- A weak passphrase, lost recovery material, or a mistaken restore on a shared device.
- Metadata leakage such as account identifiers, object sizes, timing, and synchronization patterns.
- Deliberate or accidental forwarding of private context to external model, search, transcription, or speech providers.

The threat model must state which of these the product can mitigate and which it cannot. In particular, client-side encryption cannot protect plaintext while the user is viewing it on a compromised device.

## Required design decisions before implementation

1. Define the vault file format, versioning, integrity checks, and migration behavior.
2. Choose established cryptographic libraries and constructions; do not invent primitives or protocols.
3. Define key generation, passphrase-based key derivation, device key storage, recovery, rotation, and secure deletion behavior.
4. Decide how a hybrid public/private-key and symmetric-key design will enroll and revoke devices without giving the sync service decryption keys.
5. Document visible sync metadata and whether filenames, timestamps, and object sizes are encrypted or padded.
6. Decide how encrypted backups and conflict resolution work.
7. Define exactly what the user sees and approves before any private content is sent to an external provider.
8. Set rules for handling audio, transcripts, embeddings, and derived voice data.

## Operational requirements

- Never commit keys, secrets, real vaults, or personal audio to source control.
- Keep sample data synthetic and clearly labeled.
- Keep private content out of logs, telemetry, analytics, and crash reports by default.
- Make export, deletion, backup, and recovery behavior understandable before the user relies on it.
- Track cryptographic dependencies and update them in response to security advisories.
- Arrange independent review before making end-to-end encryption claims.

These principles follow established guidance to start with a threat model, use vetted cryptography, and plan key generation, storage, distribution, rotation, recovery, and destruction. See [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) and [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html).
