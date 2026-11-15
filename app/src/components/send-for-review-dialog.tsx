import * as React from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RECIPIENTS } from "@/data/products"

export function SendForReviewDialog({ open, onOpenChange, onSend }: { open: boolean; onOpenChange: (o: boolean) => void; onSend: () => void }) {
  const [to, setTo] = React.useState<string | null>(null)
  const messageId = React.useId()
  React.useEffect(() => {
    if (open) setTo(null)
  }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Send for review</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label id="to-label">To</Label>
          <Command aria-labelledby="to-label" className="rounded-md border border-input">
            <CommandInput placeholder="Search name or team" />
            <CommandList>
              <CommandEmpty>No match</CommandEmpty>
              <CommandGroup>
                {RECIPIENTS.map((r) => (
                  <CommandItem key={r} value={r} onSelect={() => setTo(r)} aria-selected={to === r}>
                    <span className="flex-1">{r}</span>
                    {to === r && <Check aria-hidden />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={messageId}>Message</Label>
          <Textarea id={messageId} placeholder="Can you check this please?" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSend()
              onOpenChange(false)
            }}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
