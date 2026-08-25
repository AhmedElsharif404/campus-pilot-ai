# Academic Editorial design system

CampusPilot favors source clarity, scan density, and student agency over dashboard spectacle.

## Principles

1. **Evidence beside interpretation.** AI-derived content stays visually and structurally connected to its page-level source.
2. **The semester is a sequence.** Intake, review, organization, planning, execution, and reflection form the navigation model.
3. **Calm can still be dense.** Compact rows and typographic hierarchy beat piles of roomy cards.
4. **Consequences are explicit.** Suggested, pending, confirmed, overdue, and completed items never share the same treatment.
5. **The student is the editor.** AI proposes; the student accepts, edits, rejects, or reschedules.

## Foundations

### Typography

| Token      | Size                         | Use                                       |
| ---------- | ---------------------------- | ----------------------------------------- |
| Display XL | `clamp(3rem, 5.9vw, 5.3rem)` | Landing statement only                    |
| Display L  | `clamp(2rem, 4vw, 3.8rem)`   | Major section and workspace titles        |
| Heading M  | `1.5rem`                     | Workflow and course section headings      |
| Body       | `1rem / 1.55`                | Reading and task content                  |
| Small      | `.84rem`                     | Supporting academic metadata              |
| Micro      | `.69–.73rem`                 | Status, source page, and uppercase labels |

Display type uses Charter/Iowan/Palatino/Georgia. Interface type uses Inter/system sans. Numbers in calendars use tabular figures.

### Spacing

The base scale is 4, 8, 12, 16, 24, 32, 48, and 72px. Adjacent metadata may use 4–8px; section changes use 32–72px.

### Color

- Paper `#F4F0E8`; raised paper `#FBF8F2`; deep paper `#E9E2D6`
- Ink `#142235`; muted ink `#56616D`
- Academic blue `#235B87`; deep blue `#173A5E`; soft blue `#DCE8F0`
- Muted green `#436957`; soft green `#DDE8DF`
- Functional amber `#A76718`; soft amber `#F4E4C8`
- Error red `#A7433E`; soft red `#F2DDDA`
- Hairline `#D5CEC1`; strong line `#B9B0A1`

Contrast is verified against the warm surfaces; color is never the only status carrier.

### Elevation and radius

Most hierarchy uses borders and surface tone. Level 1 is a 1px/2px shadow for interactive lift; level 2 is reserved for upload/review sheets and overlays. Radii are 3px for sheets, 6px for controls, and 10px for modal-like containers. Circles and pills are limited to identity marks and compact statuses.

### Iconography

Lucide line icons at 16–20px, normally with 1.75px strokes. Icons clarify an action or content type; they do not decorate headings. No sparkle, robot, or abstract AI glyphs.

## Responsive grid

- Mobile `<640`: four conceptual columns, 16px outer gutter, single reading lane, sticky bottom primary navigation.
- Tablet `640–1023`: eight columns, 24px gutter, collapsible rail.
- Laptop `1024–1439`: twelve columns, 24px gutter, 232px navigation rail.
- Large desktop `≥1440`: twelve columns, max content width 1440px, 32px gutters; reading measures remain capped.

## Interaction

Every interactive element has visible hover, keyboard focus, pressed, disabled, and busy treatments. Optimistic changes announce through an `aria-live` region and are queued locally when offline. Destructive or consequential AI suggestions require a preview and explicit confirmation.

## Component-state checklist

Buttons, fields, upload zones, extraction rows, calendar items, session rows, and notices implement default, hover, focus, active, disabled, and loading states. Data-bearing patterns additionally cover empty, error, partial-error, and success states with direct recovery actions.
