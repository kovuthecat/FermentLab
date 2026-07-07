#!/usr/bin/env python3
"""Export de contexte projet pour ChatGPT.

Génère un fichier synthétique avec les fichiers de contexte, la carte projet,
l'état Git et une arborescence filtrée. Portable : Python 3.8+, stdlib seule,
fonctionne sur les projets JS comme Python.

Usage :
    python scripts/export-context.py

Sortie :
    context-export.md
"""

from __future__ import annotations

import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OUTPUT_PATH = ROOT / "context-export.md"

CONTEXT_FILES = [
    "PROJECT_BRIEF.md",
    "STATUS.md",
    "TASKS.md",
    "DECISIONS.md",
    "ROADMAP.md",
    "PROJECT_MAP.md",
    "architecture.md",
    "ai-workflow.md",
    "CLAUDE.md",
]

IGNORED_DIRS = {
    # commun
    ".git",
    # JS / web
    "node_modules", ".next", "dist", "build", "coverage",
    ".vercel", ".turbo", ".cache", "out",
    # Python
    "__pycache__", ".venv", "venv", ".pytest_cache",
    ".mypy_cache", ".ruff_cache", ".tox", ".eggs",
}

IGNORED_FILES = {
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "poetry.lock",
    "context-export.md",
}

MAX_FILE_SIZE = 250_000


def run(command: list[str]) -> str:
    try:
        result = subprocess.run(
            command, cwd=ROOT, capture_output=True, text=True, check=False
        )
        return result.stdout.strip()
    except Exception:
        return ""


def read_if_exists(rel_path: str) -> str | None:
    path = ROOT / rel_path
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def walk(directory: Path, depth: int = 0, max_depth: int = 4) -> list[str]:
    if depth > max_depth:
        return []
    try:
        entries = sorted(
            directory.iterdir(), key=lambda p: (p.is_file(), p.name.lower())
        )
    except OSError:
        return []

    lines: list[str] = []
    indent = "  " * depth
    for entry in entries:
        if entry.name in IGNORED_DIRS or entry.name in IGNORED_FILES:
            continue
        if entry.is_dir():
            lines.append(f"{indent}{entry.name}/")
            lines.extend(walk(entry, depth + 1, max_depth))
        else:
            try:
                if entry.stat().st_size > MAX_FILE_SIZE:
                    continue
            except OSError:
                continue
            lines.append(f"{indent}{entry.name}")
    return lines


def main() -> None:
    git_branch = run(["git", "branch", "--show-current"])
    git_status = run(["git", "status", "--short"])
    recent_commits = run(["git", "log", "--oneline", "-10"])
    changed_files = run(["git", "diff", "--name-only", "HEAD~5..HEAD"])

    parts: list[str] = []
    parts.append("# Context Export\n")
    parts.append(f"Generated at: {datetime.now(timezone.utc).isoformat()}\n")

    parts.append("## Git\n")
    parts.append(f"Branch: {git_branch or 'unknown'}\n")
    parts.append("### Status\n")
    parts.append("```text\n" + (git_status or "clean") + "\n```\n")
    parts.append("### Recent commits\n")
    parts.append("```text\n" + (recent_commits or "none") + "\n```\n")
    parts.append("### Files changed in recent commits\n")
    parts.append("```text\n" + (changed_files or "none") + "\n```\n")

    parts.append("## Project tree\n")
    parts.append("```text\n" + "\n".join(walk(ROOT)) + "\n```\n")

    parts.append("## Context files\n")
    for rel in CONTEXT_FILES:
        content = read_if_exists(rel)
        if not content:
            continue
        parts.append("---\n")
        parts.append(f"# {rel}\n")
        parts.append("```md\n" + content.strip() + "\n```\n")

    OUTPUT_PATH.write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"Context exported to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
