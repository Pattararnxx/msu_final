# PROJECT-DNA

Project DNA is the durable context for the product and repository. It is not a
one-page design prompt. It tells an agent what must stay coherent across
routes, pages, and future tasks.

Keep .whipui/project-dna.json current with:

- product purpose, audience, voice, and anti-references;
- stack, package manager, routes, constraints, and repository conventions;
- tokens, components, fonts, assets, and the existing design system;
- which input source has priority when sources disagree;
- which host skill or MCP should be used for each input;
- visual QA axes, viewports, evidence, and iteration limit.

The agent should update Project DNA only when the change is durable for the
project. Page-specific decisions belong in .whipui/design-fingerprint.json.
