import type { VaultSnapshot } from "../core/types";

export const PBKDF2_ITERATIONS: 600000;
export const MAX_BACKUP_BYTES: number;

export interface EncryptedEnvelope {
  format: "memoria-vault-encrypted";
  schemaVersion: 1;
  kdf: { name: "PBKDF2"; hash: "SHA-256"; iterations: 600000; salt: string };
  keyWrapping: { name: "RSA-OAEP"; hash: "SHA-256"; publicKey: string; wrappedDataKey: string };
  privateKeyEnvelope: { algorithm: "AES-GCM"; iv: string; ciphertext: string };
  payload: { algorithm: "AES-GCM"; iv: string; ciphertext: string };
}

export function createEnvelope(
  passphrase: string,
  snapshot: VaultSnapshot,
  validateSnapshot: (value: unknown) => value is VaultSnapshot,
): Promise<EncryptedEnvelope>;
export function createVaultSession(
  passphrase: string,
  snapshot: VaultSnapshot,
  validateSnapshot: (value: unknown) => value is VaultSnapshot,
): Promise<{ envelope: EncryptedEnvelope; snapshot: VaultSnapshot; dataKey: CryptoKey }>;
export function validateEnvelope(envelope: unknown, maxPayloadBytes?: number): envelope is EncryptedEnvelope;
export function unlockEnvelope(
  envelope: unknown,
  passphrase: string,
  validateSnapshot: (value: unknown) => value is VaultSnapshot,
): Promise<{ envelope: EncryptedEnvelope; snapshot: VaultSnapshot; dataKey: CryptoKey }>;
export function changeEnvelopePassphrase(
  envelope: EncryptedEnvelope,
  currentPassphrase: string,
  newPassphrase: string,
): Promise<EncryptedEnvelope>;
export function encryptSnapshotPayload(
  dataKey: CryptoKey,
  snapshot: VaultSnapshot,
  validateSnapshot: (value: unknown) => value is VaultSnapshot,
): Promise<EncryptedEnvelope["payload"]>;
