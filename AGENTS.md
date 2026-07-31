# Superpowers Agentic Framework

This project is equipped with **Superpowers** (`obra/superpowers`).

## Core Skills Installed
The following Superpowers skills are installed in `.gemini/skills/` and `.agents/skills/`:
- `brainstorming`: Explore requirements and sign off on design before writing code.
- `writing-plans`: Produce implementation plans with clear steps and TDD guidelines.
- `test-driven-development`: Red/green TDD workflow.
- `executing-plans`: Execute plans step-by-step with verification.
- `subagent-driven-development`: Dispatch autonomous subagents for task execution.
- `systematic-debugging`: Systematic root-cause identification before editing code.
- `requesting-code-review` / `receiving-code-review`: Multi-stage code reviews.
- `using-git-worktrees`: Isolated task branching with git worktrees.
- `verification-before-completion`: Ensure all requirements and tests pass before completion.
- `using-superpowers`: Primary workflow entry point and skill selection rules.

## Standard Instruction
When initiating any task, check `.gemini/skills/using-superpowers/SKILL.md` first to determine which skill applies to your workflow.
