import { computed, ref } from 'vue'
import type { DebugRunCreateInput } from '@/api/modules/transport'

export interface TransportDebugBinDraft {
  bin_code: string
  slot_id: string
}

export interface TransportDebugFaceGroupDraft {
  face: string
  bins: TransportDebugBinDraft[]
}

export function validateTransportDebugRunConfig(
  rackId: string,
  groups: readonly TransportDebugFaceGroupDraft[]
): string | null {
  if (!rackId.trim()) return '货架编码不能为空'
  if (groups.length === 0) return '至少配置一个货架面'
  const faces = new Set<string>()
  const binCodes = new Set<string>()
  for (const group of groups) {
    if (!group.face.trim() || group.face.includes('\0')) return '面值不能为空或只包含空白'
    if (faces.has(group.face)) return '货架面原始字符串不能重复'
    faces.add(group.face)
    if (group.bins.length < 1 || group.bins.length > 4) return '每个货架面必须录入 1～4 个料箱'
    for (const bin of group.bins) {
      const binCode = bin.bin_code.trim()
      if (!binCode) return '料箱编码不能为空'
      if (!bin.slot_id.trim()) return '原货架槽位不能为空'
      if (binCodes.has(binCode)) return '同一料箱不能出现在多个货架面'
      binCodes.add(binCode)
    }
  }
  return null
}

export function buildTransportDebugRunInput(
  rackId: string,
  groups: readonly TransportDebugFaceGroupDraft[],
  worklineCode: string
): DebugRunCreateInput {
  const error = validateTransportDebugRunConfig(rackId, groups)
  if (error) throw new Error(error)
  if (!worklineCode.trim()) throw new Error('工作线编码不能为空')
  return {
    workline_code: worklineCode.trim(),
    rack_id: rackId.trim(),
    face_groups: groups.map(group => ({
      face: group.face,
      bins: group.bins.map(bin => ({
        bin_code: bin.bin_code.trim(),
        slot_id: bin.slot_id.trim()
      }))
    }))
  }
}

export function buildTransportDebugRunPreview(
  rackId: string,
  groups: readonly TransportDebugFaceGroupDraft[],
  worklineCode: string
): string {
  if (validateTransportDebugRunConfig(rackId, groups) || !worklineCode.trim()) return ''
  const input = buildTransportDebugRunInput(rackId, groups, worklineCode)
  const steps: object[] = []
  input.face_groups.forEach((group, index) => {
    if (index === 0) {
      steps.push({
        kind: 'RACK_MOVE',
        rack_id: input.rack_id,
        source: { kind: 'RACK', location_code: input.rack_id },
        target: { kind: 'RACK_POSITION', location_code: 'KT16' },
        target_face: group.face,
        rcs_template_id: 'CTU01'
      })
    } else {
      steps.push({
        kind: 'RACK_ROTATE',
        rack_id: input.rack_id,
        position: { kind: 'RACK', location_code: input.rack_id },
        target_face: group.face,
        rcs_template_id: 'CTU02'
      })
    }
    steps.push({
      kind: 'BIN_MOVE',
      moves: group.bins.map(bin => ({
        bin_code: bin.bin_code,
        source: {
          kind: 'RACK_BIN_SLOT',
          rack_id: input.rack_id,
          rack_face: group.face,
          slot_id: bin.slot_id
        },
        target: { kind: 'HANDOFF_POSITION', location_code: 'CNV0301' }
      }))
    })
    steps.push({ kind: 'SCAN12', bin_codes: group.bins.map(bin => bin.bin_code) })
    steps.push({
      operation: 'outbound.bin.return_batch@v1',
      workline_code: worklineCode.trim(),
      rack_id: input.rack_id,
      rack_face: group.face,
      return_candidates: group.bins.map((bin, index) => ({
        sequence_no: index + 1,
        bin_code: bin.bin_code,
        source: { type: 'HANDOFF_POSITION', location_code: 'CNV0302' }
      })),
      next: '优先使用 WMS 分配；NO_BATCH 按已成功出库记录退回原槽位；每箱成功后保存实际槽位'
    })
  })
  steps.push({
    kind: 'RACK_MOVE',
    rack_id: input.rack_id,
    source: { kind: 'RACK', location_code: input.rack_id },
    target: { kind: 'ZONE', location_code: 'WH01' },
    rcs_template_id: 'CTU03'
  })
  return JSON.stringify(steps, null, 2)
}

export function useTransportDebugRunConfig() {
  const worklineCode = ref('KT16')
  const rackId = ref('510056')
  const groups = ref<TransportDebugFaceGroupDraft[]>([
    {
      face: '90',
      bins: [
        { bin_code: 'A000001922', slot_id: '510056A3F2C101' },
        { bin_code: 'A000002653', slot_id: '510056A2F2C101' }
      ]
    },
    {
      face: '270',
      bins: [
        { bin_code: 'A000002704', slot_id: '510056B5F1C101' },
        { bin_code: 'A000000770', slot_id: '510056B4F1C101' },
        { bin_code: 'A000000940', slot_id: '510056B3F1C101' }
      ]
    }
  ])
  const validationError = computed(() =>
    !worklineCode.value.trim()
      ? '工作线编码不能为空'
      : validateTransportDebugRunConfig(rackId.value, groups.value)
  )
  const preview = computed(() =>
    buildTransportDebugRunPreview(rackId.value, groups.value, worklineCode.value)
  )

  function addGroup(): void {
    groups.value.push({ face: '', bins: [{ bin_code: '', slot_id: '' }] })
  }

  function removeGroup(index: number): void {
    groups.value.splice(index, 1)
  }

  function addBin(groupIndex: number): void {
    const group = groups.value[groupIndex]
    if (group && group.bins.length < 4) group.bins.push({ bin_code: '', slot_id: '' })
  }

  function removeBin(groupIndex: number, binIndex: number): void {
    const group = groups.value[groupIndex]
    if (group && group.bins.length > 1) group.bins.splice(binIndex, 1)
  }

  return {
    worklineCode,
    rackId,
    groups,
    validationError,
    preview,
    addGroup,
    removeGroup,
    addBin,
    removeBin
  }
}
