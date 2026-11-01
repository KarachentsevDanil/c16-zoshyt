import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { loadAssignment } from "../assignments";
import { type Assignment, runSubmission } from "../run-submission";

const fixture = (name: string) => new URL(`./fixtures/${name}`, import.meta.url).pathname;

describe("runSubmission", () => {
  it("зараховує правильне рішення", async () => {
    const assignment = await loadAssignment("js-basics", "hw-06");

    const report = await runSubmission(fixture("submission_ok.js"), assignment);

    expect(report.status).toBe("passed");
    expect(report.score).toBe(100);
  });

  it("рахує частину балів за неправильні відповіді", async () => {
    const assignment = await loadAssignment("js-basics", "hw-06");

    const report = await runSubmission(fixture("submission_wrong.js"), assignment);

    expect(report.status).toBe("failed");
    expect(report.score).toBe(25);
  });

  it("зупиняє посилку, що не завершується, і позначає таймаут", async () => {
    const assignment: Assignment = {
      exportName: "median",
      timeoutMs: 300,
      cases: [{ input: [[1, 2]], expected: 1.5 }],
    };

    const report = await runSubmission(fixture("submission_loop.js"), assignment);

    expect(report.status).toBe("timeout");
    expect(report.score).toBe(0);
    expect(report.cases[0]?.status).toBe("timeout");
  });

  it("не падає на посилці з синтаксичною помилкою", async () => {
    const assignment: Assignment = {
      exportName: "median",
      timeoutMs: 1000,
      cases: [{ input: [[1]], expected: 1 }],
    };

    const report = await runSubmission(fixture("submission_broken.js"), assignment);

    expect(report.cases[0]?.status).toBe("crashed");
  });
});

describe("flaky_cases.json", () => {
  it("кожен випадок містить номер посилки і текст рішення", async () => {
    const { cases } = JSON.parse(await readFile(fixture("flaky_cases.json"), "utf8")) as {
      cases: { submission_id: number; source: string }[];
    };

    for (const flaky of cases) {
      expect(flaky.submission_id).toBeTypeOf("number");
      expect(flaky.source).toBeTypeOf("string");
    }
  });
});
