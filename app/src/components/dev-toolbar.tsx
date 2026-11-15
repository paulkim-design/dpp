import * as React from "react"
import { useNavigate } from "react-router-dom"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FINDING_PRODUCT, useAppStore, waitingForDetails, type PanelView } from "@/store/app-store"

/** State switcher for tests and reviews. Collapsed by default so it doesn't disturb user tests. */
const DETAILS_PRESETS: [string, PanelView][] = [
  ["High confidence", { kind: "result", key: "high" }],
  ["Long output", { kind: "result", key: "high", expanded: true }],
  ["Low confidence", { kind: "result", key: "low" }],
  ["No result", { kind: "result", key: "no_result" }],
  ["No result, not readable", { kind: "result", key: "not_readable" }],
  ["Failure", { kind: "result", key: "error" }],
  ["Waiting", waitingForDetails({ kind: "result", key: "no_result" })],
  ["Feedback no, high", { kind: "result", key: "high", mode: "feedback_no" }],
  ["Feedback no, low", { kind: "result", key: "low", mode: "feedback_no" }],
  ["Manual entry, low", { kind: "result", key: "low", mode: "manual" }],
]

export function DevToolbar() {
  const [open, setOpen] = React.useState(false)
  const store = useAppStore()
  const navigate = useNavigate()

  const toDetails = (view: PanelView) => {
    store.resetFinding()
    store.setDetails({ open: true, view })
    navigate(`/products/${FINDING_PRODUCT}`)
  }
  const toList = (view: PanelView) => {
    store.setList({ open: true, view })
    navigate("/sets/ss27-m-urban-jungle")
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50 shadow-md"
        onClick={() => setOpen(true)}
        aria-label="Open state switcher"
      >
        <SlidersHorizontal aria-hidden />
        States
      </Button>
    )
  }
  return (
    <div role="region" aria-label="State switcher" className="fixed bottom-4 left-4 z-50 flex w-72 flex-col gap-3 rounded-lg border bg-background p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">State switcher</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close state switcher">
          <X />
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">AI panel, details page</span>
        <div className="flex flex-wrap gap-1">
          {DETAILS_PRESETS.map(([label, view]) => (
            <Button key={label} variant="outline" size="xs" onClick={() => toDetails(view)}>
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">List view panel</span>
        <div className="flex flex-wrap gap-1">
          <Button variant="outline" size="xs" onClick={() => toList({ kind: "cold_start" })}>
            Cold start
          </Button>
          <Button variant="outline" size="xs" onClick={() => toList({ kind: "result", key: "sample" })}>
            Sample check result
          </Button>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          store.reset()
          navigate("/")
        }}
      >
        Reset prototype
      </Button>
    </div>
  )
}
