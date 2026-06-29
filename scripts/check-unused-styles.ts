#!/usr/bin/env bun
/**
 * Reports keys declared in a `StyleSheet.create({ … })` that are never read via
 * static member access (`styles.<key>`) in the same file. Biome can't see these
 * (they're plain object properties), so this is our stand-in for ESLint's
 * `react-native/no-unused-styles`.
 *
 * Run: `bun scripts/check-unused-styles.ts` (also part of `bun lint`).
 * Exits 1 if any unused key is found, 0 otherwise.
 */
import { Glob } from "bun";
import ts from "typescript";

type Sheet = {
  /** The bound variable name, e.g. `styles` / `staticStyles`. */
  name: string;
  /** Declared top-level keys → 1-based line number. */
  keys: Map<string, number>;
  /** Dynamic access (`styles[expr]`) seen — bail, treat every key as used. */
  dynamic: boolean;
};

const isStyleSheetCreate = (node: ts.Expression): boolean =>
  ts.isCallExpression(node) &&
  ts.isPropertyAccessExpression(node.expression) &&
  ts.isIdentifier(node.expression.expression) &&
  node.expression.expression.text === "StyleSheet" &&
  node.expression.name.text === "create";

/** Collect every `const x = StyleSheet.create({...})` sheet in a source file. */
const collectSheets = (source: ts.SourceFile): Map<string, Sheet> => {
  const sheets = new Map<string, Sheet>();

  const visit = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      isStyleSheetCreate(node.initializer)
    ) {
      const arg = (node.initializer as ts.CallExpression).arguments[0];
      if (arg && ts.isObjectLiteralExpression(arg)) {
        const keys = new Map<string, number>();
        for (const prop of arg.properties) {
          // Skip spreads (`...base`) and computed keys (`[FOO]: …`) — not nameable.
          if (
            (ts.isPropertyAssignment(prop) ||
              ts.isShorthandPropertyAssignment(prop)) &&
            (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))
          ) {
            const line =
              source.getLineAndCharacterOfPosition(prop.name.getStart(source))
                .line + 1;
            keys.set(prop.name.text, line);
          }
        }
        sheets.set(node.name.text, {
          name: node.name.text,
          keys,
          dynamic: false,
        });
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return sheets;
};

/** Mark keys read via `styles.key`; flag dynamic `styles[expr]` access. */
const markUsages = (source: ts.SourceFile, sheets: Map<string, Sheet>): void => {
  const visit = (node: ts.Node): void => {
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression)
    ) {
      const sheet = sheets.get(node.expression.text);
      if (sheet) sheet.keys.delete(node.name.text);
    } else if (
      ts.isElementAccessExpression(node) &&
      ts.isIdentifier(node.expression)
    ) {
      const sheet = sheets.get(node.expression.text);
      if (sheet) sheet.dynamic = true;
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
};

const findings: string[] = [];
const root = new URL("..", import.meta.url).pathname;

// Files to check: explicit repo-relative paths (e.g. staged files from the
// pre-commit hook) when passed as args, else the whole `src/` tree.
const args = process.argv.slice(2);
const files =
  args.length > 0
    ? args
    : Array.from(new Glob("src/**/*.{ts,tsx}").scanSync(root));

for (const rel of files) {
  if (
    !rel.startsWith("src/") ||
    !(rel.endsWith(".ts") || rel.endsWith(".tsx")) ||
    rel.includes("src/lib/api/generated/") ||
    rel.endsWith(".d.ts")
  )
    continue;

  const text = await Bun.file(root + rel).text();
  const source = ts.createSourceFile(
    rel,
    text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  );

  const sheets = collectSheets(source);
  if (sheets.size === 0) continue;
  markUsages(source, sheets);

  for (const sheet of sheets.values()) {
    if (sheet.dynamic) continue; // accessed dynamically — can't prove unused
    for (const [key, line] of sheet.keys) {
      findings.push(`${rel}:${line}  ${sheet.name}.${key}`);
    }
  }
}

if (findings.length > 0) {
  console.error(
    `Unused StyleSheet keys (${findings.length}):\n${findings
      .sort()
      .map((f) => `  ${f}`)
      .join("\n")}`,
  );
  process.exit(1);
}

console.log("No unused StyleSheet keys.");
