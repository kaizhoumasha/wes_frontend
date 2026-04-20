/**
 * SSE 会话级状态
 *
 * 与连接生命周期解耦：
 * - 页面内手动断开 / 重连时保留 replay cursor
 * - 登录态结束时显式重置，避免跨会话复用旧游标
 */

let lastEventId: string | null = null

export function getLastSSEEventId(): string | null {
  return lastEventId
}

export function setLastSSEEventId(value: string | null | undefined): void {
  lastEventId = value || null
}

export function resetSSESessionState(): void {
  lastEventId = null
}
