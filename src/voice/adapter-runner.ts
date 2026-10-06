import type { VoiceAssetVault, VoiceCloneRequest, VoiceEngineAdapter, PrivateVoiceAssetRef } from "./types.js";
import { consumeVoiceCloneConsent } from "./consent-policy.js";

/** Enforces the one-use consent boundary before passing a sample to an engine. */
export async function runVoiceClone(
  adapter: VoiceEngineAdapter,
  request: VoiceCloneRequest,
  vault: VoiceAssetVault,
): Promise<PrivateVoiceAssetRef> {
  if (!adapter.cloneVoice) throw new Error("This voice engine does not support cloning.");
  if (!request.sample.encrypted || request.sample.kind !== "source-sample") {
    throw new Error("The selected source sample must be stored as an encrypted private asset.");
  }
  if (!consumeVoiceCloneConsent(request.consent, {
    engineId: adapter.id,
    sampleAssetId: request.sample.assetId,
    language: request.language,
    description: request.description,
    processing: adapter.execution,
  })) {
    throw new Error("Voice-clone consent is missing, expired, already used, or does not match this engine and sample.");
  }

  let sampleBytes: Uint8Array | undefined;
  let modelBytes: Uint8Array | undefined;
  try {
    sampleBytes = await vault.readSourceSample(request.sample.assetId);
    if (!(sampleBytes instanceof Uint8Array) || sampleBytes.byteLength === 0) {
      throw new Error("The selected sample could not be decrypted from the local vault.");
    }
    modelBytes = await adapter.cloneVoice({
      requestId: crypto.randomUUID(),
      sampleBytes,
      language: request.language,
      description: request.description,
      allowTraining: request.consent.allowTraining,
      allowRetentionAfterJob: request.consent.allowRetentionAfterJob,
    });
    if (!(modelBytes instanceof Uint8Array) || modelBytes.byteLength === 0) {
      throw new Error("The voice engine did not return a valid model asset.");
    }
    const stored = await vault.storeEncryptedVoiceModel(modelBytes);
    if (!stored?.encrypted || stored.kind !== "voice-model" || !stored.assetId) {
      throw new Error("The vault did not confirm encrypted storage of the voice model.");
    }
    return stored;
  } finally {
    sampleBytes?.fill(0);
    modelBytes?.fill(0);
  }
}
