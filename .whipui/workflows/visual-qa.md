# Visual QA

Use the browser tools already available in the host. Playwright MCP is
preferred; Chrome DevTools is optional.

## Loop

1. Open the target route and wait for the rendered page to settle.
2. Inspect desktop, tablet, and mobile at the viewports in config.json.
3. Compare the result against Project DNA, the Design Fingerprint, and the
   supplied prompt, screenshot, Figma context, or web capture.
4. Evaluate all axes:
   - identity;
   - composition and hierarchy;
   - typography;
   - color and contrast;
   - spacing and density;
   - responsive behavior;
   - interaction states;
   - accessibility.
5. Record the three highest-impact findings.
6. Fix one high-impact mismatch, reload, and inspect again.
7. Stop after the configured iteration limit or when the result is coherent.

Do not infer visual quality from source code alone. Finish with no horizontal
overflow, intentional text wrapping, usable focus and hit targets, coherent
loading/empty/error states, and reduced-motion behavior.
