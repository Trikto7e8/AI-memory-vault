# Project vision

[English](vision.md) | [Italiano](vision.it.md)

## Purpose

AI Memoria Vault is the personal, portable memory of an AI assistant/agent that the user experiences as their own. The memory preserves the user's memories and preferences together with the assistant's personality and identity—including a recognizable voice and avatar—so they can be carried across devices and used with different models. The user can switch LLM/AI models without losing their memory, the familiarity and rapport built with their assistant, or the context curated over time.

The central proof is simple: I save a project and my preferences, start a fresh session on another device and another model, retrieve relevant context, and can inspect, correct, or delete what was recalled.

## User-controlled memory and personality

The user decides what becomes a memory, sees its source and date, and can correct, expire, or delete it. Temporary context does not automatically become permanent memory. Personality settings—tone, style, boundaries, language, and rules—can be changed independently from factual memories.

Categories help organize information without creating hidden profiles: projects, ideas, preferences, people and relationships the user chooses to keep, reference knowledge, and temporary continuity. Suggestions extracted from a conversation remain pending review until the user approves them.

## Persistent assistant identity

The profile should carry a coherent identity: name, description, personality, style, voice/timbre, avatar, and identifiers compatible with installed engines. A voice description helps but cannot reproduce the same voice by itself. Preserving timbre across devices may require a private encrypted voice model, installed locally or synchronized as an encrypted asset when the user authorizes it.

The assistant's voice is not a recording or voice note from the user. A voice/cloned model and avatar images are assets separate from memory records, optional, and governed by specific consent, rights, encryption, sync, and deletion. No asset is uploaded or used for training without explicit authorization.

## Model independence and portability

Memory schema, assistant settings, and sync mechanisms do not depend on one LLM or provider. Adapters translate the profile into the format required by the selected model. Capabilities vary: a model may not follow every preference or support a particular voice, but the portable profile remains user-owned.

Import and export are local and versioned. Importers preview findings and let the user choose what to keep. Cross-device sync uses end-to-end encryption with per-device key pairs; the transport service must not be able to decrypt content. Until protocol, keys, recovery, and revocation are implemented and reviewed, sync remains a design goal.

## External search and models

Memory is searched on-device. For web lookups, the client previews the exact query and sends only the approved public/sanitized part, without automatically attaching memories; results are compared locally. Any memory sent to a remote model or service requires a screen showing the destination and exact text plus consent for that request only. Once sent, that data is visible to the service for processing: the vault cannot keep it end-to-end private.

## Initial goals

- A persistent, categorized local core.
- A portable profile for the assistant's personality and identity.
- Transferable encrypted backup and multi-device encrypted sync after review.
- Swappable adapters for local or remote models with explicit approval.
- Private, optional voice/avatar assets kept separate from memory.
- Local, reviewable import from different formats.

The repository contains an experimental prototype; it has not been audited and must not be used with real personal data.
