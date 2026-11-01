import { Queue } from "bullmq";

export const GRADING_QUEUE = "grading";

export interface GradingJob {
  submissionId: number;
}

export function redisConnection() {
  const { hostname, port } = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
  return { host: hostname, port: Number(port || 6379) };
}

export function createGradingQueue(): Queue<GradingJob> {
  return new Queue<GradingJob>(GRADING_QUEUE, { connection: redisConnection() });
}
