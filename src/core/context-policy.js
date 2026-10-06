const issuedApprovals = new WeakMap();
const preparedCandidates = new WeakSet();
const consumedCandidates = new WeakSet();
const APPROVAL_LIFETIME_MS = 5 * 60 * 1000;

/** Local-only retrieval. This function does not call a model or access the network. */
export function prepareContext(records, query, destination, options = {}) {
  if (!Array.isArray(records) || records.length > 10000) throw new Error("A valid local memory list is required.");
  if (!query || typeof query !== "object" || Array.isArray(query) || typeof query.purpose !== "string" || !query.purpose.trim() || query.purpose.length > 1000) {
    throw new Error("A short, explicit purpose is required for local retrieval.");
  }
  if (typeof query.text !== "string" || query.text.length > 12000) throw new Error("The request must be text of at most 12,000 characters.");
  if (query.categories !== undefined && (!Array.isArray(query.categories) || query.categories.length > 100
    || query.categories.some((category) => typeof category !== "string" || category.length > 120))) {
    throw new Error("Retrieval categories are invalid.");
  }
  if (query.limit !== undefined && (!Number.isSafeInteger(query.limit) || query.limit < 1 || query.limit > 30)) {
    throw new Error("The retrieval limit must be between 1 and 30.");
  }
  if (Object.keys(query).some((key) => !["purpose", "text", "categories", "limit"].includes(key))) {
    throw new Error("The retrieval request contains unsupported fields.");
  }
  if (!destination || typeof destination !== "object" || Array.isArray(destination)
    || Object.keys(destination).some((key) => !["kind", "adapterId", "label"].includes(key))
    || !["local-model", "remote-provider"].includes(destination.kind)
    || typeof destination.adapterId !== "string" || !destination.adapterId.trim()
    || typeof destination.label !== "string" || !destination.label.trim()) {
    throw new Error("A specific destination must be selected before local retrieval.");
  }
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some((key) => !["assistantProfile", "now", "includeSensitive"].includes(key))) {
    throw new Error("Local retrieval options contain unsupported fields.");
  }
  if (options.includeSensitive !== undefined && typeof options.includeSensitive !== "boolean") {
    throw new Error("Sensitive-memory selection must be explicit.");
  }
  const now = options.now ?? new Date();
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error("The local retrieval time is invalid.");
  const terms = new Set(tokenize(`${query.text} ${query.purpose}`));
  const categories = query.categories?.map((category) => normalize(category));
  const limit = query.limit ?? 8;

  const selected = records
    .filter((record) => record.status === "approved")
    .filter((record) => !record.expiresAt || Date.parse(record.expiresAt) > now.getTime())
    .filter((record) => options.includeSensitive === true || record.sensitivity !== "sensitive")
    .filter((record) => !categories?.length || categories.includes(normalize(record.category)))
    .map((record) => ({ record, score: relevance(record, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.record.updatedAt.localeCompare(a.record.updatedAt))
    .slice(0, limit)
    .map((item) => item.record);

  const candidate = Object.freeze({
    query: Object.freeze({ ...query, categories: query.categories ? Object.freeze([...query.categories]) : undefined }),
    destination: Object.freeze({ ...destination }),
    records: Object.freeze(selected.map(freezeMemory)),
    assistantProfile: options.assistantProfile ? freezePersona(personaPreview(options.assistantProfile)) : undefined,
  });
  preparedCandidates.add(candidate);
  return candidate;
}

/**
 * Narrows a reviewed candidate set to a one-request grant. The UI must call
 * this only after an explicit user action; no standing consent is represented.
 */
export function approveContext(candidate, selectedIds, approvalId, approvedAt = new Date().toISOString(), selectedPersonaFields = [], edits = {}) {
  if (!preparedCandidates.has(candidate) || consumedCandidates.has(candidate)) {
    throw new Error("Approval must use a fresh preview produced by local memory retrieval.");
  }
  if (!candidate.query.purpose.trim()) throw new Error("A purpose is required before sharing context.");
  if (typeof approvalId !== "string" || !approvalId.trim()) throw new Error("A unique approval ID is required.");
  if (!isTimestamp(approvedAt)) throw new Error("The approval timestamp must be a valid ISO date-time.");
  const expiresAt = new Date(Date.now() + APPROVAL_LIFETIME_MS);
  if (!Number.isFinite(expiresAt.getTime())) throw new Error("The approval expiry is outside the supported time range.");
  if (!["local-model", "remote-provider"].includes(candidate.destination.kind)) {
    throw new Error("The destination type must be selected before approval.");
  }
  if (!candidate.destination.adapterId.trim()) throw new Error("A specific model adapter must be selected before approval.");
  if (!candidate.destination.label.trim()) throw new Error("A destination must be shown before approval.");

  if (!Array.isArray(selectedIds)) throw new Error("Selected memories must be provided as a list.");
  const byId = new Map(candidate.records.map((record) => [record.id, record]));
  const ids = [...new Set(selectedIds)];
  if (ids.some((id) => typeof id !== "string" || !byId.has(id))) {
    throw new Error("Approval includes a memory that was not in the reviewed preview.");
  }
  if (!edits || typeof edits !== "object" || Array.isArray(edits)
    || Object.keys(edits).some((key) => !["userPrompt", "memories"].includes(key))) {
    throw new Error("Only the reviewed request and selected memory excerpts can be edited.");
  }
  if (edits.userPrompt !== undefined && (typeof edits.userPrompt !== "string" || edits.userPrompt.length > 12000)) {
    throw new Error("The edited request must be text of at most 12,000 characters.");
  }
  const memoryEdits = edits.memories ?? [];
  if (!Array.isArray(memoryEdits)) throw new Error("Memory edits must be a list.");
  const editedIds = new Set();
  for (const edit of memoryEdits) {
    if (!edit || typeof edit.id !== "string" || !ids.includes(edit.id) || editedIds.has(edit.id)) {
      throw new Error("Edits must target each selected memory at most once.");
    }
    if (Object.keys(edit).some((key) => !["id", "title", "content"].includes(key))) {
      throw new Error("Memory edits may change only the reviewed title and content.");
    }
    if (edit.title !== undefined && (typeof edit.title !== "string" || edit.title.length > 120)) {
      throw new Error("An edited memory title must be text of at most 120 characters.");
    }
    if (edit.content !== undefined && (typeof edit.content !== "string" || edit.content.length > 12000)) {
      throw new Error("Edited memory content must be text of at most 12,000 characters.");
    }
    editedIds.add(edit.id);
  }
  const allowedFields = ["language", "assistantName", "personaDescription", "tone", "responseLength", "rules", "boundaries"];
  if (!Array.isArray(selectedPersonaFields)) throw new Error("Selected profile fields must be provided as a list.");
  const personaFields = [...new Set(selectedPersonaFields)];
  if (personaFields.some((field) => !allowedFields.includes(field))) {
    throw new Error("Approval includes a persona field that is not shareable.");
  }
  if (personaFields.length && !candidate.assistantProfile) {
    throw new Error("No assistant profile was included in the reviewed preview.");
  }
  if (personaFields.some((field) => candidate.assistantProfile?.[field] === undefined)) {
    throw new Error("Approval includes a persona field that was not present in the reviewed preview.");
  }

  const selectedMemories = Object.freeze(ids.map((id) => {
    const record = byId.get(id);
    const edit = memoryEdits.find((item) => item.id === id);
    return Object.freeze({
      title: edit?.title ?? record.title,
      content: edit?.content ?? record.content,
    });
  }));
  const selectedProfile = personaFields.length
    ? freezePersona(pickPersonaFields(candidate.assistantProfile, personaFields))
    : undefined;
  const grant = Object.freeze({
    approvalId,
    approvedAt,
    expiresAt: expiresAt.toISOString(),
    destination: Object.freeze({ ...candidate.destination }),
    purpose: candidate.query.purpose,
    userPrompt: edits.userPrompt ?? candidate.query.text,
    selectedPersonaFields: Object.freeze(personaFields),
    assistantProfile: selectedProfile,
    selectedMemories,
  });
  consumedCandidates.add(candidate);
  issuedApprovals.set(grant, monotonicNow());
  return grant;
}

/** An adapter runner consumes grants once so they cannot be replayed. */
export function consumeApproval(grant, now = new Date()) {
  const issuedAt = issuedApprovals.get(grant);
  if (issuedAt === undefined) return false;
  const elapsed = monotonicNow() - issuedAt;
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())
    || !Number.isFinite(elapsed) || elapsed < 0 || elapsed >= APPROVAL_LIFETIME_MS
    || !isTimestamp(grant.expiresAt) || Date.parse(grant.expiresAt) <= now.getTime()) {
    issuedApprovals.delete(grant);
    return false;
  }
  issuedApprovals.delete(grant);
  return true;
}

/** Audit metadata deliberately excludes prompt and memory contents. */
export function approvalAuditEntry(input) {
  return {
    approvalId: input.approvalId,
    approvedAt: input.approvedAt,
    destinationKind: input.destination.kind,
    destinationAdapterId: input.destination.adapterId,
    destinationLabel: input.destination.label,
    selectedPersonaFields: [...input.selectedPersonaFields],
    selectedMemoryCount: input.selectedMemories.length,
  };
}

function personaPreview(profile) {
  return {
    language: profile.language,
    assistantName: profile.identity?.name,
    personaDescription: profile.identity?.description,
    tone: profile.behavior.tone,
    responseLength: profile.behavior.responseLength,
    rules: [...profile.behavior.rules],
    boundaries: [...profile.behavior.boundaries],
  };
}

function pickPersonaFields(profile, fields) {
  const selected = {};
  for (const field of fields) {
    const value = profile[field];
    if (value !== undefined) Object.assign(selected, { [field]: value });
  }
  return selected;
}

function freezePersona(profile) {
  const copy = { ...profile };
  if (profile.rules) copy.rules = Object.freeze([...profile.rules]);
  if (profile.boundaries) copy.boundaries = Object.freeze([...profile.boundaries]);
  return Object.freeze(copy);
}

function freezeMemory(record) {
  return Object.freeze({
    ...record,
    tags: Object.freeze([...record.tags]),
    source: Object.freeze({ ...record.source }),
  });
}

function relevance(record, terms) {
  const title = tokenize(record.title);
  const category = tokenize(record.category);
  const tags = record.tags.flatMap(tokenize);
  const content = tokenize(record.content);
  let score = 0;
  for (const term of terms) {
    if (title.includes(term)) score += 5;
    if (tags.includes(term)) score += 4;
    if (category.includes(term)) score += 3;
    if (content.includes(term)) score += 1;
  }
  return score;
}

function normalize(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function tokenize(value) {
  return normalize(value).match(/[\p{L}\p{N}]+/gu) ?? [];
}

function isTimestamp(value) {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value));
}

function monotonicNow() {
  const value = globalThis.performance?.now?.();
  if (!Number.isFinite(value)) throw new Error("A monotonic clock is required for short-lived approvals.");
  return value;
}
