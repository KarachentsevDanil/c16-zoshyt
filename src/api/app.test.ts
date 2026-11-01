import { describe, expect, it, vi } from "vitest";
import type { CoursesRepo } from "../courses/repo";
import { buildApp } from "./app";

const now = new Date("2026-11-03T09:00:00Z");

function setup(courses: Partial<CoursesRepo> = {}) {
  return buildApp({
    courses: {
      upcomingDeadlines: vi.fn().mockResolvedValue([]),
      enrolledStudents: vi.fn().mockResolvedValue([]),
      ...courses,
    },
    now: () => now,
  });
}

describe("GET /health", () => {
  it("відповідає 200", async () => {
    const response = await setup().inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});

describe("GET /courses/:slug/deadlines", () => {
  it("повертає найближчі дедлайни курсу", async () => {
    const upcomingDeadlines = vi.fn().mockResolvedValue([
      { assignment: "hw-06", title: "Медіана", deadlineAt: new Date("2026-11-10T21:00:00Z") },
    ]);

    const response = await setup({ upcomingDeadlines }).inject({
      method: "GET",
      url: "/courses/js-basics/deadlines",
    });

    expect(upcomingDeadlines).toHaveBeenCalledWith("js-basics", now);
    expect(response.json().deadlines).toEqual([
      { assignment: "hw-06", title: "Медіана", deadlineAt: "2026-11-10T21:00:00.000Z" },
    ]);
  });
});
