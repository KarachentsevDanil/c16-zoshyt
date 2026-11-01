import { Worker } from "bullmq";
import { createDb } from "../src/store/db";
import { loadAssignment } from "./assignments";
import { GRADING_QUEUE, type GradingJob, redisConnection } from "./queue";
import { runSubmission } from "./run-submission";

const db = createDb(process.env.DATABASE_URL ?? "");

const worker = new Worker<GradingJob>(
  GRADING_QUEUE,
  async (job) => {
    const { submissionId } = job.data;
    const submission = await db.submission.findUniqueOrThrow({
      where: { id: submissionId },
      include: { assignment: { include: { course: true } } },
    });
    const { assignment } = submission;

    const report = await runSubmission(
      `submissions/${submissionId}/solution.js`,
      await loadAssignment(assignment.course.slug, assignment.slug),
    );
    await db.submission.update({
      where: { id: submissionId },
      data: { status: report.status, score: report.score },
    });
    return report;
  },
  { connection: redisConnection() },
);

worker.on("failed", (job, error) => {
  console.error(`Посилка ${job?.data.submissionId}: ${error.message}`);
});
