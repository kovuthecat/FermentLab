#!/usr/bin/env node

/**
 * Export de contexte projet pour ChatGPT.
 *
 * Objectif :
 * générer un fichier synthétique avec les fichiers de contexte,
 * la carte projet, l’état Git et une arborescence filtrée.
 *
 * Usage :
 *   node scripts/export-context.mjs
 *
 * Sortie :
 *   context-export.md
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const outputPath = join(root, "context-export.md");

const contextFiles = [
  "PROJECT_BRIEF.md",
  "STATUS.md",
  "TASKS.md",
  "DECISIONS.md",
  "ROADMAP.md",
  "PROJECT_MAP.md",
  "architecture.md",
  "ai-usage.md",
  "GPT_CONTEXT.md",
  "CLAUDE.md"
];

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".vercel",
  ".turbo",
  ".cache",
  "out"
]);

const ignoredFiles = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "context-export.md"
]);

function run(command) {
  try {
    return execSync(command, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function readIfExists(filePath) {
  const absolute = join(root, filePath);
  if (!existsSync(absolute)) return null;
  return readFileSync(absolute, "utf8");
}

function walk(dir, depth = 0, maxDepth = 4) {
  if (depth > maxDepth) return [];

  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const lines = [];

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name) || ignoredFiles.has(entry.name)) continue;

    const fullPath = join(dir, entry.name);
    const rel = relative(root, fullPath);

    if (entry.isDirectory()) {
      lines.push(`${"  ".repeat(depth)}${entry.name}/`);
      lines.push(...walk(fullPath, depth + 1, maxDepth));
    } else {
      const stat = statSync(fullPath);
      if (stat.size > 250_000) continue;
      lines.push(`${"  ".repeat(depth)}${entry.name}`);
    }
  }

  return lines;
}

const gitBranch = run("git branch --show-current");
const gitStatus = run("git status --short");
const recentCommits = run("git log --oneline -10");
const changedFiles = run("git diff --name-only HEAD~5..HEAD");

let output = "";

output += "# Context Export\n\n";
output += `Generated at: ${new Date().toISOString()}\n\n`;

output += "## Git\n\n";
output += `Branch: ${gitBranch || "unknown"}\n\n`;
output += "### Status\n\n";
output += "```text\n";
output += gitStatus || "clean";
output += "\n```\n\n";

output += "### Recent commits\n\n";
output += "```text\n";
output += recentCommits || "none";
output += "\n```\n\n";

output += "### Files changed in recent commits\n\n";
output += "```text\n";
output += changedFiles || "none";
output += "\n```\n\n";

output += "## Project tree\n\n";
output += "```text\n";
output += walk(root).join("\n");
output += "\n```\n\n";

output += "## Context files\n\n";

for (const file of contextFiles) {
  const content = readIfExists(file);
  if (!content) continue;

  output += `---\n\n`;
  output += `# ${file}\n\n`;
  output += "```md\n";
  output += content.trim();
  output += "\n```\n\n";
}

writeFileSync(outputPath, output, "utf8");

console.log(`Context exported to ${outputPath}`);
