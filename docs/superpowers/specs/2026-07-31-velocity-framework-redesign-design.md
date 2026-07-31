# High-Tech Velocity Framework (Process) Redesign Spec

## Overview
Redesign the **Process ("Velocity Framework")** section on the BrandBuzzer landing page to make it significantly more impactful, visually engaging, and high-converting.

## Key Changes & Enhancements

### 1. Visual Hierarchy & Timeline Track
- **Desktop (1024px+)**: A horizontal glowing gradient timeline track connecting Step 01 → 02 → 03 → 04 with active pulse nodes.
- **Mobile (<1024px)**: A vertical left-aligned glowing timeline track connecting all 4 steps sequentially.

### 2. Card Architecture & Elements
Each step card will feature:
- **Time-Badge Chip**: Translucent orange pill tag highlighting sprint timeline (`Hour 0–2`, `Hour 2–24`, `Hour 24–48`, `Hour 48–72`).
- **Icon Badge**: Glowing circular SVG icon box for each step:
  - Step 01: Scope & Target Icon
  - Step 02: Palette & Wireframe Icon
  - Step 03: Lightning Performance Icon
  - Step 04: Rocket Launch Icon
- **3D Depth Watermark Number**: Giant translucent stroked watermark (`01`, `02`, `03`, `04`) in the background.
- **Glassmorphism Styling**: Theme-aware card background with subtle gradient borders, dark mode glass glow, and smooth hover elevation (`translateY(-8px)`).

### 3. Responsiveness & Touch Optimization
- Touch-friendly card padding and spacing on mobile phones.
- Smooth reveal animation (`.rv` inView observer) with staggered delay per step.

## Component Target
- `src/App.jsx`: Section `id="process"`
- `src/App.css`: `.g4`, `.proc-card`, `.proc-timeline`, `.proc-badge`
