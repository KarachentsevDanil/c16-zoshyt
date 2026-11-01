import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const HOOK = ".claude/hooks/no-real-students.sh";

const settings = JSON.parse(readFileSync(".claude/settings.json", "utf8")) as {
  hooks: { PreToolUse: { matcher: string }[] };
};
const matcher = new RegExp(`^(${settings.hooks.PreToolUse[0]?.matcher})$`);

function runGuard(name: string) {
  const input = readFileSync(`.claude/hooks/inputs/${name}.json`, "utf8");
  const tool = (JSON.parse(input) as { tool_name: string }).tool_name;
  return { tool, ...spawnSync(HOOK, { input, encoding: "utf8" }) };
}

describe("no-real-students.sh", () => {
  it.each(["call-1-write-real", "call-2-edit-real"])("блокує %s", (name) => {
    const { tool, status, stdout } = runGuard(name);

    expect(tool).toMatch(matcher);
    expect(status).toBe(0);
    expect(JSON.parse(stdout).hookSpecificOutput.permissionDecision).toBe("deny");
  });

  it.each(["call-3-write-test", "call-4-edit-school"])("свідомо пропускає %s", (name) => {
    const { tool, status, stdout } = runGuard(name);

    expect(tool).toMatch(matcher);
    expect(status).toBe(0);
    expect(stdout).toBe("");
  });
});
