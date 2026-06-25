#!/usr/bin/env bash
# PreToolUse guard: steer code search to Serena's symbol-aware search_for_pattern
# instead of raw Grep / bash grep|rg|ag|ack. See .claude/rules/serena-code-navigation.md.
#
# Denies:
#   - any Grep tool call
#   - a Bash command that STARTS a statement with grep/rg/ag/ack
#     (start of line, or after && || ;) — i.e. a file search.
# Allows:
#   - piped filtering of command output (e.g. `ls | grep foo`, `cat x | rg y`)
#   - `git grep`, `xargs grep`, and anything where grep/rg isn't the statement head.

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name')
msg="Use Serena for code search: call mcp__plugin_serena_serena__search_for_pattern instead of raw Grep/grep/rg/ag/ack. (Filtering command output via a pipe is fine.)"

deny() {
  jq -n --arg r "$msg" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

if [ "$tool" = "Grep" ]; then
  deny
fi

if [ "$tool" = "Bash" ]; then
  cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')
  if printf '%s' "$cmd" | grep -Eq '(^|&&|\|\||;)[[:space:]]*(rg|ag|ack|grep)([[:space:]]|$)'; then
    deny
  fi
fi

exit 0
