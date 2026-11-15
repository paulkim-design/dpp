import { ScanText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { hasBlockingIssue, issueText, productLabel, type Product } from "@/data/products"

export function BulkApproveDialog({
  open,
  onOpenChange,
  selected,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  selected: Product[]
  onConfirm: (approvable: Product[]) => void
}) {
  const approvable = selected.filter((p) => !hasBlockingIssue(p) && p.reviewStatus !== "Approved")
  const excluded = selected.filter((p) => hasBlockingIssue(p))
  const n = approvable.length
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[512px]">
        <DialogHeader>
          <DialogTitle>Approve {n} products?</DialogTitle>
          <DialogDescription className="sr-only">Products with open issues or AI findings are not approved.</DialogDescription>
        </DialogHeader>
        {n > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">These products will be approved</p>
            <ul className="flex flex-col gap-1.5 rounded-md border p-3 text-sm">
              {approvable.map((p) => (
                <li key={p.styleNumber}>{productLabel(p)}</li>
              ))}
            </ul>
          </div>
        )}
        {excluded.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Not approved, open issues or AI findings</p>
            <ul className="flex flex-col gap-2 rounded-md border p-3 text-sm">
              {excluded.map((p) => (
                <li key={p.styleNumber} className="flex items-center justify-between gap-2">
                  <span>{productLabel(p)}</span>
                  <Badge variant="outline">
                    {p.finding === "unreviewed" && <ScanText aria-hidden />}
                    {issueText(p)}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            aria-disabled={n === 0 || undefined}
            onClick={() => {
              if (n === 0) return
              onConfirm(approvable)
              onOpenChange(false)
            }}
          >
            Approve {n} products
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
