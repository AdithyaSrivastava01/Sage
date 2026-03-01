# Sage — AI Tutor

An AI-powered tutor that teaches through Socratic questioning and interactive visualizations. Sage converses with students in real time using browser-native speech, renders math on Desmos/GeoGebra, runs science simulations in sandboxed HTML, and generates 3Blue1Brown-style animations via Manim.

---

## Architecture

```
Student speaks  ──>  Web Speech Recognition (browser-native)
                           |
                     useTutorBrain hook
                           |
                     POST /api/tutor/respond  (SSE stream)
                           |
                     Vercel AI SDK (streamText + tools)
                           |
            ┌──────────────┼──────────────┐
            v              v              v
       Azure/Claude/    Tool calls     Manim server
       Gemini/GPT       (canvas,       (video gen)
       response         sandbox,
       (speech text)    video,
            |           progress)
            v                |
    Web Speech Synthesis     v
    (browser TTS)       Frontend renders:
            |           - Desmos 2D/3D
            v           - GeoGebra
       Sage speaks      - HTML sandbox (iframe)
       to student       - Manim video player
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1, React 19, TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand 5 |
| Database | Drizzle ORM + PostgreSQL (Supabase) |
| AI | Vercel AI SDK (`ai@6`) |
| TTS | Web Speech Synthesis (browser-native) |
| ASR | Web Speech Recognition (browser-native) |
| Math | Desmos API + GeoGebra |
| Animations | Manim (Python server) |
| Package Manager | pnpm |

### AI Models

| Model | Provider | ID |
|-------|----------|----|
| Claude Sonnet 4.5 | Anthropic | `claude-sonnet-4-5-20250929` |
| Claude Haiku 4.5 | Anthropic | `claude-haiku-4-5-20251001` |
| Gemini 3 Pro | Google | `gemini-3-pro-preview` |
| Gemini 3 Flash | Google | `gemini-3-flash-preview` |
| GPT-4.1 | OpenAI | `gpt-4.1` |
| Azure GPT-4o | Azure OpenAI | `azure-gpt-4o` |
| Azure GPT-4o Mini | Azure OpenAI | `azure-gpt-4o-mini` |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL (Supabase recommended)

### Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL=postgresql://...

# AI (at least one required)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
OPENAI_API_KEY=sk-...

# Azure OpenAI (if using Azure models)
AZURE_OPENAI_RESOURCE_NAME=your-resource-name
AZURE_OPENAI_API_KEY=...

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Optional
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_MANIM_URL=http://localhost:5001
NEXT_PUBLIC_DESMOS_API_KEY=...
```

> **Azure deployment names** must match the model suffix: `azure-gpt-4o` expects a deployment named `gpt-4o`.

### Install & Run

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Manim Server (optional — for math animations)

```bash
cd manim-server
docker build -t manim-server .
docker run -p 5001:5001 manim-server
```

---

## Project Structure

```
src/
  app/
    page.tsx                     # Landing page
    login/page.tsx               # PIN-based student login
    student/session/page.tsx     # Main tutoring session UI
    parent/                      # Parent dashboard
    api/
      tutor/respond/route.ts     # Core SSE stream endpoint
      tutor/plan/route.ts        # AI learning plan generation
      session/route.ts           # Session CRUD
      session/summary/route.ts   # Post-session AI summary

  hooks/
    useSession.ts                # Session lifecycle orchestrator
    useAvatar.ts                 # Web Speech Synthesis TTS
    useTutorBrain.ts             # SSE stream consumer + tool execution
    useCanvas.ts                 # Multi-tool canvas manager
    useUserCamera.ts             # Native getUserMedia

  lib/
    ai/client.ts                 # Multi-model AI client (Azure, Anthropic, Google, OpenAI)
    ai/prompts.ts                # Socratic teaching system prompts
    deepgram/client.ts           # Web Speech Recognition ASR
    canvas/                      # Desmos 2D/3D + GeoGebra wrappers
    manim/client.ts              # Manim video generation client
    sandbox/template.ts          # HTML sandbox wrapper
    camera/                      # Frame capture

  stores/sessionStore.ts         # Zustand session state
  types/session.ts               # Core type definitions
  db/                            # Drizzle schema + migrations
```

---

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # ESLint
pnpm db:migrate   # Run migrations
pnpm db:studio    # Drizzle Studio
```
