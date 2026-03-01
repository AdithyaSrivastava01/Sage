# Sage — Progress Tracker

> **For AI agents**: Read this file first to understand where the project is. Update it after every meaningful task.

**Last updated**: 2026-03-01 (Post-rebrand: Minerva → Sage, free-API prototype)
**Branch**: `main`
**Phase**: Free prototype — browser-native speech, Azure OpenAI

---

## Current Architecture (What's Actually Built)

### Core Session Loop
Student speaks (push-to-talk) → Web Speech Recognition transcribes → AI responds via SSE stream (speech + tool calls) → Web Speech Synthesis speaks the response → Tools execute on frontend (whiteboard, graphs, sandbox, video)

### Stack (March 2026)
- **Framework**: Next.js 16.1 LTS, React 19.2, TypeScript, Tailwind v4
- **AI**: Vercel AI SDK — `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/azure`
- **Models**: Claude Sonnet/Haiku 4.5, Gemini 3 Pro/Flash, GPT-4.1, Azure GPT-4o, Azure GPT-4o Mini
- **TTS**: Web Speech Synthesis (browser-native, `window.speechSynthesis`)
- **ASR**: Web Speech Recognition (browser-native, `window.SpeechRecognition`)
- **Whiteboard**: KaTeX + GSAP + Rough.js
- **Graphing**: Desmos 2D, Desmos 3D, GeoGebra
- **Video**: Manim (3Blue1Brown-style math animations, server-generated)
- **Sandbox**: HTML iframe
- **State**: Zustand 5.0.11
- **Database**: Supabase (Postgres + Auth)
- **Deployment**: Vercel

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/ai/prompts.ts` | THE most important file — teaching methodology, tool usage rules, silence handling |
| `src/lib/ai/client.ts` | AI SDK wrapper — multi-model including Azure, tool calling, SSE streaming |
| `src/hooks/useTutorBrain.ts` | Conversation loop orchestrator — SSE consumer, silence handler |
| `src/hooks/useSession.ts` | Session lifecycle — wires Web Speech + brain + canvas |
| `src/hooks/useAvatar.ts` | Web Speech Synthesis TTS wrapper |
| `src/lib/deepgram/client.ts` | Web Speech Recognition ASR (browser-native, kept filename) |
| `src/stores/sessionStore.ts` | Zustand store — session state, content steps, conversation history |
| `src/components/session/StepsPanel.tsx` | Whiteboard — KaTeX rendering, GSAP animations, annotations |
| `src/components/session/FloatingVideoOverlay.tsx` | User camera PiP overlay (no avatar) |
| `src/app/api/tutor/respond/route.ts` | SSE API route — streams speech + tool calls |
| `src/types/session.ts` | All types — ContentStep, CanvasCommand, TutorBrainRequest, etc. |

---

## Session History (Reverse Chronological)

### Session 19 (2026-03-01): Rebrand + Free Prototype Migration — COMPLETE

**Rebrand: Minerva → Sage**
- Updated all user-facing strings (Navbar, Footer, ContentMode, landing page, system prompts)
- Renamed package: `treehacks2026` → `sage-tutor`
- Updated page titles, meta descriptions, student welcome text

**Removed all paid APIs:**
- Removed HeyGen LiveAvatar (`@heygen/liveavatar-web-sdk`)
- Removed ElevenLabs TTS (`@elevenlabs/elevenlabs-js`)
- Removed Deepgram ASR (`@deepgram/sdk`)
- Removed Zoom (`@zoom/videosdk`)
- Removed Perplexity, Recall.ai libs and routes
- Deleted: `src/lib/{heygen,elevenlabs,perplexity,zoom,recall}/`
- Deleted: `src/hooks/useZoom.ts`
- Deleted API routes: `heygen/token`, `deepgram/key`, `recall/`, `zoom/token`, `search`

**Replaced with browser-native APIs:**
- `src/hooks/useAvatar.ts` → rewritten as Web Speech Synthesis wrapper
- `src/lib/deepgram/client.ts` → rewritten as Web Speech Recognition wrapper (filename kept)
- `src/app/api/tutor/respond/route.ts` → removed ElevenLabs TTS streaming; speech text only

**Added Azure OpenAI:**
- Added `@ai-sdk/azure@^3.0.38` to dependencies
- Added `createAzure()` in `src/lib/ai/client.ts` with `azure-` prefix model ID convention
- Added `azure-gpt-4o` and `azure-gpt-4o-mini` to `AI_MODELS` in `src/types/session.ts`
- Added Azure "Az" (purple) provider icon to `ModelPicker.tsx`

**Cleaned up session lifecycle:**
- `useSession.ts`: removed Zoom wiring, HeyGen error codes, 9.5-min auto-end timer
- `FloatingVideoOverlay.tsx`: removed avatar video element, now shows user camera only; gallery mode top tile shows Sage status circle

**Documentation cleanup:**
- Deleted: `MinervaLogo.png`, `speckit-video-tutor.txt`, `specs/`, `.specify/`
- Rewrote: `README.md`, `plan.md`, `progress.md`, `CLAUDE.md`

**Files changed:**
| File | Change |
|------|--------|
| `src/hooks/useAvatar.ts` | Full rewrite → Web Speech Synthesis |
| `src/lib/deepgram/client.ts` | Full rewrite → Web Speech Recognition |
| `src/lib/ai/client.ts` | Added Azure OpenAI (`createAzure`) |
| `src/types/session.ts` | Added `azure` provider + 2 Azure model IDs |
| `src/components/session/ModelPicker.tsx` | Added Azure "Az" icon |
| `src/components/session/FloatingVideoOverlay.tsx` | Removed avatar video, user camera only |
| `src/hooks/useSession.ts` | Removed Zoom, HeyGen error codes, session timer |
| `src/app/api/tutor/respond/route.ts` | Removed ElevenLabs TTS streaming |
| `src/hooks/useTutorBrain.ts` | Updated for Web Speech (no audio chunks) |
| `package.json` | Renamed, removed paid deps, added `@ai-sdk/azure` |

### Session 18 (2026-02-22): Unified Board Migration — COMPLETE

All content types (equations, graphs, sandbox, video, images, code) now render inline on one scrollable surface. See `plan.md` for full details.

**Key changes:**
- `StepsPanel.tsx` — Full rewrite: native scroll, CSS zoom, inline renderers
- `types/session.ts` — 5 new ContentStep types: graph, sandbox, video, image, code
- `ContentMode.tsx` — Simplified: removed SandboxPanel/VideoPanel layers

### Session 17 (2026-02-21): Context Awareness + Unified Board Planning

- Rewrote 5-phase teaching methodology
- Added `serializeSteps()` for whiteboard context injection
- Added `summarizeSandbox()` for sandbox context
- Whiteboard UX: scroll fix, auto-follow, section navigation

### Sessions 14-16: Whiteboard Migration (KaTeX + GSAP + Rough.js)
- Replaced tldraw with KaTeX + GSAP + Rough.js
- Built StepsPanel with character-by-character equation writing, typewriter text, annotations

### Sessions 1-13: Core MVP (TreeHacks hackathon build)

---

## Next Steps

1. **Test end-to-end session** — Verify Web Speech TTS/ASR push-to-talk works correctly
2. **Test inline board content** — Desmos graphs, sandbox iframes, video inline in whiteboard
3. **Syntax highlighting** — Prism.js for `code` block type
4. **Parent dashboard** — Session history, progress charts, learning plans
5. **Mobile/tablet** — Responsive layout
