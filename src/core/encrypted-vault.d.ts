import type { ApprovedContext, AssistantProfile, ContextApprovalEdits, ContextCandidate, EncryptedVaultStore, MemoryQuery, MemoryRecord, MemoryStatus, ShareablePersonaField, VaultSnapshot } from "./types.js";
import type { NewMemoryInput } from "./memory-operations.js";

export interface CreateEncryptedVaultOptions {
  store: EncryptedVaultStore;
  passphrase: string;
  snapshot: VaultSnapshot;
  validateSnapshot: (value: unknown) => value is VaultSnapshot;
}

export interface OpenEncryptedVaultOptions {
  store: EncryptedVaultStore;
  passphrase: string;
  validateSnapshot: (value: unknown) => value is VaultSnapshot;
}

export interface ImportEncryptedVaultOptions extends OpenEncryptedVaultOptions {
  backupBytes: Uint8Array;
  /** Set only after the client has obtained the user's explicit replacement confirmation. */
  replaceExisting?: boolean;
}

export interface EncryptedVaultSession {
  isLocked(): boolean;
  readSnapshot(): Promise<VaultSnapshot>;
  saveMemory(input: NewMemoryInput, id?: string): Promise<MemoryRecord>;
  setMemoryStatus(id: string, status: MemoryStatus): Promise<VaultSnapshot>;
  deleteMemory(id: string): Promise<VaultSnapshot>;
  updateProfile(profile: AssistantProfile): Promise<VaultSnapshot>;
  previewContext(query: MemoryQuery, destination: ContextCandidate["destination"], options?: { now?: Date; includeSensitive?: boolean }): Promise<ContextCandidate>;
  approveContext(candidate: ContextCandidate, selectedIds: readonly string[], approvalId: string, approvedAt?: string, selectedPersonaFields?: readonly ShareablePersonaField[], edits?: ContextApprovalEdits): Promise<ApprovedContext>;
  exportEncryptedBackup(): Promise<Uint8Array>;
  changePassphrase(currentPassphrase: string, newPassphrase: string): Promise<void>;
  lock(): Promise<void>;
  destroy(): Promise<void>;
}

export function createEncryptedVault(options: CreateEncryptedVaultOptions): Promise<EncryptedVaultSession>;
export function openEncryptedVault(options: OpenEncryptedVaultOptions): Promise<EncryptedVaultSession>;
export function importEncryptedVault(options: ImportEncryptedVaultOptions): Promise<EncryptedVaultSession>;
