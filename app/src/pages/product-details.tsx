import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CircleAlert, CircleCheck, ScanText } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AiPanel } from "@/components/ai-panel/ai-panel"
import { ApproveButton } from "@/components/approve-button"
import { DocumentPreview } from "@/components/document-preview"
import { SendForReviewDialog } from "@/components/send-for-review-dialog"
import { UploadDialog } from "@/components/upload-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SET_NAME, hasBlockingIssue, productName, type Product } from "@/data/products"
import { cn } from "@/lib/utils"
import { FINDING_PRODUCT, useAppStore, waitingForDetails, type PanelView } from "@/store/app-store"

const LIST_URL = "/sets/ss27-m-urban-jungle"

// Values cited by each finding; only these are highlighted in the preview.
const CITED: Partial<Record<string, string[]>> = {
  high: ["45% WV, 55% PES (recycled)", "50% WV, 50% PES (recycled)", "45% WV, 52% PES, 3% EL (recycled PES)"],
  low: ["45% WV, 55% PES (recycled)", "recycled share on request"],
}

const OTHER_FIBERS: Record<string, string> = {
  "271002742": "100% cotton",
  "271002743": "98% cotton, 2% elastane",
  "271002744": "100% cotton",
  "271002745": "100% polyester",
  "271002746": "100% cotton",
}

export function ProductDetailsPage() {
  const { styleNumber = FINDING_PRODUCT } = useParams()
  const store = useAppStore()
  const navigate = useNavigate()
  const product = store.products.find((p) => p.styleNumber === styleNumber) ?? store.products[0]
  const isFindingProduct = product.styleNumber === FINDING_PRODUCT
  const attributeRef = React.useRef<HTMLButtonElement>(null)
  const [sendOpen, setSendOpen] = React.useState(false)
  const [uploadPrev, setUploadPrev] = React.useState<PanelView | null>(null)

  const { open, view } = store.details
  const panelOpen = isFindingProduct && open

  const closePanel = () => {
    store.setDetails({ open: false })
    // Focus moves back to the attribute on close.
    requestAnimationFrame(() => attributeRef.current?.focus())
  }

  const changeView = (next: PanelView) => {
    if (next.kind === "cold_start") {
      // Cancel after "Upload certificate" returns to the cold start panel in the list view.
      store.setDetails({ open: false })
      store.setList({ open: true, view: next })
      navigate(LIST_URL)
      return
    }
    store.setDetails({ view: next })
  }

  const resultKey = view.kind === "result" ? view.key : null
  const unreadable = resultKey === "not_readable"
  const previewDoc = unreadable ? "Supplier declaration, signed 14 September 2026" : store.preview.doc
  const cited = product.finding === "unreviewed" && resultKey ? (CITED[resultKey] ?? []) : []

  return (
    <AppShell
      crumbs={[{ label: "Product sets", to: "/" }, { label: SET_NAME, to: LIST_URL }, { label: productName(product) }]}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Version: draft, revision 1</span>
          <Button variant="outline" size="sm" onClick={() => setSendOpen(true)}>
            Send for review
          </Button>
          <ApproveButton
            size="sm"
            blocked={hasBlockingIssue(product)}
            onApprove={() => store.updateProduct(product.styleNumber, { reviewStatus: "Approved" })}
          />
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 gap-4 p-6">
        <AttributesColumn
          product={product}
          fiberValue={isFindingProduct ? store.fiberValue : (OTHER_FIBERS[product.styleNumber] ?? "")}
          attributeRef={attributeRef}
          onOpenFinding={() => store.setDetails({ open: true })}
          active={panelOpen}
        />
        <DocumentPreview
          doc={previewDoc}
          page={unreadable ? 1 : store.preview.page}
          nonce={store.preview.nonce}
          cited={cited}
          unreadable={unreadable}
        />
        {panelOpen && (
          <div className="flex min-h-0 w-[420px] shrink-0 flex-col">
            <AiPanel
              key={view.kind}
              view={view}
              onViewChange={changeView}
              onClose={closePanel}
              onFlag={store.flagFinding}
              onKeep={store.keepProductValues}
              onSaveManual={store.saveManualValue}
              onShowSource={store.showSource}
              onUpload={(prev) => setUploadPrev(prev)}
              onCheckComplete={store.completeCheck}
              currentValue={store.fiberValue}
              autoFocusHeading
            />
          </div>
        )}
      </div>

      <SendForReviewDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        onSend={() => store.updateProduct(product.styleNumber, { reviewStatus: "In review" })}
      />
      <UploadDialog
        open={!!uploadPrev}
        onOpenChange={(o) => !o && setUploadPrev(null)}
        onPick={() => {
          if (uploadPrev) store.setDetails({ open: true, view: waitingForDetails(uploadPrev) })
          setUploadPrev(null)
        }}
      />
    </AppShell>
  )
}

function AttributesColumn({
  product,
  fiberValue,
  attributeRef,
  onOpenFinding,
  active,
}: {
  product: Product
  fiberValue: string
  attributeRef: React.RefObject<HTMLButtonElement | null>
  onOpenFinding: () => void
  active: boolean
}) {
  const isFinding = product.styleNumber === FINDING_PRODUCT
  return (
    <div className="flex w-[300px] shrink-0 flex-col gap-4 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-semibold">{productName(product)}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Style {product.styleNumber}
          <Badge variant="outline">{product.reviewStatus}</Badge>
        </div>
      </div>
      <Group title="Identification">
        <Attr label="Product category" value={product.category} />
        <Attr label="Style name" value={product.styleName} />
        <Attr label="Style number" value={product.styleNumber} />
        {isFinding && <Attr label="Colorways" value="Navy, Ecru, Rust" />}
      </Group>
      <Group title="Material, main fabric">
        {isFinding ? (
          <FiberAttribute product={product} value={fiberValue} attributeRef={attributeRef} onOpen={onOpenFinding} active={active} />
        ) : (
          <Attr label="Fiber composition" value={fiberValue} />
        )}
        {isFinding && <Attr label="Recycled" value="Not checked" />}
        {isFinding && <Attr label="Evidence" value="GRS certificate, valid until 12 March 2027" />}
      </Group>
      {isFinding && (
        <Group title="Supplier">
          <Attr label="Supplier" value="Example Knitwear Ltd." />
          <Attr label="Supplier declaration" value="Signed 14 September 2026" />
        </Group>
      )}
    </div>
  )
}

function FiberAttribute({
  product,
  value,
  attributeRef,
  onOpen,
  active,
}: {
  product: Product
  value: string
  attributeRef: React.RefObject<HTMLButtonElement | null>
  onOpen: () => void
  active: boolean
}) {
  const status =
    product.finding === "unreviewed"
      ? { icon: ScanText, text: "AI finding, not reviewed" }
      : product.finding === "flagged"
        ? { icon: CircleAlert, text: `${product.openIssues} open issues` }
        : product.finding === "manual"
          ? { icon: CircleCheck, text: "Entered manually" }
          : null
  const content = (
    <>
      <span className="text-xs text-muted-foreground">Fiber composition</span>
      <span className="text-sm font-medium">{value}</span>
      {status && (
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <status.icon className="size-3.5" aria-hidden />
          {status.text}
        </span>
      )}
    </>
  )
  // The attribute shows its AI status until the user picks an action; while unreviewed it opens the panel.
  if (product.finding === "unreviewed") {
    return (
      <button
        ref={attributeRef}
        type="button"
        onClick={onOpen}
        aria-expanded={active}
        className={cn(
          "-mx-2 flex flex-col items-start gap-0.5 rounded-md border border-input bg-muted-subtle p-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          active && "border-primary",
        )}
      >
        {content}
      </button>
    )
  }
  return <div className="flex flex-col gap-0.5">{content}</div>
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-3" aria-label={title}>
      <h2 className="text-xs font-medium text-muted-foreground">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Attr({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
