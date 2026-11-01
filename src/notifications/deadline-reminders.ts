import { readFileSync } from "node:fs";
import Handlebars from "handlebars";
import type { CoursesRepo } from "../courses/repo";
import type { MailTransport } from "./mail";

const template = Handlebars.compile(
  readFileSync(new URL("./templates/deadline-reminder.hbs", import.meta.url), "utf8"),
  { noEscape: true },
);

const deadlineFormat = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Kyiv",
});

export interface ReminderDeps {
  courses: CoursesRepo;
  transport: MailTransport;
  now: () => Date;
}

export interface ReminderOptions {
  course: string;
  dryRun: boolean;
}

export async function sendDeadlineReminders(deps: ReminderDeps, options: ReminderOptions): Promise<number> {
  const [next] = await deps.courses.upcomingDeadlines(options.course, deps.now());
  if (!next) {
    return 0;
  }

  const students = await deps.courses.enrolledStudents(options.course);
  for (const student of students) {
    await deps.transport.send(
      {
        to: student.email,
        subject: `Нагадування про дедлайн: ${next.title}`,
        text: template({
          name: student.name,
          title: next.title,
          course: options.course,
          deadline: deadlineFormat.format(next.deadlineAt),
        }),
      },
      { dryRun: options.dryRun },
    );
  }
  return students.length;
}
