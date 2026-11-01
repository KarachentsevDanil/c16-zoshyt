import { loadAssignment } from "./assignments";
import { runSubmission } from "./run-submission";

const [submissionId, course = "js-basics", slug = "hw-06"] = process.argv.slice(2);

if (!submissionId) {
  console.error("Використання: npm run grade -- <номер посилки> [курс] [завдання]");
  process.exit(1);
}

const report = await runSubmission(`submissions/${submissionId}/solution.js`, await loadAssignment(course, slug));

console.log(`Посилка ${submissionId}: ${report.status}, оцінка ${report.score}`);
for (const { input, status } of report.cases) {
  console.log(`  ${status.padEnd(7)} ${JSON.stringify(input)}`);
}
