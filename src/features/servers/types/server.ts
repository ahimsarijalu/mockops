export type ServerEnvironment = 'development' | 'qa' | 'sit' | 'uat' | 'production-like' | 'local'

export type ServerAuthType = 'none' | 'basic' | 'bearer'

export interface ServerConfig {
  id: string
  name: string
  baseUrl: string
  environment: ServerEnvironment
  authType: ServerAuthType
  username?: string
  password?: string
  token?: string
  createdAt: string
  lastConnectionStatus?: 'online' | 'offline' | 'unknown'
  lastConnectionAt?: string
  version?: string
}

export const SERVER_ENVIRONMENTS: { value: ServerEnvironment; label: string }[] = [
  { value: 'development', label: 'Development' },
  { value: 'qa', label: 'QA' },
  { value: 'sit', label: 'SIT' },
  { value: 'uat', label: 'UAT' },
  { value: 'production-like', label: 'Production-like Mock' },
  { value: 'local', label: 'Local Mock' },
]
