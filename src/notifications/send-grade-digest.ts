import { parseArgs } from "node:util";
import { PrismaCoursesRepo } from "../courses/repo";
import { createDb } from "../store/db";
import { sendGradeDigest } from "./grade-digest";
import { createTransport } from "./transport";

const { values } = parseArgs({
  options: {
    course: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
});

if (!values.course) {
  console.error("Використання: npm run send-grade-digest -- --course <slug> [--dry-run]");
  process.exit(1);
}

const db = createDb(process.env.DATABASE_URL ?? "");

const processed = await sendGradeDigest(
  { courses: new PrismaCoursesRepo(db), transport: createTransport() },
  { course: values.course, dryRun: values["dry-run"] },
);

console.log(`Оброблено листів: ${processed}`);
await db.$disconnect();
