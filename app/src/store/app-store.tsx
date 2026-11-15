import * as React from "react"
import { initialProducts, type Product } from "@/data/products"

export type ResultKey = "high" | "low" | "no_result" | "not_readable" | "sample" | "error"

export type PanelView =
  | {
      kind: "result"
      key: ResultKey
      /** Long output: all differences shown */
      expanded?: boolean
      /** Feedback no form or manual entry replaces part of the card */
      mode?: "feedback_no" | "manual"
    }
  | { kind: "cold_start" }
  | {
      kind: "waiting"
      attributes: string
      docs: string[]
      next: PanelView
      prev: PanelView
    }

export interface PreviewTarget {
  doc: string
  page: number
  /** bumps on every request so the same page can be scrolled to again */
  nonce: number
}

interface PanelState {
  open: boolean
  view: PanelView
}

const DEFAULT_FIBER = "50% wool, 50% polyester"

interface AppState {
  products: Product[]
  fiberValue: string
  coldStartDone: boolean
  details: PanelState
  list: PanelState
  preview: PreviewTarget
}

const initialState = (): AppState => ({
  products: initialProducts.map((p) => ({ ...p })),
  fiberValue: DEFAULT_FIBER,
  coldStartDone: false,
  details: { open: false, view: { kind: "result", key: "high" } },
  list: { open: false, view: { kind: "cold_start" } },
  preview: { doc: "GRS certificate", page: 2, nonce: 0 },
})

interface AppStore extends AppState {
  updateProduct: (styleNumber: string, patch: Partial<Product>) => void
  setDetails: (patch: Partial<PanelState>) => void
  setList: (patch: Partial<PanelState>) => void
  showSource: (doc: string, page: number) => void
  flagFinding: (n: number) => void
  keepProductValues: () => void
  saveManualValue: (value: string) => void
  completeCheck: () => void
  /** Puts the finding back to unreviewed with the original product value (state switcher). */
  resetFinding: () => void
  reset: () => void
}

const Ctx = React.createContext<AppStore | null>(null)

export const FINDING_PRODUCT = "271002741"

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>(initialState)

  const store = React.useMemo<AppStore>(() => {
    const patchProduct = (s: AppState, styleNumber: string, patch: Partial<Product>) => ({
      ...s,
      products: s.products.map((p) => (p.styleNumber === styleNumber ? { ...p, ...patch } : p)),
    })
    return {
      ...state,
      updateProduct: (styleNumber, patch) => setState((s) => patchProduct(s, styleNumber, patch)),
      setDetails: (patch) => setState((s) => ({ ...s, details: { ...s.details, ...patch } })),
      setList: (patch) => setState((s) => ({ ...s, list: { ...s.list, ...patch } })),
      showSource: (doc, page) =>
        setState((s) => ({ ...s, preview: { doc, page, nonce: s.preview.nonce + 1 } })),
      // "Flag {n} issues" turns the finding into {n} open issues.
      flagFinding: (n) =>
        setState((s) => ({
          ...patchProduct(s, FINDING_PRODUCT, { finding: "flagged", openIssues: n }),
          details: { ...s.details, open: false },
        })),
      // "Keep product values" resolves the finding. Product values stay unchanged.
      keepProductValues: () =>
        setState((s) => ({
          ...patchProduct(s, FINDING_PRODUCT, { finding: "kept" }),
          details: { ...s.details, open: false },
        })),
      // Manual entry resolves the finding; the attribute shows "Entered manually".
      saveManualValue: (value) =>
        setState((s) => ({
          ...patchProduct(s, FINDING_PRODUCT, { finding: "manual" }),
          fiberValue: value.trim() || s.fiberValue,
          details: { ...s.details, open: false },
        })),
      // After the first completed check, cold start no longer appears.
      completeCheck: () => setState((s) => (s.coldStartDone ? s : { ...s, coldStartDone: true })),
      resetFinding: () =>
        setState((s) => ({ ...patchProduct(s, FINDING_PRODUCT, { finding: "unreviewed", openIssues: 0 }), fiberValue: DEFAULT_FIBER })),
      reset: () => setState(initialState()),
    }
  }, [state])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useAppStore() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider")
  return ctx
}

/** Waiting views used by the prototype (no payload; progress is simulated). */
export const waitingForDetails = (prev: PanelView, next: PanelView = { kind: "result", key: "high" }): PanelView => ({
  kind: "waiting",
  attributes: "fiber composition and recycled content",
  docs: ["Supplier declaration, signed 14 September 2026", "GRS certificate", "Recycled Claim Standard declaration"],
  next,
  prev,
})

export const waitingForSample: PanelView = {
  kind: "waiting",
  attributes: "fiber composition",
  docs: ["Sample certificate"],
  next: { kind: "result", key: "sample" },
  prev: { kind: "cold_start" },
}
