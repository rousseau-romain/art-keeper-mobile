# Rule: navigate and edit code with Serena, not raw Read/Grep/Edit

The Serena MCP plugin (`mcp__plugin_serena_serena__*`) is a symbol-aware
language server. For **source code** (TS/TSX), reach for it before the generic
Read / Grep / Edit tools — it reads at the granularity of symbols, so you pull in
only the definition you need instead of whole files.

## Use which tool

- **Overview of a file's symbols** — `get_symbols_overview` instead of reading the
  whole file.
- **Read one symbol's definition** — `find_symbol` with `include_body=true`,
  rather than Read over a line range.
- **Find call sites before changing a symbol** — `find_referencing_symbols` to
  see every usage (essential before a rename or signature change).
- **Edit a whole symbol body** — `replace_symbol_body` instead of Edit with a
  line range; `insert_after_symbol` / `insert_before_symbol` to add new ones.
- **Search across the codebase** — `search_for_pattern` instead of Grep or
  `bash grep`/`rg`.

## When to fall back

Use plain Read / Grep / Edit only when Serena can't help: non-code files (config,
JSON, SQL, Markdown — including these rule files and `AGENTS.md`), generated code
in `src/lib/api/generated/`, or a small localized edit where a symbol operation
would be overkill. If a Serena tool is unavailable or errors, fall back rather
than block.

Before working on a coding task, call `initial_instructions` once to load
Serena's own manual, as the server itself requests.

## Enforced by a hook

This rule isn't advisory-only: a `PreToolUse` hook (`.claude/hooks/serena-guard.sh`,
wired in `.claude/settings.json`) **denies** the `Grep` tool and any Bash command
that starts a statement with `grep` / `rg` / `ag` / `ack`, with a message pointing
to `search_for_pattern`. Piped output filtering (`ls | grep …`), `git grep`, and
`xargs grep` are left alone — only file searches are blocked. Review or disable it
via `/hooks`.
