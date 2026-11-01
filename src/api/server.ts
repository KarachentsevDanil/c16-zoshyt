import { createGradingQueue } from "../../grader/queue";
import { PrismaCoursesRepo } from "../courses/repo";
import { createDb } from "../store/db";
import { PrismaSubmissionsRepo } from "../submissions/repo";
import { buildApp } from "./app";

const db = createDb(process.env.DATABASE_URL ?? "");
const grading = createGradingQueue();

const app = buildApp(
  {
    courses: new PrismaCoursesRepo(db),
    submissions: new PrismaSubmissionsRepo(db),
    enqueueGrading: async (submissionId) => {
      await grading.add("grade", { submissionId });
    },
    now: () => new Date(),
  },
  { logger: true },
);

await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });
