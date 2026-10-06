import type { VoiceCloneConsent, VoiceRightsBasis, VoiceExecution } from "./types.js";

export interface VoiceCloneConsentRequest {
  engineId: string;
  sampleAssetId: string;
  language: string;
  description?: string;
  purpose: string;
  rightsBasis: VoiceRightsBasis;
  processing: VoiceExecution;
}

const activeConsents = new WeakMap<object, number>();
const CONSENT_LIFETIME_MS = 5 * 60 * 1000;
const RIGHTS_BASES: readonly VoiceRightsBasis[] = ["self-owned", "explicit-permission", "licensed-synthetic"];
const EXECUTIONS: readonly VoiceExecution[] = ["local", "remote"];

/** Issue a short-lived, single-use capability only after the UI confirms consent. */
export function grantVoiceCloneConsent(
  request: VoiceCloneConsentRequest,
  userConfirmed: boolean,
  now = new Date(),
): VoiceCloneConsent {
  if (userConfirmed !== true) throw new Error("Voice cloning requires explicit user confirmation.");
  if (!request || typeof request !== "object" || Array.isArray(request)
    || Object.keys(request).some((key) => !["engineId", "sampleAssetId", "language", "description", "purpose", "rightsBasis", "processing"].includes(key))) {
    throw new Error("The voice-clone consent request contains unsupported fields.");
  }
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error("A valid consent time is required.");
  if (
    typeof request.engineId !== "string" || !request.engineId.trim()
    || request.engineId.length > 200
    || typeof request.sampleAssetId !== "string" || !request.sampleAssetId.trim()
    || request.sampleAssetId.length > 200
    || typeof request.language !== "string" || !request.language.trim() || request.language.length > 80
    || (request.description !== undefined && (typeof request.description !== "string" || request.description.length > 1000))
    || typeof request.purpose !== "string" || !request.purpose.trim() || request.purpose.length > 1000
  ) {
    throw new Error("Consent must identify the engine, selected sample, and purpose.");
  }
  if (!RIGHTS_BASES.includes(request.rightsBasis)) {
    throw new Error("A valid rights basis is required for voice cloning.");
  }
  if (!EXECUTIONS.includes(request.processing)) {
    throw new Error("A valid processing location is required for voice cloning.");
  }
  const expiresAt = new Date(now.getTime() + CONSENT_LIFETIME_MS);
  if (!Number.isFinite(expiresAt.getTime())) throw new Error("The voice-clone consent expiry is outside the supported time range.");

  const consent: VoiceCloneConsent = Object.freeze({
    consentId: crypto.randomUUID(),
    grantedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    engineId: request.engineId,
    sampleAssetId: request.sampleAssetId,
    language: request.language,
    ...(request.description === undefined ? {} : { description: request.description }),
    purpose: request.purpose,
    rightsBasis: request.rightsBasis,
    processing: request.processing,
    allowTraining: false,
    allowRetentionAfterJob: false,
    mayRevoke: true,
  });
  activeConsents.set(consent, monotonicNow());
  return consent;
}

/** Consume consent only when it matches the exact engine, location, and sample. */
export function consumeVoiceCloneConsent(
  consent: VoiceCloneConsent,
  target: { engineId: string; sampleAssetId: string; language: string; description?: string; processing: VoiceExecution },
  now = new Date(),
): boolean {
  const issuedAt = activeConsents.get(consent);
  if (issuedAt === undefined) return false;
  const elapsed = monotonicNow() - issuedAt;
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())
    || !target || typeof target !== "object" || Array.isArray(target)
    || !Number.isFinite(elapsed) || elapsed < 0 || elapsed >= CONSENT_LIFETIME_MS
    || typeof target.engineId !== "string" || typeof target.sampleAssetId !== "string"
    || typeof target.language !== "string"
    || (target.description !== undefined && typeof target.description !== "string")
    || !EXECUTIONS.includes(target.processing)) {
    activeConsents.delete(consent);
    return false;
  }
  if (Date.parse(consent.expiresAt) <= now.getTime()) {
    activeConsents.delete(consent);
    return false;
  }
  // Any consumption attempt spends the grant, including a destination mismatch.
  // A caller must obtain fresh consent before retrying with another target.
  activeConsents.delete(consent);
  if (
    consent.engineId !== target.engineId
    || consent.sampleAssetId !== target.sampleAssetId
    || consent.language !== target.language
    || consent.description !== target.description
    || consent.processing !== target.processing
  ) return false;

  return true;
}

/** Cancel a pending consent token before the operation starts. */
export function revokePendingVoiceCloneConsent(consent: VoiceCloneConsent): boolean {
  return activeConsents.delete(consent);
}

function monotonicNow(): number {
  const value = globalThis.performance?.now?.();
  if (!Number.isFinite(value)) throw new Error("A monotonic clock is required for short-lived voice consent.");
  return value;
}
