import { consumeApproval } from "./context-policy.js";

/** Pass only a valid one-use context grant to its explicitly approved adapter. */
export async function runApprovedContext(adapter, grant) {
  if (!adapter || typeof adapter !== "object"
    || typeof adapter.id !== "string" || !adapter.id.trim()
    || typeof adapter.label !== "string" || !adapter.label.trim()
    || !["local", "remote"].includes(adapter.execution)
    || typeof adapter.generate !== "function") {
    throw new Error("A valid model adapter is required.");
  }
  const expectedKind = adapter.execution === "local" ? "local-model" : "remote-provider";
  if (grant?.destination?.kind !== expectedKind
    || grant.destination.adapterId !== adapter.id
    || grant.destination.label !== adapter.label) {
    throw new Error("The approved destination does not match the selected model adapter.");
  }
  if (!consumeApproval(grant)) throw new Error("This context grant is invalid, already used, or was not approved in this session.");
  const modelInput = Object.freeze({
    purpose: grant.purpose,
    userPrompt: grant.userPrompt,
    assistantProfile: grant.assistantProfile,
    selectedMemories: Object.freeze(grant.selectedMemories.map((memory) => Object.freeze({
      title: memory.title,
      content: memory.content,
    }))),
  });
  const result = await adapter.generate(modelInput);
  if (typeof result !== "string") throw new Error("The model adapter must return a text result.");
  return result;
}
