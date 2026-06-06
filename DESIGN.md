---
name: TaskFlow Technical
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434844'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737874'
  outline-variant: '#c3c8c3'
  surface-tint: '#516258'
  primary: '#182820'
  on-primary: '#ffffff'
  primary-container: '#2d3e35'
  on-primary-container: '#96a99d'
  inverse-primary: '#b8cbbf'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#222527'
  on-tertiary: '#ffffff'
  tertiary-container: '#373b3d'
  on-tertiary-container: '#a2a5a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e7da'
  primary-fixed-dim: '#b8cbbf'
  on-primary-fixed: '#0e1f17'
  on-primary-fixed-variant: '#394b41'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  code:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for deep work and high-velocity task management. The brand personality is grounded in reliability and precision, evoking the feeling of a high-end developer tool—functional, "no-fluff," and meticulously organized. It targets professionals who value efficiency over ornamentation.

The visual style is **Corporate Modern** with a lean towards **Technical Minimalism**. It prioritizes information density without clutter, utilizing purposeful whitespace and a rigid structural grid. Visual interest is derived from crisp borders, subtle tonal shifts, and typographic hierarchy rather than decorative elements. Abstract geometric patterns or data-driven visualizations (line charts, heatmaps) replace traditional illustrations to maintain a professional, analytical atmosphere.

## Colors
This design system utilizes a sophisticated **Forest & Indigo** palette. The primary color is a deep, architectural Forest Green (`#2D3E35`), used for high-level navigation and primary actions to evoke stability. A vibrant Indigo (`#4F46E5`) serves as the secondary accent for focus states, interactive elements, and progress tracking.

The neutral scale is built on a "Cool Slate" logic, moving from deep charcoals for text to airy grays for surfaces. All color pairings for text and UI-essential icons are strictly curated to pass WCAG AA contrast ratios against their respective backgrounds. Backgrounds utilize tiered off-whites to separate content zones without harsh lines.

## Typography
The typographic system leverages **Geist** for headlines and labels to reinforce the technical, "engineered" aesthetic. Its geometric precision and tight tracking provide a modern, authoritative voice. **Inter** is used for body copy to ensure maximum legibility during long periods of task management and data entry.

Hierarchy is strictly enforced through weight and letter-spacing. Labels use uppercase Geist with slight tracking to differentiate metadata from content. For mobile views, display sizes scale down significantly to prevent line-breaking issues in narrow columns.

## Layout & Spacing
The design system employs a **Fixed Grid** layout for desktop, centered on a 1280px container to ensure optimal line lengths for reading task descriptions. A 12-column system is used for dashboard layouts, while a single-column focused view is used for document-style task details.

The spacing rhythm is based on a **4px baseline grid**. 
- **Desktop (1280px+):** 24px margins, 24px gutters.
- **Tablet (768px - 1279px):** 16px margins, 16px gutters.
- **Mobile (<767px):** 16px margins, fluid columns.

Content follows a "logical density" rule: information-heavy tables use 8px (sm) vertical padding, while marketing or landing sections use 40px (xl) to create breathing room.

## Elevation & Depth
Depth in the design system is achieved through **Tonal Layers** and **Low-contrast Outlines**. Shadows are used sparingly, reserved for temporary surfaces like Modals and Dropdowns.

- **Level 0 (Background):** The base canvas, typically the lightest gray or white.
- **Level 1 (Cards/Sidebar):** Uses a subtle 1px border (`#E2E8F0`) to define boundaries. No shadow.
- **Level 2 (Active Elements):** Elements being dragged or interacted with receive a soft, diffused shadow (0 4px 12px rgba(0,0,0,0.05)).
- **Level 3 (Modals):** High-contrast boundaries with a 16px blur backdrop filter (glassmorphism) to keep the user focused on the foreground task.

## Shapes
The shape language is **Soft** and professional. A standard radius of `0.25rem` (4px) is applied to buttons, inputs, and small components to maintain a clean, organized feel without appearing overly "bubbly." Larger components like cards or modals use `0.5rem` (8px). 

Status chips and avatars are the only exceptions, utilizing a fully rounded/pill shape to provide a visual break from the rigid rectangular grid of the task lists and tables.

## Components
### Buttons
- **Primary:** Forest Green background, white text. Solid, no gradient.
- **Secondary:** White background, 1px Slate border, Indigo text.
- **Ghost:** No background or border. Indigo text. Used for low-priority actions in toolbars.
- **Destructive:** Solid Crimson background. Used only for final deletion actions.

### Status Chips
Pill-shaped with a light tinted background and dark foreground text.
- **PENDING:** Slate Gray.
- **IN_PROGRESS:** Indigo.
- **COMPLETED:** Emerald Green.

### Form Inputs
Inputs use a 1px border that shifts to Indigo on focus. Labels sit consistently above the field in Geist Bold (12px). Validation errors are displayed inline in Crimson.

### Tables & Lists
Tables use a "Zebra-lite" approach—subtle gray backgrounds on hover only. Horizontal dividers are 1px Slate-100. Cell padding is generous (12px vertical) to ensure readability.

### Modals & Drawers
Drawers slide from the right for task "Quick Views." Modals are centered for "System Settings." Both use a semi-transparent dark overlay with a 4px background blur.