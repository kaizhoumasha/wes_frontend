import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import RuntimeSceneDeviceFlow from '@/components/runtime/shared/RuntimeSceneDeviceFlow.vue'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'
import {
  COMPACT_LAYOUT_CONFIG,
  DEFAULT_LAYOUT_CONFIG,
  makeDeviceKey,
  type LayoutNodeInput
} from '@/utils/runtime-topology'

function createDevice(overrides: Partial<RuntimeSceneDeviceNode> = {}): RuntimeSceneDeviceNode {
  return {
    id: 101,
    deviceCode: 'ARM03',
    deviceName: '三号机械臂',
    deviceRole: 'ARM',
    roleIndex: 3,
    status: 'IDLE',
    maintenanceMode: false,
    currentCommandId: null,
    openCommandCount: 0,
    blockedOutboxCount: 0,
    runtimeHoldCount: 0,
    errorCode: null,
    ...overrides
  }
}

function mountFlow(props: InstanceType<typeof RuntimeSceneDeviceFlow>['$props']) {
  return mount(RuntimeSceneDeviceFlow, { props })
}

/**
 * jsdom 默认 HTMLCanvasElement.getBoundingClientRect() 返回全 0，会让
 * canvas hit-test 永远失败。给 canvas 一个固定矩形，clientX/Y 才能映射到
 * CSS 坐标系，让测试点落在 layout 节点 AABB 内。
 */
function mockCanvasBoundingRect(width: number, height: number): () => void {
  const original = HTMLCanvasElement.prototype.getBoundingClientRect
  HTMLCanvasElement.prototype.getBoundingClientRect = function () {
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      toJSON: () => ({})
    }
  }
  return () => {
    HTMLCanvasElement.prototype.getBoundingClientRect = original
  }
}

function mockElementBoundingRect(width: number, height: number): () => void {
  const original = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function () {
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      toJSON: () => ({})
    }
  }
  return () => {
    Element.prototype.getBoundingClientRect = original
  }
}

function mockMutableElementBoundingRect(size: { width: number; height: number }): () => void {
  const original = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function () {
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: size.width,
      bottom: size.height,
      width: size.width,
      height: size.height,
      toJSON: () => ({})
    }
  }
  return () => {
    Element.prototype.getBoundingClientRect = original
  }
}

interface CanvasDrawSnapshot {
  text: string
  fillStyle: string | CanvasGradient | CanvasPattern
  strokeStyle: string | CanvasGradient | CanvasPattern
}

class MockPath2D {
  constructor(readonly path: string) {}
}

function mockCanvasContext(
  onClearRect?: (canvas: HTMLCanvasElement) => void,
  onFillText?: (snapshot: CanvasDrawSnapshot) => void,
  onStroke?: (path?: Path2D) => void
): () => void {
  const original = HTMLCanvasElement.prototype.getContext
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value(this: HTMLCanvasElement, contextId: string) {
      if (contextId !== '2d') return null
      const context = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        lineDashOffset: 0,
        globalAlpha: 1,
        font: '',
        textBaseline: 'top',
        shadowColor: '',
        shadowBlur: 0
      }
      return {
        canvas: this,
        save: () => undefined,
        restore: () => undefined,
        setTransform: () => undefined,
        clearRect: () => onClearRect?.(this),
        beginPath: () => undefined,
        closePath: () => undefined,
        moveTo: () => undefined,
        lineTo: () => undefined,
        arc: () => undefined,
        arcTo: () => undefined,
        fill: () => undefined,
        stroke: (path?: Path2D) => onStroke?.(path),
        fillText: (text: string) => {
          onFillText?.({
            text,
            fillStyle: context.fillStyle,
            strokeStyle: context.strokeStyle
          })
        },
        measureText: (text: string) => ({ width: text.length * 8 }),
        setLineDash: () => undefined,
        get fillStyle() {
          return context.fillStyle
        },
        set fillStyle(value) {
          context.fillStyle = value
        },
        get strokeStyle() {
          return context.strokeStyle
        },
        set strokeStyle(value) {
          context.strokeStyle = value
        },
        get lineWidth() {
          return context.lineWidth
        },
        set lineWidth(value) {
          context.lineWidth = value
        },
        get lineDashOffset() {
          return context.lineDashOffset
        },
        set lineDashOffset(value) {
          context.lineDashOffset = value
        },
        get globalAlpha() {
          return context.globalAlpha
        },
        set globalAlpha(value) {
          context.globalAlpha = value
        },
        get font() {
          return context.font
        },
        set font(value) {
          context.font = value
        },
        get textBaseline() {
          return context.textBaseline
        },
        set textBaseline(value) {
          context.textBaseline = value
        },
        get shadowColor() {
          return context.shadowColor
        },
        set shadowColor(value) {
          context.shadowColor = value
        },
        get shadowBlur() {
          return context.shadowBlur
        },
        set shadowBlur(value) {
          context.shadowBlur = value
        }
      } as unknown as CanvasRenderingContext2D
    }
  })
  return () => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: original
    })
  }
}

async function capturePaintedDeviceText(
  overrides: Partial<RuntimeSceneDeviceNode>
): Promise<CanvasDrawSnapshot[]> {
  const fillTextCalls: CanvasDrawSnapshot[] = []
  const restoreRect = mockElementBoundingRect(640, 360)
  const restoreContext = mockCanvasContext(undefined, snapshot => {
    fillTextCalls.push(snapshot)
  })
  try {
    mountFlow({
      devices: [
        createDevice({
          id: 421,
          roleIndex: 0,
          errorCode: null,
          runtimeHoldCount: 0,
          blockedOutboxCount: 0,
          currentCommandId: null,
          ...overrides
        })
      ]
    })
    await nextTick()
    return fillTextCalls
  } finally {
    restoreContext()
    restoreRect()
  }
}

function expectStatusLabel(
  fillTextCalls: CanvasDrawSnapshot[],
  label: string,
  strokeStyle: string
): void {
  const statusLabel = fillTextCalls.find(call => call.text === label)
  expect(statusLabel).toBeDefined()
  expect(statusLabel?.fillStyle).toBe('#0b1220')
  expect(statusLabel?.strokeStyle).toBe(strokeStyle)
  expect(fillTextCalls.some(call => call.text === '空闲')).toBe(false)
}

describe('RuntimeSceneDeviceFlow (canvas)', () => {
  beforeEach(() => {
    // rAF 在 jsdom 中默认不存在，补一个 mock 防止 paint 循环崩溃。
    if (typeof globalThis.requestAnimationFrame !== 'function') {
      globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
        setTimeout(() => cb(Date.now()), 16) as unknown as number) as typeof globalThis.requestAnimationFrame
      globalThis.cancelAnimationFrame = ((id: number) => clearTimeout(id)) as typeof globalThis.cancelAnimationFrame
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the empty state when no devices are provided', () => {
    const wrapper = mountFlow({ devices: [] })
    expect(wrapper.find('[data-test="runtime-scene-device-flow-empty"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="runtime-scene-device-flow-canvas"]').exists()).toBe(false)
  })

  it('renders a single canvas element with HiDPI-scaled physical pixels', () => {
    const wrapper = mountFlow({
      devices: [createDevice(), createDevice({ id: 102 })]
    })
    const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')
    expect(canvas.exists()).toBe(true)
    // CSS size 现在是 100% × 100%（fit-to-container），物理像素由 ResizeObserver
    // 注入——这里只断言 canvas 元素存在即可。
    const style = canvas.attributes('style') ?? ''
    expect(style).toMatch(/width:\s*100%/)
    expect(style).toMatch(/height:\s*100%/)
  })

  it('sizes the canvas backing store before first paint after measuring the container', async () => {
    const clearSizes: string[] = []
    const restoreRect = mockElementBoundingRect(640, 360)
    const restoreContext = mockCanvasContext(canvas => {
      clearSizes.push(`${canvas.width}x${canvas.height}`)
    })
    try {
      mountFlow({
        devices: [createDevice({ id: 401, roleIndex: 0 })]
      })
      await nextTick()
      expect(clearSizes[0]).toBe('640x360')
    } finally {
      restoreContext()
      restoreRect()
    }
  })

  it('resizes the canvas backing store before repaint when the rendered box changes', async () => {
    const size = { width: 640, height: 360 }
    const clearSizes: string[] = []
    const restoreRect = mockMutableElementBoundingRect(size)
    const restoreContext = mockCanvasContext(canvas => {
      clearSizes.push(`${canvas.width}x${canvas.height}`)
    })
    try {
      const wrapper = mountFlow({
        devices: [createDevice({ id: 411, roleIndex: 0 })]
      })
      await nextTick()
      size.width = 320
      size.height = 180
      await wrapper.setProps({
        devices: [createDevice({ id: 412, roleIndex: 0 })]
      })
      expect(clearSizes.at(-1)).toBe('320x180')
    } finally {
      restoreContext()
      restoreRect()
    }
  })

  it('rebuilds a cached edge path when the same edge id receives new geometry', async () => {
    const strokedPaths: Array<MockPath2D | undefined> = []
    const originalPath2D = globalThis.Path2D
    globalThis.Path2D = MockPath2D as unknown as typeof Path2D
    const restoreRect = mockElementBoundingRect(640, 360)
    const restoreContext = mockCanvasContext(
      undefined,
      undefined,
      path => strokedPaths.push(path as MockPath2D | undefined)
    )

    try {
      const wrapper = mountFlow({
        devices: [createDevice({ id: 101 }), createDevice({ id: 102 })],
        explicitNodes: [
          { kind: 'device', device: createDevice({ id: 101 }) },
          { kind: 'device', device: createDevice({ id: 102 }) }
        ],
        explicitEdges: [
          {
            fromKey: makeDeviceKey(101),
            toKey: makeDeviceKey(102),
            type: 'MATERIAL_FLOW'
          }
        ]
      })
      await nextTick()

      const firstStroke = strokedPaths.find(path => path?.path)
      expect(firstStroke).toBeDefined()

      await wrapper.setProps({
        explicitNodes: [
          { kind: 'device', device: createDevice({ id: 100 }) },
          { kind: 'device', device: createDevice({ id: 101 }) },
          { kind: 'device', device: createDevice({ id: 102 }) }
        ],
        explicitEdges: [
          {
            fromKey: makeDeviceKey(101),
            toKey: makeDeviceKey(102),
            type: 'MATERIAL_FLOW'
          }
        ]
      })
      await nextTick()

      const updatedStroke = strokedPaths
        .slice()
        .reverse()
        .find(path => path?.path)
      expect(updatedStroke).toBeDefined()
      expect(updatedStroke?.path).not.toBe(firstStroke?.path)
      expect(updatedStroke).not.toBe(firstStroke)
    } finally {
      restoreContext()
      restoreRect()
      if (originalPath2D) {
        globalThis.Path2D = originalPath2D
      } else {
        Reflect.deleteProperty(globalThis, 'Path2D')
      }
    }
  })

  it.each([
    ['ERROR', '#dc2626'],
    ['OFFLINE', '#dc2626'],
    ['STOPPED', '#eab308'],
    ['WAITING', '#eab308'],
    ['MAINTENANCE', '#06b6d4']
  ])('paints %s status-only devices as non-idle shared-tone signals', async (status, strokeStyle) => {
    const fillTextCalls = await capturePaintedDeviceText({ status })
    expectStatusLabel(fillTextCalls, status, strokeStyle)
  })

  it('prioritizes blocked outbox warning before status danger', async () => {
    const fillTextCalls = await capturePaintedDeviceText({
      status: 'ERROR',
      blockedOutboxCount: 2
    })

    expectStatusLabel(fillTextCalls, '等待设备空闲', '#eab308')
    expect(fillTextCalls.some(call => call.text === 'ERROR')).toBe(false)
  })

  it('prioritizes current command primary before status danger', async () => {
    const fillTextCalls = await capturePaintedDeviceText({
      status: 'ERROR',
      currentCommandId: 9001
    })

    expectStatusLabel(fillTextCalls, '执行中', '#3b82f6')
    expect(fillTextCalls.some(call => call.text === 'ERROR')).toBe(false)
  })

  it('emits select with the device id when a device is clicked', async () => {
    const restoreRect = mockCanvasBoundingRect(2000, 2000)
    try {
      const wrapper = mountFlow({
        devices: [createDevice({ id: 501, roleIndex: 0 })]
      })
      const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')
      await canvas.trigger('click', {
        clientX: DEFAULT_LAYOUT_CONFIG.paddingX + 24,
        clientY: DEFAULT_LAYOUT_CONFIG.paddingY + 24
      })
      const selects = wrapper.emitted('select')
      expect(selects).toBeDefined()
      expect(selects![0]).toEqual([501])
    } finally {
      restoreRect()
    }
  })

  it('does not emit select from the synthetic click after dragging the canvas', async () => {
    const restoreRect = mockCanvasBoundingRect(2000, 2000)
    try {
      const wrapper = mountFlow({
        devices: [createDevice({ id: 502, roleIndex: 0 })]
      })
      const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')

      await canvas.trigger('mousedown', { button: 0, clientX: 40, clientY: 40 })
      await canvas.trigger('mousemove', { clientX: 72, clientY: 40 })
      await canvas.trigger('mouseup', { clientX: 72, clientY: 40 })
      await canvas.trigger('click', {
        clientX: DEFAULT_LAYOUT_CONFIG.paddingX + 24,
        clientY: DEFAULT_LAYOUT_CONFIG.paddingY + 24
      })

      expect(wrapper.emitted('select')).toBeUndefined()
      expect(wrapper.emitted('selectRackPosition')).toBeUndefined()
    } finally {
      restoreRect()
    }
  })

  it('does not hit a compact device outside the active compact node width', async () => {
    const restoreRect = mockCanvasBoundingRect(2000, 2000)
    try {
      const wrapper = mountFlow({
        compact: true,
        devices: [createDevice({ id: 511, roleIndex: 0 })]
      })
      const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')
      // Compact layout places the first node at (16, 16) with width 120.
      // This point is outside compact width but inside the old fixed 220px hitbox.
      await canvas.trigger('click', { clientX: 150, clientY: 40 })
      expect(wrapper.emitted('select')).toBeUndefined()
    } finally {
      restoreRect()
    }
  })

  it('emits sendEvent on dblclick of a device', async () => {
    const restoreRect = mockCanvasBoundingRect(2000, 2000)
    try {
      const wrapper = mountFlow({
        devices: [createDevice({ id: 601, roleIndex: 0 })]
      })
      const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')
      await canvas.trigger('dblclick', { clientX: 134, clientY: 64 })
      const events = wrapper.emitted('sendEvent')
      expect(events).toBeDefined()
      expect(events![0]).toEqual([601])
    } finally {
      restoreRect()
    }
  })

  it('emits showContextMenu with client coords on contextmenu of a device', async () => {
    const restoreRect = mockCanvasBoundingRect(2000, 2000)
    try {
      const wrapper = mountFlow({
        devices: [createDevice({ id: 701, roleIndex: 0 })]
      })
      const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')
      const clientX = DEFAULT_LAYOUT_CONFIG.paddingX + 26
      const clientY = DEFAULT_LAYOUT_CONFIG.paddingY + 26
      await canvas.trigger('contextmenu', { clientX, clientY })
      const events = wrapper.emitted('showContextMenu')
      expect(events).toBeDefined()
      expect(events![0][0]).toMatchObject({ deviceId: 701 })
      expect(events![0][0]).toMatchObject({ x: clientX, y: clientY })
    } finally {
      restoreRect()
    }
  })

  it('emits selectRackPosition when a rack-position node is clicked', async () => {
    const restoreRect = mockCanvasBoundingRect(2000, 2000)
    try {
      const explicitNodes: LayoutNodeInput[] = [
        { kind: 'rack_position', code: 'SINGLE_LAYER_A', label: 'SINGLE_LAYER_A' }
      ]
      const wrapper = mountFlow({
        devices: [],
        explicitNodes
      })
      const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')
      await canvas.trigger('click', {
        clientX: DEFAULT_LAYOUT_CONFIG.paddingX + 24,
        clientY: DEFAULT_LAYOUT_CONFIG.paddingY + 24
      })
      const events = wrapper.emitted('selectRackPosition')
      expect(events).toBeDefined()
      expect(events![0]).toEqual(['SINGLE_LAYER_A'])
    } finally {
      restoreRect()
    }
  })

  it('does not hit a compact rack-position outside the active compact node width', async () => {
    const restoreRect = mockCanvasBoundingRect(2000, 2000)
    try {
      const explicitNodes: LayoutNodeInput[] = [
        { kind: 'rack_position', code: 'COMPACT_RACK_A', label: 'COMPACT_RACK_A' }
      ]
      const wrapper = mountFlow({
        compact: true,
        devices: [],
        explicitNodes
      })
      const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')
      await canvas.trigger('click', {
        clientX: COMPACT_LAYOUT_CONFIG.paddingX + COMPACT_LAYOUT_CONFIG.nodeWidth + 14,
        clientY: COMPACT_LAYOUT_CONFIG.paddingY + 24
      })
      expect(wrapper.emitted('selectRackPosition')).toBeUndefined()
    } finally {
      restoreRect()
    }
  })

  it('does not emit select when the click misses any node', async () => {
    const restoreRect = mockCanvasBoundingRect(2000, 2000)
    try {
      const wrapper = mountFlow({
        devices: [createDevice({ id: 901, roleIndex: 0 })]
      })
      const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')
      // Click on the very top-left corner — should miss the device rect.
      await canvas.trigger('click', { clientX: 1, clientY: 1 })
      expect(wrapper.emitted('select')).toBeUndefined()
    } finally {
      restoreRect()
    }
  })
})
