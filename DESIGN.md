# CreateFlow AI OS — System Design & UI/UX Standards

This document specifies the visual identity, UI/UX architecture, design tokens, anti-slop guidelines, and component patterns for **CreateFlow AI OS**. It synthesizes principles from `ui-ux-pro-max-skill`, `awesome-design-md` (Linear/Vercel/Deepgram aesthetic), `impeccable` (anti-patterns & design critique), `taste-skill`, and Google agentic skills.

---

## 🎨 Visual Identity & Aesthetic Philosophy
- **Aesthetic Direction**: High-Density Tech SaaS (Linear / Vercel / Deepgram Studio).
- **Core Mood**: Sleek, hyper-precise, dark-mode first, minimal chrome, high-contrast monospace metadata.
- **Density**: High density with balanced padding (`p-5`, `gap-4`). Every pixel has purpose; no unnecessary whitespace or bloated cards.

---

## 🎛️ Color System Tokens

### Backgrounds
- **App Canvas**: `#0a0a0c` (Ultra-dark pitch obsidian)
- **Sidebar**: `#09090b` (Deep dark zinc with `border-r border-zinc-800/70`)
- **Card Containers**: `#111114` or `#121215` (Deep graphite)
- **Hover/Active Containers**: `#18181c` or `#1c1c20`

### Borders
- **Standard Border**: `border-zinc-800/80` or `border-zinc-800/60`
- **Hover Border**: `hover:border-zinc-700/90`
- **Active Focus Border**: `focus:border-indigo-500`

### Accents & Status Indicators
- **Primary Indigo**: `text-indigo-400`, `bg-indigo-600`, `border-indigo-500/30`
- **Emerald (Active / Success)**: `text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/20`
- **Amber (Ready / Scheduled)**: `text-amber-400`, `bg-amber-500/10`, `border-amber-500/20`
- **Rose (Errors / Danger)**: `text-rose-400`, `bg-rose-500/10`, `border-rose-500/20`
- **Purple (Drafts / AI)**: `text-purple-400`, `bg-purple-500/10`, `border-purple-500/20`

---

## ✒️ Typography Guidelines
- **Primary Sans**: `Geist Sans` / `Inter` — used for primary headers, titles, and body content (`font-sans`).
- **Monospace Accent**: `Geist Mono` — used for all metadata, tags, dates, key-value pairs, section counts `[3]`, and keyboard shortcuts `⌘K` (`font-mono`).

---

## 🛑 Anti-Slop Rules (Impeccable & Taste-Skill Standards)
1. **NO Cards-Within-Cards Nested Bloat**: Avoid stacking multiple padded rounded rectangles inside cards. Keep layout flat and clean.
2. **NO Generic Purple Gradients**: Avoid bright uncurated radial gradient blobs. Stick to subtle 1px borders, crisp 8px-12px rounded corners, and true dark obsidian surfaces.
3. **NO Decorative Icon Overkill**: Icons must have semantic meaning (e.g. status indicator, channel icon `ig`/`in`).
4. **NO Hardcoded Static Widths**: Layouts must fill 100% of available viewport width with responsive CSS grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`).

---

## 🧩 Component Specifications (3-Column Agent Grid Pattern)
- **Grid Ratio**: 3 columns on desktop, scaling to 4-5 on ultrawide, 1-2 on mobile.
- **Card Anatomy**:
  - **Header**: Icon square badge (`h-8 w-8 rounded-lg bg-color-500/10`) + `•••` action menu.
  - **Body**: Title (`font-bold text-white text-sm line-clamp-1`), tags (`font-mono text-[11px] text-zinc-500 truncate`).
  - **Footer**: Monospace date (`Created Jun 12`) + Status Badge (`Active` / `Draft` / `Ready`).
