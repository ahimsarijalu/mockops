import { Select as BaseSelect } from '@base-ui-components/react/select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export const Select = BaseSelect.Root
export const SelectGroup = BaseSelect.Group
export const SelectGroupLabel = BaseSelect.GroupLabel
export const SelectValue = BaseSelect.Value

export function SelectTrigger({ className, children, ...props }: BaseSelect.Trigger.Props) {
  return (
    <BaseSelect.Trigger
      className={cn(
        'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <BaseSelect.Icon>
        <ChevronDownIcon className="size-4 opacity-50" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  )
}

export function SelectContent({ className, children, ...props }: BaseSelect.Popup.Props) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner className="z-50 outline-none" sideOffset={4}>
        <BaseSelect.ScrollUpArrow className="flex justify-center py-1">
          <ChevronUpIcon className="size-4" />
        </BaseSelect.ScrollUpArrow>
        <BaseSelect.Popup
          className={cn(
            'min-w-32 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md p-1',
            className,
          )}
          {...props}
        >
          {children}
        </BaseSelect.Popup>
        <BaseSelect.ScrollDownArrow className="flex justify-center py-1">
          <ChevronDownIcon className="size-4" />
        </BaseSelect.ScrollDownArrow>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  )
}

export function SelectItem({ className, children, ...props }: BaseSelect.Item.Props) {
  return (
    <BaseSelect.Item
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 pl-8 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <BaseSelect.ItemIndicator>
          <CheckIcon className="size-4" />
        </BaseSelect.ItemIndicator>
      </span>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  )
}
