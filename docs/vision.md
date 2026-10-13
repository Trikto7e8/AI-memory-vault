# Project vision

[English](vision.md) | [Italiano](vision.it.md)

## Purpose

AI Memory Vault is an open project for keeping, under the user's control, AI preferences, personal memories, and voice notes, together with voice, personality, and behavior settings for the AI assistant they usually use. The memory is designed to work locally and travel with the user across devices, independently of the selected model. Users should be able to switch LLM/AI models without losing their stored memories or the sense of familiarity and rapport built with their assistant. Future synchronization is designed to transfer encrypted data only, so the storage service cannot read its contents; it is not implemented yet.

The central proof is simple: I save a project and my preferences, start a fresh session on another device and another model, retrieve relevant context, and can inspect, correct, or delete what was recalled.

## Independent scope

This project is a reusable vault, not a specific assistant product. Assistant applications, including mobile clients, own their interfaces, avatar animation, speech synthesis, and interactions with models. The vault stores approved records and optional descriptive preferences, without depending on or naming any particular assistant or application. Media generation and playback are outside its scope.

## User-controlled memory and personality

The user decides what becomes a memory, sees its source and date, and can correct, expire, or delete it. Temporary context does not automatically become permanent memory. Personality settings—tone, style, boundaries, language, and rules—can be changed independently from factual memories.

Categories help organize information without creating hidden profiles: projects, ideas, preferences, people and relationships the user chooses to keep, reference knowledge, and temporary continuity. Suggestions extracted from a conversation remain pending review until the user approves them.

## Optional client profile metadata

The optional profile may store descriptive fields such as name, personality, style, voice/timbre preference, and avatar description or references. These are data, not a promise to reproduce an assistant's identity: implementing a voice engine or drawing an avatar remains the responsibility of a separate client.

Personal voice notes are memories belonging to the user; timbre settings and a voice model describe the voice the assistant speaks with. They are distinct kinds of content. The current prototype does not store voice notes or voice models. Any future private media-asset integration belongs behind separately reviewed consent, rights, encryption, synchronization, and deletion boundaries. No asset is uploaded or used for training by this prototype.

## Model independence and portability

Memory schema, assistant settings, and sync mechanisms do not depend on one LLM or provider. Adapters translate the profile into the format required by the selected model. Capabilities vary: a model may not follow every preference or support a particular voice, but the portable profile remains user-owned.

Import and export are local and versioned. Importers preview findings and let the user choose what to keep. Cross-device sync uses end-to-end encryption with per-device key pairs; the transport service must not be able to decrypt content. Until protocol, keys, recovery, and revocation are implemented and reviewed, sync remains a design goal.

## External search and models

Memory is searched on-device. For web lookups, the client previews the exact query and sends only the approved public/sanitized part, without automatically attaching memories; results are compared locally. Any memory sent to a remote model or service requires a screen showing the destination and exact text plus consent for that request only. Once sent, that data is visible to the service for processing: the vault cannot keep it end-to-end private.

## Initial goals

- A persistent, categorized local core.
- AI preferences and personal voice notes stored locally under the user's control.
- A portable profile for the assistant's personality and identity.
- Transferable encrypted backup and multi-device encrypted sync after review.
- Swappable adapters for local or remote models with explicit approval.
- Optional, generic voice/avatar descriptions or external references; actual media processing stays with separate clients.
- Local, reviewable import from different formats.

The repository contains an experimental prototype; it has not been audited and must not be used with real personal data.
