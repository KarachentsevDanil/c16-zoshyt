import { readFile } from "node:fs/promises";
import type { Assignment } from "../run-submission";

export async function loadAssignment(course: string, slug: string): Promise<Assignment> {
  const file = new URL(`./${course}/${slug}.json`, import.meta.url);
  return JSON.parse(await readFile(file, "utf8")) as Assignment;
}
