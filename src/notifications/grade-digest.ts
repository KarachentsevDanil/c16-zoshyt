import type { CoursesRepo } from "../courses/repo";
import type { MailTransport } from "./mail";

export interface DigestDeps {
  courses: CoursesRepo;
  transport: MailTransport;
}

export interface DigestOptions {
  course: string;
  dryRun: boolean;
}

export async function sendGradeDigest(deps: DigestDeps, options: DigestOptions): Promise<number> {
  const students = await deps.courses.grades(options.course);
  for (const student of students) {
    const lines = student.grades.map(({ assignment, score }) => `${assignment}: ${score}`);
    await deps.transport.send(
      {
        to: student.email,
        subject: `Ваші оцінки: ${options.course}`,
        text: [`Вітаємо, ${student.name}!`, "", ...lines].join("\n"),
      },
      { dryRun: options.dryRun },
    );
  }
  return students.length;
}
