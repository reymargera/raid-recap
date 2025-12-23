// Custom worker entrypoint that combines OpenNext with Cloudflare Workflows
// See: https://opennext.js.org/cloudflare/howtos/custom-worker

// @ts-ignore `.open-next/worker.ts` is generated at build time
import { default as openNextHandler } from "./.open-next/worker.js";

// Re-export OpenNext's durable objects (required for caching)
// @ts-ignore `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

// Export Cloudflare Workflows (named exports per Cloudflare docs)
export { ProcessReportWorkflow } from "./src/workflows/process-report-workflow";

// Re-export the OpenNext fetch handler as the default export
export default {
  fetch: openNextHandler.fetch,
} satisfies ExportedHandler<CloudflareEnv>;
