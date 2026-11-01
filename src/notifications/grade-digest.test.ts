import { describe, expect, it, vi } from "vitest";
import type { CoursesRepo } from "../courses/repo";
import { sendGradeDigest } from "./grade-digest";
import type { Mail, MailTransport } from "./mail";

describe("sendGradeDigest", () => {
  it("надсилає кожному студенту його оцінки", async () => {
    const sent: Mail[] = [];
    const transport: MailTransport = {
      send: async (mail) => {
        sent.push(mail);
      },
    };
    const courses: CoursesRepo = {
      upcomingDeadlines: vi.fn(),
      enrolledStudents: vi.fn(),
      grades: vi.fn().mockResolvedValue([
        {
          id: 1,
          name: "Student One",
          email: "student1@example.com",
          grades: [{ assignment: "Сортування", score: 87 }],
        },
      ]),
    };

    const processed = await sendGradeDigest({ courses, transport }, { course: "js-basics", dryRun: false });

    expect(processed).toBe(1);
    expect(sent[0]?.to).toBe("student1@example.com");
    expect(sent[0]?.text).toContain("Сортування: 87");
  });
});
