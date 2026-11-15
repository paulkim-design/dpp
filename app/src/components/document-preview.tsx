import * as React from "react"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

/* Mock documents. All content is invented. */
type Line =
  | { type: "title"; text: string }
  | { type: "heading"; text: string }
  | { type: "text"; prefix?: string; value: string }
  | { type: "skeleton"; width: string }

const filler = (widths: string[]): Line[] => widths.map((width) => ({ type: "skeleton", width }))

const DOCUMENTS: Record<string, Line[][]> = {
  "GRS certificate": [
    [{ type: "title", text: "Scope certificate, page 1" }, ...filler(["w-3/5", "w-4/5", "w-2/3", "w-1/2", "w-3/4", "w-2/5"])],
    [
      { type: "title", text: "Scope certificate, page 2" },
      ...filler(["w-3/5", "w-4/5", "w-1/2"]),
      { type: "heading", text: "Composition per colorway" },
      { type: "text", prefix: "Navy, composition: ", value: "45% WV, 55% PES (recycled)" },
      ...filler(["w-2/3", "w-3/4", "w-1/2", "w-3/5"]),
    ],
    [
      { type: "title", text: "Scope certificate, page 3" },
      { type: "heading", text: "Composition per colorway" },
      { type: "text", prefix: "Ecru, composition: ", value: "50% WV, 50% PES (recycled)" },
      { type: "text", prefix: "Recycled content: ", value: "recycled share on request" },
      ...filler(["w-4/5", "w-2/3", "w-1/2"]),
    ],
    [{ type: "title", text: "Scope certificate, page 4" }, ...filler(["w-3/4", "w-2/3", "w-4/5", "w-1/2"])],
    [{ type: "title", text: "Scope certificate, page 5" }, ...filler(["w-2/3", "w-3/5", "w-3/4"])],
    [{ type: "title", text: "Scope certificate, page 6" }, ...filler(["w-4/5", "w-1/2", "w-2/3"])],
    [
      { type: "title", text: "Scope certificate, page 7" },
      { type: "heading", text: "Composition per colorway" },
      { type: "text", prefix: "Rust, composition: ", value: "45% WV, 52% PES, 3% EL (recycled PES)" },
      ...filler(["w-3/5", "w-4/5", "w-1/2"]),
    ],
    [{ type: "title", text: "Scope certificate, page 8" }, ...filler(["w-2/3", "w-1/2"])],
  ],
  "Supplier declaration, signed 14 September 2026": [
    [{ type: "title", text: "Supplier declaration, page 1" }, ...filler(["w-4/5", "w-3/5", "w-2/3", "w-3/4", "w-1/2", "w-2/3"])],
  ],
  "Sample certificate": [
    [
      { type: "title", text: "Sample certificate, page 1" },
      ...filler(["w-3/5", "w-1/2"]),
      { type: "text", prefix: "Composition: ", value: "100% LI" },
      ...filler(["w-2/3", "w-3/4"]),
    ],
  ],
}

export interface DocumentPreviewProps {
  doc: string
  page: number
  /** bumps on every "View source" so the same page scrolls again */
  nonce: number
  /** Values cited by the current finding; only these get highlighted. */
  cited: string[]
  /** Not readable document, shown faded. */
  unreadable?: boolean
}

export function DocumentPreview({ doc, page, nonce, cited, unreadable }: DocumentPreviewProps) {
  const pages = DOCUMENTS[doc] ?? DOCUMENTS["GRS certificate"]
  const pageRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [current, setCurrent] = React.useState(page)

  React.useEffect(() => {
    setCurrent(page)
    pageRefs.current[page - 1]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [doc, page, nonce])

  return (
    <section aria-label={`Document preview, ${doc}`} className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex min-h-11 shrink-0 items-center gap-2 border-b px-3 py-2">
        <FileText className="size-4" aria-hidden />
        <span className="min-w-0 flex-1 text-sm font-medium">
          {doc}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          Page {current} of {pages.length}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-muted p-6">
        {pages.map((lines, i) => {
          return (
            <div
              key={i}
              ref={(el) => {
                pageRefs.current[i] = el
              }}
              className={cn(
                "flex scroll-mt-6 flex-col gap-2.5 rounded-sm border bg-background px-5 py-6 shadow-xs",
                unreadable && "opacity-40 blur-[1px]",
              )}
            >
              {lines.map((l, j) => {
                if (l.type === "title") return <p key={j} className="text-xs font-medium text-muted-foreground">{l.text}</p>
                if (l.type === "heading") return <p key={j} className="text-sm font-semibold">{l.text}</p>
                if (l.type === "skeleton") return <Skeleton key={j} className={cn("h-2", l.width)} />
                const isCited = cited.includes(l.value)
                return (
                  <div key={j} className="flex flex-col items-start gap-1">
                    <p className="text-sm">
                      {l.prefix}
                      {isCited ? <mark className="rounded-xs bg-mark px-0.5 text-foreground">{l.value}</mark> : l.value}
                    </p>
                    {isCited && <Badge variant="outline">Cited in finding</Badge>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </section>
  )
}
