import { onScopeDispose, ref, watch, type Ref } from 'vue'
import type { DebugRunCreateInput, DebugRunResult } from '@/api/modules/transport'
import { validateTransportDebugRunConfig } from './useTransportDebugRunConfig'

export function nextRoundInput(snapshot: DebugRunResult) {
  if (snapshot.status !== 'COMPLETED') throw new Error('当前轮尚未完成')
  const expected = new Set(
    snapshot.face_groups.flatMap(group => group.bins.map(bin => bin.bin_code))
  )
  const locations = snapshot.returned_bins
  if (!locations || locations.length !== expected.size)
    throw new Error('回架储位结果不完整，已停止接续')
  const seen = new Set<string>()
  const slots = new Set<string>()
  const faceGroups = new Map<string, Array<{ bin_code: string; slot_id: string }>>()
  for (const item of locations) {
    const slotKey = JSON.stringify([item.rack_face, item.slot_id])
    if (
      !expected.has(item.bin_code) ||
      seen.has(item.bin_code) ||
      slots.has(slotKey) ||
      item.rack_id !== snapshot.rack_id ||
      !item.rack_face ||
      !item.slot_id
    ) {
      throw new Error('回架储位结果冲突，已停止接续')
    }
    seen.add(item.bin_code)
    slots.add(slotKey)
    const bins = faceGroups.get(item.rack_face) ?? []
    bins.push({ bin_code: item.bin_code, slot_id: item.slot_id })
    faceGroups.set(item.rack_face, bins)
  }
  const groups = [...faceGroups].map(([face, bins]) => ({ face, bins }))
  const error = validateTransportDebugRunConfig(snapshot.rack_id, groups)
  if (error) throw new Error(`回架储位无法用于下一轮：${error}`)
  return { workline_code: snapshot.workline_code, rack_id: snapshot.rack_id, face_groups: groups }
}

export function useTransportDebugSequence(options: {
  currentRun: Ref<DebugRunResult | null>
  startRun(input: DebugRunCreateInput): Promise<DebugRunResult>
  canStart(): boolean
}) {
  const running = ref(false)
  const launching = ref(false)
  const planned = ref(0)
  const started = ref(0)
  const completed = ref(0)
  const error = ref('')
  const ownedRunId = ref<string | null>(null)
  let generation = 0

  function stop(): void {
    generation += 1
    running.value = false
    ownedRunId.value = null
  }

  async function launch(input: DebugRunCreateInput, token: number): Promise<void> {
    if (token !== generation || !running.value) return
    if (!options.canStart()) {
      error.value = '无启动权限，已停止接续'
      stop()
      return
    }
    launching.value = true
    try {
      const snapshot = await options.startRun(input)
      if (token !== generation) return
      started.value += 1
      ownedRunId.value = snapshot.run_id
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
      stop()
    } finally {
      launching.value = false
    }
  }

  async function start(input: DebugRunCreateInput, rounds: number): Promise<void> {
    if (!Number.isInteger(rounds) || rounds < 1 || rounds > 1000)
      throw new Error('联调轮数必须为 1～1000 的整数')
    if (running.value || launching.value) return
    const token = ++generation
    planned.value = rounds
    started.value = 0
    completed.value = 0
    error.value = ''
    running.value = true
    await launch(input, token)
  }

  watch([() => options.currentRun.value, ownedRunId, launching], async () => {
    const snapshot = options.currentRun.value
    if (!running.value || launching.value || !snapshot || snapshot.run_id !== ownedRunId.value)
      return
    if (snapshot.status === 'FAILED' || snapshot.status === 'ABORTED') {
      error.value = `当前轮 ${snapshot.status}，已停止接续`
      stop()
    } else if (snapshot.status === 'COMPLETED') {
      // 先消费本轮身份，重复SSE/轮询不得再次创建下一轮。
      ownedRunId.value = null
      completed.value += 1
      if (completed.value >= planned.value) {
        stop()
        return
      }
      try {
        await launch(nextRoundInput(snapshot), generation)
      } catch (cause) {
        error.value = cause instanceof Error ? cause.message : String(cause)
        stop()
      }
    }
  })

  window.addEventListener('pagehide', stop)
  onScopeDispose(() => {
    stop()
    window.removeEventListener('pagehide', stop)
  })
  return { running, launching, planned, started, completed, error, start, stop }
}
