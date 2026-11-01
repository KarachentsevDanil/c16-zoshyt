import { describe, expect, it, vi } from "vitest";
import { type AppDeps, buildApp } from "./app";

const now = new Date("2026-11-03T09:00:00Z");

function setup(overrides: Partial<AppDeps> = {}) {
  return buildApp({
    courses: {
      upcomingDeadlines: vi.fn().mockResolvedValue([]),
      enrolledStudents: vi.fn().mockResolvedValue([]),
      grades: vi.fn().mockResolvedValue([]),
    },
    submissions: {
      find: vi.fn().mockResolvedValue(null),
      markQueued: vi.fn().mockResolvedValue(undefined),
    },
    enqueueGrading: vi.fn().mockResolvedValue(undefined),
    now: () => now,
    ...overrides,
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

    const response = await setup({
      courses: { upcomingDeadlines, enrolledStudents: vi.fn(), grades: vi.fn() },
    }).inject({ method: "GET", url: "/courses/js-basics/deadlines" });

    expect(upcomingDeadlines).toHaveBeenCalledWith("js-basics", now);
    expect(response.json().deadlines).toEqual([
      { assignment: "hw-06", title: "Медіана", deadlineAt: "2026-11-10T21:00:00.000Z" },
    ]);
  });
});

describe("POST /submissions/:id/grade", () => {
  it("ставить наявну посилку в чергу", async () => {
    const enqueueGrading = vi.fn().mockResolvedValue(undefined);
    const submissions = {
      find: vi.fn().mockResolvedValue({ id: 4417, status: "timeout", score: 75 }),
      markQueued: vi.fn().mockResolvedValue(undefined),
    };

    const response = await setup({ submissions, enqueueGrading }).inject({
      method: "POST",
      url: "/submissions/4417/grade",
    });

    expect(response.statusCode).toBe(202);
    expect(submissions.markQueued).toHaveBeenCalledWith(4417);
    expect(enqueueGrading).toHaveBeenCalledWith(4417);
  });

  it("відповідає 404, якщо посилки немає", async () => {
    const enqueueGrading = vi.fn();

    const response = await setup({ enqueueGrading }).inject({
      method: "POST",
      url: "/submissions/1/grade",
    });

    expect(response.statusCode).toBe(404);
    expect(enqueueGrading).not.toHaveBeenCalled();
  });
});
