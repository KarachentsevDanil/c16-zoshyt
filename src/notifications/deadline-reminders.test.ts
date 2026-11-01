import { describe, expect, it, vi } from "vitest";
import type { CoursesRepo } from "../courses/repo";
import { sendDeadlineReminders } from "./deadline-reminders";
import type { Mail, MailTransport } from "./mail";

const now = new Date("2026-11-03T09:00:00Z");

const courses = (deadlines: Awaited<ReturnType<CoursesRepo["upcomingDeadlines"]>>): CoursesRepo => ({
  upcomingDeadlines: vi.fn().mockResolvedValue(deadlines),
  enrolledStudents: vi.fn().mockResolvedValue([
    { id: 1, name: "Student One", email: "student1@example.com" },
    { id: 2, name: "Student Two", email: "student2@example.com" },
  ]),
});

const nextDeadline = {
  assignment: "hw-06",
  title: "Медіана",
  deadlineAt: new Date("2026-11-10T21:00:00Z"),
};

describe("sendDeadlineReminders", () => {
  it("надсилає лист кожному студенту курсу", async () => {
    const sent: Mail[] = [];
    const transport: MailTransport = {
      send: async (mail) => {
        sent.push(mail);
      },
    };

    const processed = await sendDeadlineReminders(
      { courses: courses([nextDeadline]), transport, now: () => now },
      { course: "js-basics", dryRun: false },
    );

    expect(processed).toBe(2);
    expect(sent.map((mail) => mail.to)).toEqual(["student1@example.com", "student2@example.com"]);
    expect(sent[0]?.subject).toBe("Нагадування про дедлайн: Медіана");
    expect(sent[0]?.text).toContain("Вітаємо, Student One!");
    expect(sent[0]?.text).toContain("10 листопада 2026");
  });

  it("передає --dry-run у транспорт", async () => {
    const transport: MailTransport = { send: vi.fn().mockResolvedValue(undefined) };

    await sendDeadlineReminders(
      { courses: courses([nextDeadline]), transport, now: () => now },
      { course: "js-basics", dryRun: true },
    );

    expect(transport.send).toHaveBeenCalledWith(expect.anything(), { dryRun: true });
  });

  it("нічого не надсилає, якщо дедлайнів немає", async () => {
    const transport: MailTransport = { send: vi.fn() };

    const processed = await sendDeadlineReminders(
      { courses: courses([]), transport, now: () => now },
      { course: "js-basics", dryRun: false },
    );

    expect(processed).toBe(0);
    expect(transport.send).not.toHaveBeenCalled();
  });
});
