# Architecture notes

[English](architecture.md) | [Italiano](architecture.it.md)

These notes set a direction to implement and review; they are not a security certification.

## Separate but portable concerns

1. **Personal memory:** categorized records, provenance, dates, sensitivity, and expiry.
2. **Assistant identity:** name, personality, instructions, boundaries, style, voice/timbre, and avatar.
3. **Vault and keys:** local encryption, unlock, backup, recovery, device enrollment, and synchronization.
4. **Adapters:** interfaces to different AI models, voice engines, search, and mobile clients.

Every concern must work without depending on one assistant or model. The core passes an adapter only the request and approved context and gives it no vault handle or keys. This is an API boundary, not a sandbox: code running in the same JavaScript origin can still use ambient browser APIs, so only trusted adapters may run there. A future provider integration needs a genuinely isolated execution boundary and a narrow, consent-bound message channel before claiming technical confinement.

## Persistent identity

The assistant profile travels with memory and describes its personality and identity. For voice, store descriptive preferences (timbre, accent, pace) and stable identifiers that a compatible engine can reuse. Preserving the same timbre across engines or devices may require treating a voice model as a separate, private, encrypted asset that transfers only with user consent. Descriptions and IDs alone cannot guarantee identical reproduction.

The same principle applies to the assistant's name, description, and avatar assets. Images, voice models, and other assets are not text memories and must not be put in issues, examples, or public commits. Cloning is optional and requires rights and specific consent from the represented person.

## Public/private keys and passphrases

A public/private key pair is not a password. The public key can be shared; the private key must remain secret. Data is encrypted with a random symmetric key; a copy of that key is then wrapped for each authorized device using its public key. The corresponding private key lets the device recover the data key.

A passphrase protects private keys locally. It is neither a public key nor the vault key. On unlock and before changing the passphrase, the prototype verifies that the public and private keys in the encrypted envelope form a pair. Each device must have distinct key pairs for encryption and signing. The sync service must never receive private keys or passphrases. Enrollment, recovery, revocation, and rotation are described in the [sync specification](sync-protocol.md) and remain to be implemented and reviewed.

## Categorized records

Each memory has a stable ID, versioned schema, category, title, content, tags, provenance, dates, status, and sensitivity level. Media attachments are separate encrypted assets referenced by IDs, not local paths or public URLs. A conversation-derived suggestion remains under review until approved by the user. Corrections and deletion are explicit.

The runtime entry point [`src/index.js`](../src/index.js) exposes the portable core: provider-independent memory operations and one shared v1 snapshot validator. An encrypted session combines create/unlock, reads, serialized writes, local previews, passphrase changes, backup, and locking over a replaceable storage interface. Atomic creation and compare-and-swap updates detect stale local sessions instead of silently overwriting concurrent changes. The store handles encrypted-envelope bytes only; the reusable IndexedDB adapter is exported from the core, while mobile storage still needs a platform-specific implementation. The adapter also reads legacy envelope objects saved by the earlier prototype by normalizing them to JSON bytes. Imports require the valid passphrase and, when replacing an existing vault, explicit user confirmation.

Core operations reject unknown record and provenance fields and validate record bounds before saving, so extensions cannot silently add undeclared plaintext to a snapshot.

## Retrieval and sharing

Records are retrieved locally. For public search, the client previews the exact query and removes private context by default; it compares results with memories on-device. Sending to a remote model shows the destination and exact text and requires consent for that request only. The provider sees in plaintext what it receives.

## Synchronization

The client encrypts and authenticates each revision before upload. Authorized devices' public keys each receive a wrapped copy of the data key; the service stores ciphertext and routing metadata. The protocol must authenticate membership, versions, and revisions; detect replay; preserve offline conflicts; and support revocation and recovery. Until these properties are implemented and reviewed, do not claim end-to-end sync is active.
