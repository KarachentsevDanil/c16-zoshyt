import { parseArgs } from "node:util";
import { PrismaCoursesRepo } from "../courses/repo";
import { createDb } from "../store/db";
import { sendDeadlineReminders } from "./deadline-reminders";
import { poshtarTransport } from "./transports/poshtar";

const { values } = parseArgs({
  options: {
    course: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
});

if (!values.course) {
  console.error("Використання: npm run send-deadline-reminders -- --course <slug> [--dry-run]");
  process.exit(1);
}

const db = createDb(process.env.DATABASE_URL ?? "");

const processed = await sendDeadlineReminders(
  {
    courses: new PrismaCoursesRepo(db),
    transport: poshtarTransport({
      apiUrl: process.env.POSHTAR_API_URL ?? "",
      apiKey: process.env.POSHTAR_API_KEY ?? "",
    }),
    now: () => new Date(),
  },
  { course: values.course, dryRun: values["dry-run"] },
);

console.log(`Оброблено листів: ${processed}`);
await db.$disconnect();
