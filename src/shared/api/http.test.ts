import { describe, it, expect } from 'vitest'
import { describeWireMockError } from './http'

describe('describeWireMockError', () => {
  it('adds a permission hint for AccessDeniedException', () => {
    const raw = 'java.nio.file.AccessDeniedException: ./mappings/abc-123.json'
    const message = describeWireMockError(raw)
    expect(message).toContain("couldn't write to its storage directory")
    expect(message).toContain(raw)
  })

  it('adds a permission hint for FileSystemException', () => {
    const raw = 'java.nio.file.FileSystemException: /home/wiremock/__files/foo.json'
    expect(describeWireMockError(raw)).toContain('permission denied')
  })

  it('passes other messages through unchanged', () => {
    const raw = 'Stub mapping not found'
    expect(describeWireMockError(raw)).toBe(raw)
  })
})
