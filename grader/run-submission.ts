import { execFile } from "node:child_process";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const RUNNER = fileURLToPath(new URL("./runner.cjs", import.meta.url));

export interface GradeCase {
  input: unknown[];
  expected: unknown;
}

export interface Assignment {
  exportName: string;
  timeoutMs: number;
  cases: GradeCase[];
}

export type CaseStatus = "passed" | "failed" | "timeout" | "crashed";

export interface CaseResult {
  input: unknown[];
  status: CaseStatus;
}

export interface GradeReport {
  status: "passed" | "failed" | "timeout";
  score: number;
  cases: CaseResult[];
}

function runCase(solutionPath: string, assignment: Assignment, gradeCase: GradeCase): Promise<CaseStatus> {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [RUNNER, solutionPath, assignment.exportName, JSON.stringify(gradeCase.input)],
      { timeout: assignment.timeoutMs },
      (error, stdout) => {
        if (error) {
          resolve(error.killed ? "timeout" : "crashed");
          return;
        }
        resolve(isDeepStrictEqual(JSON.parse(stdout), gradeCase.expected) ? "passed" : "failed");
      },
    );
  });
}

// Посилка виконується в тимчасовій теці: студенти здають CommonJS, а цей пакет — ESM.
export async function runSubmission(sourcePath: string, assignment: Assignment): Promise<GradeReport> {
  const workdir = await mkdtemp(join(tmpdir(), "zoshyt-grader-"));
  try {
    const solutionPath = join(workdir, "solution.js");
    await copyFile(sourcePath, solutionPath);

    const cases: CaseResult[] = [];
    for (const gradeCase of assignment.cases) {
      cases.push({ input: gradeCase.input, status: await runCase(solutionPath, assignment, gradeCase) });
    }

    const passed = cases.filter((result) => result.status === "passed").length;
    const score = Math.round((passed / cases.length) * 100);
    if (cases.some((result) => result.status === "timeout")) {
      return { status: "timeout", score, cases };
    }
    return { status: passed === cases.length ? "passed" : "failed", score, cases };
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}
