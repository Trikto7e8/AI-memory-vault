/** @typedef {import("./types").MemoryRecord} MemoryRecord */
/** @typedef {import("./types").MemoryStatus} MemoryStatus */
/** @typedef {import("./types").Sensitivity} Sensitivity */
/** @typedef {import("./types").MemoryKind} MemoryKind */
/** @typedef {import("./types").VaultSnapshot} VaultSnapshot */

/**
 * @typedef {object} NewMemoryInput
 * @property {MemoryKind} kind
 * @property {string} category
 * @property {string} title
 * @property {string} content
 * @property {readonly string[]=} tags
 * @property {Sensitivity=} sensitivity
 * @property {MemoryRecord["source"]} source
 * @property {string=} expiresAt
 */

/**
 * @typedef {object} MemoryOperationContext
 * @property {string} id
 * @property {string} now
 */

/** Creates a detached record; callers persist it only through the encrypted vault. */
/** @param {NewMemoryInput} input @param {MemoryOperationContext} context @returns {MemoryRecord} */
export function createMemoryRecord(input, context) {
  if (!hasOnlyKeys(input, ["kind", "category", "title", "content", "tags", "sensitivity", "source", "expiresAt"])) {
    throw new Error("Memory input contains unsupported fields.");
  }
  if (!hasOnlyKeys(context, ["id", "now"])) throw new Error("Memory operation context contains unsupported fields.");
  if (!hasOnlyKeys(input.source, ["type", "label", "capturedAt"])) {
    throw new Error("Memory provenance contains unsupported fields.");
  }
  if (typeof input.title !== "string" || typeof input.category !== "string") {
    throw new Error("Memory title and category must be text.");
  }
  const title = input.title.trim();
  const category = input.category.trim();
  if (!isUuid(context.id)) throw new Error("A stable UUID is required for each memory.");
  if (!isDate(context.now)) throw new Error("The operation timestamp must be a valid date.");
  if (!title || title.length > 120) throw new Error("A memory title is required and must be at most 120 characters.");
  if (!category || category.length > 120) throw new Error("A memory category is required and must be at most 120 characters.");
  if (typeof input.content !== "string" || input.content.length > 12000) throw new Error("Memory content must be at most 12,000 characters.");
  if (input.tags !== undefined && (!Array.isArray(input.tags) || input.tags.length > 100 || input.tags.some((tag) => typeof tag !== "string" || tag.length > 80))) {
    throw new Error("A memory can have at most 100 tags of at most 80 characters each.");
  }
  if (input.expiresAt !== undefined && !isDate(input.expiresAt)) throw new Error("Memory expiry must be a valid date.");
  if (!["fact", "preference", "project", "note", "voice-preference"].includes(input.kind)) throw new Error("Unknown memory kind.");
  if (input.sensitivity !== undefined && !["ordinary", "sensitive"].includes(input.sensitivity)) throw new Error("Unknown sensitivity level.");
  if (!input.source || !["user-authored", "conversation-import", "assistant-suggestion"].includes(input.source.type) || !isDate(input.source.capturedAt)) {
    throw new Error("Memory provenance must have a recognized source and timestamp.");
  }
  if (input.source.label !== undefined && (typeof input.source.label !== "string" || input.source.label.length > 300)) {
    throw new Error("The source label must be at most 300 characters.");
  }

  const tags = [...new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
  return Object.freeze({
    schemaVersion: 1,
    id: context.id,
    kind: input.kind,
    category,
    title,
    content: input.content,
    tags: Object.freeze(tags),
    status: input.source.type === "user-authored" ? "approved" : "suggested",
    sensitivity: input.sensitivity ?? "ordinary",
    source: Object.freeze({ ...input.source }),
    createdAt: context.now,
    updatedAt: context.now,
    ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
  });
}

/** Adds or replaces one record without mutating the source snapshot. */
/** @param {VaultSnapshot} snapshot @param {MemoryRecord} record @param {string} updatedAt @returns {VaultSnapshot} */
export function saveMemory(snapshot, record, updatedAt) {
  assertMemoryRecord(record);
  assertMemoryList(snapshot);
  if (!isDate(updatedAt)) throw new Error("The update timestamp must be a valid date.");
  const existing = snapshot.memories.find((item) => item.id === record.id);
  if (!existing && snapshot.memories.length >= 10000) throw new Error("A vault can contain at most 10,000 memories.");
  const saved = Object.freeze({
    ...record,
    createdAt: existing?.createdAt ?? record.createdAt,
    updatedAt,
    tags: Object.freeze([...record.tags]),
    source: Object.freeze({ ...record.source }),
  });
  const memories = existing
    ? snapshot.memories.map((item) => item.id === record.id ? saved : item)
    : [saved, ...snapshot.memories];
  return { ...snapshot, memories };
}

/** Changes review state explicitly; imported and assistant-suggested memories can stay pending. */
/** @param {VaultSnapshot} snapshot @param {string} id @param {MemoryStatus} status @param {string} updatedAt @returns {VaultSnapshot} */
export function setMemoryStatus(snapshot, id, status, updatedAt) {
  assertMemoryList(snapshot);
  if (!isUuid(id)) throw new Error("A valid memory UUID is required.");
  if (!isDate(updatedAt)) throw new Error("The update timestamp must be a valid date.");
  if (!["suggested", "approved", "archived"].includes(status)) throw new Error("Unknown memory review status.");
  let found = false;
  const memories = snapshot.memories.map((record) => {
    if (record.id !== id) return record;
    assertMemoryRecord(record);
    found = true;
    return Object.freeze({ ...record, status, updatedAt });
  });
  if (!found) throw new Error("The memory to review does not exist.");
  return { ...snapshot, memories };
}

/** Deletion is explicit and returns a new snapshot; encrypted persistence is the caller's responsibility. */
/** @param {VaultSnapshot} snapshot @param {string} id @returns {VaultSnapshot} */
export function deleteMemory(snapshot, id) {
  assertMemoryList(snapshot);
  if (!isUuid(id)) throw new Error("A valid memory UUID is required.");
  return { ...snapshot, memories: snapshot.memories.filter((record) => record.id !== id) };
}

/** Reject malformed or extended records before they enter a vault snapshot. */
function assertMemoryRecord(record) {
  if (!hasOnlyKeys(record, ["schemaVersion", "id", "kind", "category", "title", "content", "tags", "status", "sensitivity", "source", "createdAt", "updatedAt", "expiresAt"])) {
    throw new Error("Memory record contains unsupported fields.");
  }
  if (!hasOnlyKeys(record.source, ["type", "label", "capturedAt"])) throw new Error("Memory provenance contains unsupported fields.");
  if (record.schemaVersion !== 1 || !isUuid(record.id)) throw new Error("Memory record identity or schema is invalid.");
  if (!["fact", "preference", "project", "note", "voice-preference"].includes(record.kind)) throw new Error("Unknown memory kind.");
  if (typeof record.category !== "string" || !record.category.trim() || record.category.length > 120) throw new Error("Memory category is invalid.");
  if (typeof record.title !== "string" || !record.title.trim() || record.title.length > 120) throw new Error("Memory title is invalid.");
  if (typeof record.content !== "string" || record.content.length > 12000) throw new Error("Memory content is invalid.");
  if (!Array.isArray(record.tags) || record.tags.length > 100 || record.tags.some((tag) => typeof tag !== "string" || tag.length > 80)) {
    throw new Error("Memory tags are invalid.");
  }
  if (new Set(record.tags).size !== record.tags.length) throw new Error("Memory tags must be unique.");
  if (!["suggested", "approved", "archived"].includes(record.status)) throw new Error("Memory review status is invalid.");
  if (!["ordinary", "sensitive"].includes(record.sensitivity)) throw new Error("Memory sensitivity is invalid.");
  if (!record.source || !["user-authored", "conversation-import", "assistant-suggestion"].includes(record.source.type)
    || !isDate(record.source.capturedAt)) throw new Error("Memory provenance is invalid.");
  if (record.source.label !== undefined && (typeof record.source.label !== "string" || record.source.label.length > 300)) {
    throw new Error("Memory source label is invalid.");
  }
  if (!isDate(record.createdAt) || !isDate(record.updatedAt)
    || (record.expiresAt !== undefined && !isDate(record.expiresAt))) throw new Error("Memory timestamps are invalid.");
}

function assertMemoryList(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.memories) || snapshot.memories.length > 10000) {
    throw new Error("A valid vault memory list is required.");
  }
  const ids = new Set();
  for (const record of snapshot.memories) {
    assertMemoryRecord(record);
    if (ids.has(record.id)) throw new Error("Vault memory IDs must be unique.");
    ids.add(record.id);
  }
}

/** @param {string} value */
function isDate(value) {
  return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
}

/** @param {string} value */
function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hasOnlyKeys(value, allowedKeys) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).every((key) => allowedKeys.includes(key));
}
