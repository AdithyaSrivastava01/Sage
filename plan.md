# Sage — Project Plan

> **Quick context for any AI agent**: Sage is an AI tutor that teaches ALL subjects to students. The tutor speaks via browser Web Speech Synthesis while content appears on an interactive whiteboard (equations, graphs, simulations, videos). Multi-model AI brain (Azure OpenAI, Claude, Gemini, GPT). Parents set goals and track progress. Originally built as "Minerva" at TreeHacks 2026, now rebranded and migrated to a free-API prototype.

## Status: Free Prototype (Post-Rebrand)

Sage is now running entirely on free/browser-native APIs:
- **No paid TTS** — Web Speech Synthesis (browser-native)
- **No paid ASR** — Web Speech Recognition (browser-native)
- **No paid avatar** — Removed HeyGen entirely
- **AI** — Azure OpenAI (user-provided key), plus Anthropic/Google/OpenAI

## Current Architecture

### Data Flow
```
Student speaks (push-to-talk)
  → Web Speech Recognition (browser-native ASR)
  → useTutorBrain sends to /api/tutor/respond
  → AI model generates speech + tool calls (SSE stream)
  → Web Speech Synthesis speaks the response (browser-native TTS)
  → Tool calls execute on frontend (showSteps, executeCanvasCommands, showSandbox, showVideo)
  → Content appears on the whiteboard
```

### Tech Stack
| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16.1 LTS, React 19.2, TypeScript | App Router, Turbopack |
| Styling | Tailwind v4, shadcn/ui | Soft Lavender (#A78BFA) + Aqua (#67E8F9) design system |
| AI SDK | Vercel AI SDK (`@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/azure`) | Multi-model, tool calling, SSE streaming |
| Models | Claude Sonnet/Haiku 4.5, Gemini 3 Pro/Flash, GPT-4.1, Azure GPT-4o/Mini | User-selectable via ModelPicker |
| TTS | Web Speech Synthesis | Browser-native, no paid API |
| ASR | Web Speech Recognition | Browser-native push-to-talk |
| Whiteboard | KaTeX + GSAP + Rough.js | Equations write character-by-character, hand-drawn annotations |
| Graphing | Desmos 2D/3D, GeoGebra | Interactive, student-explorable |
| Videos | Manim (server-side) | 3Blue1Brown-style math animations |
| Sandbox | HTML iframe | Physics, chemistry, biology, history visualizations |
| State | Zustand 5.0.11 | Session store with persist middleware |
| Database | Supabase (Postgres + Auth) | Profiles, sessions, progress, learning plans |
| Hosting | Vercel | SSE streaming, edge functions |

### Unified Board (Completed Session 18)
One scrollable surface with typed inline content blocks. No mode switching for sandbox/video.

| Block Type | Tool | What it shows |
|------------|------|---------------|
| `step` | `showSteps` | Equations (KaTeX), text (typewriter), labels |
| `divider` | `showSteps` | Section separator with optional heading |
| `numberLine` | `showSteps` | Number line with highlights |
| `diagram` | `showSteps` | SVG diagram |
| `graph` | `showSteps` | Inline Desmos/GeoGebra interactive plot |
| `sandbox` | `showSteps` / `showSandbox` | Inline HTML iframe (physics, chemistry, etc.) |
| `video` | `showSteps` / `showVideo` | Inline video player |
| `image` | `showSteps` | Static image |
| `code` | `showSteps` | Syntax-highlighted code block |
| Annotations | `showSteps` | Circle, underline, arrow, box, crossOut, highlight |

**Math mode** (`executeCanvasCommands`) still opens standalone Desmos/GeoGebra for complex graph interactions. This will eventually migrate to inline `graph` blocks.

### AI Context Awareness
Every turn, the AI model receives structured context about what's displayed:
- **Whiteboard**: Indexed list of all steps, equations, annotations via `serializeSteps()`
- **Math canvas**: Desmos/GeoGebra expression state via `getSnapshot()`
- **Sandbox**: Text extracted from HTML via `summarizeSandbox()`
- **Video**: URL of currently playing video
- **Student profile, learning plan, mastery scores**: All injected into each prompt

### Teaching Methodology (5-Phase)
1. **INTRODUCE** — Write topic title, give brief context, key vocabulary
2. **DEMONSTRATE** ("I Do") — Work through complete example, narrate thinking, NO questions
3. **GUIDED PRACTICE** ("We Do") — Set up similar problem, Socratic questioning begins
4. **INDEPENDENT PRACTICE** ("You Do") — Student works alone, tutor steps back
5. **ASSESS & ADVANCE** — If mastered → harder problems; if struggled → back to Phase 3

## Next Steps

1. **Test session end-to-end** — Web Speech TTS/ASR working correctly with push-to-talk
2. **Test inline Desmos/sandbox/video** — Verify all board content types render correctly
3. **Syntax highlighting** — Prism.js or similar for `code` blocks
4. **Parent dashboard** — Session history, progress charts, learning plan management
5. **Mobile/tablet** — Responsive layout for the unified board

## Key Decisions Made

1. **Free prototype** — Removed all paid APIs (HeyGen, ElevenLabs, Deepgram, Perplexity, Recall, Zoom)
2. **Web Speech APIs** — Browser-native TTS + ASR; zero cost, instant setup
3. **Azure OpenAI** — Primary AI provider for the free prototype
4. **Multi-model support** — User can switch AI models (Azure, Claude, Gemini, GPT)
5. **KaTeX + GSAP whiteboard** — Replaced tldraw. Lighter, better UX for teaching.
6. **Unified board** — One scrollable surface with typed inline blocks (DONE)
7. **5-phase teaching methodology** — Research-backed (I Do, We Do, You Do)
8. **Context awareness** — AI sees what student sees, every turn (ChatGPT Canvas pattern)
9. **Black Box Design** — All external deps wrapped in `src/lib/`, no SDK types leak
