# Pick from Web

This workflow is the main URL feature. WhipUI routes it to Playwright MCP and
does not create or own a browser.

## Capture

1. Open the URL in an isolated browser context with Playwright MCP.
2. Use the host's element-picker or page-evaluation affordance so the user can
   identify an element visually. If the host cannot expose a picker, ask for a
   selector, text label, or coordinates; do not build a new browser picker.
3. Capture:
   - URL and timestamp;
   - selector or locator, text, attributes, outerHTML, and ancestor path;
   - computed styles for layout, box model, typography, colors, borders,
     radius, shadow, opacity, overflow, transform, and z-index;
   - bounding box and viewport dimensions;
   - element screenshot and surrounding viewport screenshot;
   - accessibility snapshot when available;
   - default, hover, focus-visible, active/pressed, disabled, expanded/open,
     and selected states when supported.
4. Save a structured Reference Packet JSON record in .whipui/web-captures/
   with image paths next to it.
5. Update the Design Fingerprint with the durable visual rules. Do not copy
   CSS blindly.

## Reuse

Map the captured element to existing project components and tokens. Treat the
capture as a source of visual language and behavior, not as permission to copy
unrelated page content or private data.

## Boundaries

Playwright MCP is primary. Chrome DevTools is optional. Never attach to the
users real browser profile, reuse unrelated cookies, or claim capture success
without browser evidence.
