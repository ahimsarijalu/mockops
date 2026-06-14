import { z } from 'zod'

// ---------------------------------------------------------------------------
// Matchers
// ---------------------------------------------------------------------------

export const stringValuePatternSchema = z
  .object({
    equalTo: z.string().optional(),
    binaryEqualTo: z.string().optional(),
    contains: z.string().optional(),
    matches: z.string().optional(),
    doesNotMatch: z.string().optional(),
    matchesXPath: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    matchesJsonPath: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    equalToJson: z.union([z.string(), z.unknown()]).optional(),
    equalToXml: z.string().optional(),
    absent: z.boolean().optional(),
    caseInsensitive: z.boolean().optional(),
    ignoreArrayOrder: z.boolean().optional(),
    ignoreExtraElements: z.boolean().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
    equalToDateTime: z.string().optional(),
    actualFormat: z.string().optional(),
    expression: z.string().optional(),
  })
  .catchall(z.unknown())

export type StringValuePattern = z.infer<typeof stringValuePatternSchema>

export const multipartPatternSchema = z
  .object({
    name: z.string().optional(),
    matchingType: z.enum(['ANY', 'ALL']).optional(),
    headers: z.record(z.string(), stringValuePatternSchema).optional(),
    bodyPatterns: z.array(stringValuePatternSchema).optional(),
  })
  .catchall(z.unknown())

// ---------------------------------------------------------------------------
// Request pattern
// ---------------------------------------------------------------------------

export const requestPatternSchema = z
  .object({
    url: z.string().optional(),
    urlPattern: z.string().optional(),
    urlPath: z.string().optional(),
    urlPathPattern: z.string().optional(),
    method: z.string().optional(),
    headers: z.record(z.string(), stringValuePatternSchema).optional(),
    cookies: z.record(z.string(), stringValuePatternSchema).optional(),
    queryParameters: z.record(z.string(), stringValuePatternSchema).optional(),
    pathParameters: z.record(z.string(), stringValuePatternSchema).optional(),
    bodyPatterns: z.array(stringValuePatternSchema).optional(),
    multipartPatterns: z.array(multipartPatternSchema).optional(),
    basicAuthCredentials: z.object({ username: z.string(), password: z.string() }).optional(),
  })
  .catchall(z.unknown())

export type RequestPattern = z.infer<typeof requestPatternSchema>

// ---------------------------------------------------------------------------
// Response definition
// ---------------------------------------------------------------------------

export const faultSchema = z.enum([
  'EMPTY_RESPONSE',
  'MALFORMED_RESPONSE_CHUNK',
  'RANDOM_DATA_THEN_CLOSE',
  'CONNECTION_RESET_BY_PEER',
])

export type Fault = z.infer<typeof faultSchema>

export const delayDistributionSchema = z
  .object({
    type: z.enum(['uniform', 'lognormal']).optional(),
    lower: z.number().optional(),
    upper: z.number().optional(),
    median: z.number().optional(),
    sigma: z.number().optional(),
  })
  .catchall(z.unknown())

export const chunkedDribbleDelaySchema = z.object({
  numberOfChunks: z.number(),
  totalDuration: z.number(),
})

export const responseDefinitionSchema = z
  .object({
    status: z.number().optional(),
    statusMessage: z.string().optional(),
    body: z.string().optional(),
    jsonBody: z.unknown().optional(),
    base64Body: z.string().optional(),
    bodyFileName: z.string().optional(),
    headers: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
    additionalProxyRequestHeaders: z.record(z.string(), z.string()).optional(),
    fixedDelayMilliseconds: z.number().optional(),
    delayDistribution: delayDistributionSchema.optional(),
    chunkedDribbleDelay: chunkedDribbleDelaySchema.optional(),
    fault: faultSchema.optional(),
    proxyBaseUrl: z.string().optional(),
    transformers: z.array(z.string()).optional(),
    transformerParameters: z.record(z.string(), z.unknown()).optional(),
  })
  .catchall(z.unknown())

export type ResponseDefinition = z.infer<typeof responseDefinitionSchema>

// ---------------------------------------------------------------------------
// Stub mapping
// ---------------------------------------------------------------------------

export const stubMappingSchema = z
  .object({
    id: z.string().optional(),
    uuid: z.string().optional(),
    name: z.string().optional(),
    request: requestPatternSchema,
    response: responseDefinitionSchema,
    persistent: z.boolean().optional(),
    priority: z.number().optional(),
    scenarioName: z.string().optional(),
    requiredScenarioState: z.string().optional(),
    newScenarioState: z.string().optional(),
    postServeActions: z.unknown().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    insertionIndex: z.number().optional(),
  })
  .catchall(z.unknown())

export type StubMapping = z.infer<typeof stubMappingSchema>

export const stubMappingsResponseSchema = z.object({
  mappings: z.array(stubMappingSchema),
  meta: z.object({ total: z.number() }).optional(),
})

export type StubMappingsResponse = z.infer<typeof stubMappingsResponseSchema>

// ---------------------------------------------------------------------------
// Request journal
// ---------------------------------------------------------------------------

export const loggedRequestSchema = z
  .object({
    url: z.string(),
    absoluteUrl: z.string().optional(),
    method: z.string(),
    clientIp: z.string().optional(),
    headers: z.record(z.string(), z.unknown()).optional(),
    cookies: z.record(z.string(), z.unknown()).optional(),
    browserProxyRequest: z.boolean().optional(),
    loggedDate: z.number().optional(),
    bodyAsBase64: z.string().optional(),
    body: z.string().optional(),
    loggedDateString: z.string().optional(),
    queryParams: z.record(z.string(), z.unknown()).optional(),
  })
  .catchall(z.unknown())

export const loggedResponseSchema = z
  .object({
    status: z.number(),
    headers: z.record(z.string(), z.unknown()).optional(),
    body: z.string().optional(),
    bodyAsBase64: z.string().optional(),
    fault: faultSchema.optional(),
  })
  .catchall(z.unknown())

export const serveEventSchema = z
  .object({
    id: z.string(),
    request: loggedRequestSchema,
    responseDefinition: responseDefinitionSchema.optional(),
    response: loggedResponseSchema.optional(),
    wasMatched: z.boolean().optional(),
    stubMapping: stubMappingSchema.optional(),
    timing: z
      .object({
        addedDelay: z.number().optional(),
        processTime: z.number().optional(),
        responseSendTime: z.number().optional(),
        serveTime: z.number().optional(),
        totalTime: z.number().optional(),
      })
      .optional(),
  })
  .catchall(z.unknown())

export type ServeEvent = z.infer<typeof serveEventSchema>

export const requestJournalResponseSchema = z.object({
  requests: z.array(serveEventSchema),
  meta: z.object({ total: z.number() }).optional(),
  requestJournalDisabled: z.boolean().optional(),
})

export type RequestJournalResponse = z.infer<typeof requestJournalResponseSchema>

// ---------------------------------------------------------------------------
// Near misses
// ---------------------------------------------------------------------------

export const nearMissSchema = z.object({
  request: loggedRequestSchema,
  stubMapping: stubMappingSchema.optional(),
  matchResult: z
    .object({
      distance: z.number().optional(),
    })
    .catchall(z.unknown())
    .optional(),
})

export type NearMiss = z.infer<typeof nearMissSchema>

export const nearMissesResponseSchema = z.object({
  nearMisses: z.array(nearMissSchema),
})

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export const scenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
  possibleStates: z.array(z.string()),
})

export type Scenario = z.infer<typeof scenarioSchema>

export const scenariosResponseSchema = z.object({
  scenarios: z.array(scenarioSchema),
})

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const wireMockSettingsSchema = z
  .object({
    fixedDelay: z.number().nullable().optional(),
    delayDistribution: delayDistributionSchema.optional(),
    proxyPassThrough: z.boolean().optional(),
    extended: z.record(z.string(), z.unknown()).optional(),
  })
  .catchall(z.unknown())

export type WireMockSettings = z.infer<typeof wireMockSettingsSchema>

// ---------------------------------------------------------------------------
// System / health
// ---------------------------------------------------------------------------

export const wireMockVersionSchema = z.object({
  version: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Recordings
// ---------------------------------------------------------------------------

export const recordingStatusSchema = z.object({
  status: z.enum(['NeverStarted', 'Recording', 'Stopped']),
})

export type RecordingStatus = z.infer<typeof recordingStatusSchema>

export const recordingStartRequestSchema = z
  .object({
    targetBaseUrl: z.string().optional(),
    filters: z
      .object({
        urlPathPattern: z.string().optional(),
        method: z.string().optional(),
        headers: z.record(z.string(), stringValuePatternSchema).optional(),
      })
      .optional(),
    captureHeaders: z.record(z.string(), z.object({})).optional(),
    requestBodyPattern: z
      .object({
        matcher: z.enum(['equalToJson', 'equalToXml', 'equalTo']).optional(),
        ignoreArrayOrder: z.boolean().optional(),
        ignoreExtraElements: z.boolean().optional(),
      })
      .optional(),
    persist: z.boolean().optional(),
    repeatsAsScenarios: z.boolean().optional(),
    transformers: z.array(z.string()).optional(),
    transformerParameters: z.record(z.string(), z.unknown()).optional(),
  })
  .catchall(z.unknown())

export type RecordingStartRequest = z.infer<typeof recordingStartRequestSchema>

export const recordingResultSchema = z.object({
  mappings: z.array(stubMappingSchema),
})

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export interface FileEntry {
  path: string
  name: string
  isDirectory: boolean
  size?: number
}
