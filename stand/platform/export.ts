// Імітує вивантаження зі staging: дамп студентів і посилки для дебагу.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildStudents, type DumpStudent } from "./students";

const DAY_MS = 24 * 60 * 60 * 1000;

const COURSE = "js-basics";
const ASSIGNMENT = "hw-06";

const SUBMISSIONS = [
  { id: 4417, studentId: 1 },
  { id: 4502, studentId: 2 },
];

function exportHeader(submissionId: number, student: DumpStudent): string {
  return `// Зошит · посилка ${submissionId} · ${COURSE}/${ASSIGNMENT} · ${student.name} <${student.email}>`;
}

const students = buildStudents();
const now = Date.now();

await mkdir("dumps", { recursive: true });
await writeFile(
  "dumps/staging_students.json",
  `${JSON.stringify(
    {
      exportedAt: new Date(now).toISOString(),
      courses: [
        {
          slug: COURSE,
          title: "Основи JavaScript",
          assignments: [
            { slug: "hw-05", title: "Сортування", deadlineAt: new Date(now - 7 * DAY_MS).toISOString() },
            { slug: ASSIGNMENT, title: "Медіана", deadlineAt: new Date(now + 7 * DAY_MS).toISOString() },
          ],
        },
      ],
      students,
      submissions: SUBMISSIONS.map(({ id, studentId }) => ({ id, studentId, course: COURSE, assignment: ASSIGNMENT })),
    },
    null,
    2,
  )}\n`,
);

for (const { id, studentId } of SUBMISSIONS) {
  const student = students.find((candidate) => candidate.id === studentId)!;
  const source = await readFile(new URL(`./raw/${id}.js`, import.meta.url), "utf8");
  await mkdir(`submissions/${id}`, { recursive: true });
  await writeFile(`submissions/${id}/solution.js`, `${exportHeader(id, student)}\n${source}`);
}

console.log(`Дамп: ${students.length} студентів. Посилки: ${SUBMISSIONS.map(({ id }) => id).join(", ")}.`);
