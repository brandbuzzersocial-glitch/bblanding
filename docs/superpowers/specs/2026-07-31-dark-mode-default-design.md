# Fixed Dark Mode Design Spec

**Date:** 2026-07-31  
**Status:** Approved (Approach 2 - Fixed Dark Mode)  
**Topic:** Default & Permanent Dark Mode Implementation

---

## 1. Overview
The goal is to make the website exclusively and permanently dark mode by default, eliminating any light flash during initial document render, overscroll, or component mount, while removing dead code related to theme switching.

---

## 2. Component & File Changes

### A. `index.html`
- Add `<meta name="theme-color" content="#0f0f0f" />` to configure browser UI and mobile header color to deep dark background (`#0f0f0f`).

### B. `src/App.css`
- Apply `color-scheme: dark;` to `html`.
- Set default `background-color: #0f0f0f;` and `color: #f2eeea;` on `html` and `body`.
- Ensure canvas containers, scrollbar tracks, and mobile menu overlays default to dark styles.

### C. `src/App.jsx`
- Fix theme state to `"dark"` and `dark = true`.
- Clean up unused theme toggle button logic if present to maintain lean component structure.
- Ensure all theme tokens (`T`) consistently output dark mode values:
  - `bg`: `#0f0f0f`
  - `bg2`: `#171717`
  - `bg3`: `#1e1e1e`
  - `text`: `#f2eeea`
  - `muted`: `#6b6560`
  - `border`: `rgba(240,113,39,0.14)`
  - `navBg`: `rgba(15,15,15,0.92)` (when scrolled) / `transparent`
  - `card`: `#171717`
- Pass `theme="dark"` to `CodeMatrixRain` and `CircuitNetwork` canvas animations.

---

## 3. Verification Plan
- Build and serve the app locally via `npm run dev` or `vite build` + `vite preview`.
- Verify document root background is `#0f0f0f` before JS load (no white flash).
- Verify all sections (Hero, Services, Live Work, Process, Results, Contact, Footer) display crisp dark mode aesthetics with orange accenting (`#f07127`).
