import { apiClient, resolveApiBaseUrl } from '@/api/client'
import {
  getAccessToken as getStoredAccessToken,
  refreshAccessToken as refreshStoredAccessToken
} from '@/api/services/token-refresh'

export interface AuthenticatedSseDependencies {
  fetchImpl: typeof fetch
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<string>
}

export interface AuthenticatedSseOptions<TEvent> {
  path: string
  query?: Record<string, unknown>
  signal: AbortSignal
  parseEvent: (eventType: string, payload: unknown) => TEvent | null
  onOpen?: () => void
  onEvent: (event: TEvent) => void
  baseUrl?: string
}

export type AuthenticatedSseConnectionState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTED'

interface AuthenticatedSseConnectionAttempt {
  signal: AbortSignal
  onOpen: () => void
}

export interface AuthenticatedSseConnectionOptions {
  connector: (attempt: AuthenticatedSseConnectionAttempt) => Promise<void>
  initialRetryDelayMs?: number
  onStateChange: (state: AuthenticatedSseConnectionState) => void
  onError?: (error: Error | null) => void
  onGap?: () => void
}

export interface AuthenticatedSseConnection {
  connect(): void
  reconnect(): void
  disconnect(): void
}

const DEFAULT_DEPENDENCIES: AuthenticatedSseDependencies = {
  fetchImpl: (...args) => globalThis.fetch(...args),
  getAccessToken: getStoredAccessToken,
  refreshAccessToken: () => refreshStoredAccessToken(apiClient)
}
const MAX_INCOMPLETE_FRAME_BYTES = 512 * 1024

export class AuthenticatedSseHttpError extends Error {
  constructor(public readonly status: number) {
    super(`SSE 连接失败（HTTP ${status}）`)
    this.name = 'AuthenticatedSseHttpError'
  }
}

export class AuthenticatedSseProtocolError extends Error {
  constructor(message = 'SSE 未完成帧超过 512 KiB') {
    super(message)
    this.name = 'AuthenticatedSseProtocolError'
  }
}

export async function consumeAuthenticatedSse<TEvent>(
  options: AuthenticatedSseOptions<TEvent>,
  dependencies: AuthenticatedSseDependencies = DEFAULT_DEPENDENCIES
): Promise<void> {
  const url = buildStreamUrl(options.baseUrl ?? resolveApiBaseUrl(), options.path, options.query)
  let response = await requestStream(
    url,
    options.signal,
    dependencies,
    dependencies.getAccessToken()
  )

  if (response.status === 401 && !options.signal.aborted) {
    await cancelResponseBody(response)
    if (options.signal.aborted) throw new DOMException('Aborted', 'AbortError')
    response = await requestStream(
      url,
      options.signal,
      dependencies,
      await dependencies.refreshAccessToken()
    )
  }

  if (!response.ok) {
    await cancelResponseBody(response)
    throw new AuthenticatedSseHttpError(response.status)
  }
  const mediaType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
  if (mediaType !== 'text/event-stream') {
    await cancelResponseBody(response)
    throw new AuthenticatedSseProtocolError('SSE 响应 Content-Type 必须是 text/event-stream')
  }
  if (!response.body) throw new Error('SSE 响应缺少可读流')

  await readFrames(response.body, options.parseEvent, options.onEvent, options.onOpen)
}

const MAX_RETRY_DELAY_MS = 10_000

export function createAuthenticatedSseConnection(
  options: AuthenticatedSseConnectionOptions
): AuthenticatedSseConnection {
  const initialRetryDelayMs = options.initialRetryDelayMs ?? 500
  let controller: AbortController | null = null
  let generation = 0

  function stopCurrentRun(): void {
    generation += 1
    controller?.abort()
    controller = null
  }

  function connect(): void {
    stopCurrentRun()
    const currentGeneration = ++generation
    controller = new AbortController()
    options.onStateChange('CONNECTING')
    options.onError?.(null)
    void runConnectionLoop(currentGeneration, controller)
  }

  function disconnect(): void {
    stopCurrentRun()
    options.onStateChange('DISCONNECTED')
  }

  async function runConnectionLoop(
    currentGeneration: number,
    activeController: AbortController
  ): Promise<void> {
    let hasOpened = false
    let retryDelayMs = initialRetryDelayMs

    while (currentGeneration === generation && !activeController.signal.aborted) {
      let openedThisAttempt = false
      try {
        await options.connector({
          signal: activeController.signal,
          onOpen: () => {
            openedThisAttempt = true
            options.onStateChange(hasOpened ? 'RECONNECTED' : 'CONNECTED')
            hasOpened = true
            options.onError?.(null)
            retryDelayMs = initialRetryDelayMs
          }
        })
      } catch (error) {
        if (activeController.signal.aborted || currentGeneration !== generation) return
        const normalizedError = error instanceof Error ? error : new Error(String(error))
        options.onError?.(normalizedError)
        if (
          normalizedError instanceof AuthenticatedSseHttpError &&
          (normalizedError.status === 401 || normalizedError.status === 403)
        ) {
          options.onStateChange('DISCONNECTED')
          return
        }
      }

      if (activeController.signal.aborted || currentGeneration !== generation) return
      if (openedThisAttempt) options.onGap?.()
      options.onStateChange('CONNECTING')

      try {
        await waitForRetry(retryDelayMs, activeController.signal)
      } catch {
        return
      }
      retryDelayMs = Math.min(retryDelayMs * 2, MAX_RETRY_DELAY_MS)
    }
  }

  return { connect, reconnect: connect, disconnect }
}

function waitForRetry(delayMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, delayMs)
    const abort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', abort, { once: true })
  })
}

async function cancelResponseBody(response: Response): Promise<void> {
  await response.body?.cancel().catch(() => undefined)
}

function buildStreamUrl(baseUrl: string, path: string, query?: Record<string, unknown>): string {
  const url = new URL(path, baseUrl)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== '')
      url.searchParams.set(key, String(value))
  }
  return url.toString()
}

function requestStream(
  url: string,
  signal: AbortSignal,
  dependencies: AuthenticatedSseDependencies,
  token: string | null
): Promise<Response> {
  return dependencies.fetchImpl(url, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    credentials: 'include',
    cache: 'no-store',
    signal
  })
}

async function readFrames<TEvent>(
  stream: ReadableStream<Uint8Array>,
  parseEvent: (eventType: string, payload: unknown) => TEvent | null,
  onEvent: (event: TEvent) => void,
  onOpen?: () => void
): Promise<void> {
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const encoder = new TextEncoder()
  let buffer = ''
  let bufferedBytes = 0
  let opened = false
  const markOpen = () => {
    if (opened) return
    opened = true
    onOpen?.()
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      bufferedBytes += value?.byteLength ?? 0
      let decodedChunk = ''
      try {
        decodedChunk = decoder.decode(value, { stream: !done })
      } catch {
        await cancelWithProtocolError(
          reader,
          new AuthenticatedSseProtocolError('SSE 包含非法 UTF-8')
        )
      }
      const decodedBuffer = buffer + decodedChunk
      const remaining = dispatchCompleteFrames(decodedBuffer, parseEvent, onEvent, markOpen)
      if (remaining.length !== decodedBuffer.length) {
        bufferedBytes -= encoder.encode(
          decodedBuffer.slice(0, decodedBuffer.length - remaining.length)
        ).byteLength
      }
      buffer = remaining
      if (bufferedBytes > MAX_INCOMPLETE_FRAME_BYTES) {
        await cancelWithProtocolError(reader, new AuthenticatedSseProtocolError())
      }
      if (done) return
    }
  } finally {
    reader.releaseLock()
  }
}

async function cancelWithProtocolError(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  error: AuthenticatedSseProtocolError
): Promise<never> {
  try {
    await reader.cancel(error)
  } catch {
    // 保留原始协议错误。
  }
  throw error
}

function dispatchCompleteFrames<TEvent>(
  buffer: string,
  parseEvent: (eventType: string, payload: unknown) => TEvent | null,
  onEvent: (event: TEvent) => void,
  onFrame: () => void
): string {
  let remaining = buffer
  while (true) {
    const boundary = remaining.match(/\r?\n\r?\n/)
    if (!boundary?.index && boundary?.index !== 0) return remaining
    const frame = remaining.slice(0, boundary.index)
    remaining = remaining.slice(boundary.index + boundary[0].length)
    onFrame()
    dispatchFrame(frame, parseEvent, onEvent)
  }
}

function dispatchFrame<TEvent>(
  frame: string,
  parseEvent: (eventType: string, payload: unknown) => TEvent | null,
  onEvent: (event: TEvent) => void
): void {
  let eventType = ''
  const dataLines: string[] = []
  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith(':')) continue
    const separator = line.indexOf(':')
    const field = separator === -1 ? line : line.slice(0, separator)
    const rawValue = separator === -1 ? '' : line.slice(separator + 1)
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue
    if (field === 'event') eventType = value
    else if (field === 'data') dataLines.push(value)
  }
  if (!dataLines.length) return
  try {
    const event = parseEvent(eventType, JSON.parse(dataLines.join('\n')))
    if (event) onEvent(event)
  } catch {
    // 非法 JSON 或领域 payload 不进入业务状态机。
  }
}
