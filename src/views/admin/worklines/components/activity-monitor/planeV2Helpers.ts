/**
 * Plane v2 纯函数辅助：轮询退避、资源引用匹配、状态展示映射。
 * 与 Vue 无关，便于单测覆盖非平凡逻辑（详见同目录 planeV2Helpers.test.ts）。
 */
import type {
  ConflictState,
  PlaneActiveObjectView,
  PlaneResourceRef,
  PlaneResourceState,
  SceneBindingState
} from '@/api/types/plane-v2'

/** 失败退避序列：15s → 30s → 60s → 120s，达到上限后不再增加。健康时固定 15s。 */
const BACKOFF_STEPS_MS = [15_000, 30_000, 60_000, 120_000] as const

/**
 * 依据连续失败次数计算下一次轮询延迟。
 * consecutiveFailures <= 0（健康/刚成功）→ 15s；每多失败一次上探一档，封顶 120s。
 */
export function nextPollDelayMs(consecutiveFailures: number): number {
  if (consecutiveFailures <= 0) return BACKOFF_STEPS_MS[0]
  const index = Math.min(consecutiveFailures - 1, BACKOFF_STEPS_MS.length - 1)
  return BACKOFF_STEPS_MS[index]
}

export function sameResourceRef(
  a: PlaneResourceRef | null | undefined,
  b: PlaneResourceRef | null | undefined
): boolean {
  if (!a || !b) return false
  return a.group === b.group && a.key === b.key
}

/** 选中资源为空时不过滤（返回 true）；否则要求对象的 resource_ref 精确匹配。 */
export function matchesSelectedResource(
  objectRef: PlaneResourceRef | null | undefined,
  selected: PlaneResourceRef | null
): boolean {
  if (!selected) return true
  return sameResourceRef(objectRef, selected)
}

export function findResourceState(
  states: PlaneResourceState[],
  ref: PlaneResourceRef
): PlaneResourceState | undefined {
  return states.find(state => sameResourceRef(state.resource_ref, ref))
}

export function filterActiveObjects(
  objects: PlaneActiveObjectView[],
  filters: {
    selectedResourceRef?: PlaneResourceRef | null
    conflictState?: ConflictState | null
    objectType?: string | null
    unmappedOnly?: boolean
  }
): PlaneActiveObjectView[] {
  return objects.filter(object => {
    if (filters.unmappedOnly && object.resource_ref !== null) return false
    if (
      !filters.unmappedOnly &&
      !matchesSelectedResource(object.resource_ref, filters.selectedResourceRef ?? null)
    )
      return false
    if (filters.conflictState && object.conflict_state !== filters.conflictState) return false
    if (filters.objectType && object.object_type !== filters.objectType) return false
    return true
  })
}

export const BINDING_STATE_LABEL: Record<SceneBindingState, string> = {
  BOUND: '已绑定',
  UNBOUND: '未绑定',
  INVALID: '绑定异常'
}

export const CONFLICT_STATE_LABEL: Record<ConflictState, string> = {
  OK: '正常',
  TRANSIENT: '瞬时冲突',
  RECONCILING: '协调中'
}

export const SOURCE_STATUS_BANNER: Record<string, string | null> = {
  COMPLETE: null,
  PARTIAL: '本次数据部分缺失，仅展示已获取的资源活动',
  FAILED: '动态数据更新失败，以下为最近一次成功数据',
  STALE: '动态数据更新失败，以下为最近一次成功数据'
}
