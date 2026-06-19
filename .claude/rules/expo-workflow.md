# Rule: Expo workflow — versioned docs, MCP server, bun

## Expo HAS CHANGED

Read the exact versioned docs at <https://docs.expo.dev/versions/v56.0.0/> before
writing any code.

## Expo MCP Server

This project uses the Expo MCP Server (`https://mcp.expo.dev/mcp`) for documentation,
dependency management, builds/workflows, and local simulator automation.

- Prefer Expo MCP tools over guessing: `read_documentation` / `search_documentation`
  for SDK questions, `add_library` to install packages (uses compatible versions).
- `expo-mcp` is installed as a dev dependency to enable **local capabilities**.

### Local capabilities (screenshots, tap, view inspection)

Local tools (`automation_take_screenshot`, `automation_tap`, `automation_find_view`,
`collect_app_logs`, `open_devtools`, `expo_router_sitemap`) require a local dev server
started with the MCP flag:

```sh
bun expo whoami || bun expo login
bun start:mcp   # = EXPO_UNSTABLE_MCP_SERVER=1 expo start
```

- This project uses **bun** — use `bun expo ...`, not npm/yarn/pnpm.
- Whenever the dev server starts or stops, **reconnect/restart the Expo MCP
  connection** (`/mcp`) so refreshed capabilities are picked up.
- iOS local automation is **simulator-only** and **macOS-only**; have a simulator
  running (press `i` in the dev server) before using automation tools.
- Use these to verify UI changes: write the code, screenshot the simulator to
  confirm it renders, tap to test interactions, and fix issues found.
