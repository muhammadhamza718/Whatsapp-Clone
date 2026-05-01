---
id: "015"
title: Redacted Thinking OpenRouter Compatibility Issue
stage: general
date: 2026-05-01
surface: agent
model: Claude Sonnet 4.6 (Thinking)
feature: none
branch: main
user: Hamza
command: "explain redacted_thinking error in Claude Code"
labels: ["claude-code", "openrouter", "extended-thinking", "debugging"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/settings.local.json
tests:
  - none
---

## Prompt

hi

I can't say anything to claude code 
its opened in ide with claude code extension 

and i have @[f:\Courses\Hamza\WhatsApp Clone\.claude\settings.local.json:L1-L10] settings locally to use openrouter models 

look 

f:\Courses\Hamza\WhatsApp Clone\CLAUDE.md
hi
I need to greet the user and understand what they need help with. They just said "hi" and opened the CLAUDE.md file. Let me start by greeting them and asking how I can assist.

Unsupported content type: redacted_thinking
hi
Hello! I'm your AI assistant for the WhatsApp Clone project. How can I assist you today? Would you like to work on a specific feature, fix a bug, or need help with something else in the project? Let me know what you'd like to do!

He is thinking properly but when i came to print the message its showing me this Unsupported content type: redacted_thinking why?

## Response snapshot

Explained that the "Unsupported content type: redacted_thinking" error is caused by a conflict between:
1. Claude Code using a Thinking-enabled model (Claude Sonnet 4.6 Thinking) which produces `redacted_thinking` content blocks
2. The OpenRouter proxy routing through nvidia/nemotron which doesn't support these encrypted thinking blocks

Provided three fix options:
- Option 1: Switch to a non-thinking model in Claude Code
- Option 2: Remove OpenRouter override and use a real Anthropic API key
- Option 3: Use a thinking-compatible model on OpenRouter (e.g., anthropic/claude-sonnet-4-5)

## Outcome

- ✅ Impact: User understands root cause of the redacted_thinking display issue in Claude Code IDE
- 🧪 Tests: none
- 📁 Files: .claude/settings.local.json (reviewed, not modified)
- 🔁 Next prompts: User may want to fix the settings to use a compatible model or proper API key
- 🧠 Reflection: This is a known compatibility gap between Claude extended thinking API responses and OpenRouter proxy middleware that doesn't forward thinking blocks correctly

## Evaluation notes (flywheel)

- Failure modes observed: OpenRouter + thinking-enabled Claude models produce unrenderable content blocks in Claude Code
- Graders run and results (PASS/FAIL): none
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Remove ANTHROPIC_BASE_URL override to test direct Anthropic API connection
