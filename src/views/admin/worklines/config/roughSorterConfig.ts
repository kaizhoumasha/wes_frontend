import { z } from 'zod'

export const ROUGH_SORTER_DEVICE_ROLES = [
  'MEASUREMENT_DEVICE',
  'TRANSFER_DEVICE',
  'PLACEMENT_DEVICE'
] as const

const requiredText = z.string().trim().min(1)
const positiveInteger = z.number().int().positive()

const DeviceContractSchema = z
  .object({
    ecs_version: requiredText,
    gateway_version: requiredText,
    device_model: requiredText,
    firmware_version: requiredText,
    status_max_age_ms: positiveInteger,
    command_timeout_ms: positiveInteger,
    time_source: requiredText,
    allowed_clock_skew_ms: positiveInteger,
    callback_retry_window_ms: positiveInteger,
    evidence_retention_days: positiveInteger
  })
  .strict()

const PositionBindingsSchema = z
  .object({
    MEASUREMENT_POSITION: z.string().trim().min(1).max(120),
    PIPELINE_INLET: z.string().trim().min(1).max(120),
    PIPELINE_OUTLET: z.string().trim().min(1).max(120),
    NG_POSITION: z.string().trim().min(1).max(120)
  })
  .strict()
  .superRefine((bindings, context) => {
    const values = Object.values(bindings)
    if (new Set(values).size !== values.length) {
      context.addIssue({
        code: 'custom',
        message: '四个位置绑定不能重复',
        path: ['NG_POSITION']
      })
    }
  })

export const RoughSorterConfigSchema = z
  .object({
    device_contracts: z
      .object({
        MEASUREMENT_DEVICE: DeviceContractSchema,
        TRANSFER_DEVICE: DeviceContractSchema,
        PLACEMENT_DEVICE: DeviceContractSchema
      })
      .strict(),
    position_bindings: PositionBindingsSchema
  })
  .strict()

export type RoughSorterConfig = z.infer<typeof RoughSorterConfigSchema>

type WorkLineConfig = Record<string, unknown> | undefined

function createEmptyDeviceContract(): RoughSorterConfig['device_contracts']['MEASUREMENT_DEVICE'] {
  return {
    ecs_version: '',
    gateway_version: '',
    device_model: '',
    firmware_version: '',
    status_max_age_ms: 0,
    command_timeout_ms: 0,
    time_source: '',
    allowed_clock_skew_ms: 0,
    callback_retry_window_ms: 0,
    evidence_retention_days: 0
  }
}

export function createEmptyRoughSorterConfig(): RoughSorterConfig {
  return {
    device_contracts: {
      MEASUREMENT_DEVICE: createEmptyDeviceContract(),
      TRANSFER_DEVICE: createEmptyDeviceContract(),
      PLACEMENT_DEVICE: createEmptyDeviceContract()
    },
    position_bindings: {
      MEASUREMENT_POSITION: '',
      PIPELINE_INLET: '',
      PIPELINE_OUTLET: '',
      NG_POSITION: ''
    }
  }
}

export function readRoughSorterConfig(config: WorkLineConfig): RoughSorterConfig {
  const value = config?.rough_sorter
  if (value === undefined) return createEmptyRoughSorterConfig()
  return structuredClone(RoughSorterConfigSchema.parse(value))
}

export function mergeRoughSorterConfig(
  config: WorkLineConfig,
  roughSorter: RoughSorterConfig
): Record<string, unknown> {
  return {
    ...(config ?? {}),
    rough_sorter: RoughSorterConfigSchema.parse(roughSorter)
  }
}
