/** Optional contracts for voice tools. No audio samples or models belong here. */

export type VoiceRightsBasis = "self-owned" | "explicit-permission" | "licensed-synthetic";
export type VoiceExecution = "local" | "remote";

export interface VoiceCloneConsent {
  readonly consentId: string;
  readonly grantedAt: string;
  readonly expiresAt: string;
  readonly engineId: string;
  readonly sampleAssetId: string;
  readonly language: string;
  readonly description?: string;
  readonly purpose: string;
  readonly rightsBasis: VoiceRightsBasis;
  readonly processing: VoiceExecution;
  readonly allowTraining: false;
  readonly allowRetentionAfterJob: false;
  readonly mayRevoke: true;
}

/** Opaque ID pointing to encrypted local storage, never a raw filesystem path. */
export interface PrivateVoiceAssetRef {
  assetId: string;
  kind: "source-sample" | "transcript" | "voice-model";
  encrypted: true;
  createdAt: string;
}

export interface VoiceCloneRequest {
  consent: VoiceCloneConsent;
  sample: PrivateVoiceAssetRef;
  language: string;
  description?: string;
}

/** Minimal input visible to the synthesis engine; consent details stay local. */
export interface VoiceCloneEngineInput {
  requestId: string;
  sampleBytes: Uint8Array;
  language: string;
  description?: string;
  allowTraining: false;
  allowRetentionAfterJob: false;
}

/** Vault boundary: decrypt only after approval and encrypt model output at rest. */
export interface VoiceAssetVault {
  readSourceSample(assetId: string): Promise<Uint8Array>;
  storeEncryptedVoiceModel(modelBytes: Uint8Array): Promise<PrivateVoiceAssetRef>;
}

/** Optional, revocable adapter. It is not a memory provider or an LLM adapter. */
export interface VoiceEngineAdapter {
  readonly id: string;
  readonly label: string;
  readonly execution: VoiceExecution;
  cloneVoice?(request: VoiceCloneEngineInput): Promise<Uint8Array>;
  synthesize?(input: {
    voiceModel: PrivateVoiceAssetRef;
    text: string;
    consentId: string;
  }): Promise<PrivateVoiceAssetRef>;
  revoke(consentId: string): Promise<void>;
  deleteAsset(assetId: string): Promise<void>;
}
