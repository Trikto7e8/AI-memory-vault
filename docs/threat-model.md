# Threat model — draft

[English](threat-model.md) | [Italiano](threat-model.it.md)

This is an initial map of trust boundaries, not a certification. The current prototype is unaudited; use synthetic data only. Update this document alongside every new network, sync, audio, or integration feature.

## Data to protect

- Personal memories, voice notes and attachments, categories, tags, provenance, dates, and expiry.
- Assistant profile: preferences, personality, boundaries, and voice settings.
- Voice models and avatars that preserve assistant identity: separate and potentially highly sensitive assets.
- Vault keys, device private keys, passphrases, and recovery material.
- External queries can reveal information even when memory text is not attached.

## Actors and boundaries

| Component | Can see | Must not receive |
| --- | --- | --- |
| App and unlocked device | Plaintext needed for active features | — |
| Locked local storage | Ciphertext and local technical metadata | Decrypted content or a persisted passphrase |
| Sync service | Encrypted packages, identifiers, and documented residual metadata | Private keys, passphrases, or plaintext snapshots |
| Local model | Only context selected for this on-device request | Autonomous vault access |
| Remote model or search | Only text/query the user approved for this request | Implicit private context or persistent vault access |
| Public repository | Code, specifications, and synthetic examples | Personal exports, backups, keys, audio, or real memories |

## Threats considered

- Theft of a backup or access to stored data by someone without the key.
- Curious or compromised sync server reading, altering, replacing, reordering, replaying, or blocking packages.
- A lost, revoked, shared, or unattended unlocked device.
- A selection error or deceptive UI sending more memory than intended to a remote service.
- Weak or forgotten passphrase, shared backup, or loss of all authorized devices.
- Malformed imports or conversation content attempting to influence the assistant.
- Offline conflicts, restoring an old version, and incomplete deletion of copies or backups.
- Voice samples or other people's data collected without rights or valid consent.

## Limits / out of scope

The prototype automatically locks after ten minutes without interaction and clears rendered values. Browser process memory may still contain plaintext copies; this timeout is an unattended-screen safeguard, not secure memory erasure.

Vault encryption does not protect against malware, hostile extensions, keyloggers, a compromised operating system, screenshots, physical access while unlocked, or plaintext already decrypted in memory. It does not automatically hide sizes, timing, frequency, or device relationships from a sync service. A remote provider receives data the user chooses to send and may retain logs under its terms. Revocation cannot recall copies already downloaded.

When the user locks the prototype, it clears decrypted values from the rendered page before dropping the active vault reference. This reduces accidental exposure in the hidden page, but browser JavaScript does not provide a reliable guarantee that every plaintext copy in process memory has been erased.

## Security requirements

1. No network is needed to create, view, correct, or delete local memories.
2. Use authenticated encryption with random keys; use a passphrase to protect local key material through a suitable KDF with versioned parameters.
3. Keep secrets out of logs, telemetry, URLs, crash reports, analytics, and the repository.
4. Encrypt exports, preview imports, and validate fully before replacing existing data.
5. No remote sending by default. Show the destination and exact text, require approval for one request, and record only minimal decision metadata.
6. For sync, authenticate device enrollment; the server cannot unilaterally add trusted keys. Handle revocation, replay, rollback, conflicts, and recovery.
7. Voice data is opt-in, with separate rights/consent, encryption, and deletion.
8. Require independent audit, dependency review, and threat-model assessment before real personal data.

## Verification status

The prototype uses Web Crypto for a local backup flow, but has no independent review. Multi-device sync, a remote-consent UI gate, recovery, revocation, and conversation importer are not operational. Controls documented for these features are future requirements, not protections currently provided.
