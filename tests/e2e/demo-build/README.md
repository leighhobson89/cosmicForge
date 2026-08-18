# e2e / demo-build

**Demo Build Lockdowns** — 🟢 GREEN

Feature gating for the demo variant. A leak here gives away the full game. Driven by booting a spoofed Electron demo, because nearly every lockdown is baked in at draw time and cannot be reached by toggling the flag on a running page.

Specs for this area go in this folder, named `<scenario>.spec.js`.

Full test plan and checklist: [`tests/docs/areas/demo-build.md`](../../docs/areas/demo-build.md)
