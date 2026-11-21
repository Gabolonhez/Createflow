# CreateFlow AI OS — System Design & UI/UX Standards (Pluy Edition)

This document specifies the visual identity, UI/UX architecture, design tokens, anti-slop rules, and component patterns for **CreateFlow AI OS**, calibrated to match the monochrome dark craft of **Pluy (`trypluy.com`)**, **Apple macOS**, and **Linear**.

---

## 🎨 Visual Identity & Aesthetic Philosophy
- **Aesthetic Direction**: Monochrome Dark Craft (Pluy / Apple macOS / Linear).
- **Core Mood**: Sleek, pitch-black obsidian, crisp 1px neutral borders, pure white pill CTAs, subtle macOS window chrome, and surgical color accents.
- **Zero Purple/Indigo Slop**: No generic `violet-600`, `indigo-600`, or bright gradient blobs on primary UI controls, borders, or cards.

---

## 🎛️ Color System Tokens

### Monochrome Surfaces
- **App Canvas**: `#0a0a0a`
- **Sidebar / Modal Chrome**: `#111111` or `#141414`
- **Cards & KPIs**: `#161616` (`rounded-[20px]` / `rounded-[22px]`, `border-[#222222]`, `hover:border-[#333333]`)
- **Elevated / Preview Frame**: `#1a1a1a` / `#1d1d1d`
- **Active / Quiet Surface**: `#212121`
- **Inputs / Textareas / Selects**: `#1c1c1c` (`border-[#2a2a2a]`, `focus:border-[#4e4e4e]`)
- **Borders / Dividers**: `#1f1f1f` (dividers), `#262626` (panel contours)

### Text
- **Primary**: `#ececec` (or `#ffffff` on emphasis)
- **Secondary**: `#9a9a9a`
- **Muted / Metadata**: `#6f6f6f`

### Surgical Accents (Semantic Only)
- **Pluy Electric Blue (`#0c8ce9`)**: Exclusively for active switches/toggles (`Autopilot`, `Follow-Gate`, `Reply Público`). Off state = `#333333`.
- **Pluy Mint (`#7ae6a0`)**: Live status, active campaigns, checkmarks (`● Ativa`, `● Live`, `bg-[#7ae6a0]/12 text-[#7ae6a0]`).
- **macOS Window Lights**: `#ff5f56`, `#ffbd2e`, `#27c93f` on modal & preview window bars.

---

## 💊 Buttons & Controls
- **Primary CTA (White Pill)**: `rounded-full bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] font-medium transition-all active:scale-[0.97]`
- **Secondary CTA (Quiet Pill)**: `rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] font-medium transition-all active:scale-[0.97]`
- **Segmented Pill Tabs**: Container `p-1 rounded-full bg-[#141414] border border-[#242424]`; active `rounded-full bg-[#282828] text-white font-medium`; inactive `rounded-full text-[#8a8a8a] hover:text-[#ececec]`.
- **Circular Send Button**: `rounded-full bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] active:scale-[0.95]`.

---

## ✒️ Typography
- **Primary Sans**: `Inter` (`font-feature-settings: "cv11", "ss03"`) with `font-medium` / `font-semibold` and `tracking-[-0.025em]` / `tracking-[-0.03em]`.
- **Monospace Accent**: `Geist Mono` (`font-mono text-[11px]`) for timestamps, telemetry, keywords, and section counters.
