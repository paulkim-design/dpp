# DPP Prototype (code)

Clickable prototype of the AI evidence check in a DPP review tool. Built from the Figma design (Capstone file, page "Design") and the Design Context Brief (Notion, "Design Context Brief & State JSON").

## Run

Needs Node 22.12 or newer (`.nvmrc` pins 22).

```bash
nvm use
npm install
npm run dev
```

## Stack

Vite, React, TypeScript, Tailwind v4, shadcn/ui (radix, Nova preset, Geist, lucide), React Router.

## Where things are

| Path | What |
| --- | --- |
| `src/data/payloads.ts` | The six state payloads, verbatim from brief section 10 |
| `src/data/products.ts` | Products, set, dashboard rows, recipients |
| `src/store/app-store.tsx` | Prototype state: review status, finding, panel views, preview target |
| `src/components/ai-panel/ai-panel.tsx` | AI panel: all states and variants, rendered from the payloads |
| `src/components/document-preview.tsx` | Mock documents; source links scroll to the page and mark only the cited text |
| `src/components/dev-toolbar.tsx` | State switcher ("States" button, bottom left) |
| `src/pages/*` | Dashboard, list view, product details |

## Deviations from shadcn defaults (all from the brief or the Figma decisions)

- `--input` is neutral-500, so control borders (outline button, badge, checkbox, input, select) reach 3:1.
- Disabled buttons: `bg-muted` with `--disabled-foreground` (neutral-600, 7.2:1), no opacity.
- Approve uses `aria-disabled="true"` (stays focusable) and links its hint with `aria-describedby`.
- `--muted-subtle` (AI card background) and `--mark` (cited text) are neutral.
- Button heights 36/32 px and badge radius `rounded-md`, to match the Figma design.

## Prototype behaviour

- Waiting is simulated: 1.5 s per document, then the result.
- Upload uses a mock file picker.
- Nothing is persisted; reload or "Reset prototype" in the state switcher starts over.
