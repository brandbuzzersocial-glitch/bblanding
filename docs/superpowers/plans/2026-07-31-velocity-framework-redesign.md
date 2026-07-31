# Velocity Framework Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Process ("Velocity Framework") section into a high-impact, high-tech connected sprint timeline with time-badge chips, circular SVG icons, 3D watermark numbers, and dynamic hover/touch states.

**Architecture:** Update CSS definitions in `src/App.css` for timeline tracks, card styling, badges, and icon glow, and update the React section JSX in `src/App.jsx` to render the timeline track, time chips, SVG icons, and step descriptions.

**Tech Stack:** React 18, Vite, Vanilla CSS.

## Global Constraints

- Preserve smooth scrolling navigation (`go('process')`).
- Maintain dark mode & light mode theme token compatibility (`T.bg`, `T.bg2`, `T.text`, `T.muted`, `T.border`).
- Ensure responsive display down to 320px screen width.

---

### Task 1: Update CSS Stylesheet for Velocity Framework Timeline & Cards

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Consumes: Theme variables (`--bg`, `--txt`, `--bdr`)
- Produces: Styles for `.proc-container`, `.proc-timeline-track`, `.proc-card`, `.proc-chip`, `.proc-icon-wrap`, `.proc-watermark`

- [ ] **Step 1: Add Process section styles to `src/App.css`**

Add CSS classes for:
- `.proc-container` (relative position container for timeline track)
- `.proc-timeline-track` (horizontal gradient line for desktop, vertical line for mobile)
- `.proc-card` (glassmorphic card with subtle border glow, 3D depth, hover translateY, and overflow hidden)
- `.proc-chip` (pill tag for sprint duration: `Hour 0–2`, `Hour 2–24`, etc.)
- `.proc-icon-wrap` (circular glowing icon badge)
- `.proc-watermark` (large translucent outlined step numbers `01`, `02`, `03`, `04`)

- [ ] **Step 2: Verify CSS syntax by running build**

Run: `npm run build`
Expected: PASS

---

### Task 2: Update React Component JSX in `src/App.jsx`

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: Process section styles from `App.css`
- Produces: High-impact `id="process"` section component

- [ ] **Step 1: Update section `id="process"` in `src/App.jsx`**

Replace current process section JSX with:
- Timeline connector track with glowing pulse nodes.
- Array of 4 sprint steps containing:
  - Time chip (`Hour 0–2`, `Hour 2–24`, `Hour 48–72`)
  - Circular SVG icon (Target, Palette, Lightning, Rocket)
  - Translucent 3D depth watermark number
  - Step title & detailed value proposition text

- [ ] **Step 2: Run production build & verify**

Run: `npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit changes**

```bash
git add src/App.css src/App.jsx docs/superpowers/
git commit -m "feat: redesign Velocity Framework section with high-tech sprint timeline"
```
