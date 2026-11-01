#!/bin/bash
# .claude/hooks/no-real-students.sh
INPUT=$(cat)
TEXT=$(jq -r '.tool_input.content // .tool_input.new_string // ""' <<<"$INPUT")
REAL=$(grep -Eo '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' <<<"$TEXT" \
  | grep -Eiv '@(example\.com|zoshyt\.example)$' | head -n 1)
if [ -n "$REAL" ]; then
  jq -n '{hookSpecificOutput: {hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: "У вмісті є адреса поза доменами example.com і zoshyt.example. У фікстури й код ідуть лише тестові адреси."}}'
fi
exit 0
