import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowDown, ArrowUp, ScanText } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AiPanel } from "@/components/ai-panel/ai-panel"
import { BulkApproveDialog } from "@/components/bulk-approve-dialog"
import { ProductSidePanel } from "@/components/product-side-panel"
import { UploadDialog } from "@/components/upload-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { COLLECTION, DEADLINE, SET_NAME, hasBlockingIssue, issueText, productLabel } from "@/data/products"
import { FINDING_PRODUCT, useAppStore, waitingForDetails, type PanelView } from "@/store/app-store"

const ALL = "all"

export function ListViewPage() {
  const store = useAppStore()
  const navigate = useNavigate()
  const [status, setStatus] = React.useState(ALL)
  const [issues, setIssues] = React.useState(ALL)
  const [category, setCategory] = React.useState(ALL)
  const [sortAsc, setSortAsc] = React.useState(true)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [sidePanel, setSidePanel] = React.useState<string | null>(null)
  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [uploadPrev, setUploadPrev] = React.useState<PanelView | null>(null)

  // Cold start sits in the side panel spot when the set opens and no check has completed yet.
  React.useEffect(() => {
    if (!store.coldStartDone) store.setList({ open: true, view: { kind: "cold_start" } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = store.products
    .filter((p) => status === ALL || p.reviewStatus === status)
    .filter((p) => issues === ALL || (issues === "with" ? hasBlockingIssue(p) : !hasBlockingIssue(p)))
    .filter((p) => category === ALL || p.category === category)
    .sort((a, b) => (sortAsc ? 1 : -1) * a.styleNumber.localeCompare(b.styleNumber))

  const clearFilters = () => {
    setStatus(ALL)
    setIssues(ALL)
    setCategory(ALL)
  }
  // Bulk approve acts on the selected rows that are visible with the current filters.
  const visibleSelected = rows.filter((r) => selected.has(r.styleNumber))

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.styleNumber))
  const someSelected = visibleSelected.length > 0
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const listPanelOpen = store.list.open
  const closeListPanel = () => store.setList({ open: false })

  const openIssues = (id: string) => {
    closeListPanel() // cold start closes when the user opens a product with "Open issues"
    setSidePanel(id)
  }

  return (
    <AppShell crumbs={[{ label: "Product sets" }, { label: SET_NAME }]}>
      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">{SET_NAME}</h1>
            <p className="text-sm text-muted-foreground">6 products, deadline {DEADLINE}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Filter and sort">
            <FilterSelect label="Review status" value={status} onChange={setStatus} options={["Draft", "In review", "Approved"]} />
            <FilterSelect
              label="Issues"
              value={issues}
              onChange={setIssues}
              options={[
                ["with", "With issues"],
                ["without", "No issues"],
              ]}
            />
            <FilterSelect
              label="Product category"
              value={category}
              onChange={setCategory}
              options={[...new Set(store.products.map((p) => p.category))]}
            />
            <div className="flex-1" />
            {someSelected && (
              <Button size="sm" onClick={() => setBulkOpen(true)}>
                Approve selected
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortAsc((s) => !s)}
              aria-label={`Sort by style number, currently ${sortAsc ? "ascending" : "descending"}`}
            >
              {sortAsc ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />}
              Sort by style number
            </Button>
          </div>

          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      aria-label="Select all products"
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={(v) => setSelected(v ? new Set(rows.map((r) => r.styleNumber)) : new Set())}
                    />
                  </TableHead>
                  <TableHead aria-sort={sortAsc ? "ascending" : "descending"}>Identification</TableHead>
                  <TableHead className="w-28">Review status</TableHead>
                  <TableHead className="w-52">Collection</TableHead>
                  <TableHead className="w-48">Issues</TableHead>
                  <TableHead className="w-72">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-muted-foreground">No products match these filters.</p>
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((p) => {
                  const isSel = selected.has(p.styleNumber)
                  return (
                    <TableRow key={p.styleNumber} data-state={isSel ? "selected" : undefined}>
                      <TableCell className="pl-4">
                        <Checkbox aria-label={`Select ${productLabel(p)}`} checked={isSel} onCheckedChange={() => toggle(p.styleNumber)} />
                      </TableCell>
                      <TableCell className="font-medium whitespace-normal">{productLabel(p)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.reviewStatus}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">{COLLECTION}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1.5 ${hasBlockingIssue(p) ? "" : "text-muted-foreground"}`}>
                          {p.finding === "unreviewed" && <ScanText className="size-3.5" aria-hidden />}
                          {issueText(p)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openIssues(p.styleNumber)}>
                            Open issues
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${p.styleNumber}`)}>
                            Show product details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </div>

        {listPanelOpen && (
          <aside
            aria-label="Evidence check side panel"
            className="absolute inset-y-0 right-0 z-10 flex w-[452px] flex-col border-l bg-background p-4 shadow-[-4px_0_16px_rgba(0,0,0,0.08)]"
          >
            <AiPanel
              view={store.list.view}
              onViewChange={(view) => store.setList({ view })}
              onClose={closeListPanel}
              onFlag={closeListPanel}
              onKeep={closeListPanel}
              onSaveManual={closeListPanel}
              onShowSource={() => {}}
              onUpload={(prev) => setUploadPrev(prev)}
              onCheckComplete={store.completeCheck}
              currentValue={store.fiberValue}
              autoFocusHeading
              className="border-0 p-0"
            />
          </aside>
        )}
      </div>

      <ProductSidePanel styleNumber={sidePanel} onOpenChange={(o) => !o && setSidePanel(null)} />
      <BulkApproveDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        selected={visibleSelected}
        onConfirm={(ps) => {
          ps.forEach((p) => store.updateProduct(p.styleNumber, { reviewStatus: "Approved" }))
          setSelected(new Set())
        }}
      />
      <UploadDialog
        open={!!uploadPrev}
        onOpenChange={(o) => !o && setUploadPrev(null)}
        onPick={() => {
          // Upload certificate: Waiting, then the result on the details page of the product the certificate belongs to.
          closeListPanel()
          store.setDetails({ open: true, view: waitingForDetails({ kind: "cold_start" }) })
          setUploadPrev(null)
          navigate(`/products/${FINDING_PRODUCT}`)
        }}
      />
    </AppShell>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: (string | [string, string])[]
}) {
  const items: [string, string][] = [[ALL, "All"], ...options.map((o) => (Array.isArray(o) ? o : ([o, o] as [string, string])))]
  const current = items.find(([v]) => v === value)?.[1] ?? "All"
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" aria-label={`${label}: ${current}`} className="border-input data-[size=sm]:h-8">
        <SelectValue>
          {value === ALL ? (
            label
          ) : (
            <span>
              <span className="text-muted-foreground">{label}:</span> {current}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {items.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
