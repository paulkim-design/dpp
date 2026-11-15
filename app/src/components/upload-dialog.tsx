import * as React from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/** Mock file picker. Picking any file starts the check (Waiting). */
const MOCK_FILES = ["GRS-certificate-SS27.pdf", "GRS-certificate-unlocked.pdf", "Supplier-declaration-scan.pdf"]

export function UploadDialog({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (file: string) => void }) {
  const [file, setFile] = React.useState(MOCK_FILES[0])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>Prototype file picker. Choose a file to start the check.</DialogDescription>
        </DialogHeader>
        <div role="radiogroup" aria-label="Files" className="flex flex-col gap-2">
          {MOCK_FILES.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={file === f}
              onClick={() => setFile(f)}
              className={cn(
                "flex items-center gap-2 rounded-md border border-input px-3 py-2 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                file === f && "border-primary bg-muted",
              )}
            >
              <FileText className="size-4" aria-hidden />
              {f}
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onPick(file)
            }}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
