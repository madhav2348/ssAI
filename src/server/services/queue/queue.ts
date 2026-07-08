import { createId } from "../../utils/id";
import type { JobStatus, PipelineStage, QueueJob } from "../../types/queue";

type JobHandler<TPayload> = (job: QueueJob<TPayload>) => Promise<void>;

export class InMemoryQueue<TPayload> {
  private readonly jobs: Map<string, QueueJob<TPayload>> = new Map();
  private readonly order: string[] = [];

  async enqueue(name: string, payload: TPayload): Promise<QueueJob<TPayload>> {
    const now = new Date().toISOString();
    const job: QueueJob<TPayload> = {
      id: createId("job"),
      name,
      payload,
      createdAt: now,
      updatedAt: now,
      status: "queued",
      stage: null,
    };

    this.jobs.set(job.id, job);
    this.order.push(job.id);
    return job;
  }

  updateStatus(
    id: string,
    status: JobStatus,
    stage: PipelineStage = null,
    error?: string,
  ): void {
    const job = this.jobs.get(id);
    if (!job) return;
    job.status = status;
    job.stage = stage;
    job.updatedAt = new Date().toISOString();
    if (error !== undefined) job.error = error;
  }

  retry(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job || job.status !== "failed") return false;
    const now = new Date().toISOString();
    job.status = "queued";
    job.stage = null;
    job.error = undefined;
    job.updatedAt = now;
    // re-append to processing order
    this.order.push(id);
    return true;
  }

  async process(handler: JobHandler<TPayload>): Promise<void> {
    while (this.order.length > 0) {
      const id = this.order.shift();
      if (!id) continue;
      const job = this.jobs.get(id);
      if (!job || job.status === "processed") continue;

      // FIX: Explicitly set status to processing before the handler executes
      this.updateStatus(id, "processing");

      try {
        await handler(job);
        // Mark as completed once processed successfully
        this.updateStatus(id, "processed");
      } catch (error) {
        // Fallback: If it crashes, mark it failed so it doesn't hang forever
        this.updateStatus(
          id,
          "failed",
          null,
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  size(): number {
    return this.order.length;
  }

  getById(id: string): QueueJob<TPayload> | undefined {
    return this.jobs.get(id);
  }

  list(): QueueJob<TPayload>[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
  }

  listActive(): QueueJob<TPayload>[] {
    return this.list().filter(
      (j) => j.status === "queued" || j.status === "processing",
    );
  }
}