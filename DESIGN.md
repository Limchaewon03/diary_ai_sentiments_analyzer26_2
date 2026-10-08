---
name: Mindful Canvas
colors:
  surface: '#fef7ff'
  surface-dim: '#dfd7e3'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f1fd'
  surface-container: '#f3ebf7'
  surface-container-high: '#ede6f1'
  surface-container-highest: '#e7e0eb'
  on-surface: '#1d1a22'
  on-surface-variant: '#494551'
  inverse-surface: '#322f37'
  inverse-on-surface: '#f6eefa'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#00513b'
  on-tertiary: '#ffffff'
  tertiary-container: '#006c4f'
  on-tertiary-container: '#47f3bb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#54fdc4'
  tertiary-fixed-dim: '#27e0a9'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#00513b'
  background: '#fef7ff'
  on-background: '#1d1a22'
  surface-variant: '#e7e0eb'
typography:
  display-lg:
    fontFamily: Noto Sans
    fontSize: 57px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.25px
  display-md:
    fontFamily: Noto Sans
    fontSize: 45px
    fontWeight: '400'
    lineHeight: 52px
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Noto Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.15px
  title-sm:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0.15px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.25px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.4px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
  label-sm:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies an empathetic, introspective, and luminous atmosphere tailored for an AI-powered personal diary experience in Korean. Drawing directly from Google Material 3 (Material You) principles, it prioritizes dynamic expression, personal warmth, and emotional resonance without sacrificing structured utility.

The aesthetic fuses soft tonal surfaces with vivid mood accents. The emotional signature is calm yet uplifting, encouraging vulnerability and daily reflection. Interactions feel organic, lightweight, and gentle, moving away from cold mechanical AI tooling toward an attentive digital companion.

## Colors

The core palette centers on Material 3's iconic violet-indigo base, supported by expressive emotional hues specifically designed for sentiment logging and contextual diary insights.

### Functional Tones
- **Primary & Interactive**: `#6750A4` serves as the primary anchor, with `#7C3AED` delivering a vibrant, focused presence for active AI triggers, primary buttons, and floating action buttons.
- **Surfaces & Containers**: Baseline screen surface is crisp `#FFFFFF`. Layered containers use soft lilac-tinted neutrals (`#F7F5FC` for surface container low, `#F3EDF7` for standard containers, and `#EADBDB` to `#E7E0EC` for structural dividers).
- **Text & On-Surface**: High-contrast `#1D1B20` guarantees crisp legibility for Hangul body copy and headlines, paired with `#49454F` for secondary helper copy.

### Sentiment & Mood Matrix
- **Joy / Gratitude**: `#FFB703` (Golden Warmth)
- **Calm / Peace**: `#48CAE4` (Gentle Sky)
- **Sadness / Release**: `#90E0EF` (Soft Cloud)
- **Anger / Tension**: `#FF6B6B` (Coral Pulse)
- **Growth / Hope**: `#06D6A0` (Emerald Vitality)

Mood colors should be applied via tonal surface containers (8% to 15% opacity tint over neutral surfaces) with matching saturated icons, rather than jarring full-bleed blocks.

## Typography

Typography prioritizes legibility, breathing room, and typographic rhythm tailored for the Korean script (Hangul). Korean glyphs require slightly elevated line heights compared to Latin defaults to avoid visual crowding across multiline diary entries.

- **Headlines & Display**: Grounded and expressive, utilizing semi-bold weights for entry titles, day summaries, and milestone highlights.
- **Body Text**: Tuned for reflective journaling with generous line-height ratios (`26px` on `16px` text), avoiding fatigue during long reflective writing or reading AI weekly retrospectives.
- **Labels & Metadata**: Crisp, deliberate tracking ensures microcopy such as timestamps, sentiment tags, and AI suggestions remain legible at glanceable sizes.
- **Font Fallback**: `Noto Sans`, `Noto Sans KR`, `Pretendard`, system-ui, sans-serif.

## Layout & Spacing

The layout is structured around an adaptive 4-column (mobile), 8-column (tablet), and 12-column (desktop) responsive grid. 

- **Mobile (< 600px)**: Content embraces full-width cards with a persistent `1rem` (16px) margin. Single-column linear flow prioritizing the reading and typing view.
- **Tablet (600px - 1024px)**: Uses dual-column layouts (`1.5rem` gutter) pairing diary navigation or calendar views alongside the active entry editor.
- **Desktop (> 1024px)**: Centers content within a max-width container (1200px) using 12 columns, flanked by generous `4rem` outer margins to maintain focus and calm.
- **Rhythm**: Internal spacing builds upon an 8-point spatial grid (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 32px), creating balanced padding across cards and dynamic conversational threads.

## Elevation & Depth

This design system uses Material 3 tonal elevation combined with soft, lavender-tinted ambient drop shadows. Instead of harsh grey drop shadows, depth is achieved by coupling elevated surface container tints with airy, diffused shadows:

- **Level 0 (Flat / Canvas)**: Pure `#FFFFFF` background or subtle `#FEF7FF` canvas with no shadow. Used for the root view.
- **Level 1 (Card / Resting Container)**: Background `#F7F5FC`, bordered with `1px solid #E7E0EC` or accompanied by a soft ambient shadow: `0px 2px 8px rgba(103, 80, 164, 0.04), 0px 1px 3px rgba(0, 0, 0, 0.03)`.
- **Level 2 (Hover / Active Cards / Menus)**: Background `#F3EDF7`, shadow: `0px 4px 16px rgba(103, 80, 164, 0.08), 0px 2px 6px rgba(0, 0, 0, 0.04)`.
- **Level 3 (Modals / Floating Action Buttons)**: Background `#EEE8F4`, shadow: `0px 8px 24px rgba(103, 80, 164, 0.12), 0px 4px 8px rgba(0, 0, 0, 0.06)`.
- **AI Prompt Highlights**: Elevated surfaces delivering automated AI emotional summaries feature a subtle 1px border gradient transitioning from `#E7E0EC` to `#7C3AED` with an extra diffused glow.

## Shapes

In true Material 3 spirit, the shape language uses expansive, gentle curves to create an inviting, human feel:

- **Pill Geometry (`9999px`)**: Interactive targets such as filled buttons, tonal action chips, search bars, and bottom navigation indicators use full pill curvature.
- **Cards & Surface Containers**: Standard diary entry tiles, analytics cards, and emotion clusters use large corner radices (`16px` to `24px` / `rounded-xl`).
- **Input Fields & Dialogue Prompts**: Text fields feature rounded corners (`16px` for standalone rich text entry cards, `28px` for single-line AI query bars).

## Components

### Buttons
- **Primary / FAB**: Pill-shaped (`rounded-full`), height of 48px or 56px, filled with `#6750A4` or `#7C3AED`, text in white `label-lg`. Floating action buttons utilize a soft Level 3 violet shadow.
- **Tonal / Secondary**: Pill-shaped, container background `#E8DEF8`, text `#21005D`. Used for auxiliary actions such as "AI 회고 보기" (View AI Reflection) or "감정 태그 추가" (Add Emotion Tag).
- **Outlined / Text**: 1px border `#79747E`, pill-shaped, transparent background.

### Mood Chips & Tags
- Pill-shaped (`rounded-full`), 32px height, composed of an 8-to-12% opacity tint of the respective sentiment color, a matching saturated icon or dot, and dark label text (`label-md`). Selected states adopt full border rings in the sentiment color.

### Diary Cards
- Enclosed with `rounded-xl` (16px to 24px) corners, padded with `1.5rem`. Contains a header with Korean date metadata (`title-sm`), mood chip, title (`title-md`), truncated entry preview (`body-md`), and optional AI empathy quote container at the base (`#F7F5FC` fill with a subtle 2px left border in `#7C3AED`).

### Input Fields
- Diary content creation employs an edgeless, borderless canvas on mobile with floating pill formatting toolbars. Single-line prompts and AI chat prompts use a pill-enclosed surface (`#F3EDF7`) with `1rem` horizontal padding and an internal circular icon send button.

### Selection Controls
- Checkboxes and switches reflect the violet theme (`#6750A4` when checked) with smooth spring transitions.

### AI Insight Cards (Special Component)
- Distinct from standard diary cards, these use a soft gradient container (`#F6F2FF` fading to `#FFFFFF`), a 1px border tinted in `#E8DEF8`, and a dedicated sparkle/gem icon in `#7C3AED` to clearly designate AI reflections, sentiment shifts, and weekly growth summaries.