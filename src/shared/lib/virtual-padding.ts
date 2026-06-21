import type { Virtualizer, VirtualItem } from '@tanstack/react-virtual'

/**
 * Padding-row sizes for a virtualized <table>: the rows before/after the
 * visible window are replaced with a single spacer row of this height,
 * rather than rendering every off-screen row.
 */
export function getVirtualRowPadding<
  TScrollElement extends Element | Window,
  TItemElement extends Element,
>(virtualizer: Virtualizer<TScrollElement, TItemElement>, virtualRows: VirtualItem[]) {
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualRows.length > 0
      ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0
  return { paddingTop, paddingBottom }
}
