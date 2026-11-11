import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

const root = "src";
const maxLines = 200;

type CssFile = {
  path: string;
  lines: number;
};

type Merge = {
  path: string;
  line: number;
  text: string;
};

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(path, out);
    } else {
      out.push(path);
    }
  }
}

function rel(path: string): string {
  return relative(process.cwd(), path);
}

function findImporters(cssPath: string, sourceFiles: string[]): string[] {
  const name = basename(cssPath);
  const cssRel = rel(cssPath);
  const importers: string[] = [];
  for (const file of sourceFiles) {
    if (!/\.(tsx?|jsx?)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    if (text.includes(name) || text.includes(cssRel)) {
      importers.push(rel(file));
    }
  }
  return importers.sort();
}

function findMergedClasses(sourceFiles: string[]): Merge[] {
  const merges: Merge[] = [];
  const pattern = /\bclasses\s*=\s*\{[^}]*\.\.\./;
  for (const file of sourceFiles) {
    if (!/\.(tsx?|jsx?)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";
      if (
        pattern.test(line) ||
        (line.includes("const classes = {") && text.includes("..."))
      ) {
        // check if this assignment contains a spread
        if (line.includes("...") && /classes\s*=/.test(line)) {
          merges.push({ path: rel(file), line: i + 1, text: line.trim() });
        }
      }
    }
    // multiline: const classes = { followed by ... on next lines
    const multi = /const\s+classes\s*=\s*\{[\s\S]*?\};?/m.exec(text);
    if (multi && multi[0].includes("...")) {
      const startLine = text.slice(0, multi.index).split("\n").length;
      if (!merges.some(m => m.path === rel(file) && m.line === startLine)) {
        const snippet = (lines[startLine - 1] ?? "").trim();
        merges.push({ path: rel(file), line: startLine, text: snippet });
      }
    }
  }
  // dedupe
  const seen = new Set<string>();
  return merges.filter(m => {
    const key = `${m.path}:${m.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const allFiles: string[] = [];
walk(root, allFiles);

const sourceFiles = allFiles.filter(p => /\.(tsx?|jsx?)$/.test(p));
const cssFiles: CssFile[] = allFiles
  .filter(p => p.endsWith(".css"))
  .map(path => ({
    path,
    lines: readFileSync(path, "utf8").split("\n").length,
  }));

const large = cssFiles
  .filter(f => f.lines > maxLines)
  .sort((a, b) => b.lines - a.lines);
const merges = findMergedClasses(sourceFiles);

let ok = true;

if (large.length > 0) {
  ok = false;
  console.log(`CSS files over ${maxLines} lines:\n`);
  for (const { path, lines } of large) {
    const importers = findImporters(path, sourceFiles);
    console.log(`${rel(path)} (${lines} lines)`);
    if (importers.length === 0) {
      console.log("  imported by: (none found)");
    } else {
      console.log("  imported by:");
      for (const importer of importers) {
        console.log(`    - ${importer}`);
      }
    }
    console.log();
  }
} else {
  console.log(`✓ No CSS files over ${maxLines} lines in ${root}/`);
}

if (merges.length > 0) {
  ok = false;
  console.log(
    "\nMerged CSS module classes (`const classes = { ... }`) are not allowed:",
  );
  console.log("Import and use specific module classes instead of merging.\n");
  for (const m of merges) {
    console.log(`  ${m.path}:${m.line}`);
    console.log(`    ${m.text}`);
  }
  console.log();
} else {
  console.log("✓ No merged CSS module class objects found");
}

if (!ok) {
  process.exit(1);
}
