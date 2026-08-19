import { expect, it } from 'vitest'
import {
  RoughSorterConfigSchema,
  createEmptyRoughSorterConfig,
  mergeRoughSorterConfig,
  readRoughSorterConfig
} from '@/views/admin/worklines/config/roughSorterConfig'

function validConfig() {
  const config = createEmptyRoughSorterConfig()
  for (const contract of Object.values(config.device_contracts)) {
    Object.assign(contract, {
      ecs_version: '1.0',
      gateway_version: '1.0',
      device_model: 'MODEL-A',
      firmware_version: 'FW-1',
      status_max_age_ms: 1000,
      command_timeout_ms: 5000,
      time_source: 'PLC',
      allowed_clock_skew_ms: 500,
      callback_retry_window_ms: 30000,
      evidence_retention_days: 30
    })
  }
  Object.assign(config.position_bindings, {
    MEASUREMENT_POSITION: 'MEASURE-01',
    PIPELINE_INLET: 'INLET-01',
    PIPELINE_OUTLET: 'OUTLET-01',
    NG_POSITION: 'NG-01'
  })
  return config
}

it('accepts only the three device roles and four unique position bindings', () => {
  expect(RoughSorterConfigSchema.safeParse(validConfig()).success).toBe(true)

  const duplicate = validConfig()
  duplicate.position_bindings.NG_POSITION = duplicate.position_bindings.PIPELINE_OUTLET
  expect(RoughSorterConfigSchema.safeParse(duplicate).success).toBe(false)

  expect(
    RoughSorterConfigSchema.safeParse({
      ...validConfig(),
      extra: true
    }).success
  ).toBe(false)
})

it('replaces only config.rough_sorter and preserves sibling configuration', () => {
  const roughSorter = validConfig()
  expect(mergeRoughSorterConfig({ owner: 'WES', threshold: 3 }, roughSorter)).toEqual({
    owner: 'WES',
    threshold: 3,
    rough_sorter: roughSorter
  })
})

it('treats an omitted WorkLine config as an empty object without sharing state', () => {
  const first = readRoughSorterConfig(undefined)
  const second = readRoughSorterConfig(undefined)
  first.position_bindings.NG_POSITION = 'CHANGED'

  expect(second.position_bindings.NG_POSITION).toBe('')
  expect(mergeRoughSorterConfig(undefined, validConfig())).toEqual({
    rough_sorter: validConfig()
  })
})

it('returns independent form state for different WorkLines', () => {
  const first = readRoughSorterConfig({ rough_sorter: validConfig() })
  const second = readRoughSorterConfig({ rough_sorter: validConfig() })
  first.position_bindings.NG_POSITION = 'CHANGED'
  expect(second.position_bindings.NG_POSITION).toBe('NG-01')
})

it('rejects an invalid existing rough-sorter config instead of erasing it', () => {
  expect(() =>
    readRoughSorterConfig({
      owner: 'WES',
      rough_sorter: { device_contracts: {} }
    })
  ).toThrow()
})

type MutableConfig = {
  device_contracts: Record<string, Record<string, unknown>>
  position_bindings: Record<string, string>
}

function deviceContract(config: MutableConfig, role: string): Record<string, unknown> {
  const contract = config.device_contracts[role]
  if (!contract) throw new Error(`missing test contract: ${role}`)
  return contract
}

it.each<[string, (config: MutableConfig) => void]>([
  [
    'missing device role',
    config => {
      delete config.device_contracts.TRANSFER_DEVICE
    }
  ],
  [
    'extra device role',
    config => {
      config.device_contracts.EXTRA = deviceContract(config, 'TRANSFER_DEVICE')
    }
  ],
  [
    'missing contract field',
    config => {
      delete deviceContract(config, 'MEASUREMENT_DEVICE').ecs_version
    }
  ],
  [
    'blank contract string',
    config => {
      deviceContract(config, 'MEASUREMENT_DEVICE').ecs_version = ' '
    }
  ],
  [
    'boolean pseudo-integer',
    config => {
      deviceContract(config, 'MEASUREMENT_DEVICE').status_max_age_ms = true
    }
  ],
  [
    'non-positive integer',
    config => {
      deviceContract(config, 'MEASUREMENT_DEVICE').status_max_age_ms = 0
    }
  ],
  [
    'missing position role',
    config => {
      delete config.position_bindings.NG_POSITION
    }
  ],
  [
    'extra position role',
    config => {
      config.position_bindings.EXTRA = 'EXTRA-01'
    }
  ],
  [
    'blank position',
    config => {
      config.position_bindings.NG_POSITION = ' '
    }
  ],
  [
    'overlong position',
    config => {
      config.position_bindings.NG_POSITION = 'x'.repeat(121)
    }
  ],
  [
    'duplicate position',
    config => {
      config.position_bindings.NG_POSITION = config.position_bindings.PIPELINE_OUTLET
    }
  ]
])('rejects %s', (_name, mutate) => {
  const config = structuredClone(validConfig()) as unknown as MutableConfig
  mutate(config)
  expect(RoughSorterConfigSchema.safeParse(config).success).toBe(false)
})
