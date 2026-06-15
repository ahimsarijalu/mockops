import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn } from '@/shared/lib/utils'

export const TooltipProvider = BaseTooltip.Provider
export const Tooltip = BaseTooltip.Root
export const TooltipTrigger = BaseTooltip.Trigger

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: BaseTooltip.Popup.Props & { sideOffset?: number }) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner sideOffset={sideOffset} className="z-50">
        <BaseTooltip.Popup
          className={cn(
            'rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground border border-border shadow-md data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity',
            className,
          )}
          {...props}
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  )
}
