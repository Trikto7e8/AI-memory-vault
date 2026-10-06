/** Device and ciphertext-sync contracts. No sync or key-enrollment service is implemented. */

export type DeviceEncryptionAlgorithm = "RSA-OAEP-3072-SHA256";
export type DeviceSigningAlgorithm = "ECDSA-P256-SHA256";

/** Public identity; encryption and signing keys must be distinct. */
export interface DevicePublicKey {
  readonly deviceId: string;
  readonly encryptionAlgorithm: DeviceEncryptionAlgorithm;
  readonly encryptionPublicKeySpki: string;
  readonly signingAlgorithm: DeviceSigningAlgorithm;
  readonly signingPublicKeySpki: string;
  readonly addedAt: string;
}

/** A new device is added only by a currently trusted device's signature. */
export interface DeviceEnrollmentApproval {
  readonly format: "memoria-vault-device-enrollment";
  readonly schemaVersion: 1;
  readonly vaultId: string;
  readonly proposedDevice: DevicePublicKey;
  readonly approvedByDeviceId: string;
  readonly approvedAt: string;
  readonly signatureAlgorithm: DeviceSigningAlgorithm;
  readonly signature: string;
}

/** Signed membership revisions carry both enrollment and revocation state. */
export interface DeviceMembershipManifest {
  readonly format: "memoria-vault-device-membership";
  readonly schemaVersion: 1;
  readonly vaultId: string;
  readonly revisionId: string;
  readonly parentRevisionId?: string;
  readonly createdAt: string;
  readonly members: ReadonlyArray<DevicePublicKey>;
  readonly signerDeviceId: string;
  readonly signatureAlgorithm: DeviceSigningAlgorithm;
  readonly signature: string;
}

export interface DeviceKeyEnvelope {
  readonly recipientDeviceId: string;
  readonly algorithm: DeviceEncryptionAlgorithm;
  readonly wrappedVaultKey: string;
  readonly createdAt: string;
}

/** AES-GCM AAD binds the canonical header; the signature covers header, ciphertext, and recipient envelopes. */
export interface EncryptedSyncPackage {
  readonly format: "memoria-vault-sync";
  readonly schemaVersion: 1;
  readonly vaultId: string;
  readonly membershipRevisionId: string;
  readonly revisionId: string;
  readonly parentRevisionIds: readonly string[];
  readonly createdAt: string;
  readonly payload: { readonly algorithm: "AES-256-GCM"; readonly nonce: string; readonly ciphertext: string };
  readonly recipients: readonly DeviceKeyEnvelope[];
  readonly signerDeviceId: string;
  readonly signatureAlgorithm: DeviceSigningAlgorithm;
  readonly signature: string;
}

/** Signed deletion marker; it requests deletion but cannot erase offline copies. */
export interface SignedVaultTombstone {
  readonly format: "memoria-vault-tombstone";
  readonly schemaVersion: 1;
  readonly vaultId: string;
  readonly deletedAt: string;
  readonly signerDeviceId: string;
  readonly signatureAlgorithm: DeviceSigningAlgorithm;
  readonly signature: string;
}

/** The transport stores opaque package bytes and cannot decrypt them or call a model. */
export interface CiphertextSyncTransport {
  /** Returns all current branch heads, not a server-selected single winner. */
  fetchHeads(vaultId: string): Promise<ReadonlyArray<Uint8Array>>;
  putRevision(
    vaultId: string,
    expectedHeadRevisionIds: readonly string[],
    encryptedPackage: Uint8Array,
  ): Promise<{ readonly accepted: boolean; readonly headRevisionIds: readonly string[] }>;
  publishTombstone(vaultId: string, signedTombstone: Uint8Array): Promise<void>;
}
