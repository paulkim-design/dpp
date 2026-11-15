import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, CircleAlert, ScanText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ApproveButton } from "@/components/approve-button"
import { SendForReviewDialog } from "@/components/send-for-review-dialog"
import { COLLECTION, hasBlockingIssue, issueText, productLabel } from "@/data/products"
import { useAppStore } from "@/store/app-store"

export function ProductSidePanel({ styleNumber, onOpenChange }: { styleNumber: string | null; onOpenChange: (open: boolean) => void }) {
  const store = useAppStore()
  const navigate = useNavigate()
  const [sendOpen, setSendOpen] = React.useState(false)
  const product = store.products.find((p) => p.styleNumber === styleNumber)
  const detailsUrl = product ? `/products/${product.styleNumber}` : "/"

  const openIssue = () => {
    store.setDetails({ open: true, view: { kind: "result", key: "high" } })
    navigate(detailsUrl)
  }

  return (
    <>
      <Sheet open={!!product} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-[452px] flex-col gap-6 p-6 sm:max-w-[452px]" showCloseButton={false}>
          {product && (
            <>
              <SheetHeader className="flex-row items-start gap-3 p-0">
                <SheetTitle className="flex-1 text-lg">{productLabel(product)}</SheetTitle>
                <SheetDescription className="sr-only">Product side panel</SheetDescription>
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </SheetHeader>
              <dl className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <dt className="text-xs font-medium text-muted-foreground">Review status</dt>
                  <dd>
                    <Badge variant="outline">{product.reviewStatus}</Badge>
                  </dd>
                </div>
                <div className="flex flex-col gap-1.5">
                  <dt className="text-xs font-medium text-muted-foreground">Collection</dt>
                  <dd className="text-sm">{COLLECTION}</dd>
                </div>
                <div className="flex flex-col gap-1.5">
                  <dt className="text-xs font-medium text-muted-foreground">Issues</dt>
                  <dd>
                    {hasBlockingIssue(product) ? (
                      <button
                        type="button"
                        onClick={openIssue}
                        className="flex w-full items-center gap-3 rounded-md border border-input p-3 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span className="flex flex-1 flex-col gap-1">
                          <span className="text-sm font-medium">Fiber composition, main fabric</span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {product.finding === "unreviewed" ? (
                              <ScanText className="size-3.5 text-foreground" aria-hidden />
                            ) : (
                              <CircleAlert className="size-3.5 text-foreground" aria-hidden />
                            )}
                            {issueText(product)}
                          </span>
                        </span>
                        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                      </button>
                    ) : (
                      <span className="text-sm text-muted-foreground">No issues</span>
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-auto flex flex-col gap-2">
                <Button variant="outline" onClick={() => navigate(detailsUrl)}>
                  Show product details
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSendOpen(true)}>
                    Send for review
                  </Button>
                  <div className="flex-1 [&>div]:w-full [&_button:first-child]:flex-1">
                    <ApproveButton
                      blocked={hasBlockingIssue(product)}
                      onApprove={() => store.updateProduct(product.styleNumber, { reviewStatus: "Approved" })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <SendForReviewDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        onSend={() => product && store.updateProduct(product.styleNumber, { reviewStatus: "In review" })}
      />
    </>
  )
}
