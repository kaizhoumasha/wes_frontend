import { computed, ref } from 'vue'
import { rackBinMountsApi, type RackBinMountsItem } from '@/api/modules/rackBinMounts'
import type { DebugRunCreateInput } from '@/api/modules/transport'

export type MountedBin = Pick<
  RackBinMountsItem,
  'rack_code' | 'rack_slot_code' | 'bin_code' | 'mount_status'
>

export interface TransportDebugFaceGroupDraft {
  face: string
  bins: MountedBin[]
}

type MountedBinQuery = NonNullable<Parameters<typeof rackBinMountsApi.query>[0]>

interface MountedBinQueryPort {
  query(options: MountedBinQuery): Promise<{ items: MountedBin[]; total: number }>
}

const DEFAULT_QUERY: MountedBinQueryPort = {
  query: options => rackBinMountsApi.query(options)
}

export async function loadMountedBins(
  api: MountedBinQueryPort = DEFAULT_QUERY,
  pageSize = 100
): Promise<MountedBin[]> {
  const items: MountedBin[] = []
  let offset = 0
  while (true) {
    const page = await api.query({
      filters: {
        couple: 'and',
        conditions: [{ field: 'mount_status', op: 'eq', value: 'MOUNTED' }]
      },
      sort: [
        { field: 'rack_code', order: 'asc' },
        { field: 'rack_slot_code', order: 'asc' }
      ],
      offset,
      limit: pageSize,
      max_depth: 1,
      include_deleted: false
    })
    items.push(...page.items.filter(item => item.mount_status === 'MOUNTED'))
    offset += pageSize
    if (offset >= page.total) break
  }
  return items
}

export function validateTransportDebugRunConfig(
  rackId: string,
  groups: readonly TransportDebugFaceGroupDraft[]
): string | null {
  if (!rackId) return '请选择货架'
  if (groups.length === 0) return '至少配置一个货架面'
  const faces = new Set<string>()
  const binIds = new Set<string>()
  for (const group of groups) {
    if (!group.face.trim() || group.face.includes('\0')) return '面值不能为空或只包含空白'
    if (faces.has(group.face)) return '货架面原始字符串不能重复'
    faces.add(group.face)
    if (group.bins.length < 1 || group.bins.length > 4) return '每个货架面必须选择 1～4 个料箱'
    for (const bin of group.bins) {
      if (bin.rack_code !== rackId || bin.mount_status !== 'MOUNTED') return '只能选择当前货架已挂载料箱'
      if (binIds.has(bin.bin_code)) return '同一料箱不能出现在多个货架面'
      binIds.add(bin.bin_code)
    }
  }
  return null
}

export function buildTransportDebugRunInput(
  rackId: string,
  groups: readonly TransportDebugFaceGroupDraft[]
): DebugRunCreateInput {
  const error = validateTransportDebugRunConfig(rackId, groups)
  if (error) throw new Error(error)
  return {
    rack_id: rackId,
    face_groups: groups.map(group => ({
      face: group.face,
      bins: group.bins.map(bin => ({ bin_id: bin.bin_code, slot_id: bin.rack_slot_code }))
    }))
  }
}

export function buildTransportDebugRunPreview(
  rackId: string,
  groups: readonly TransportDebugFaceGroupDraft[]
): string {
  if (!rackId || groups.length === 0) return ''
  const steps: object[] = []
  groups.forEach((group, index) => {
    if (index === 0) {
      steps.push({
        kind: 'RACK_MOVE', rack_id: rackId,
        source: { kind: 'RACK', location_code: rackId },
        target: { kind: 'RACK_POSITION', location_code: 'KT16' },
        target_face: group.face, rcs_template_id: 'CTU01'
      })
    } else {
      steps.push({
        kind: 'RACK_ROTATE', rack_id: rackId,
        position: { kind: 'RACK', location_code: rackId },
        target_face: group.face, rcs_template_id: 'CTU02'
      })
    }
    steps.push({
      kind: 'BIN_MOVE',
      moves: group.bins.map(bin => ({
        bin_id: bin.bin_code,
        source: { kind: 'RACK_BIN_SLOT', rack_id: rackId, rack_face: group.face, slot_id: bin.rack_slot_code },
        target: { kind: 'HANDOFF_POSITION', location_code: 'CNV0301' }
      }))
    })
    steps.push({ kind: 'SCAN12', bin_ids: group.bins.map(bin => bin.bin_code) })
    steps.push({
      kind: 'BIN_MOVE',
      moves: group.bins.map(bin => ({
        bin_id: bin.bin_code,
        source: { kind: 'HANDOFF_POSITION', location_code: 'CNV0302' },
        target: { kind: 'RACK_BIN_SLOT', rack_id: rackId, rack_face: group.face, slot_id: bin.rack_slot_code }
      }))
    })
  })
  steps.push({
    kind: 'RACK_MOVE', rack_id: rackId,
    source: { kind: 'RACK', location_code: rackId },
    target: { kind: 'ZONE', location_code: 'WH01' },
    target_face: '90', rcs_template_id: 'CTU03'
  })
  return JSON.stringify(steps, null, 2)
}

export function useTransportDebugRunConfig() {
  const mountedBins = ref<MountedBin[]>([])
  const selectedRackId = ref('')
  const groups = ref<TransportDebugFaceGroupDraft[]>([])
  const loading = ref(false)
  const lastError = ref<Error | null>(null)
  const rackIds = computed(() => [...new Set(mountedBins.value.map(bin => bin.rack_code))])
  const rackBins = computed(() => mountedBins.value.filter(bin => bin.rack_code === selectedRackId.value))
  const validationError = computed(() => validateTransportDebugRunConfig(selectedRackId.value, groups.value))
  const preview = computed(() => buildTransportDebugRunPreview(selectedRackId.value, groups.value))

  async function load(): Promise<void> {
    loading.value = true
    lastError.value = null
    try {
      mountedBins.value = await loadMountedBins()
    } catch (error) {
      lastError.value = error instanceof Error ? error : new Error(String(error))
      throw error
    } finally {
      loading.value = false
    }
  }

  function selectRack(rackId: string): void {
    if (selectedRackId.value === rackId) return
    selectedRackId.value = rackId
    groups.value = []
  }

  function addGroup(): void {
    groups.value.push({ face: '', bins: [] })
  }

  function removeGroup(index: number): void {
    groups.value.splice(index, 1)
  }

  return { mountedBins, selectedRackId, groups, loading, lastError, rackIds, rackBins,
    validationError, preview, load, selectRack, addGroup, removeGroup }
}
