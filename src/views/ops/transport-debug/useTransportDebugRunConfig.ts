import { computed, ref } from 'vue'
import type { DebugRunCreateInput } from '@/api/modules/transport'

export interface TransportDebugLocations {
  workstation: string
  infeed_position: string
  outfeed_position: string
  scan_device_codes: string[]
}

export function defaultTransportDebugLocations(): TransportDebugLocations {
  return {
    workstation: 'KT16',
    infeed_position: 'CNV0301',
    outfeed_position: 'CNV0302',
    scan_device_codes: ['STATION_SCAN9', 'STATION_SCAN10', 'STATION_SCAN11', 'STATION_SCAN12']
  }
}

function validateLocations(locations: TransportDebugLocations): string | null {
  const values = [
    locations.workstation,
    locations.infeed_position,
    locations.outfeed_position,
    ...locations.scan_device_codes
  ]
  if (values.some(value => !value.trim() || value.trim().length > 100 || value.includes('\0')))
    return '请填写工作区、投料口、出料口和扫码设备编码（1～100 字符）'
  if (
    locations.scan_device_codes.length !== 4 ||
    new Set(locations.scan_device_codes.map(value => value.trim())).size !== 4
  )
    return '请配置四个不同的扫码设备'
  if (locations.infeed_position.trim() === locations.outfeed_position.trim())
    return '投料口和出料口不能相同'
  if (!/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,99}$/.test(locations.outfeed_position.trim()))
    return '出料口编码须以字母或数字开头，且仅含字母、数字、点、下划线、冒号、斜线或连字符'
  return null
}

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
  worklineCode: string,
  locations: TransportDebugLocations = defaultTransportDebugLocations(),
  testMode = false
): DebugRunCreateInput {
  const error = validateLocations(locations) || validateTransportDebugRunConfig(rackId, groups)
  if (error) throw new Error(error)
  if (!worklineCode.trim()) throw new Error('工作线编码不能为空')
  return {
    test_mode: testMode,
    workstation: locations.workstation.trim(),
    infeed_position: locations.infeed_position.trim(),
    outfeed_position: locations.outfeed_position.trim(),
    scan_device_codes: locations.scan_device_codes.map(value => value.trim()),
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
  worklineCode: string,
  locations?: TransportDebugLocations
): string {
  if (
    validateTransportDebugRunConfig(rackId, groups) ||
    !worklineCode.trim() ||
    (locations && validateLocations(locations))
  )
    return ''
  const input = buildTransportDebugRunInput(
    rackId,
    groups,
    worklineCode,
    locations ?? defaultTransportDebugLocations()
  )
  const steps: object[] = []
  input.face_groups.forEach((group, index) => {
    if (index === 0) {
      steps.push({
        kind: 'RACK_MOVE',
        rack_id: input.rack_id,
        source: { kind: 'RACK', location_code: input.rack_id },
        target: { kind: 'RACK_POSITION', location_code: input.workstation },
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
        target: { kind: 'HANDOFF_POSITION', location_code: input.infeed_position }
      }))
    })
    steps.push({
      kind: 'SCAN_COMPLETED',
      device_code: input.scan_device_codes[3],
      bin_codes: group.bins.map(bin => bin.bin_code)
    })
    steps.push({
      operation: 'outbound.bin.return_batch@v1',
      workline_code: worklineCode.trim(),
      rack_id: input.rack_id,
      rack_face: group.face,
      return_candidates: group.bins.map((bin, index) => ({
        sequence_no: index + 1,
        bin_code: bin.bin_code,
        source: { type: 'HANDOFF_POSITION', location_code: input.outfeed_position }
      })),
      next: '优先使用 WMS 分配；NO_BATCH 按已成功出库记录退回原槽位；每箱成功后保存实际槽位'
    })
  })
  steps.push({
    kind: 'RACK_MOVE',
    rack_id: input.rack_id,
    source: { kind: 'RACK', location_code: input.rack_id },
    target: { kind: 'ZONE', location_code: 'WH05' },
    rcs_template_id: 'CTU03'
  })
  return JSON.stringify(steps, null, 2)
}

export function useTransportDebugRunConfig() {
  const testMode = ref(false)
  const worklineCode = ref('KT16')
  const locations = ref(defaultTransportDebugLocations())
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
      : validateLocations(locations.value) ||
        validateTransportDebugRunConfig(rackId.value, groups.value)
  )
  const preview = computed(() =>
    buildTransportDebugRunPreview(rackId.value, groups.value, worklineCode.value, locations.value)
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
    testMode,
    worklineCode,
    locations,
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
