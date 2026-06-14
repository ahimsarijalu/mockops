import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboardIcon,
  ServerIcon,
  ListTreeIcon,
  FolderTreeIcon,
  HistoryIcon,
  TargetIcon,
  GitBranchIcon,
  RadioIcon,
  SettingsIcon,
  ScrollTextIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboardIcon },
  { label: 'Servers', to: '/servers', icon: ServerIcon },
  { label: 'Mappings', to: '/mappings', icon: ListTreeIcon },
  { label: 'Files', to: '/files', icon: FolderTreeIcon },
  { label: 'Request Journal', to: '/requests', icon: HistoryIcon },
  { label: 'Near Misses', to: '/near-misses', icon: TargetIcon },
  { label: 'Scenarios', to: '/scenarios', icon: GitBranchIcon },
  { label: 'Recordings', to: '/recordings', icon: RadioIcon },
  { label: 'Audit Log', to: '/audit', icon: ScrollTextIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon },
]
