import * as React from "react"
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CirclePlus,
  CircleX,
  Loader,
  ScanText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { payloads, type CheckPayload, type Source } from "@/data/payloads"
import { SET_NAME } from "@/data/products"
import { formatDate, pageRange, plural, sourceLabel } from "@/lib/format"
import { waitingForDetails, waitingForSample, type PanelView } from "@/store/app-store"

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface AiPanelProps {
  view: PanelView
  onViewChange: (view: PanelView) => void
  onClose: () => void
  onFlag: (n: number) => void
  onKeep: () => void
  onSaveManual: (value: string) => void
  onShowSource: (doc: string, page: number) => void
  /** Opens the mock file picker; on pick the panel goes to Waiting. */
  onUpload: (prev: PanelView) => void
  /** Called when Waiting finishes and a result is shown. */
  onCheckComplete: () => void
  /** Current product value, shown as placeholder in manual entry. */
  currentValue: string
  /** Move focus to the heading when the panel opens. */
  autoFocusHeading?: boolean
  className?: string
}

export function AiPanel(props: AiPanelProps) {
  const { view, onClose, autoFocusHeading, className } = props
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const headingId = React.useId()

  React.useEffect(() => {
    if (autoFocusHeading) headingRef.current?.focus()
  }, [autoFocusHeading])

  const header = headerFor(view)
  const pinned = view.kind === "result" && ["high", "low", "sample"].includes(view.key)

  return (
    <section
      aria-labelledby={headingId}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation()
          onClose()
        }
      }}
      className={cn(
        "flex w-full flex-col gap-4 rounded-lg border bg-background p-4",
        pinned ? "h-full min-h-0" : "max-h-full",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">{header.eyebrow}</p>
          <h2
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className="text-base font-semibold outline-none"
          >
            {header.heading}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </header>
      <PanelBody {...props} pinned={pinned} />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Header and chip                                                     */
/* ------------------------------------------------------------------ */

function headerFor(view: PanelView): { eyebrow: string; heading: string } {
  const setLevel = { eyebrow: `Side panel, ${SET_NAME}`, heading: "Evidence check" }
  if (view.kind === "cold_start") return setLevel
  if (view.kind === "waiting") {
    if (view.next.kind === "result" && view.next.key === "sample") return setLevel
    return issueHeader(payloads.low) // main fabric scope while the check runs
  }
  return issueHeader(payloads[view.key])
}

function issueHeader(p: CheckPayload) {
  return {
    eyebrow: `Issue on ${p.product.product_category} ${p.product.style_name}, style ${p.product.style_number}`,
    heading: `${p.attribute.name}, ${p.attribute.scope}`,
  }
}

const CHIPS = {
  high: { label: "High confidence", icon: CircleCheck },
  low: { label: "Low confidence", icon: CircleAlert },
  none: { label: "No result", icon: CircleDashed },
  failed: { label: "Check failed", icon: CircleX },
  progress: { label: "In progress", icon: Loader },
  new: { label: "New, no checks yet", icon: CirclePlus },
} as const

function CardLabel({ chip }: { chip: keyof typeof CHIPS }) {
  const { label, icon: Icon } = CHIPS[chip]
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-sm font-semibold">
        <ScanText className="size-4" aria-hidden />
        AI check
      </span>
      {/* Status is announced and never shown by color alone. */}
      <span aria-live="polite">
        <Badge variant="outline">
          <Icon aria-hidden />
          {label}
        </Badge>
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function AiCard({ children, pinned, foot }: { children: React.ReactNode; pinned?: boolean; foot?: React.ReactNode }) {
  if (!pinned) {
    return (
      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-lg border bg-muted-subtle p-4">
        {children}
        {foot}
      </div>
    )
  }
  // Long output: the card scrolls, actions and feedback stay pinned at the foot.
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-muted-subtle p-4">
      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-4">{children}</div>
      {foot && <div className="flex flex-col gap-3 border-t pt-4">{foot}</div>}
    </div>
  )
}

function Box({ heading, children }: { heading?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-card p-3">
      {heading && <p className="text-xs font-medium text-muted-foreground">{heading}</p>}
      {children}
    </div>
  )
}

function TwoColumns({ cols }: { cols: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-4">
      {cols.map(([label, value]) => (
        <div key={label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function TextLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-fit rounded-sm text-left text-sm font-medium underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </button>
  )
}

/** Buttons sit side by side at equal width and stack full width, primary on top, when a label does not fit. */
function ActionRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 [&>*]:min-w-max [&>*]:flex-1 [&>*]:basis-0">{children}</div>
}

function Footnote({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}

function Sources({ sources, onShow }: { sources: Source[]; onShow: (doc: string, page: number) => void }) {
  if (sources.length === 0) return null
  return (
    <ul className="flex flex-col gap-3">
      {sources.map((s) => (
        <li key={s.document_name} className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{s.document_name}</span>
          {s.valid_until && (
            <span className="text-xs text-muted-foreground">Valid until {formatDate(s.valid_until)}</span>
          )}
          <TextLink onClick={() => onShow(s.document_name, s.pages[0] ?? 1)}>{sourceLabel(s.pages)}</TextLink>
        </li>
      ))}
    </ul>
  )
}

function FeedbackRow({ question, onNo }: { question: string; onNo: () => void }) {
  const [answer, setAnswer] = React.useState<"yes" | null>(null)
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{question}</p>
      <div className="flex gap-2">
        <Button
          variant={answer === "yes" ? "default" : "outline"}
          size="sm"
          aria-pressed={answer === "yes"}
          onClick={() => setAnswer("yes")}
        >
          Yes
        </Button>
        <Button variant="outline" size="sm" aria-pressed={false} onClick={onNo}>
          No
        </Button>
      </div>
    </div>
  )
}

function FeedbackForm({ onDone }: { onDone: () => void }) {
  const id = React.useId()
  const options = ["The certificate does not say that", "This is not relevant to this product", "Something else"]
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-medium">Thanks. What was wrong?</legend>
      {options.map((o, i) => (
        <div key={o} className="flex items-center gap-2">
          <Checkbox id={`${id}-${i}`} />
          <Label htmlFor={`${id}-${i}`} className="font-normal">
            {o}
          </Label>
        </div>
      ))}
      <Textarea placeholder="Tell us more (optional)" aria-label="Tell us more (optional)" />
      <ActionRow>
        <Button onClick={onDone}>Send feedback</Button>
        <Button variant="outline" onClick={onDone}>
          Skip
        </Button>
      </ActionRow>
    </fieldset>
  )
}

function ManualEntry({
  label,
  placeholder,
  onSave,
  onCancel,
}: {
  label: string
  placeholder: string
  onSave: (v: string) => void
  onCancel: () => void
}) {
  const id = React.useId()
  const [value, setValue] = React.useState("")
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(value)
      }}
    >
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} autoFocus value={value} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} />
      <ActionRow>
        <Button type="submit">Save value</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </ActionRow>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Body per state                                                      */
/* ------------------------------------------------------------------ */

function PanelBody(props: AiPanelProps & { pinned: boolean }) {
  const { view } = props
  if (view.kind === "cold_start") return <ColdStart {...props} />
  if (view.kind === "waiting") return <Waiting {...props} view={view} />
  const p = payloads[view.key]
  if (p.state === "high_confidence") return <HighConfidence {...props} view={view} payload={p} />
  if (p.state === "low_confidence") return <LowConfidence {...props} view={view} payload={p} />
  if (p.state === "error") return <Failure {...props} view={view} payload={p} />
  if (p.no_result_reason === "not_readable") return <NotReadable {...props} view={view} payload={p} />
  return <NoDocumentsLinked {...props} view={view} payload={p} />
}

type ResultView = Extract<PanelView, { kind: "result" }>
type ResultProps = AiPanelProps & { pinned: boolean; view: ResultView; payload: CheckPayload }

function HighConfidence({ view, payload: p, pinned, onViewChange, onFlag, onKeep, onShowSource, onClose }: ResultProps) {
  const n = p.differences.length
  const shown = view.expanded ? p.differences : p.differences.slice(0, 3)
  const isSample = view.key === "sample"
  const set = (patch: Partial<ResultView>) => onViewChange({ ...view, ...patch })

  const foot = (
    <>
      <ActionRow>
        <Button variant="outline" onClick={() => (isSample ? onClose() : onFlag(n))}>
          {n === 1 ? "Flag 1 issue" : `Flag ${n} issues`}
        </Button>
        <Button variant="outline" onClick={() => (isSample ? onClose() : onKeep())}>
          Keep product values
        </Button>
      </ActionRow>
      {view.mode === "feedback_no" ? (
        <FeedbackForm onDone={() => set({ mode: undefined })} />
      ) : (
        <>
          <FeedbackRow question="Were these findings useful?" onNo={() => set({ mode: "feedback_no" })} />
          <Footnote>Nothing changes until you choose an action.</Footnote>
        </>
      )}
    </>
  )

  return (
    <AiCard pinned={pinned} foot={foot}>
      <CardLabel chip="high" />
      {p.summary && <p className="text-sm">{p.summary}</p>}
      {n > 0 && (
        <Box heading={`What the check found, ${n} ${plural(n, "difference", "differences")}`}>
          {shown.map((d, i) => (
            <React.Fragment key={d.label}>
              {i > 0 && <Separator />}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">
                  Difference {i + 1}: {d.label}
                </p>
                <TwoColumns
                  cols={[
                    ["In certificate", d.certificate_value],
                    ["In product", d.product_value],
                  ]}
                />
              </div>
            </React.Fragment>
          ))}
          {n > 3 && (
            <TextLink onClick={() => set({ expanded: !view.expanded })}>
              {view.expanded ? "Show less" : "Show more"}
            </TextLink>
          )}
        </Box>
      )}
      {p.explanation && (
        <Box heading="Why this was flagged">
          <p className="text-sm">{p.explanation}</p>
          <Sources sources={p.sources} onShow={onShowSource} />
        </Box>
      )}
    </AiCard>
  )
}

function LowConfidence({ view, payload: p, pinned, onViewChange, onShowSource, onSaveManual, currentValue }: ResultProps) {
  const d = p.differences[0]
  const set = (patch: Partial<ResultView>) => onViewChange({ ...view, ...patch })
  const firstSource = p.sources[0]

  const foot = (
    <>
      {view.mode === "manual" ? (
        <ManualEntry
          label={p.attribute.name}
          placeholder={currentValue}
          onSave={onSaveManual}
          onCancel={() => set({ mode: undefined })}
        />
      ) : (
        <ActionRow>
          <Button onClick={() => firstSource && onShowSource(firstSource.document_name, d.pages[0])}>
            Review source (p. {pageRange(d.pages)})
          </Button>
          <Button variant="outline" onClick={() => set({ mode: "manual" })}>
            Enter {d.label}
          </Button>
        </ActionRow>
      )}
      {view.mode === "feedback_no" ? (
        <FeedbackForm onDone={() => set({ mode: undefined })} />
      ) : (
        <>
          <FeedbackRow question="Was this result useful?" onNo={() => set({ mode: "feedback_no" })} />
          <Footnote>Nothing changes until you choose an action.</Footnote>
        </>
      )}
    </>
  )

  return (
    <AiCard pinned={pinned} foot={foot}>
      <CardLabel chip="low" />
      {p.summary && <p className="text-sm">{p.summary}</p>}
      {d && (
        <Box heading="Reading">
          <TwoColumns
            cols={[
              ["Reading from certificate", d.certificate_value],
              ["Value in product", d.product_value],
            ]}
          />
        </Box>
      )}
      {p.explanation && (
        <Box heading="Why confidence is low">
          <p className="text-sm">{p.explanation}</p>
          <Sources sources={p.sources} onShow={onShowSource} />
        </Box>
      )}
    </AiCard>
  )
}

function NoDocumentsLinked({ view, payload: p, onViewChange }: ResultProps) {
  const docs = p.candidate_documents
  return (
    <AiCard>
      <CardLabel chip="none" />
      <p className="text-sm">
        The check found nothing to compare this value against. The documents for this material are not linked to this
        check yet.
      </p>
      {docs.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Documents for this material, {docs.length} {plural(docs.length, "file", "files")}
          </p>
          <ul className="flex flex-col gap-2">
            {docs.map((d) => (
              <li key={d.document_name} className="flex items-center gap-3 rounded-md border bg-card p-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{d.document_name}</span>
                  <span className="text-xs text-muted-foreground">Valid until {formatDate(d.valid_until)}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => onViewChange(waitingForDetails(view))}>
                  Use for this check
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <FeedbackRow question="Did you expect a finding here?" onNo={() => {}} />
    </AiCard>
  )
}

function NotReadable({ view, payload: p, onViewChange, onShowSource, onUpload, onSaveManual, currentValue }: ResultProps) {
  const set = (patch: Partial<ResultView>) => onViewChange({ ...view, ...patch })
  return (
    <AiCard>
      <CardLabel chip="none" />
      <p className="text-sm">
        The check could not read this document clearly enough to compare it. Enter the value manually or upload a
        clearer file.
      </p>
      <Sources sources={p.sources} onShow={onShowSource} />
      {view.mode === "manual" ? (
        <ManualEntry
          label={p.attribute.name}
          placeholder={currentValue}
          onSave={onSaveManual}
          onCancel={() => set({ mode: undefined })}
        />
      ) : (
        <ActionRow>
          <Button onClick={() => set({ mode: "manual" })}>Enter values manually</Button>
          <Button variant="outline" onClick={() => onUpload(view)}>
            Upload clearer file
          </Button>
        </ActionRow>
      )}
      <FeedbackRow question="Did you expect a finding here?" onNo={() => {}} />
    </AiCard>
  )
}

function Failure({ view, payload: p, onViewChange, onUpload, onSaveManual, currentValue }: ResultProps) {
  const set = (patch: Partial<ResultView>) => onViewChange({ ...view, ...patch })
  const doc = p.sources[0]?.document_name
  return (
    <AiCard>
      <CardLabel chip="failed" />
      <p className="text-sm">
        The check did not finish. It could not open the {doc} because the file is password protected.
      </p>
      <Box heading="What is saved">
        <p className="text-sm">
          Nothing was changed. Your values, the uploaded file and your review notes are exactly as you left them.
        </p>
      </Box>
      {view.mode === "manual" ? (
        <ManualEntry
          label={p.attribute.name}
          placeholder={currentValue}
          onSave={onSaveManual}
          onCancel={() => set({ mode: undefined })}
        />
      ) : (
        <ActionRow>
          <Button onClick={() => onUpload(view)}>Upload unlocked file</Button>
          <Button variant="outline" onClick={() => set({ mode: "manual" })}>
            Enter values manually
          </Button>
        </ActionRow>
      )}
    </AiCard>
  )
}

function ColdStart({ view, onViewChange, onUpload }: AiPanelProps) {
  return (
    <AiCard>
      <CardLabel chip="new" />
      <p className="text-sm">
        No checks yet. Run one on a sample product to see what the check finds, or upload a certificate of your own.
      </p>
      <Box heading="Sample data, not your products">
        <TwoColumns
          cols={[
            ["Sample product", "Linen Shirt Liora, style 271000001"],
            ["Example finding", "Certificate lists 100% linen. Product lists 55% linen and 45% cotton."],
          ]}
        />
      </Box>
      <ActionRow>
        <Button onClick={() => onViewChange(waitingForSample)}>Try sample check</Button>
        <Button variant="outline" onClick={() => onUpload(view)}>
          Upload certificate
        </Button>
      </ActionRow>
      <Footnote>Takes about 20 seconds. Nothing is added to your products.</Footnote>
    </AiCard>
  )
}

const STEP_MS = 1500

function Waiting({ view, onViewChange, onCheckComplete }: AiPanelProps & { view: Extract<PanelView, { kind: "waiting" }> }) {
  const n = view.docs.length
  const [i, setI] = React.useState(1)

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      if (i < n) setI(i + 1)
      else {
        onViewChange(view.next)
        onCheckComplete()
      }
    }, STEP_MS)
    return () => window.clearTimeout(t)
  }, [i, n, view, onViewChange, onCheckComplete])

  return (
    <AiCard>
      <CardLabel chip="progress" />
      <p className="text-sm">
        Checking {view.attributes} against {n} {plural(n, "document", "documents")}. This usually takes about 20
        seconds.
      </p>
      <div className="flex flex-col gap-2">
        <p aria-live="polite" className="text-xs font-medium text-muted-foreground">
          Reading document {i} of {n}: {view.docs[i - 1]}
        </p>
        <Progress value={(i / n) * 100} aria-label="Check progress" className="h-2" />
      </div>
      <Box>
        <Skeleton className="h-3 w-36" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </Box>
      <Box>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-3/5" />
      </Box>
      <Button variant="outline" className="w-full" onClick={() => onViewChange(view.prev)}>
        Cancel check
      </Button>
      <Footnote>
        You can keep working. Your values stay unchanged while the check runs, and cancelling keeps everything as it is.
      </Footnote>
    </AiCard>
  )
}
