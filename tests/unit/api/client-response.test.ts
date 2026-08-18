import { afterEach, describe, expect, it, vi } from 'vitest'

describe('API client response parsing', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports malformed response bodies without reading the stream twice', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Internal Server Error', { status: 500 }))
    )
    const { apiClient } = await import('@/api/client')

    await expect(apiClient.Get('/malformed-response')).rejects.toThrow('服务器响应格式错误')
  })
})
