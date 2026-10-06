/** Portable domain types. No type is tied to a particular LLM provider. */

export type MemoryStatus = "suggested" | "approved" | "archived";
export type Sensitivity = "ordinary" | "sensitive";
export type MemoryKind = "fact" | "preference" | "project" | "note" | "voice-preference";

export interface MemoryRecord {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly kind: MemoryKind;
  readonly category: string;
  readonly title: string;
  readonly content: string;
  readonly tags: readonly string[];
  readonly status: MemoryStatus;
  readonly sensitivity: Sensitivity;
  readonly source: Readonly<{
    type: "user-authored" | "conversation-import" | "assistant-suggestion";
    label?: string;
    capturedAt: string;
  }>;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly expiresAt?: string;
}

/** Personal behavior settings are separate from factual memory records. */
export interface AssistantProfile {
  schemaVersion: 1;
  language: string;
  identity?: {
    assistantId?: string;
    name?: string;
    description?: string;
    avatarDescription?: string;
    avatarAssetId?: string;
  };
  behavior: {
    tone?: string;
    responseLength?: "brief" | "balanced" | "detailed";
    rules: string[];
    boundaries: string[];
  };
  voice?: {
    readAloud: boolean;
    voiceIdentityId?: string;
    language?: string;
    timbreDescription?: string;
    /** Accent and pronunciation preference, separate from timbreDescription. */
    accentDescription?: string;
    pace?: "slow" | "natural" | "fast";
    preferredVoiceLabel?: string;
    engineId?: string;
    voiceModelAssetId?: string;
  };
}

export interface VaultSnapshot {
  format: "memoria-vault";
  schemaVersion: 1;
  vaultId: string;
  exportedAt: string;
  profile: AssistantProfile;
  memories: MemoryRecord[];
}

export interface MemoryQuery {
  purpose: string;
  text: string;
  categories?: readonly string[];
  limit?: number;
}

/** Local controls; sensitivity is intentionally excluded from the model's query shape. */
export interface LocalRetrievalOptions {
  assistantProfile?: AssistantProfile;
  now?: Date;
  includeSensitive?: boolean;
}

/** Only these explicitly selected persona fields may enter a model request. */
export interface AssistantPersonaContext {
  language?: string;
  assistantName?: string;
  personaDescription?: string;
  tone?: string;
  responseLength?: "brief" | "balanced" | "detailed";
  rules?: readonly string[];
  boundaries?: readonly string[];
}

export type ShareablePersonaField = keyof AssistantPersonaContext;

export interface ApprovedMemoryExcerpt {
  readonly title: string;
  readonly content: string;
}

/** User edits applied to the exact text shown in a context preview. */
export interface ContextApprovalEdits {
  readonly userPrompt?: string;
  readonly memories?: readonly Readonly<{
    id: string;
    title?: string;
    content?: string;
  }>[];
}

export interface ContextCandidate {
  readonly query: Readonly<MemoryQuery>;
  readonly records: ReadonlyArray<MemoryRecord>;
  readonly assistantProfile?: Readonly<AssistantPersonaContext>;
  readonly destination: Readonly<{ kind: "local-model" | "remote-provider"; adapterId: string; label: string }>;
}

/** One-request grant created after the UI shows the preview and the user approves. */
export interface ApprovedContext {
  readonly approvalId: string;
  readonly approvedAt: string;
  readonly expiresAt: string;
  readonly destination: Readonly<{ kind: "local-model" | "remote-provider"; adapterId: string; label: string }>;
  readonly purpose: string;
  readonly userPrompt: string;
  readonly selectedPersonaFields: readonly ShareablePersonaField[];
  readonly assistantProfile?: Readonly<AssistantPersonaContext>;
  readonly selectedMemories: ReadonlyArray<ApprovedMemoryExcerpt>;
}

/** Minimal payload passed to the selected model after approval; it omits vault IDs and approval metadata. */
export interface ModelRequestContext {
  readonly purpose: string;
  readonly userPrompt: string;
  readonly assistantProfile?: Readonly<AssistantPersonaContext>;
  readonly selectedMemories: ReadonlyArray<Readonly<{ title: string; content: string }>>;
}

/** Providers receive only the minimized request payload, never grants, vault handles, or keys. */
export interface ModelAdapter {
  readonly id: string;
  readonly label: string;
  readonly execution: "local" | "remote";
  generate(input: ModelRequestContext): Promise<string>;
}

/**
 * Persistence boundary for vault sessions. Implementations handle encrypted-envelope
 * bytes only and must make create, compare-and-swap, and conditional clear atomic.
 */
export interface EncryptedVaultStore {
  /** Return a detached byte copy, or undefined when the vault does not exist. */
  readEncryptedEnvelope(): Promise<Uint8Array | undefined>;
  /** Insert only when empty; reject without replacing an existing vault. */
  createEncryptedEnvelope(envelopeBytes: Uint8Array): Promise<void>;
  /** Replace only if current bytes exactly match expectedBytes. */
  compareAndSwapEncryptedEnvelope(expectedBytes: Uint8Array, nextBytes: Uint8Array): Promise<boolean>;
  /** Delete only if current bytes exactly match expectedBytes. */
  clearEncryptedEnvelope(expectedBytes: Uint8Array): Promise<boolean>;
}
