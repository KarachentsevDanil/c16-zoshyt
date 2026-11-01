// Відновлює локальну базу з дампа staging.
import { readFile } from "node:fs/promises";
import { createDb } from "../../src/store/db";
import type { DumpStudent } from "./students";

interface Dump {
  courses: {
    slug: string;
    title: string;
    assignments: { slug: string; title: string; deadlineAt: string }[];
  }[];
  students: DumpStudent[];
  submissions: { id: number; studentId: number; course: string; assignment: string }[];
}

const dump = JSON.parse(await readFile("dumps/staging_students.json", "utf8")) as Dump;
const db = createDb(process.env.DATABASE_URL ?? "");

await db.$transaction([
  db.submission.deleteMany(),
  db.grade.deleteMany(),
  db.enrollment.deleteMany(),
  db.assignment.deleteMany(),
  db.course.deleteMany(),
  db.student.deleteMany(),
]);

await db.student.createMany({
  data: dump.students.map(({ id, name, email }) => ({ id, name, email })),
});

for (const { slug, title, assignments } of dump.courses) {
  const course = await db.course.create({
    data: {
      slug,
      title,
      assignments: { create: assignments },
    },
    include: { assignments: true },
  });

  await db.enrollment.createMany({
    data: dump.students.map(({ id }) => ({ studentId: id, courseId: course.id })),
  });
  await db.grade.createMany({
    data: dump.students.flatMap(({ id, scores }) =>
      scores.map(({ assignment, score }) => ({
        studentId: id,
        assignmentId: course.assignments.find((candidate) => candidate.slug === assignment)!.id,
        score,
      })),
    ),
  });
  await db.submission.createMany({
    data: dump.submissions
      .filter((submission) => submission.course === slug)
      .map(({ id, studentId, assignment }) => ({
        id,
        studentId,
        assignmentId: course.assignments.find((candidate) => candidate.slug === assignment)!.id,
      })),
  });
}

console.log(`Відновлено студентів: ${dump.students.length}.`);
await db.$disconnect();
