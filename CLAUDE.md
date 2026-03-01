# Sage — AI Tutor

> Originally built as "Minerva" at TreeHacks 2026 (Feb 14-16, 2026). Rebranded to Sage post-hackathon.

## First Steps for Every Session

1. **Read `progress.md`** — tells you exactly what's been done and what's next.
2. **Read `plan.md`** — full project context, architecture, and current direction.
3. If working on a specific feature, check `.claude/plans/` for active implementation plans.

## Session Continuity Rules

After completing every meaningful task or group of tasks:
- **Update `progress.md`** — mark tasks complete, note what was just built, update "Next Steps".
- **Update `plan.md`** if anything changes architecturally (new decisions, changed approach, new risks).
- These files are the handoff to the next session. Treat them as the source of truth for project state.

## Research Before Building

**MANDATORY**: Before implementing any major phase, feature, or integration:
1. **Search the web** for current best practices, examples, community tips (GitHub, Devpost, Stack Overflow, official docs).
2. **Verify library versions** — we are building in **March 2026**. Do NOT use outdated APIs or deprecated patterns.
3. **Check for breaking changes** — especially for Next.js 16, Vercel AI SDK, and Zustand v5.
4. This applies to every AI agent (Claude Code, Cursor, GitHub Copilot, etc.) — not just Claude.

## Architecture Principles (Black Box Design)

The key rules:
- Every external dependency is wrapped in `src/lib/` — no SDK types leak out.
- Modules communicate only through typed interfaces defined in `src/types/`.
- Any module should be rewritable from scratch using only its interface.
- Content errors never break the tutoring session. Fail gracefully.
- One module = one person can build and maintain it.

## Tech Stack (Current — March 2026)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16.1 LTS, React 19.2, TypeScript | App Router, Turbopack |
| Styling | Tailwind v4, shadcn/ui | Soft Lavender + Aqua design system |
| AI SDK | Vercel AI SDK (`@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/azure`) | Multi-model, tool calling, SSE streaming |
| Models | Claude Sonnet 4.5, Haiku 4.5, Gemini 3 Pro/Flash, GPT-4.1, Azure GPT-4o/Mini | User-selectable via ModelPicker |
| TTS | Web Speech Synthesis | Browser-native, no paid API |
| ASR | Web Speech Recognition | Browser-native push-to-talk |
| Whiteboard | KaTeX + GSAP + Rough.js | Equations write char-by-char, hand-drawn annotations |
| Graphing | Desmos 2D/3D, GeoGebra | Interactive, student-explorable |
| Videos | Manim (server-side) | 3Blue1Brown-style math animations |
| Sandbox | HTML iframe | Physics, chemistry, biology, history visualizations |
| State | Zustand 5.0.11 | Session store with persist middleware |
| Database | Supabase (Postgres + Auth) | Profiles, sessions, progress, learning plans |
| Hosting | Vercel | SSE streaming, edge functions |

## Key Files

| File | Purpose |
|------|---------|
| `progress.md` | Living tracker of what's done and what's next |
| `plan.md` | Full project plan — architecture, data flow, next steps |
| `src/lib/ai/prompts.ts` | THE most important file — 5-phase teaching methodology, tool rules, silence handling |
| `src/lib/ai/client.ts` | AI SDK wrapper — multi-model, tool calling, SSE streaming, Azure support |
| `src/hooks/useTutorBrain.ts` | Conversation loop orchestrator — SSE consumer, silence handler |
| `src/hooks/useSession.ts` | Session lifecycle — wires avatar (Web Speech) + brain + ASR + canvas |
| `src/hooks/useAvatar.ts` | Web Speech Synthesis TTS wrapper |
| `src/lib/deepgram/client.ts` | Web Speech Recognition ASR (browser-native) |
| `src/stores/sessionStore.ts` | Zustand store — session state, content steps, conversation history |
| `src/components/session/StepsPanel.tsx` | Whiteboard — KaTeX rendering, GSAP animations, annotations |
| `src/app/api/tutor/respond/route.ts` | SSE API route — streams speech + tool calls |
| `src/types/session.ts` | All types — ContentStep, ConversationMessage, TutorBrainRequest, etc. |

# currentDate
Today's date is 2026-03-01.
