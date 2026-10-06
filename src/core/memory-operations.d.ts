import type { MemoryKind, MemoryRecord, MemoryStatus, Sensitivity, VaultSnapshot } from "./types.js";

export interface NewMemoryInput {
  readonly kind: MemoryKind;
  readonly category: string;
  readonly title: string;
  readonly content: string;
  readonly tags?: readonly string[];
  readonly sensitivity?: Sensitivity;
  readonly source: MemoryRecord["source"];
  readonly expiresAt?: string;
}

export interface MemoryOperationContext {
  readonly id: string;
  readonly now: string;
}

export declare function createMemoryRecord(input: NewMemoryInput, context: MemoryOperationContext): MemoryRecord;
export declare function saveMemory(snapshot: VaultSnapshot, record: MemoryRecord, updatedAt: string): VaultSnapshot;
export declare function setMemoryStatus(snapshot: VaultSnapshot, id: string, status: MemoryStatus, updatedAt: string): VaultSnapshot;
export declare function deleteMemory(snapshot: VaultSnapshot, id: string): VaultSnapshot;
