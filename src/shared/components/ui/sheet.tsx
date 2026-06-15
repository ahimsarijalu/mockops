import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

export const Sheet = BaseDialog.Root
export const SheetTrigger = BaseDialog.Trigger
export const SheetClose = BaseDialog.Close

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform border-border data-[ending-style]:duration-200 data-[starting-style]:duration-0',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full',
        bottom:
          'inset-x-0 bottom-0 border-t data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full',
      },
    },
    defaultVariants: { side: 'right' },
  },
)

export function SheetContent({
  className,
  side = 'right',
  children,
  ...props
}: BaseDialog.Popup.Props & VariantProps<typeof sheetVariants>) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
      <BaseDialog.Popup className={cn(sheetVariants({ side }), className)} {...props}>
        {children}
        <BaseDialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />
}

export function SheetTitle({ className, ...props }: BaseDialog.Title.Props) {
  return <BaseDialog.Title className={cn('text-lg font-semibold', className)} {...props} />
}

export function SheetDescription({ className, ...props }: BaseDialog.Description.Props) {
  return (
    <BaseDialog.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}
