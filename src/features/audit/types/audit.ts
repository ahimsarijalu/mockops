export interface AuditEntry {
  id: string
  timestamp: string
  action: string
  target: string
  serverId?: string
  serverName?: string
}
