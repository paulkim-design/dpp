import * as React from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const APPROVE_HINT = "Approve is available when no issues are open."

/**
 * Approve uses aria-disabled="true" while blocked, so it stays focusable.
 * An info button next to it shows the hint as a tooltip on hover and keyboard focus.
 * The hint is also kept in the DOM (visually hidden) so aria-describedby always resolves.
 */
export function ApproveButton({
  blocked,
  onApprove,
  size = "default",
  className,
}: {
  blocked: boolean
  onApprove: () => void
  size?: "default" | "sm"
  className?: string
}) {
  const hintId = React.useId()
  return (
    <div className="flex items-center gap-1">
      <Button
        size={size}
        aria-disabled={blocked || undefined}
        aria-describedby={blocked ? hintId : undefined}
        onClick={() => {
          if (!blocked) onApprove()
        }}
        className={className}
      >
        Approve
      </Button>
      {blocked && (
        <>
          <span id={hintId} className="sr-only">
            {APPROVE_HINT}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Why Approve is unavailable">
                <Info aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{APPROVE_HINT}</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  )
}
