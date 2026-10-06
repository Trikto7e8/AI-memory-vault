import { changeEnvelopePassphrase, createVaultSession, encryptSnapshotPayload, MAX_BACKUP_BYTES, unlockEnvelope, validateEnvelope } from "../crypto/encrypted-envelope.js";
import { approveContext, prepareContext } from "./context-policy.js";
import { createMemoryRecord, deleteMemory as deleteMemoryRecord, saveMemory as saveMemoryRecord, setMemoryStatus as setMemoryRecordStatus } from "./memory-operations.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

/** Create a vault over any persistence adapter that stores opaque ciphertext bytes only. */
export async function createEncryptedVault({ store, passphrase, snapshot, validateSnapshot }) {
  assertStore(store);
  if (await store.readEncryptedEnvelope() !== undefined) throw new Error("An encrypted vault already exists in this store.");
  const session = await createVaultSession(passphrase, clone(snapshot), validateSnapshot);
  const storedBytes = encodeEnvelope(session.envelope);
  await store.createEncryptedEnvelope(storedBytes);
  return createSession(store, session, validateSnapshot, storedBytes);
}

/** Unlock an existing encrypted vault from a persistence adapter. */
export async function openEncryptedVault({ store, passphrase, validateSnapshot }) {
  assertStore(store);
  const bytes = await store.readEncryptedEnvelope();
  if (!(bytes instanceof Uint8Array)) throw new Error("No encrypted vault exists in this store.");
  const session = await unlockEnvelope(decodeEnvelope(bytes), passphrase, validateSnapshot);
  return createSession(store, session, validateSnapshot, new Uint8Array(bytes));
}

/** Import a validated encrypted backup into an empty store without exposing plaintext to the store. */
export async function importEncryptedVault({ store, backupBytes, passphrase, validateSnapshot, replaceExisting = false }) {
  assertStore(store);
  const existing = await store.readEncryptedEnvelope();
  if (existing !== undefined && replaceExisting !== true) {
    throw new Error("The destination store must be empty unless replacement was explicitly approved.");
  }
  if (!(backupBytes instanceof Uint8Array)) throw new Error("An encrypted backup byte array is required.");
  const backupCopy = new Uint8Array(backupBytes);
  const envelope = decodeEnvelope(backupCopy);
  const session = await unlockEnvelope(envelope, passphrase, validateSnapshot);
  if (existing === undefined) await store.createEncryptedEnvelope(backupCopy);
  else if (!await store.compareAndSwapEncryptedEnvelope(existing, backupCopy)) throw staleSessionError();
  return createSession(store, session, validateSnapshot, backupCopy);
}

function createSession(store, initialSession, validateSnapshot, initialStoredBytes) {
  let snapshot = initialSession.snapshot;
  let envelope = initialSession.envelope;
  let dataKey = initialSession.dataKey;
  let locked = false;
  let queue = Promise.resolve();
  let revision = 0;
  let storedBytes = new Uint8Array(initialStoredBytes);
  const sessionCandidates = new WeakMap();

  function assertUnlocked() {
    if (locked || !dataKey || !snapshot || !envelope) throw new Error("The encrypted vault session is locked.");
  }

  function enqueue(change) {
    assertUnlocked();
    return serialize(async () => {
      assertUnlocked();
      await ensureCurrentRevision();
      const changed = change(snapshot);
      const nextSnapshot = { ...changed, exportedAt: new Date().toISOString() };
      if (!validateSnapshot(nextSnapshot)) throw new Error("The updated vault snapshot is invalid.");
      const nextPayload = await encryptSnapshotPayload(dataKey, nextSnapshot, validateSnapshot);
      const nextEnvelope = { ...envelope, payload: nextPayload };
      const nextStoredBytes = encodeEnvelope(nextEnvelope);
      if (!await store.compareAndSwapEncryptedEnvelope(storedBytes, nextStoredBytes)) throw staleSessionError();
      snapshot = nextSnapshot;
      envelope = nextEnvelope;
      storedBytes = nextStoredBytes;
      revision += 1;
      return clone(nextSnapshot);
    });
  }

  function serialize(operation) {
    const pending = queue.then(operation);
    queue = pending.catch(() => undefined);
    return pending;
  }

  async function ensureCurrentRevision() {
    const current = await store.readEncryptedEnvelope();
    if (!(current instanceof Uint8Array) || !bytesEqual(current, storedBytes)) throw staleSessionError();
  }

  return Object.freeze({
    isLocked: () => locked,
    readSnapshot: async () => {
      await queue;
      assertUnlocked();
      await ensureCurrentRevision();
      return clone(snapshot);
    },
    saveMemory: async (input, id) => {
      const now = new Date().toISOString();
      const record = createMemoryRecord(input, { id: id ?? crypto.randomUUID(), now });
      const saved = await enqueue((current) => saveMemoryRecord(current, record, now));
      return saved.memories.find((memory) => memory.id === record.id);
    },
    setMemoryStatus: async (id, status) => enqueue((current) => setMemoryRecordStatus(current, id, status, new Date().toISOString())),
    deleteMemory: async (id) => enqueue((current) => deleteMemoryRecord(current, id)),
    updateProfile: async (profile) => {
      const nextProfile = clone(profile);
      return enqueue((current) => ({ ...current, profile: nextProfile }));
    },
    previewContext: async (query, destination, options = {}) => {
      await queue;
      assertUnlocked();
      await ensureCurrentRevision();
      if (!options || typeof options !== "object" || Array.isArray(options)
        || Object.keys(options).some((key) => !["now", "includeSensitive"].includes(key))) {
        throw new Error("Only local retrieval controls may be supplied; the assistant profile comes from the vault.");
      }
      const candidate = prepareContext(snapshot.memories, query, destination, {
        assistantProfile: snapshot.profile,
        ...options,
      });
      sessionCandidates.set(candidate, revision);
      return candidate;
    },
    approveContext: (candidate, selectedIds, approvalId, approvedAt, selectedPersonaFields, edits) => serialize(async () => {
      assertUnlocked();
      await ensureCurrentRevision();
      if (sessionCandidates.get(candidate) !== revision) throw new Error("Context must be previewed again after any vault change before approval.");
      return approveContext(candidate, selectedIds, approvalId, approvedAt, selectedPersonaFields, edits);
    }),
    exportEncryptedBackup: async () => {
      await queue;
      assertUnlocked();
      await ensureCurrentRevision();
      return encodeEnvelope(envelope);
    },
    changePassphrase: (currentPassphrase, newPassphrase) => serialize(async () => {
      assertUnlocked();
      await ensureCurrentRevision();
      const nextEnvelope = await changeEnvelopePassphrase(envelope, currentPassphrase, newPassphrase);
      const nextStoredBytes = encodeEnvelope(nextEnvelope);
      if (!await store.compareAndSwapEncryptedEnvelope(storedBytes, nextStoredBytes)) throw staleSessionError();
      envelope = nextEnvelope;
      storedBytes = nextStoredBytes;
    }),
    lock: () => serialize(async () => {
      assertUnlocked();
      locked = true;
      snapshot = undefined;
      envelope = undefined;
      dataKey = undefined;
    }),
    destroy: () => serialize(async () => {
      assertUnlocked();
      if (!await store.clearEncryptedEnvelope(storedBytes)) throw staleSessionError();
      locked = true;
      snapshot = undefined;
      envelope = undefined;
      dataKey = undefined;
    }),
  });
}

function assertStore(store) {
  if (!store || typeof store.readEncryptedEnvelope !== "function"
    || typeof store.createEncryptedEnvelope !== "function"
    || typeof store.compareAndSwapEncryptedEnvelope !== "function"
    || typeof store.clearEncryptedEnvelope !== "function") {
    throw new Error("An encrypted vault store with atomic create, compare-and-swap, and clear operations is required.");
  }
}

function bytesEqual(left, right) {
  if (left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

function staleSessionError() {
  return new Error("Another session changed this vault. Lock and reopen it before continuing.");
}

function encodeEnvelope(envelope) {
  const bytes = encoder.encode(JSON.stringify(envelope));
  if (bytes.byteLength > MAX_BACKUP_BYTES) throw new Error("The encrypted vault exceeds the supported size limit.");
  return bytes;
}

function decodeEnvelope(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength > MAX_BACKUP_BYTES) {
    throw new Error("Encrypted vault bytes are missing or exceed the supported size limit.");
  }
  let envelope;
  try {
    envelope = JSON.parse(decoder.decode(bytes));
  } catch {
    throw new Error("Encrypted vault data is not valid UTF-8 JSON.");
  }
  if (!validateEnvelope(envelope)) throw new Error("Encrypted vault format is not recognized.");
  return envelope;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
