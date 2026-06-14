export const STRING_MATCHER_TYPES = [
  { value: 'equalTo', label: 'Equal to' },
  { value: 'contains', label: 'Contains' },
  { value: 'matches', label: 'Matches (regex)' },
  { value: 'doesNotMatch', label: 'Does not match (regex)' },
  { value: 'absent', label: 'Absent' },
] as const

export type StringMatcherType = (typeof STRING_MATCHER_TYPES)[number]['value']

export const BODY_MATCHER_TYPES = [
  { value: 'equalTo', label: 'Equal to' },
  { value: 'equalToJson', label: 'Equal to JSON' },
  { value: 'matchesJsonPath', label: 'Matches JSONPath' },
  { value: 'equalToXml', label: 'Equal to XML' },
  { value: 'matchesXPath', label: 'Matches XPath' },
  { value: 'contains', label: 'Contains' },
  { value: 'matches', label: 'Matches (regex)' },
  { value: 'binaryEqualTo', label: 'Binary equal to' },
] as const

export type BodyMatcherType = (typeof BODY_MATCHER_TYPES)[number]['value']

export const URL_MATCH_TYPES = [
  { value: 'url', label: 'URL (exact)' },
  { value: 'urlPattern', label: 'URL (regex)' },
  { value: 'urlPath', label: 'URL Path (exact)' },
  { value: 'urlPathPattern', label: 'URL Path (regex)' },
] as const

export type UrlMatchType = (typeof URL_MATCH_TYPES)[number]['value']

export const HTTP_METHODS = [
  'ANY',
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
  'TRACE',
]

export const FAULT_TYPES = [
  { value: 'EMPTY_RESPONSE', label: 'Empty response' },
  { value: 'MALFORMED_RESPONSE_CHUNK', label: 'Malformed response chunk' },
  { value: 'RANDOM_DATA_THEN_CLOSE', label: 'Random data then close' },
  { value: 'CONNECTION_RESET_BY_PEER', label: 'Connection reset by peer' },
] as const

export const RESPONSE_BODY_MODES = [
  { value: 'json', label: 'JSON body' },
  { value: 'text', label: 'Text / XML / HTML body' },
  { value: 'file', label: 'Response file (bodyFileName)' },
  { value: 'none', label: 'No body' },
] as const

export type ResponseBodyMode = (typeof RESPONSE_BODY_MODES)[number]['value']
