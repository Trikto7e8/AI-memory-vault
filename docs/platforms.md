# Cross-platform development

[English](platforms.md) | [Italiano](platforms.it.md)

## Project rule

Memory Vault is an independent, local-first memory layer. Its schema, encryption, import/export and consent boundaries must remain usable without any avatar, assistant product, model or provider. Client-specific behavior belongs in optional adapters. Store this rule in design decisions and review every integration against it.

## Platform roadmap

| Target | Current evidence | Help wanted / next milestone |
| --- | --- | --- |
| Android phones and tablets | Feasibility tracked in issue #5; no native release | Test local browser persistence and encrypted backup, then propose an independent native client or storage adapter |
| iPhone and iPad (iOS/iPadOS) | No validated device matrix or native release | Evaluate a local browser/native route, file import/export, storage eviction, lock behavior and accessibility |
| Windows PCs | Local Python quick-start documented; no packaged desktop release | Reproducible browser tests, encrypted file handling, independent desktop packaging proposal |
| macOS | Quick-start merged in #4/#6; real-device verification pending in #3 | Verify browser lifecycle and encrypted backup; assess desktop packaging and key storage |
| Linux | Quick-start merged in #4/#6; real-device verification pending in #3 | Test selected distributions/browsers; document desktop packaging and storage behavior |
| Compatible browsers / web | Existing local web prototype and reusable core | Publish an evidence-based compatibility matrix; improve keyboard, screen-reader and small-screen flows |

The platform list is open to further proposals. No App Store, Google Play, desktop installer or universal compatibility is claimed. Choose packaging after a feasibility proposal; do not replace the shared data format with a platform-specific one.

## Shared acceptance checklist

Use synthetic data and record OS/browser versions, date, reproduction steps and failures. Never attach real memories, exports, device identifiers or credentials.

- [ ] Create, unlock and lock a vault; verify wrong-passphrase behavior.
- [ ] Create, search, edit, approve, archive and delete synthetic memories.
- [ ] Check idle lock, background/resume and restart behavior.
- [ ] Export an encrypted backup, import it on a second environment, and compare synthetic records.
- [ ] Change passphrase and verify old/new backup behavior without confusing it with device-key rotation.
- [ ] Document storage limits, eviction risk and recovery; private content must stay out of logs.
- [ ] Test keyboard, screen reader, focus, zoom and small screens.
- [ ] Confirm no unintended outbound memory requests; future external calls require exact preview and request-specific consent.

Cross-device backup tests are manual portability tests, not automatic sync. Native key stores and device-specific enrollment require design and review; the current prototype reuses its backup key pair.

## Work beyond platform clients

1. Stabilize versioned schemas, migrations and interoperability fixtures.
2. Add guided local conversation import with provenance, duplicate detection and user approval.
3. Implement and review per-device enrollment, encrypted sync, conflicts, revocation and recovery.
4. Build optional local/remote model adapters without coupling stored memories to a model.
5. Specify encrypted personal audio notes and optional preference metadata separately from media engines.

The existing prototype remains experimental and unaudited. A platform milestone needs published evidence, not only a successful build. See [roadmap](roadmap.md) and [contributing](../CONTRIBUTING.md).
