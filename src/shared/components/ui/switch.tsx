import { Switch as BaseSwitch } from '@base-ui-components/react/switch'
import { cn } from '@/shared/lib/utils'

export function Switch({ className, ...props }: BaseSwitch.Root.Props) {
  return (
    <BaseSwitch.Root
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-input transition-colors data-[checked]:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-background shadow transition-transform data-[checked]:translate-x-[18px]" />
    </BaseSwitch.Root>
  )
}
