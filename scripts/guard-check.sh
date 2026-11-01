#!/bin/bash
# Проганяє гард на чотирьох викликах із .claude/hooks/inputs. Виклик, якого немає в matcher,
# до скрипта не доходить, як і в Claude Code. Результати не оцінює, лише показує.
cd "$(dirname "$0")/.." || exit 1

HOOK=.claude/hooks/no-real-students.sh
MATCHER=$(jq -r '.hooks.PreToolUse[0].matcher' .claude/settings.json)
STDERR=$(mktemp)

for input in .claude/hooks/inputs/*.json; do
  tool=$(jq -r '.tool_name' "$input")
  printf '%s\n' "$(basename "$input" .json) ($tool)"

  if ! grep -Eqx "$MATCHER" <<<"$tool"; then
    printf '  не викликається: matcher "%s"\n' "$MATCHER"
    continue
  fi

  stdout=$("$HOOK" <"$input" 2>"$STDERR")
  code=$?
  printf '  exit %s\n' "$code"
  [ -s "$STDERR" ] && printf '  stderr: %s\n' "$(cat "$STDERR")"
  [ -n "$stdout" ] && printf '  stdout: %s\n' "$(jq -c . <<<"$stdout")"
done

rm -f "$STDERR"
