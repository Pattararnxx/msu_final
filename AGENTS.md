<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- WhipUI:BEGIN -->
## WhipUI frontend design router

For frontend requests, read WhipUI.md, PROJECT-DNA.md,
.whipui/project-dna.json, and .whipui/design-fingerprint.json before coding.

WhipUI is a thin router. Do not build a new agent, browser, editor, or MCP
server. Use the project-local capabilities recorded in .whipui/capabilities.json
and route work to the existing host ecosystem:

- Prompt: use UI/UX Pro Max for design-system direction when installed, then
  reuse the repository design system.
- Critique/refinement: use Impeccable when installed for anti-slop critique,
  hierarchy, spacing, typography, responsive, and interaction refinement.
- Fallback: use another existing design-intelligence or frontend skill exposed
  by the host; never invent a second design database or runtime.
- Screenshot: inspect the image as evidence and record durable visual traits.
- Figma: use connected Figma MCP for variables, components, assets, and
  hierarchy.
- URL: use Playwright MCP to inspect the real page in an isolated context.
- Pick from Web: use .whipui/workflows/pick-from-web.md with Playwright MCP as
  primary and Chrome DevTools only as optional support.
- Existing repo: inspect local components, tokens, routes, fonts, assets, and
  existing frontend conventions first.

Always update the Design Fingerprint with concrete decisions. Finish with
.whipui/workflows/visual-qa.md across all configured axes and viewports. Do not
claim browser or visual validation when the host did not provide evidence.

Avoid generic AI-slop output: default purple gradients, arbitrary glass cards,
excessive rounded containers, invented variants, and decorative motion without
a product, hierarchy, wayfinding, or brand reason.
<!-- WhipUI:END -->
