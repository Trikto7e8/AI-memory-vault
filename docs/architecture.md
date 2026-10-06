# Architecture notes

[English](architecture.md) | [Italiano](architecture.it.md)

These notes turn the current goals into a reviewable direction. They are not an implementation specification; key formats, algorithms, and protocol details still need expert review before coding.

## Keep four concerns separate

1. **Memory data:** user-controlled records, categories, provenance, timestamps, and retention.
2. **Assistant profile:** tone, language, behavior preferences, and boundaries, stored separately from factual memories.
3. **Vault and keys:** local encryption, unlock, recovery, export, and optional encrypted sync.
4. **Assistant adapters:** local models, mobile clients, public search, and optional remote models.

This separation lets the same memory vault work with Solphivia, another local assistant, or a future application without handing the full archive to each one.

## Public/private keys and passwords

A public/private key pair is not the same thing as a password. The public key can be shared; the private key must stay secret. In an encrypted vault, the private key can help authorize a device or protect a small random vault key for that device. The public key by itself cannot decrypt the vault.

Large files are usually encrypted with a randomly generated symmetric data key. A vetted authenticated-encryption construction protects the file; the data key is then wrapped separately for each authorized device using that device's public key. Each device uses its private key to unwrap the data key. This hybrid pattern is more practical than encrypting every byte directly with public-key cryptography.

A password or passphrase can locally unlock a device key or derive a wrapping key with a password-based key derivation function. It should not be treated as the public key, private key, or sole encryption primitive. Weak passwords, lost recovery material, and compromised unlocked devices still matter.

The design must decide how device keys are generated, stored in OS-provided secure storage, backed up, rotated, revoked, and recovered. Sync must never receive a decryption key. A new device must be enrolled by an already-authorized device or an explicit recovery process; otherwise a sync provider could silently add a reader.

## Categorized local memory

Store each memory as an independently addressable record so that users can review and remove it. A record should support:

- a stable ID and schema version;
- category and optional user-defined tags;
- content and content type (text, reference, audio, transcript, or attachment);
- source/provenance and creation/update times;
- optional expiry, confidence, and sensitivity labels;
- links to related projects or records;
- an explicit user-curated, suggested, or imported status.

Sensitive categories should be opt-in. A suggestion extracted from a conversation should remain a suggestion until the user accepts it. The assistant should retrieve only records relevant to the current task, with an easy way to inspect and edit the selected set.

## Keep private memories on-device during public search

For a public web lookup, create the search query from the current request while excluding vault contents by default. Fetch public results, then retrieve and compare relevant private memories locally. For example:

```text
User request
  ├─ Public query without private context → search provider
  └─ Relevant memories → local retrieval
                         ↓
              local comparison/summary
```

If the user asks for personalized remote reasoning, show the destination and exact memory excerpts first. Require a one-time confirmation. Never imply that end-to-end encryption protects content after the user deliberately sends it to a remote provider.

## Device sync

When sync is added, encrypt records on the sending device before upload. The sync service should store opaque ciphertext and the minimum metadata needed to locate and synchronize objects. Document any visible sizes, timestamps, account identifiers, and access patterns. Downloaded data is authenticated and decrypted only on an authorized device.

## Lessons from prior Solphivia discussions

- Test continuity by carrying one project into a fresh conversation, and let the user inspect and correct the recalled context.
- Keep memory independent from the assistant or model so the phone, notebook, and future clients can share a format.
- Local inference, document search, and a notebook-hosted memory service are optional adapters; they should not be required for a portable vault.
- Voice quality and identity are distinct from memory storage. Keep voice recordings, transcripts, and style preferences separately permissioned.
