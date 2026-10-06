# Design specification: device enrollment and encrypted sync

[English](sync-protocol.md) | [Italiano](sync-protocol.it.md)

This specification describes intended behavior. It is not implemented in the prototype: today there is only a manual encrypted backup using the same passphrase-protected key pair. Use synthetic data only until the protocol is implemented, reviewed, and verified.

## Keys: what each one can do

- Every device generates independent encryption and signing key pairs. Private keys are never sent to the server; public keys can be shared to authorize the device and verify signed updates.
- The vault generates a random content key. This key encrypts vault data; it is then wrapped separately to each authorized device's public key.
- Only the corresponding private key can unwrap that device's copy of the vault key. A public key is not a password and cannot decrypt.
- A passphrase protects the private key locally, preferably with the operating system's secure key store. It is not the public key or the vault key.

This separation allows a device to be added or revoked without sharing one private key across every device.

## Planned enrollment flow

1. The new device creates its encryption and signing key pairs locally and displays a QR code containing its identifier and both public-key fingerprints.
2. An already-authorized device scans the QR code. The user compares and confirms the new device on both screens; the existing device signs an enrollment approval binding both new public keys to the vault.
3. The existing device wraps the random vault key locally to the new device's public key. The private key and passphrase do not pass through the server.
4. The new device downloads ciphertext, its wrapped key, and a signed manifest. It verifies the signature and vault identity before decryption.
5. The user keeps a separate recovery method. Losing all authorized devices and recovery material can make the data unrecoverable.

The QR code must authenticate the key fingerprint, not carry the private key or plaintext vault. Any network-based alternative must authenticate the key out of band or be authorized by an already trusted device: a server account alone must not be able to enroll devices.

## Planned synchronization flow

1. An unlocked device creates a new snapshot revision and generates a fresh random AES-GCM nonce.
2. Ciphertext is authenticated with a manifest binding the vault ID, signed membership revision, schema, unique revision ID, and all parent revision IDs. An authorized device signs the canonical manifest, ciphertext, and recipient key envelopes.
3. The package contains ciphertext and a copy of the vault key wrapped for each active device. Private keys and plaintext are never uploaded.
4. The service stores and returns encrypted bytes. It necessarily receives routing metadata and may observe sizes, timing, frequency, device identifiers, and revisions, depending on the final design.
5. Before writing, the client supplies all known remote head IDs as a compare-and-swap condition. Concurrent writes create parallel heads/conflicts for local resolution; the client does not silently apply “last write wins.”
6. Merging happens on-device after decryption. Distinct records can merge by ID; concurrent edits to the same record remain visible until the user chooses.

## Revision history without a public blockchain

The design borrows one useful idea from blockchains—linking signed revisions to their parent revisions—without putting the user's vault on a public ledger. Each encrypted package is signed by an authorized device and names its parent revision IDs. Devices remember the latest heads they have accepted; this makes edits, branches, and some rollback attempts detectable when devices compare histories.

This is a signed revision graph, not a blockchain: there is no public consensus network, mining, token, or global ledger. A public blockchain is not needed for end-to-end encryption or assistant personalization. It would add cost and permanence, while public transaction metadata could expose activity patterns. Personal memories, profile settings, voice/avatar assets, keys, stable identifiers, and hashes derived from them must never be written to a public chain. Deleting a local record or rotating keys also cannot erase an immutable public transaction.

For terminology, NIST describes blockchain as a distributed digital ledger whose linked blocks are validated through consensus and replicated across network participants ([NIST Blockchain overview](https://www.nist.gov/blockchain)).

The signed revision graph is only tamper-evident within the history devices can verify. It cannot force a sync service to deliver updates, prove that no newer revision exists, or prevent a malicious service from withholding data. Stronger anti-rollback guarantees require a reviewed protocol and a trusted checkpoint or transparency mechanism that does not reveal private content.

A signature and locally remembered head set help detect altered or rolled-back packages, but a server can still delay or deny updates. Anti-rollback protection across offline devices requires a verifiable protocol and review. Canonical byte encoding and signature verification rules must be fixed before implementation. Membership revisions list authorized public keys and are signed by a device already trusted in the parent revision; the client verifies this chain before accepting changes.

## Revocation, recovery, and deletion

- **Revoke a device:** a trusted device publishes a new signed membership. To prevent the revoked device from reading future updates, generate a new content key and distribute it only to remaining devices. Revocation cannot erase copies, keys, or plaintext already obtained by that device.
- **Recover:** use recovery material separate from the devices and the daily passphrase, kept by the user. The format and restore procedure must be decided and tested before public sync.
- **Delete:** publish a tombstone and delete data from controlled devices. The service may retain prior versions or backups; verifiable remote erasure is not guaranteed without a service commitment.
- **Conflicts:** never silently discard a private edit. Preserve concurrent versions with provenance and ask for a choice when a merge is unsafe.

## External models and search

Memory retrieval happens on-device. For web search, the client prepares a public/sanitized query without attaching private records; the UI shows the exact query and asks before the remote request because even a query can reveal information. Public results are compared with memories locally. If the user chooses to send an excerpt to a remote LLM, that text leaves the device in plaintext for the provider to process, and the UI must say so.

## Before calling it “end-to-end”

The contract currently names RSA-OAEP with 3072-bit keys for key wrapping, ECDSA P-256/SHA-256 for signatures, and AES-256-GCM for content encryption as a proposal. These choices and their implementation still require expert review. Implementation and independent review are needed for the signed format, authenticated enrollment, authenticated encryption, nonces, replay/rollback protection, rotation and revocation, backup/recovery, migrations, and exposed metadata. This document alone is not evidence that sync or end-to-end encryption works.

## Current limitations

- Automatic sync and device enrollment do not exist yet.
- The prototype's `.mvault` backup reuses its passphrase-protected key pair; it does not implement the multi-device model above.
- The prototype is unaudited and is not suitable for real personal data.
- Do not put conversation archives, keys, or personal audio in GitHub. See `.gitignore` and the contribution instructions.
