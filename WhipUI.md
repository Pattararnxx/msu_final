# WhipUI

WhipUI is a thin frontend design router. It packages a small, durable contract
around skills, MCP servers, and tools that already exist in the coding host.
It does not create a new frontend agent, browser, editor, or MCP server.

## One-time setup

Run `whipui init` once in the existing frontend repository. It writes project
instructions, detects capabilities, configures project-local Playwright MCP for
the selected hosts, and can install UI/UX Pro Max plus Impeccable after an
explicit confirmation. Use `whipui setup --yes` in non-interactive environments
and `whipui doctor` to inspect the result. It never edits global config.

After setup, speak to Codex, Claude Code, or VS Code Agent in normal language.
The generated instructions route the request without requiring the user to
know which skill or MCP is underneath.

## Five inputs

### Prompt

Use UI/UX Pro Max when installed to derive product type, audience, art
direction, layout pattern, type pairing, palette, UX rules, and anti-patterns.
Use Impeccable when installed to critique and refine the result. Otherwise use
an existing design-intelligence skill. Record durable decisions in the Design
Fingerprint.

### Screenshot

Treat the image as visual evidence. Extract hierarchy, composition,
typography, color relationships, spacing rhythm, imagery, effects, and
interaction clues. Separate identity from accidental pixels before adapting it
to responsive layouts.

### Figma

When Figma MCP is connected, prefer its variables, components, assets,
hierarchy, and named styles over guesses from pixels. WhipUI accepts the URL and
routes to the connected MCP; authentication remains with the host.

### URL

Use Playwright MCP to inspect the real page in an isolated browser context.
Chrome DevTools is optional for extra runtime diagnostics when already exposed
by the host.

### Existing repository

Inspect local routes, components, tokens, fonts, assets, Storybook or other
design-system references before inventing new UI. The existing repository is
the default source of truth for implementation conventions.

## Project DNA and Design Fingerprint

Project DNA describes the durable product, repository, design-system, tool
routing, and visual QA context. The Design Fingerprint describes the visual
identity of a particular page or task. Keep both concrete and update them as
the implementation becomes clearer.

## Capability routing

`.whipui/capabilities.json` is the local capability manifest. Treat it as a
routing hint, not a new runtime. Playwright MCP is the primary provider for
live URL inspection, Pick from Web, and visual QA. Chrome DevTools MCP,
Figma MCP, Firecrawl, Fudge, Agentation, and onUI are optional adapters used
only when the host or project already exposes them.

## Anti-slop rules

- Choose an art direction and one memorable visual idea before building a
  component grid.
- Do not default to purple-gradient-on-white, generic SaaS cards, or
  interchangeable typography unless the product asks for them.
- Do not use glass, pills, giant rounded cards, shadows, gradients, texture, or
  motion without a clear product, hierarchy, wayfinding, or brand reason.
- Reuse existing components and tokens before creating variants.
- Preserve source character at mobile widths; do not just shrink desktop.
- Make focus, hover, active, disabled, loading, empty, error, and reduced-motion
  states intentional.

## Visual QA

Use Playwright MCP as the primary browser runtime. Evaluate identity,
composition and hierarchy, typography, color and contrast, spacing and density,
responsive behavior, interaction states, and accessibility across desktop,
tablet, and mobile. Fix the highest-impact mismatch, reload, and inspect again
for a bounded number of iterations.
