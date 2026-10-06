import type {
  ApprovedContext,
  ContextApprovalEdits,
  ContextCandidate,
  LocalRetrievalOptions,
  MemoryQuery,
  MemoryRecord,
  ShareablePersonaField,
} from "./types.js";

export function prepareContext(
  records: readonly MemoryRecord[],
  query: MemoryQuery,
  destination: ContextCandidate["destination"],
  options?: LocalRetrievalOptions,
): ContextCandidate;
export function approveContext(
  candidate: ContextCandidate,
  selectedIds: readonly string[],
  approvalId: string,
  approvedAt?: string,
  selectedPersonaFields?: readonly ShareablePersonaField[],
  edits?: ContextApprovalEdits,
): ApprovedContext;
export function consumeApproval(grant: ApprovedContext, now?: Date): boolean;
export function approvalAuditEntry(input: ApprovedContext): {
  approvalId: string;
  approvedAt: string;
  destinationKind: "local-model" | "remote-provider";
  destinationAdapterId: string;
  destinationLabel: string;
  selectedPersonaFields: ShareablePersonaField[];
  selectedMemoryCount: number;
};
