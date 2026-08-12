@AGENTS.md

<!-- WhipUI:BEGIN -->
## WhipUI frontend design router

For frontend work, read WhipUI.md, PROJECT-DNA.md,
.whipui/project-dna.json, and .whipui/design-fingerprint.json.

WhipUI is a thin router. Do not create a new agent, browser, editor, or MCP
server. Use .whipui/capabilities.json and route the request to the project-local
or host capabilities already available in Claude:

- Prompt: use UI/UX Pro Max for design-system direction when installed.
- Critique/refinement: use Impeccable when installed for anti-slop critique and
  visual refinement.
- Fallback: use another existing frontend/design skill; do not create a second
  design database or runtime.
- Screenshot: inspect the image and preserve durable visual identity.
- Figma: use connected Figma MCP for variables, components, assets, and
  hierarchy.
- URL: use Playwright MCP in an isolated browser context.
- Pick from Web: follow .whipui/workflows/pick-from-web.md.
- Existing repo: inspect local components, tokens, routes, fonts, and assets.

Update the Design Fingerprint with concrete decisions. Finish with
.whipui/workflows/visual-qa.md across every configured axis and viewport.
Never claim visual validation without rendered browser or screenshot evidence.
<!-- WhipUI:END -->
