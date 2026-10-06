import type { ApprovedContext, ModelAdapter } from "./types.js";

export function runApprovedContext(adapter: ModelAdapter, grant: ApprovedContext): Promise<string>;
