# Ga Bible Study — Progressive Web App

> An interactive, audio-enabled Bible study application built for the Ga-speaking community of Ghana. Read, listen to, and study the Bible in the Ga language with devotional commentary, parallel translations, and verse-level study tools.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [API Integrations](#api-integrations)
7. [Environment Variables](#environment-variables)
8. [Getting Started](#getting-started)
9. [PWA Support](#pwa-support)
10. [Roadmap](#roadmap)
11. [Contributing](#contributing)
12. [License](#license)

---

## Overview

**Ga Bible Study** is a Progressive Web App (PWA) designed to make the Ga-language Bible accessible and engaging. The Ga language is spoken by approximately 750,000 people primarily in the Greater Accra Region of Ghana. Despite its rich oral tradition, digital Bible study tools in Ga remain scarce.

This app bridges that gap by combining:

- The **Ga New Testament and Old Testament** text, sourced via the Bible Brain / Faithful Word API
- **Dramatized audio recordings** of Ga scripture (filesets `GASRN2DA` / `GASRN1DA`)
- **Verse-level study tools** — click any verse to access commentary, cross-references, and devotional notes
- **Parallel translation view** — read Ga alongside English translations side by side
- A clean, mobile-first UI built for low-bandwidth environments common across West Africa

---

## Features

### Core Reading Experience
- **Full Bible navigation** — all 66 books of the Old and New Testament, with chapter-level navigation
- **Book + chapter selector** — dropdown menus and prev/next buttons for fast navigation
- **Verse highlighting** — active verse highlighted during audio playback
- **Responsive layout** — optimized for mobile (portrait-first) and desktop

### Audio Playback
- **Chapter-level audio streaming** from Bible Brain (dramatized Ga recordings)
- **Verse synchronization** — audio playback highlights the current verse in real time using verse timing data
- **Audio controls** — play/pause, seek bar, volume, and playback speed
- **Graceful fallback** — if no API key is configured, the player degrades gracefully without breaking the UI

### Parallel Translation
- **Side-by-side reading** — toggle a parallel column showing an English translation alongside the Ga text
- **Version selector** — choose from available Bible versions (KJV, NIV, ESV, and Ga versions)
- **Persistent preference** — version and parallel state saved to local storage via Zustand

### Verse Study Tools (Popover)
- **Tap/click any verse** to open a contextual popover with:
  - Devotional commentary for the verse
  - Cross-reference suggestions
  - Study notes from curated content
  - Option to bookmark or highlight the verse
- **Popover positioning** — smart screen-edge detection to keep popover within viewport

### Study Content
- **Devotional notes** — curated study data per book and chapter (via `studyData.ts`)
- **Study page** — dedicated section for structured Bible study plans (in development)

### Progressive Web App
- **Installable** — add to home screen on Android and iOS
- **Offline-capable** — Workbox service worker caches all static assets for offline reading
- **App manifest** — branded icons (192x192, 512x512), theme color `#1e3a5f` (deep navy)
- **Standalone display mode** — runs like a native app without browser chrome

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19.x |
| Language | TypeScript | 6.x |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS (v4) | 4.x |
| State Management | Zustand | 5.x |
| Routing | React Router DOM | 7.x |
| Icons | Lucide React | 1.x |
| PWA | vite-plugin-pwa + Workbox | latest |
| Bible Text API | Bible Brain (bibles.is) | v1 |
| Bible Text API (alt) | YouVersion (unofficial) | — |
| Package Manager | npm | — |
| Node Requirement | Node.js | >= 18 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React App (SPA)                      │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ HomePage │  │  ReaderPage  │  │      StudyPage        │ │
│  └──────────┘  └──────┬───────┘  └───────────────────────┘ │
│                       │                                     │
│         ┌─────────────┼──────────────┐                      │
│         ▼             ▼              ▼                      │
│   ┌───────────┐ ┌───────────┐ ┌───────────────┐            │
│   │BibleReader│ │AudioPlayer│ │VersePopover   │            │
│   └─────┬─────┘ └─────┬─────┘ └───────┬───────┘            │
│         │             │               │                     │
│         └──────┬───────┘               │                    │
│                ▼                       ▼                    │
│         ┌─────────────┐        ┌──────────────┐            │
│         │ bibleStore  │        │  studyData   │            │
│         │  (Zustand)  │        │  (service)   │            │
│         └──────┬──────┘        └──────────────┘            │
│                │                                            │
│    ┌───────────┼────────────┐                               │
│    ▼           ▼            ▼                               │
│ ┌────────┐ ┌────────┐ ┌──────────┐                         │
│ │biblebr-│ │youver- │ │ index.ts │                         │
│ │ain.ts  │ │sion.ts │ │(service  │                         │
│ │        │ │        │ │ facade)  │                         │
│ └────────┘ └────────┘ └──────────┘                         │
│      │           │                                          │
└──────┼───────────┼──────────────────────────────────────────┘
       │           │
       ▼           ▼
 Bible Brain    YouVersion
 API (bibles.is) (fallback)
```

### State Management

All Bible navigation state is managed by a single **Zustand store** (`bibleStore`):

| State Key | Type | Description |
|---|---|---|
| `currentBook` | `string` | Active book ID (e.g. `"JHN"`) |
| `chapter` | `number` | Active chapter number |
| `primaryVersion` | `string` | Selected Bible version ID |
| `isParallel` | `boolean` | Whether parallel column is shown |
| `availableVersions` | `Version[]` | List of available Bible versions |
| `selectedVerse` | `number \| null` | Currently highlighted verse |

Actions: `setBook`, `setChapter`, `setVersions`, `toggleParallel`, `nextChapter`, `prevChapter`

### Service Layer

The `services/` directory abstracts all external API calls:

- **`biblebrain.ts`** — Primary API. Handles fileset discovery, audio URL resolution, and verse timing for the Bible Brain API (`https://api.bibles.is/v1`)
- **`youversion.ts`** — Secondary API. Fetches Bible text from YouVersion as a fallback or alternative text source
- **`studyData.ts`** — Local curated data. Provides devotional commentary, study notes, and cross-references keyed by book/chapter/verse
- **`index.ts`** — Service facade. Exports a unified interface consumed by components, routing between APIs based on availability

---

## Project Structure

```
ga-bible-app/
├── public/                     # Static assets
│   ├── favicon.svg
│   ├── pwa-192x192.png         # PWA icon (small)
│   └── pwa-512x512.png         # PWA icon (large)
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Global nav header
│   │   ├── HomePage.tsx        # Landing / welcome screen
│   │   ├── ReaderPage.tsx      # Main Bible reading interface
│   │   ├── BibleReader.tsx     # Verse-by-verse text renderer
│   │   ├── AudioPlayer.tsx     # Audio playback controls
│   │   ├── VersePopover.tsx    # Per-verse study tools popover
│   │   └── StudyPage.tsx       # Structured study plans (WIP)
│   ├── hooks/                  # Custom React hooks
│   ├── services/
│   │   ├── biblebrain.ts       # Bible Brain API client
│   │   ├── youversion.ts       # YouVersion API client
│   │   ├── studyData.ts        # Curated devotional content
│   │   └── index.ts            # Unified service facade
│   ├── stores/
│   │   └── bibleStore.ts       # Zustand global state store
│   ├── types/
│   │   └── bible.ts            # TypeScript interfaces & types
│   ├── utils/                  # Utility/helper functions
│   ├── App.tsx                 # Root component + routing
│   ├── main.tsx                # React DOM entry point
│   ├── index.css               # Global styles + Tailwind base
│   └── vite-env.d.ts           # Vite environment type declarations
├── dist/                       # Production build output (git-ignored)
├── node_modules/               # Dependencies (git-ignored)
├── index.html                  # HTML shell
├── vite.config.ts              # Vite + PWA + Tailwind config
├── tsconfig.json               # TypeScript compiler config
├── postcss.config.js           # PostCSS config
└── package.json                # Dependencies and scripts
```

---

## API Integrations

### Bible Brain (Primary)

- **Base URL:** `https://api.bibles.is/v1`
- **Authentication:** `api-key` header
- **Key endpoints used:**
  - `GET /filesets` — discover available Ga audio filesets
  - `GET /filesets/{id}/chapters/{book}{chapter}` — fetch audio URL + verse timings
- **Known Ga Filesets:**
  | Fileset ID | Type | Coverage |
  |---|---|---|
  | `GASRN2DA` | Audio Drama | New Testament |
  | `GASRN1DA` | Audio Drama | Old Testament |
- **Fallback:** If `VITE_BIBLEBRAIN_KEY` is not set, the app uses hardcoded fileset IDs and degrades gracefully — no crashes

### YouVersion (Secondary)

- Used as a fallback text source when Bible Brain text is unavailable
- Fetches Bible verse text for display in the reader

### Study Data (Local)

- Curated devotional content stored locally in `src/services/studyData.ts`
- No API key required
- Covers cross-references, commentary, and study notes per passage

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Bible Brain API key (get yours at https://www.faithcomesbyhearing.com/audio-bible-resources/bible-brain)
VITE_BIBLEBRAIN_KEY=your_api_key_here

# Optional: YouVersion API key if using private endpoints
VITE_YOUVERSION_KEY=your_key_here
```

> **Note:** All environment variables must be prefixed with `VITE_` to be exposed to the browser by Vite. The app functions without these keys — Bible text display and audio will use fallback/demo modes.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/Amberesaiae/ga-bible-study.git
cd ga-bible-study

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Bible Brain API key

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

```bash
# Type-check and build
npm run build

# Preview the production build locally
npm run preview
```

Production output is in the `dist/` directory, ready to deploy to any static host (Vercel, Netlify, GitHub Pages, Firebase Hosting).

---

## PWA Support

This app is a fully compliant Progressive Web App:

| Feature | Status |
|---|---|
| Web App Manifest | Configured (`vite.config.ts`) |
| Service Worker | Auto-generated by Workbox via `vite-plugin-pwa` |
| Offline Support | All JS/CSS/HTML/images cached |
| Installable | Yes — "Add to Home Screen" on Android & iOS |
| Standalone Mode | Yes — runs without browser UI |
| Theme Color | `#1e3a5f` (deep navy) |
| Icons | 192x192 and 512x512 PNG, maskable |

The service worker registers automatically and updates silently in the background (`registerType: 'autoUpdate'`).

---

## Roadmap

### v1.1 — Enhanced Reading
- [ ] Font size adjustment controls
- [ ] Night mode / dark theme
- [ ] Reading progress tracker (last read position saved)
- [ ] Verse bookmarking and personal highlights
- [ ] Share verse as image (WhatsApp-ready card)

### v1.2 — Study Tools
- [ ] Structured daily reading plans (e.g. 90-day Bible plan)
- [ ] Search across full Bible text
- [ ] Strong's concordance integration for word-level study
- [ ] Personal notes per verse (stored locally)

### v1.3 — Audio Enhancements
- [ ] Background audio playback (Media Session API)
- [ ] Auto-advance to next chapter on audio completion
- [ ] Download chapters for offline listening
- [ ] Audio speed controls (0.75x, 1x, 1.25x, 1.5x, 2x)

### v1.4 — Community & Sharing
- [ ] Verse-of-the-day widget / home screen widget
- [ ] WhatsApp / SMS verse sharing
- [ ] Community commentary contributions
- [ ] Prayer request board

### v2.0 — Multi-Language Expansion
- [ ] Add support for other Ghanaian languages: Twi, Ewe, Fante, Dagbani
- [ ] Language detection and auto-selection
- [ ] Multilingual parallel reading (3+ columns)
- [ ] Localized UI strings (i18n)

### Infrastructure
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deploy to Vercel / Firebase Hosting
- [ ] Automated Lighthouse PWA audits on every PR
- [ ] E2E tests with Playwright

---

## Contributing

Contributions are welcome, especially from Ga-speaking developers and Bible scholars who can improve the accuracy of commentary and study notes.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add verse bookmarking"`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

*Built with love for the Ga community. "Yɛ hɛ Onyoŋ Wɔ."* (We trust in God.)
