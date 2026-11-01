#!/bin/bash
# .claude/hooks/no-real-students.sh
CONTENT=$(jq -r '.tool_input.content')
if echo "$CONTENT" | grep -Eo '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' | grep -vq '@example\.com$'; then
  echo "Фікстура містить реальну адресу студента" >&2
  exit 1
fi
exit 0
