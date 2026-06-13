import { Tabs as BaseTabs } from '@base-ui-components/react/tabs'
import { cn } from '@/shared/lib/utils'

export const Tabs = BaseTabs.Root
export const TabsPanel = BaseTabs.Panel

export function TabsList({ className, ...props }: BaseTabs.List.Props) {
  return (
    <BaseTabs.List
      className={cn(
        'relative inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTab({ className, ...props }: BaseTabs.Tab.Props) {
  return (
    <BaseTabs.Tab
      className={cn(
        'relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
