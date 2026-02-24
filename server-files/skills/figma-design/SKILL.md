# Figma Design Skill — World-Class UI Design

You are a world-class product designer. When using the Figma Design Bridge, your output should look like it came from a senior designer at Linear, Stripe, Apple, or Vercel — not a developer guessing at design. This skill teaches you to design like a top-tier product team.

---

## Design Philosophy

**1. Visual hierarchy first.** Every screen has ONE primary action and one dominant visual element. Everything else is secondary. Users should know where to look and what to do within 2 seconds.

**2. Whitespace is a feature.** Empty space is not wasted space — it creates focus, elegance, and readability. Top tech apps use 40-60% whitespace. Do not fill every pixel.

**3. Consistency over creativity.** Use the same spacing, the same font sizes, the same card styles, the same button styles across ALL screens. Consistency builds trust. Creativity at the expense of consistency destroys it.

**4. Content-first layout.** Position elements based on what users need to see and do — not based on filling space. Start with the most important information, then build down.

**5. One CTA per screen.** One large primary button. Everything else is text or outlined. Never two big buttons fighting for attention.

---

## Design System Tokens

### Typography Scale (Inter font — ALWAYS use these exact sizes)

```
Display:    fontSize: 32, fontStyle: "Bold"       → Hero headings, splash screens, hero numbers
H1:         fontSize: 28, fontStyle: "Bold"        → Page titles, main headings
H2:         fontSize: 22, fontStyle: "Semi Bold"   → Section headings, modal titles
H3:         fontSize: 18, fontStyle: "Semi Bold"   → Card titles, subsection headers
Body:       fontSize: 16, fontStyle: "Regular"     → Primary text, descriptions, list items
Body Small: fontSize: 14, fontStyle: "Regular"     → Secondary text, metadata, captions
Caption:    fontSize: 12, fontStyle: "Regular"     → Labels, timestamps, helper text
Overline:   fontSize: 11, fontStyle: "Medium"      → Tags, category labels, eyebrow text
```

**Rules:**
- Never use a font size not in this scale (no 15px, no 17px, no 20px)
- Never use more than 2 font weights per screen (usually Regular + Semi Bold, or Regular + Bold)
- Line height (lineHeight) for body text: fontSize × 1.5 (e.g., 24 for 16px)
- Letter spacing for Overline: letterSpacing: 1.5

### Spacing Grid (8px base — ALWAYS use these exact values)

```
4   → Tight: icon-to-text gap, inner badge padding
8   → Small: between label and input, between icon and title
12  → Medium-small: between list items, between chip items
16  → Standard: horizontal screen margins, card internal padding, between related elements
20  → Medium: between cards (vertical gap), modal padding
24  → Large: between sections, button margin from edge
32  → Extra large: major section breaks, hero spacing
48  → 2XL: top of screen breathing room, large hero sections
64  → 3XL: very large gaps, full-bleed spacing
```

**Rules:**
- Never use a spacing value not in this grid (no 10px, no 13px, no 22px)
- Horizontal screen margin: ALWAYS 16px from both edges
- Touch targets: MINIMUM height 44px for any tappable element

### Color Tokens

#### Dark Mode (Primary — use for premium/modern apps)
```
Backgrounds:
  bg-primary:     "#0A0A0F"   → Main screen background
  bg-secondary:   "#111118"   → Slightly elevated (list areas, headers)
  bg-elevated:    "#1A1A24"   → Cards, sheets, modals
  bg-overlay:     rgba #000000 at 70% opacity → Overlays, scrim

Text:
  text-primary:   "#F9FAFB"   → Main text (headings, body)
  text-secondary: "#9CA3AF"   → Secondary text, metadata, placeholders
  text-tertiary:  "#6B7280"   → Very secondary, disabled states

Accent (Indigo — default):
  accent:         "#6366F1"   → Primary buttons, links, active states, highlights
  accent-light:   "#818CF8"   → Hover states, lighter accent use
  accent-bg:      "#1E1B4B"   → Accent background tint (active tab, selected state)

Status:
  success:        "#10B981"   → Success states, positive values, completed
  warning:        "#F59E0B"   → Warnings, pending states
  error:          "#EF4444"   → Errors, destructive actions, negative values

Borders:
  border-default: "#27272A"   → Card borders, dividers
  border-subtle:  "#1F1F23"   → Very subtle separators
```

#### Light Mode
```
Backgrounds:
  bg-primary:     "#FFFFFF"
  bg-secondary:   "#F8F9FA"
  bg-elevated:    "#FFFFFF" with border "#E5E7EB"

Text:
  text-primary:   "#111827"
  text-secondary: "#6B7280"
  text-tertiary:  "#9CA3AF"

Accent: "#6366F1" (same)
Border-default: "#E5E7EB"
```

**Rules:**
- Choose ONE mode (dark or light) and use it consistently across ALL screens
- Never use more than 3 colors on a single screen (bg + text + one accent)
- Never put light gray text on white/light background — minimum 4.5:1 contrast ratio

### Corner Radius Tokens
```
2   → Tiny: dividers, thin lines (rarely used)
6   → Small: tags, badges, small chips
8   → Medium: inputs, small buttons, form elements
12  → Large: medium buttons, small cards
16  → XL: large buttons, primary cards
20  → 2XL: feature cards, hero cards, modals
24  → 3XL: large sheets, bottom panels
9999→ Full: pills (tags), avatars, circular elements
```

### Shadow Tokens
```
shadow-sm:  { color: "#000000", opacity: 0.05, x: 0, y: 1, blur: 2, spread: 0 }   → Subtle (inputs)
shadow-md:  { color: "#000000", opacity: 0.08, x: 0, y: 4, blur: 12, spread: 0 }  → Cards
shadow-lg:  { color: "#000000", opacity: 0.12, x: 0, y: 8, blur: 24, spread: 0 }  → Elevated cards, dropdowns
shadow-xl:  { color: "#000000", opacity: 0.16, x: 0, y: 16, blur: 48, spread: 0 } → Modals, floating CTAs
```

---

## Layout Patterns (Copy-Paste Ready)

### Screen Safe Zones (Mobile 375×812)
```
Status bar:      y: 0 → 54      (NEVER place content here)
Navigation bar:  y: 54 → 110    (back button, title, action)
Content area:    y: 110 → 750   (scrollable content starts here)
Tab bar:         y: 750 → 812   (navigation tabs)
First content:   y: 124         (24px gap below nav bar)
```

### Navigation Bar
```json
{
  "type": "frame",
  "name": "Nav Bar",
  "x": 0, "y": 54,
  "width": 375, "height": 56,
  "fill": "#0A0A0F",
  "children": [
    { "type": "text", "x": 16, "y": 16, "content": "←", "fontSize": 22, "fill": "#9CA3AF" },
    { "type": "text", "x": 0, "y": 16, "width": 375, "content": "Page Title", "fontSize": 18, "fontStyle": "Semi Bold", "fill": "#F9FAFB", "textAlign": "center" },
    { "type": "text", "x": 335, "y": 16, "content": "⋯", "fontSize": 22, "fill": "#9CA3AF" }
  ]
}
```

### Bottom Tab Bar (5 tabs)
```json
{
  "type": "frame",
  "name": "Tab Bar",
  "x": 0, "y": 742,
  "width": 375, "height": 70,
  "fill": "#111118",
  "stroke": "#27272A",
  "strokeWeight": 1,
  "children": [
    {
      "type": "frame", "name": "Tab Home",
      "x": 0, "y": 0, "width": 75, "height": 70,
      "fill": "transparent",
      "layout": { "direction": "vertical", "gap": 4, "align": "center", "justify": "center", "padding": 0 },
      "children": [
        { "type": "icon", "emoji": "🏠", "size": 22, "fill": "#6366F1" },
        { "type": "text", "content": "Home", "fontSize": 11, "fontStyle": "Medium", "fill": "#6366F1" }
      ]
    },
    {
      "type": "frame", "name": "Tab Explore",
      "x": 75, "y": 0, "width": 75, "height": 70,
      "fill": "transparent",
      "layout": { "direction": "vertical", "gap": 4, "align": "center", "justify": "center", "padding": 0 },
      "children": [
        { "type": "icon", "emoji": "🔍", "size": 22, "fill": "#6B7280" },
        { "type": "text", "content": "Explore", "fontSize": 11, "fontStyle": "Regular", "fill": "#6B7280" }
      ]
    }
  ]
}
```

### Standard Card
```json
{
  "type": "frame",
  "name": "Card",
  "x": 16, "y": 124,
  "width": 343, "height": 120,
  "fill": "#1A1A24",
  "cornerRadius": 16,
  "shadow": { "color": "#000000", "opacity": 0.08, "x": 0, "y": 4, "blur": 12, "spread": 0 },
  "layout": { "direction": "vertical", "padding": 20, "gap": 8 },
  "children": [
    { "type": "text", "content": "Card Title", "fontSize": 16, "fontStyle": "Semi Bold", "fill": "#F9FAFB" },
    { "type": "text", "content": "Supporting text goes here", "fontSize": 14, "fontStyle": "Regular", "fill": "#9CA3AF" }
  ]
}
```

### Stats Card (for dashboards)
```json
{
  "type": "frame",
  "name": "Stats Card",
  "x": 16, "y": 124,
  "width": 161, "height": 100,
  "fill": "#1A1A24",
  "cornerRadius": 16,
  "children": [
    { "type": "text", "x": 16, "y": 16, "content": "Total Revenue", "fontSize": 12, "fontStyle": "Regular", "fill": "#9CA3AF" },
    { "type": "text", "x": 16, "y": 40, "content": "$24,500", "fontSize": 22, "fontStyle": "Bold", "fill": "#F9FAFB" },
    { "type": "text", "x": 16, "y": 72, "content": "↑ 12% this month", "fontSize": 11, "fontStyle": "Regular", "fill": "#10B981" }
  ]
}
```

### List Item (for settings, menus, search results)
```json
{
  "type": "frame",
  "name": "List Item",
  "x": 0, "y": 124,
  "width": 375, "height": 64,
  "fill": "transparent",
  "layout": { "direction": "horizontal", "paddingLeft": 16, "paddingRight": 16, "gap": 12, "align": "center" },
  "children": [
    {
      "type": "frame", "name": "Icon Container",
      "width": 40, "height": 40,
      "fill": "#1A1A24", "cornerRadius": 10,
      "layout": { "direction": "horizontal", "align": "center", "justify": "center", "padding": 0 },
      "children": [{ "type": "icon", "emoji": "📊", "size": 18 }]
    },
    {
      "type": "frame", "name": "Text",
      "width": 251, "height": 40,
      "fill": "transparent",
      "layout": { "direction": "vertical", "gap": 4, "justify": "center", "padding": 0 },
      "children": [
        { "type": "text", "content": "Item Title", "fontSize": 16, "fontStyle": "Regular", "fill": "#F9FAFB" },
        { "type": "text", "content": "Subtitle or metadata", "fontSize": 12, "fontStyle": "Regular", "fill": "#9CA3AF" }
      ]
    },
    { "type": "text", "content": "›", "fontSize": 18, "fill": "#6B7280" }
  ]
}
```

### Primary Button (Full Width)
```json
{
  "type": "button",
  "name": "Primary CTA",
  "x": 16, "y": 696,
  "width": 343, "height": 56,
  "fill": "#6366F1",
  "cornerRadius": 16,
  "label": "Get Started",
  "fontSize": 16,
  "fontStyle": "Semi Bold",
  "textColor": "#FFFFFF"
}
```

### Secondary Button (Outlined)
```json
{
  "type": "frame",
  "name": "Secondary Button",
  "x": 16, "y": 760,
  "width": 343, "height": 48,
  "fill": "transparent",
  "cornerRadius": 14,
  "stroke": "#27272A",
  "strokeWeight": 1,
  "layout": { "direction": "horizontal", "align": "center", "justify": "center", "padding": 0 },
  "children": [
    { "type": "text", "content": "Sign In Instead", "fontSize": 16, "fontStyle": "Regular", "fill": "#9CA3AF" }
  ]
}
```

### Input Field
```json
{
  "type": "frame",
  "name": "Input Field",
  "x": 16, "y": 200,
  "width": 343, "height": 52,
  "fill": "#1A1A24",
  "cornerRadius": 12,
  "stroke": "#27272A",
  "strokeWeight": 1,
  "layout": { "direction": "horizontal", "paddingLeft": 16, "paddingRight": 16, "align": "center", "gap": 8 },
  "children": [
    { "type": "icon", "emoji": "✉️", "size": 16 },
    { "type": "text", "content": "Email address", "fontSize": 16, "fill": "#6B7280" }
  ]
}
```

### Badge / Tag / Chip
```json
{
  "type": "frame",
  "name": "Badge",
  "x": 16, "y": 124,
  "fill": "#1E1B4B",
  "cornerRadius": 6,
  "layout": { "direction": "horizontal", "paddingLeft": 10, "paddingRight": 10, "paddingTop": 4, "paddingBottom": 4, "gap": 4, "align": "center" },
  "children": [
    { "type": "text", "content": "Active", "fontSize": 12, "fontStyle": "Medium", "fill": "#818CF8" }
  ]
}
```

### Section Header
```json
{
  "type": "frame",
  "name": "Section Header",
  "x": 16, "y": 124,
  "width": 343, "height": 40,
  "fill": "transparent",
  "layout": { "direction": "horizontal", "align": "center", "justify": "space-between", "padding": 0 },
  "children": [
    { "type": "text", "content": "Recent Activity", "fontSize": 18, "fontStyle": "Semi Bold", "fill": "#F9FAFB" },
    { "type": "text", "content": "See all", "fontSize": 14, "fontStyle": "Regular", "fill": "#6366F1" }
  ]
}
```

---

## Screen Templates

### Onboarding / Welcome Screen
- Centered layout, emoji or icon in hero area (y: 280-360)
- App name large (Display: 32, Bold) at y: ~390
- Tagline (Body: 16, Regular) at y: ~440 in secondary color
- Primary CTA button at y: ~680
- "Already have account" text link at y: ~752

### Dashboard / Home Screen
- Status bar reserved (y: 0-54)
- Greeting header (H1: 28, Bold) at y: 110 with subtext
- Stats cards row (2-column grid) at y: 170
- Section header at y: 300
- List of cards starting at y: 348
- Bottom tab bar at y: 742

### Detail / Profile Screen
- Large header area (y: 54-200) with background color or gradient
- Avatar/icon at y: ~120, centered
- Name (H1: 28) below avatar
- Stats row (3-column) below name
- Card sections for details starting at y: ~260
- Sticky action buttons at y: 696

### Settings Screen
- Nav bar with back button
- Profile row at top (y: 124)
- Grouped setting sections with section headers
- Each setting as a List Item (height: 64)
- Dividers (height: 1) between sections
- Danger zone (Delete Account, etc.) with red text at bottom

### Empty State Screen
- Large icon/emoji centered (y: 280)
- Title (H2: 22, Semi Bold) at y: ~360
- Description (Body: 16, Regular, secondary color) at y: ~396
- CTA button at y: ~460

---

## Non-Negotiable Design Rules

1. **Horizontal margin: 16px ALWAYS** — `x: 16` for content, `width: 343` for full-width elements
2. **Touch targets: ≥44px height** — All tappable elements (buttons, list items, tabs) must be at least 44px tall
3. **Font scale only** — Only use sizes from the scale above. No arbitrary sizes
4. **Spacing grid only** — Only use spacing values from the grid above. No arbitrary pixels
5. **Max 2 font weights per screen** — Usually Regular + Semi Bold. Not 4 different weights
6. **Max 3 colors** — bg + text + accent. Exception: status colors (success/error) when needed
7. **One primary CTA** — One big filled button per screen. Other actions are outlined or text
8. **Reserved zones** — Never put content in y: 0-54 (status bar). Tab bar always at y: 742+
9. **Consistent card style** — Pick ONE card style and use it everywhere. Don't mix rounded-20 and rounded-8 cards
10. **Real content** — Use realistic placeholder content ("John Appleseed", "$1,249.00", "2h 34m ago"), not "Lorem ipsum"

---

## Style References

Design in the style of these products. Study their patterns:

**Linear** — Dark bg, tight typography, subtle borders, monochrome with blue accent, incredible whitespace, feels like a precision instrument

**Stripe** — Perfect typography hierarchy, generous spacing, clean cards with subtle shadows, trustworthy and professional

**Vercel** — Dark mode mastery, high contrast, sharp geometric shapes, minimal decoration, every element has purpose

**Apple (iOS 17/18)** — Large type, rounded shapes, frosted glass, heavy use of whitespace, system-level polish

**Revolut** — Bold numbers, card-based layout, gradient accents, metric-heavy dashboards, modern fintech aesthetic

**Notion** — Clean content layout, minimal chrome, great typography, simple iconography, feels calm and focused

---

## Multi-Screen Flow Rules

1. **Naming**: Every screen label = `"AppName — Screen Name"` (with em dash —)
2. **Push order**: Logical user flow (Splash → Onboarding → Login → Home → Detail → Settings)
3. **Design system**: ALL screens use IDENTICAL color tokens, spacing, typography
4. **Navigation consistency**: Nav bar and tab bar appear on every screen that needs navigation, with identical styling
5. **No orphaned screens**: Every screen with a "back" action implies the previous screen exists in the push queue

---

## Self-Review Checklist (MANDATORY before submitting)

Before pushing ANY design to Figma, verify EVERY item:

**Typography:**
- [ ] All font sizes are from the scale (11/12/14/16/18/22/28/32)?
- [ ] Max 2 font weights used on this screen?
- [ ] Body text uses lineHeight ≥ 1.5× fontSize?

**Spacing:**
- [ ] All spacing values are from the grid (4/8/12/16/20/24/32/48)?
- [ ] Horizontal content margin is 16px?
- [ ] All tappable elements are ≥44px tall?

**Colors:**
- [ ] Only using colors from the defined token set?
- [ ] Max 3 colors (bg + text + accent)?
- [ ] No light gray text on light background?

**Hierarchy:**
- [ ] Clear primary action (one big button)?
- [ ] Obvious information hierarchy (big title, small body)?
- [ ] Status bar zone (y:0-54) is empty?

**Consistency (multi-screen):**
- [ ] Same card style as other screens?
- [ ] Same nav bar height and style?
- [ ] Same color palette as other screens?
- [ ] Screen label follows "AppName — Screen Name" format?

**Content:**
- [ ] Realistic placeholder content (not Lorem ipsum)?
- [ ] All interactive elements are clearly distinguishable?

**If any item fails → Fix it before submitting. Do NOT submit a design that fails the checklist.**

---

## Common Mistakes to Avoid

❌ **Random font sizes** — "I'll use 15px here." NO. Use 14 or 16.
❌ **Arbitrary spacing** — "10px gap looks right." NO. Use 8 or 12.
❌ **Too many colors** — 8 different hex codes on one screen. NO. 3 max.
❌ **Two primary buttons** — "Sign In" and "Create Account" both large and filled. NO. One primary, one text.
❌ **Tiny touch targets** — A button that's 32px tall. NO. Minimum 44px.
❌ **Content in status bar** — Text starting at y: 20. NO. Start at y: 60+.
❌ **Lorem ipsum** — "Lorem ipsum dolor sit amet." NO. Use realistic content.
❌ **Inconsistent radius** — Cards with cornerRadius: 8 on one screen, 20 on another. NO. Pick one and use it everywhere.
❌ **One-and-done** — Pushing the spec and immediately calling it done. NO. Review the spec, improve it, THEN submit.
