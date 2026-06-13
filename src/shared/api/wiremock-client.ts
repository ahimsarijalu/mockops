import type { AxiosInstance } from 'axios'
import { createHttpClient } from './http'
import type { ServerConfig } from '@/features/servers/types/server'
import {
  type StubMapping,
  type StubMappingsResponse,
  type RequestJournalResponse,
  type ServeEvent,
  type NearMiss,
  type Scenario,
  type WireMockSettings,
  type RecordingStartRequest,
  type RecordingStatus,
  stubMappingSchema,
  stubMappingsResponseSchema,
  requestJournalResponseSchema,
  serveEventSchema,
  nearMissesResponseSchema,
  scenariosResponseSchema,
  wireMockSettingsSchema,
  recordingStatusSchema,
  recordingResultSchema,
} from '@/shared/types/wiremock'

/** Mapping CRUD + search */
class MappingClient {
  private http: AxiosInstance
  constructor(http: AxiosInstance) {
    this.http = http
  }

  async list(params?: { limit?: number; offset?: number }): Promise<StubMappingsResponse> {
    const { data } = await this.http.get('/__admin/mappings', { params })
    return stubMappingsResponseSchema.parse(data)
  }

  async get(id: string): Promise<StubMapping> {
    const { data } = await this.http.get(`/__admin/mappings/${id}`)
    return stubMappingSchema.parse(data)
  }

  async create(mapping: StubMapping): Promise<StubMapping> {
    const { data } = await this.http.post('/__admin/mappings', mapping)
    return stubMappingSchema.parse(data)
  }

  async update(id: string, mapping: StubMapping): Promise<StubMapping> {
    const { data } = await this.http.put(`/__admin/mappings/${id}`, mapping)
    return stubMappingSchema.parse(data)
  }

  async remove(id: string): Promise<void> {
    await this.http.delete(`/__admin/mappings/${id}`)
  }

  async removeAll(): Promise<void> {
    await this.http.delete('/__admin/mappings')
  }

  async resetToDefault(): Promise<void> {
    await this.http.post('/__admin/mappings/reset')
  }

  async persist(): Promise<void> {
    await this.http.post('/__admin/mappings/save')
  }

  async importMappings(mappings: StubMapping[]): Promise<void> {
    await this.http.post('/__admin/mappings/import', { mappings })
  }

  async findByMetadata(pattern: unknown): Promise<StubMappingsResponse> {
    const { data } = await this.http.post('/__admin/mappings/find-by-metadata', pattern)
    return stubMappingsResponseSchema.parse(data)
  }

  async removeByMetadata(pattern: unknown): Promise<void> {
    await this.http.post('/__admin/mappings/remove-by-metadata', pattern)
  }
}

/** __files management */
class FileClient {
  private http: AxiosInstance
  constructor(http: AxiosInstance) {
    this.http = http
  }

  async list(): Promise<string[]> {
    const { data } = await this.http.get<string[]>('/__admin/files')
    return data
  }

  async get(filename: string): Promise<string> {
    const { data } = await this.http.get<string>(`/__admin/files/${encodeFilePath(filename)}`, {
      responseType: 'text',
    })
    return data
  }

  async put(filename: string, content: string): Promise<void> {
    await this.http.put(`/__admin/files/${encodeFilePath(filename)}`, content, {
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  async remove(filename: string): Promise<void> {
    await this.http.delete(`/__admin/files/${encodeFilePath(filename)}`)
  }
}

function encodeFilePath(filename: string): string {
  return filename.split('/').map(encodeURIComponent).join('/')
}

/** Scenario state management */
class ScenarioClient {
  private http: AxiosInstance
  constructor(http: AxiosInstance) {
    this.http = http
  }

  async list(): Promise<Scenario[]> {
    const { data } = await this.http.get('/__admin/scenarios')
    return scenariosResponseSchema.parse(data).scenarios
  }

  async resetAll(): Promise<void> {
    await this.http.post('/__admin/scenarios/reset')
  }

  async reset(name: string): Promise<void> {
    await this.http.put(`/__admin/scenarios/${encodeURIComponent(name)}/state`, {})
  }

  async setState(name: string, state: string): Promise<void> {
    await this.http.put(`/__admin/scenarios/${encodeURIComponent(name)}/state`, {
      state,
    })
  }
}

/** Request journal + near misses */
class RequestClient {
  private http: AxiosInstance
  constructor(http: AxiosInstance) {
    this.http = http
  }

  async journal(params?: { limit?: number; since?: string }): Promise<RequestJournalResponse> {
    const { data } = await this.http.get('/__admin/requests', { params })
    return requestJournalResponseSchema.parse(data)
  }

  async get(id: string): Promise<ServeEvent> {
    const { data } = await this.http.get(`/__admin/requests/${id}`)
    return serveEventSchema.parse(data)
  }

  async remove(id: string): Promise<void> {
    await this.http.delete(`/__admin/requests/${id}`)
  }

  async removeAll(): Promise<void> {
    await this.http.delete('/__admin/requests')
  }

  async count(criteria: unknown): Promise<number> {
    const { data } = await this.http.post('/__admin/requests/count', criteria)
    return data.count
  }

  async findUnmatched(): Promise<RequestJournalResponse> {
    const { data } = await this.http.get('/__admin/requests/unmatched')
    return requestJournalResponseSchema.parse(data)
  }

  async nearMisses(): Promise<NearMiss[]> {
    const { data } = await this.http.get('/__admin/requests/unmatched/near-misses')
    return nearMissesResponseSchema.parse(data).nearMisses
  }

  async findNearMissesFor(request: unknown): Promise<NearMiss[]> {
    const { data } = await this.http.post('/__admin/near-misses/request', request)
    return nearMissesResponseSchema.parse(data).nearMisses
  }
}

/** Recording lifecycle */
class RecordingClient {
  private http: AxiosInstance
  constructor(http: AxiosInstance) {
    this.http = http
  }

  async status(): Promise<RecordingStatus> {
    const { data } = await this.http.get('/__admin/recordings/status')
    return recordingStatusSchema.parse(data)
  }

  async start(request: RecordingStartRequest): Promise<void> {
    await this.http.post('/__admin/recordings/start', request)
  }

  async stop(): Promise<StubMapping[]> {
    const { data } = await this.http.post('/__admin/recordings/stop')
    return recordingResultSchema.parse(data).mappings
  }

  async snapshot(request?: RecordingStartRequest): Promise<StubMapping[]> {
    const { data } = await this.http.post('/__admin/recordings/snapshot', request ?? {})
    return recordingResultSchema.parse(data).mappings
  }
}

/** Settings, health, system info */
class SystemClient {
  private http: AxiosInstance
  constructor(http: AxiosInstance) {
    this.http = http
  }

  async getSettings(): Promise<WireMockSettings> {
    const { data } = await this.http.get('/__admin/settings')
    return wireMockSettingsSchema.parse(data)
  }

  async updateSettings(settings: WireMockSettings): Promise<void> {
    await this.http.post('/__admin/settings', settings)
  }

  async health(): Promise<{ status: string; version?: string; uptime?: number }> {
    const { data } = await this.http.get('/__admin/health')
    return data
  }

  async version(): Promise<{ version?: string }> {
    const { data } = await this.http.get('/__admin/version')
    return data
  }

  async shutdown(): Promise<void> {
    await this.http.post('/__admin/shutdown')
  }

  async resetAll(): Promise<void> {
    await this.http.post('/__admin/reset')
  }
}

export class WireMockClient {
  readonly http: AxiosInstance
  readonly mappings: MappingClient
  readonly files: FileClient
  readonly scenarios: ScenarioClient
  readonly requests: RequestClient
  readonly recordings: RecordingClient
  readonly system: SystemClient

  constructor(server: ServerConfig) {
    this.http = createHttpClient(server)
    this.mappings = new MappingClient(this.http)
    this.files = new FileClient(this.http)
    this.scenarios = new ScenarioClient(this.http)
    this.requests = new RequestClient(this.http)
    this.recordings = new RecordingClient(this.http)
    this.system = new SystemClient(this.http)
  }
}
