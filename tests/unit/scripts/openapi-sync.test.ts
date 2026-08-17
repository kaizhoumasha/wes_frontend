import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  parseContractSyncRecord,
  serializeOpenApiDocument,
  validateOpenApiDocument,
  isBrowserOwnedEndpoint
} from '../../../scripts/lib/openapi-sync'
import { computeSha256 } from '../../../scripts/lib/sha256'

const BACKEND_COMMIT = 'de034e721befae2e1658d0aff96f2f2e43a0ffbb'

describe('OpenAPI sync helpers', () => {
  it('serializes the complete document deterministically and hashes every section', () => {
    const document = {
      openapi: '3.1.0',
      info: { title: 'WES', version: '1.0.0' },
      paths: { '/api/v1/health': { get: { responses: { 200: { description: 'ok' } } } } },
      components: { schemas: { Health: { type: 'object' } } }
    }
    const serialized = `${JSON.stringify(document, null, 2)}\n`

    expect(serializeOpenApiDocument(document)).toBe(serialized)
    expect(computeSha256(serialized)).toBe(createHash('sha256').update(serialized).digest('hex'))

    const pathChanged = serializeOpenApiDocument({
      ...document,
      paths: { '/api/v1/ready': document.paths['/api/v1/health'] }
    })
    expect(computeSha256(pathChanged)).not.toBe(computeSha256(serialized))
  })

  it('rejects malformed OpenAPI documents and non-exact sync records', () => {
    expect(() => validateOpenApiDocument({ openapi: '2.0', paths: {} })).toThrow(/OpenAPI 3/)
    expect(() =>
      validateOpenApiDocument({
        openapi: '3.1.0',
        info: { title: 'invalid', version: '1.0.0' },
        paths: []
      })
    ).toThrow(/paths/)

    expect(
      parseContractSyncRecord({
        backendCommit: BACKEND_COMMIT,
        openApiSha256: 'a'.repeat(64),
        snapshotPath: 'contracts/openapi.current.json'
      })
    ).toEqual({
      backendCommit: BACKEND_COMMIT,
      openApiSha256: 'a'.repeat(64),
      snapshotPath: 'contracts/openapi.current.json'
    })

    expect(() =>
      parseContractSyncRecord({
        backendCommit: BACKEND_COMMIT,
        openApiSha256: 'a'.repeat(64),
        snapshotPath: 'contracts/openapi.current.json',
        lastSyncTime: '2026-08-18T00:00:00.000Z'
      })
    ).toThrow(/字段/)
    expect(() =>
      parseContractSyncRecord({
        backendCommit: BACKEND_COMMIT,
        openApiSha256: 'legacy',
        snapshotPath: 'contracts/openapi.current.json'
      })
    ).toThrow(/SHA-256/)
  })

  it('requires non-empty OpenAPI info title and version strings', () => {
    const validDocument = {
      openapi: '3.1.0',
      info: { title: 'WES', version: '1.0.0' },
      paths: {}
    }

    for (const title of [undefined, '', '   ', 42]) {
      expect(() =>
        validateOpenApiDocument({
          ...validDocument,
          info: { ...validDocument.info, title }
        })
      ).toThrow(/info\.title/)
    }

    for (const version of [undefined, '', '   ', 42]) {
      expect(() =>
        validateOpenApiDocument({
          ...validDocument,
          info: { ...validDocument.info, version }
        })
      ).toThrow(/info\.version/)
    }
  })

  it('keeps system endpoints in the mirror but excludes only their browser clients', () => {
    expect(isBrowserOwnedEndpoint('/api/v1/wms/events')).toBe(false)
    expect(isBrowserOwnedEndpoint('/api/v1/wms/tasks/123')).toBe(false)
    expect(isBrowserOwnedEndpoint('/api/v1/callback/external')).toBe(false)

    expect(isBrowserOwnedEndpoint('/api/v1/callback/logs')).toBe(true)
    expect(isBrowserOwnedEndpoint('/api/v1/callback/logs/123')).toBe(true)
    expect(isBrowserOwnedEndpoint('/api/v1/admin/users')).toBe(true)
  })
})
