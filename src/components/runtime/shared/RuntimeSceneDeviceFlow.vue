<template>
  <div
    class="runtime-scene-device-flow"
    :class="{ 'is-compact': compact }"
    data-test="runtime-scene-device-flow"
  >
    <canvas
      v-if="hasRenderableNodes"
      ref="canvasRef"
      class="runtime-scene-device-flow__canvas"
      data-test="runtime-scene-device-flow-canvas"
      :style="{
        width: '100%',
        height: '100%'
      }"
      @click.capture="suppressClickIfDragged"
      @click="handleCanvasClick"
      @dblclick="handleCanvasDblClick"
      @contextmenu="handleCanvasContextMenu"
      @wheel.prevent="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    />
    <div
      v-else
      class="runtime-scene-device-flow__empty"
      data-test="runtime-scene-device-flow-empty"
    >
      暂无设备拓扑数据
    </div>

    <div
      v-if="hasRenderableNodes"
      class="runtime-scene-device-flow__zoom-readout"
      data-test="runtime-scene-device-flow-zoom"
    >
      {{ zoomPercent }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTopologyLayout } from '@/composables/useTopologyLayout'
import type { RuntimeTraceDevicePathNode } from '@/types/runtime'
import {
  compactEnumLabel,
  normalizeRuntimeStatus,
  resolveRuntimeTone
} from '@/utils/runtime-display'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'
import {
  COMPACT_LAYOUT_CONFIG,
  DEFAULT_LAYOUT_CONFIG,
  type ExplicitLayoutEdge,
  type LayoutConfig,
  type LayoutEdge,
  type LayoutNode,
  type LayoutNodeInput
} from '@/utils/runtime-topology'

/**
 * Node hit-box size follows the same active layout config used by
 * `useTopologyLayout`, so drawn rectangles and pointer hit-test stay aligned.
 */
const DBCLICK_WINDOW_MS = 300

const props = withDefaults(
  defineProps<{
    devices?: RuntimeSceneDeviceNode[]
    selectedDeviceId?: number | null
    tracePathNodes?: RuntimeTraceDevicePathNode[]
    blockingDeviceId?: number | null
    compact?: boolean
    showRoleDetails?: boolean
    /**
     * Optional explicit topology nodes (devices + rack-positions). When
     * provided together with `explicitEdges`, layout uses manifest-driven
     * mode rather than the device-only fallback. Wired via getters so a
     * late-arriving manifest still triggers layout recomputation.
     */
    explicitNodes?: LayoutNodeInput[]
    explicitEdges?: ExplicitLayoutEdge[]
  }>(),
  {
    devices: () => [],
    selectedDeviceId: null,
    tracePathNodes: () => [],
    blockingDeviceId: null,
    compact: false,
    showRoleDetails: true,
    explicitNodes: undefined,
    explicitEdges: undefined
  }
)

const emit = defineEmits<{
  select: [deviceId: number]
  sendEvent: [deviceId: number]
  showContextMenu: [payload: { deviceId: number; x: number; y: number }]
  selectRackPosition: [rackCode: string]
}>()

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const { layout } = useTopologyLayout(() => props.devices, {
  compact: () => props.compact,
  explicitNodes: () => props.explicitNodes,
  explicitEdges: () => props.explicitEdges
})

const activeLayoutConfig = computed<LayoutConfig>(() =>
  props.compact ? COMPACT_LAYOUT_CONFIG : DEFAULT_LAYOUT_CONFIG
)

const hasRenderableNodes = computed(() => layout.value.nodes.length > 0)

const tracedDeviceIds = computed(() => new Set(props.tracePathNodes.map(n => n.device_id)))

// ---------------------------------------------------------------------------
// Canvas refs
// ---------------------------------------------------------------------------

const canvasRef = ref<HTMLCanvasElement | null>(null)
const dpr = ref(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)
const pathCache = new Map<string, { path: string; path2d: Path2D }>()
let rafId: number | null = null
let lastClickAt = 0
let lastClickTargetKey: string | null = null
// 缓存最近一次 layout 引用：所有 paint/tick/watch 都从这读，避免在 RAF 循环
// 和 watch 回调内反复触发 `useTopologyLayout` 内部 computed 重算。
let activeLayout: import('@/utils/runtime-topology').LayoutResult | null = null
// fit-to-container: canvas 物理尺寸 = device-flow 容器尺寸（× dpr），layout
// 内容按 fitZoom 缩放填满容器。containerSize 由 ResizeObserver 维护。
const containerSize = ref({ width: 0, height: 0 })
const fitZoom = ref(1)
let resizeObserver: ResizeObserver | null = null

// ---------------------------------------------------------------------------
// Viewport: zoom + pan
// ---------------------------------------------------------------------------

const MIN_ZOOM = 0.25
const MAX_ZOOM = 3

const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
let dragOrigin: { x: number; y: number; panX: number; panY: number } | null = null
let didDrag = false
const DRAG_THRESHOLD_PX = 4

const zoomPercent = computed(() => Math.round(zoom.value * fitZoom.value * 100))

function clampZoom(value: number): number {
  if (value < MIN_ZOOM) return MIN_ZOOM
  if (value > MAX_ZOOM) return MAX_ZOOM
  return value
}

function handleWheel(event: WheelEvent): void {
  if (!hasRenderableNodes.value) return
  event.preventDefault()
  // deltaY < 0 = 滚轮向上 → 放大；> 0 = 向下 → 缩小。
  // 单次步长与当前位置有关：zoom 越大，步长越细（贴近 1.0 时每格 ~10%）。
  const direction = event.deltaY < 0 ? 1 : -1
  const stepFactor = event.ctrlKey || event.metaKey ? 0.05 : 0.1
  const target = clampZoom(zoom.value * (1 + direction * stepFactor))
  if (target === zoom.value) return

  // 以鼠标位置为锚点缩放：变换后鼠标下的逻辑点保持不变。
  // 渲染 transform 用 userZoom × fitZoom，hit-test 同理；锚点计算要除以
  // 当前的复合 zoom 才能反算出正确的逻辑坐标。
  const anchor = getCanvasCssPoint(event)
  if (anchor) {
    const totalZoom = zoom.value * fitZoom.value
    if (totalZoom > 0) {
      const logicalX = (anchor.x - panX.value) / totalZoom
      const logicalY = (anchor.y - panY.value) / totalZoom
      // 缩放后逻辑点仍在鼠标下：newPan + newUserZoom * fitZoom * logicalX = anchor.x
      const newTotal = target * fitZoom.value
      panX.value = anchor.x - newTotal * logicalX
      panY.value = anchor.y - newTotal * logicalY
    }
  }
  zoom.value = target
  paint()
}

function handleMouseDown(event: MouseEvent): void {
  if (!hasRenderableNodes.value) return
  if (event.button !== 0) return // 只响应左键拖拽
  dragOrigin = {
    x: event.clientX,
    y: event.clientY,
    panX: panX.value,
    panY: panY.value
  }
  didDrag = false
}

function handleMouseMove(event: MouseEvent): void {
  if (!dragOrigin) return
  const dx = event.clientX - dragOrigin.x
  const dy = event.clientY - dragOrigin.y
  if (!didDrag && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
  didDrag = true
  panX.value = dragOrigin.panX + dx
  panY.value = dragOrigin.panY + dy
  paint()
}

function handleMouseUp(): void {
  // 如果发生拖拽，不让 click 事件触发节点选中（避免误点）。
  dragOrigin = null
}

function suppressClickIfDragged(event: MouseEvent): void {
  if (didDrag) {
    event.stopPropagation()
    event.preventDefault()
  }
}

function signalText(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return `ERROR: ${device.errorCode}`
  if (device.runtimeHoldCount > 0) return '异常待处置'
  if (device.blockedOutboxCount > 0) return '等待设备空闲'
  if (device.currentCommandId) return '执行中'
  const statusLabel = deviceStatusSignalLabel(device.status)
  if (statusLabel) return statusLabel
  return '空闲'
}

function signalClass(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return 'is-danger'
  if (device.runtimeHoldCount > 0) return 'is-danger'
  if (device.blockedOutboxCount > 0) return 'is-warning'
  if (device.currentCommandId) return 'is-primary'
  const statusTone = deviceStatusSignalTone(device.status)
  if (statusTone) return `is-${statusTone}`
  return 'is-idle'
}

function deviceStatusSignalLabel(status: string): string | null {
  return deviceStatusSignalTone(status) ? compactEnumLabel(status) : null
}

function deviceStatusSignalTone(status: string): ReturnType<typeof resolveRuntimeTone> | null {
  const normalized = normalizeRuntimeStatus(status)
  if (!normalized || normalized === '—') return null

  const tone = resolveRuntimeTone(status)
  return tone === 'success' ? null : tone
}

function isBlocking(deviceId: number): boolean {
  return props.blockingDeviceId === deviceId
}

function isTraced(deviceId: number): boolean {
  return tracedDeviceIds.value.has(deviceId)
}

// ---------------------------------------------------------------------------
// Painting
// ---------------------------------------------------------------------------

function statusColor(device: RuntimeSceneDeviceNode): {
  fill: string
  stroke: string
  glow: string
} {
  const tone = signalClass(device)
  switch (tone) {
    case 'is-danger':
      return { fill: 'rgba(220, 38, 38, 0.16)', stroke: '#dc2626', glow: 'rgba(220, 38, 38, 0.5)' }
    case 'is-warning':
      return { fill: 'rgba(234, 179, 8, 0.18)', stroke: '#eab308', glow: 'rgba(234, 179, 8, 0.45)' }
    case 'is-primary':
      return {
        fill: 'rgba(59, 130, 246, 0.18)',
        stroke: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.45)'
      }
    case 'is-info':
      return { fill: 'rgba(6, 182, 212, 0.16)', stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' }
    default:
      return { fill: 'rgba(34, 197, 94, 0.14)', stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.45)' }
  }
}

function edgeColor(status: LayoutEdge['status']): string {
  switch (status) {
    case 'fault':
      return '#dc2626'
    case 'warning':
      return '#eab308'
    case 'active':
      return '#f59e0b'
    default:
      return 'rgba(245, 158, 11, 0.4)'
  }
}

function paint(
  layout: import('@/utils/runtime-topology').LayoutResult | null = activeLayout
): void {
  const canvas = canvasRef.value
  if (!canvas) return
  syncCanvasSizeFromRenderedBox(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // 用入参而非 layout.value：避免在 RAF 循环里反复访问 layout.value 触发
  // `useTopologyLayout` 内部 computed 重算，造成 paint 之间的状态竞态。
  const currentLayout = layout ?? activeLayout
  if (!currentLayout) return
  activeLayout = currentLayout

  const currentDpr = dpr.value
  const currentZoom = zoom.value * fitZoom.value

  ctx.save()
  // 1) 先在 identity 变换下按物理像素整张清屏，缩放/平移时也能彻底清干净。
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // 2) 应用 DPR + fit-to-container + 用户缩放 + 平移：layout 内容按
  //    fitZoom 缩放到容器大小，再叠加用户 wheel zoom + drag pan。
  ctx.setTransform(
    currentDpr * currentZoom,
    0,
    0,
    currentDpr * currentZoom,
    panX.value * currentDpr,
    panY.value * currentDpr
  )

  // Edges first so nodes render on top.
  for (const edge of currentLayout.edges) {
    const path2d = getOrBuildPath(edge)
    ctx.lineWidth = 2
    ctx.strokeStyle = edgeColor(edge.status)
    if (edge.status === 'active') {
      ctx.setLineDash([8, 6])
      const offset = (Date.now() / 50) % 14
      ctx.lineDashOffset = -offset
    } else if (edge.status === 'warning') {
      ctx.setLineDash([6, 5])
    } else if (edge.status === 'fault') {
      ctx.lineWidth = 2.5
      ctx.setLineDash([6, 4])
    } else {
      ctx.setLineDash([])
    }
    ctx.stroke(path2d)
  }
  ctx.setLineDash([])

  // Nodes.
  for (const node of currentLayout.nodes) {
    paintNode(ctx, node)
  }

  ctx.restore()
}

function getOrBuildPath(edge: LayoutEdge): Path2D {
  const cached = pathCache.get(edge.id)
  if (cached && cached.path === edge.path) {
    return cached.path2d
  }

  const path2d = new Path2D(edge.path)
  pathCache.set(edge.id, { path: edge.path, path2d })
  return path2d
}

function paintNode(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  if (node.kind === 'rack_position' && node.rackPosition) {
    paintRackNode(ctx, node)
    return
  }
  if (node.kind === 'device' && node.device) {
    paintDeviceNode(ctx, node)
  }
}

function paintDeviceNode(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const device = node.device!
  const x = node.x
  const y = node.y
  const { nodeWidth, nodeHeight } = activeLayoutConfig.value
  const color = statusColor(device)
  const selected = props.selectedDeviceId === device.id
  const traced = isTraced(device.id)
  const blocked = isBlocking(device.id)
  const dimmed = props.tracePathNodes.length > 0 && !traced

  ctx.save()
  ctx.globalAlpha = dimmed ? 0.45 : 1
  ctx.fillStyle = color.fill
  ctx.strokeStyle = selected ? '#3b82f6' : color.stroke
  ctx.lineWidth = selected ? 3 : 1.5
  roundRect(ctx, x, y, nodeWidth, nodeHeight, 10)
  ctx.fill()
  ctx.stroke()

  // Selected glow.
  if (selected) {
    ctx.save()
    ctx.shadowColor = 'rgba(59, 130, 246, 0.5)'
    ctx.shadowBlur = 14
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.95)'
    ctx.lineWidth = 2
    roundRect(ctx, x, y, nodeWidth, nodeHeight, 10)
    ctx.stroke()
    ctx.restore()
  }

  // Status pill.
  const label = signalText(device)
  ctx.font = '600 11px var(--font-mono, "JetBrains Mono", monospace)'
  const labelWidth = Math.max(60, ctx.measureText(label).width + 16)
  ctx.fillStyle = color.stroke
  roundRect(ctx, x + 12, y + 10, labelWidth, 18, 9)
  ctx.fill()
  ctx.fillStyle = '#0b1220'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + 20, y + 19)

  // Device name (display name).
  ctx.fillStyle = '#e2e8f0'
  ctx.font = '700 14px var(--font-mono, "JetBrains Mono", monospace)'
  ctx.textBaseline = 'top'
  ctx.fillText(device.deviceName, x + 12, y + 36, nodeWidth - 24)

  // Device code.
  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 11px var(--font-mono, "JetBrains Mono", monospace)'
  ctx.fillText(device.deviceCode, x + 12, y + 56, nodeWidth - 24)

  // Maintenance tag.
  if (device.maintenanceMode) {
    ctx.fillStyle = '#eab308'
    ctx.font = '700 10px var(--font-mono, "JetBrains Mono", monospace)'
    ctx.fillText('维护中', x + nodeWidth - 50, y + 10)
  }

  // Blocked marker.
  if (blocked) {
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(x + nodeWidth - 14, y + 14, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function paintRackNode(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const rack = node.rackPosition!
  const x = node.x
  const y = node.y
  const { nodeWidth, nodeHeight } = activeLayoutConfig.value
  ctx.save()
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)'
  ctx.lineWidth = 1.5
  roundRect(ctx, x, y, nodeWidth, nodeHeight, 10)
  ctx.fill()
  ctx.stroke()

  // Header bar.
  ctx.fillStyle = 'rgba(59, 130, 246, 0.18)'
  roundRect(ctx, x, y, nodeWidth, 22, 10, true)
  ctx.fill()
  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 10px var(--font-mono, "JetBrains Mono", monospace)'
  ctx.textBaseline = 'middle'
  ctx.fillText('货位', x + 12, y + 11)

  // Code (large).
  ctx.fillStyle = '#e2e8f0'
  ctx.font = '700 18px var(--font-mono, "JetBrains Mono", monospace)'
  ctx.textBaseline = 'top'
  const label = rack.label ?? rack.code
  ctx.fillText(label, x + 12, y + 30, nodeWidth - 24)

  // Code (small).
  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 11px var(--font-mono, "JetBrains Mono", monospace)'
  ctx.fillText(rack.code, x + 12, y + 56, nodeWidth - 24)

  ctx.restore()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  onlyTop = false
): void {
  ctx.beginPath()
  if (onlyTop) {
    ctx.moveTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
  } else {
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
  }
  ctx.closePath()
}

function prunePathCache(
  edges: import('@/utils/runtime-topology').LayoutEdge[] = activeLayout?.edges ?? []
): void {
  const liveIds = new Set(edges.map(e => e.id))
  for (const id of pathCache.keys()) {
    if (!liveIds.has(id)) pathCache.delete(id)
  }
}

// ---------------------------------------------------------------------------
// Hit-test
// ---------------------------------------------------------------------------

interface HitTarget {
  kind: 'device' | 'rack_position'
  deviceId?: number
  rackCode?: string
  nodeKey: string
}

/**
 * Convert a pointer event to **logical** canvas coordinates. The canvas DOM
 * element renders at its container CSS size (full bleed) but ctx applies
 * fitZoom × userZoom + pan via setTransform. We reverse the transform here
 * so hit-test compares against layout-space (node.x, node.y) directly.
 */
function getCanvasCssPoint(event: MouseEvent): { x: number; y: number } | null {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function getCanvasLogicalPoint(event: MouseEvent): { x: number; y: number } | null {
  const css = getCanvasCssPoint(event)
  if (!css) return null
  // 渲染时 transform 应用的是 dpr × (userZoom × fitZoom)，hit-test 同样
  // 用复合值反算才能准确命中 layout 坐标。
  const totalZoom = zoom.value * fitZoom.value
  if (!totalZoom) return css
  return {
    x: (css.x - panX.value) / totalZoom,
    y: (css.y - panY.value) / totalZoom
  }
}

function hitTest(cssX: number, cssY: number): HitTarget | null {
  // cssX/cssY are already in layout-space (logical) coordinates.
  // Iterate in reverse so visually-on-top nodes win.
  const nodes = layout.value.nodes
  const { nodeWidth, nodeHeight } = activeLayoutConfig.value
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    if (node.kind === 'device' && node.device) {
      if (
        cssX >= node.x &&
        cssX <= node.x + nodeWidth &&
        cssY >= node.y &&
        cssY <= node.y + nodeHeight
      ) {
        return {
          kind: 'device',
          deviceId: node.device.id,
          nodeKey: `device:${node.device.id}`
        }
      }
    } else if (node.kind === 'rack_position' && node.rackPosition) {
      if (
        cssX >= node.x &&
        cssX <= node.x + nodeWidth &&
        cssY >= node.y &&
        cssY <= node.y + nodeHeight
      ) {
        return {
          kind: 'rack_position',
          rackCode: node.rackPosition.code,
          nodeKey: `rack:${node.rackPosition.code}`
        }
      }
    }
  }
  return null
}

function handleCanvasClick(event: MouseEvent): void {
  if (didDrag) {
    didDrag = false
    return
  }
  const point = getCanvasLogicalPoint(event)
  if (!point) return
  const target = hitTest(point.x, point.y)
  if (!target) return

  const now = Date.now()
  const isDouble = lastClickTargetKey === target.nodeKey && now - lastClickAt < DBCLICK_WINDOW_MS
  lastClickAt = now
  lastClickTargetKey = target.nodeKey
  if (isDouble) return // dblclick handler will fire separately

  if (target.kind === 'device' && target.deviceId != null) {
    emit('select', target.deviceId)
  } else if (target.kind === 'rack_position' && target.rackCode) {
    emit('selectRackPosition', target.rackCode)
  }
}

function handleCanvasDblClick(event: MouseEvent): void {
  const point = getCanvasLogicalPoint(event)
  if (!point) return
  const target = hitTest(point.x, point.y)
  if (!target) return
  if (target.kind === 'device' && target.deviceId != null) {
    emit('sendEvent', target.deviceId)
  }
  lastClickAt = 0
  lastClickTargetKey = null
}

function handleCanvasContextMenu(event: MouseEvent): void {
  event.preventDefault()
  const point = getCanvasLogicalPoint(event)
  if (!point) return
  const target = hitTest(point.x, point.y)
  if (!target) return
  if (target.kind === 'device' && target.deviceId != null) {
    emit('select', target.deviceId)
    emit('showContextMenu', {
      deviceId: target.deviceId,
      x: event.clientX,
      y: event.clientY
    })
  }
}

// ---------------------------------------------------------------------------
// Animation loop (only active edges change dash offset over time)
// ---------------------------------------------------------------------------

function tick(): void {
  paint()
  const currentLayout = activeLayout
  if (currentLayout && hasAnimatedEdges(currentLayout)) {
    rafId = requestAnimationFrame(tick)
  } else {
    rafId = null
  }
}

function startAnimation(): void {
  if (rafId != null) return
  rafId = requestAnimationFrame(tick)
}

function stopAnimation(): void {
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function hasAnimatedEdges(currentLayout: import('@/utils/runtime-topology').LayoutResult): boolean {
  return currentLayout.edges.some(e => e.status === 'active')
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

function handleResize(): void {
  if (typeof window === 'undefined') return
  dpr.value = window.devicePixelRatio || 1
  // 浏览器窗口 resize 时 device-flow 容器尺寸也会变。委托给
  // updateContainerSize 重读 rect + 重算 fitZoom + paint，单调 paint
  // 拿不到容器新尺寸。
  updateContainerSize()
}

function getCanvasPhysicalSize(
  width = containerSize.value.width,
  height = containerSize.value.height
): {
  width: number
  height: number
} {
  return {
    width: Math.max(1, Math.round(width * dpr.value)),
    height: Math.max(1, Math.round(height * dpr.value))
  }
}

function syncCanvasBackingStore(canvas: HTMLCanvasElement): void {
  const physicalSize = getCanvasPhysicalSize()
  if (canvas.width !== physicalSize.width) canvas.width = physicalSize.width
  if (canvas.height !== physicalSize.height) canvas.height = physicalSize.height
}

function syncCanvasSizeFromRenderedBox(canvas: HTMLCanvasElement): void {
  const rect = canvas.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    const hasSizeChanged =
      rect.width !== containerSize.value.width || rect.height !== containerSize.value.height
    if (hasSizeChanged) {
      containerSize.value = { width: rect.width, height: rect.height }
      const currentLayout = activeLayout
      if (currentLayout) {
        fitZoom.value = computeFitZoom(
          currentLayout.canvasWidth,
          currentLayout.canvasHeight,
          rect.width,
          rect.height
        )
      }
    }
  }
  syncCanvasBackingStore(canvas)
}

function computeFitZoom(
  layoutWidth: number,
  layoutHeight: number,
  containerWidth: number,
  containerHeight: number
): number {
  if (layoutWidth <= 0 || layoutHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return 1
  }
  // 留 5% 边距：内容不会贴容器边缘。
  const FIT_PADDING_RATIO = 0.95
  const scaleX = (containerWidth / layoutWidth) * FIT_PADDING_RATIO
  const scaleY = (containerHeight / layoutHeight) * FIT_PADDING_RATIO
  // 横向、纵向取较小者，保证内容不会被裁切。
  return Math.min(scaleX, scaleY)
}

function updateContainerSize(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return

  const physicalSize = getCanvasPhysicalSize(rect.width, rect.height)
  if (
    rect.width === containerSize.value.width &&
    rect.height === containerSize.value.height &&
    canvas.width === physicalSize.width &&
    canvas.height === physicalSize.height
  ) {
    return
  }
  containerSize.value = { width: rect.width, height: rect.height }
  syncCanvasBackingStore(canvas)
  const currentLayout = activeLayout
  if (currentLayout) {
    fitZoom.value = computeFitZoom(
      currentLayout.canvasWidth,
      currentLayout.canvasHeight,
      rect.width,
      rect.height
    )
  }
  // viewport 状态在 resize 时重置：fit-zoom 变化意味着坐标比例变了。
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  prunePathCache()
  paint()
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    dpr.value = window.devicePixelRatio || 1
    window.addEventListener('resize', handleResize)
  }
  // 用 layout.value 的当前快照驱动首次 paint + 设置 activeLayout 闭包变量。
  const currentLayout = layout.value
  // ResizeObserver 监听 device-flow 容器尺寸变化：fit-to-container 必需。
  // 但 mount 同步读 getBoundingClientRect() 在 Vue 布局未完成时拿到的常是
  // 0×0，canvas 物理尺寸随之变成 0，paint 画在 0×0 画布完全空白。延迟到
  // requestAnimationFrame 让浏览器完成首帧布局，再读真实尺寸并 paint。
  if (typeof ResizeObserver !== 'undefined') {
    const wrapper = canvasRef.value?.parentElement
    if (wrapper) {
      resizeObserver = new ResizeObserver(updateContainerSize)
      resizeObserver.observe(wrapper)
      const initializeViewport = (attempts = 0) => {
        const rect = wrapper.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          containerSize.value = { width: rect.width, height: rect.height }
          fitZoom.value = computeFitZoom(
            currentLayout.canvasWidth,
            currentLayout.canvasHeight,
            rect.width,
            rect.height
          )
          zoom.value = 1
          panX.value = 0
          panY.value = 0
          prunePathCache(currentLayout.edges)
          paint(currentLayout)
          return
        }
        // 一次 rAF 不够就多次重试：flex 链布局可能在第 1~2 帧才稳定。
        if (attempts < 5) {
          requestAnimationFrame(() => initializeViewport(attempts + 1))
        }
      }
      // 同步 + 连续 rAF 重试：同步拿到 0 时下一帧补救；最多 5 帧后放弃
      // （几乎不会发生：5 帧 80ms 足够 flex 链完成）。
      initializeViewport()
    }
  }
  if (hasAnimatedEdges(currentLayout)) startAnimation()
})

onBeforeUnmount(() => {
  stopAnimation()
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  pathCache.clear()
})

watch(
  () => layout.value,
  // `useTopologyLayout` 内部 computed 已经深追踪依赖，watch 不要再 deep。
  // 用 flush: 'post' 让回调在 Vue 模板的 DOM 更新之后再跑，避免与
  // canvas.width/height 同步更新产生竞态（paint 读旧 width 时清屏范围错位）。
  currentLayout => {
    // 把 layout 引用存到闭包变量里，下面的 paint / hasAnimatedEdges 全用
    // 这个引用，不再触发 computed 重算。避免 watch 内部访问 layout.value
    // 造成重复 reactive 订阅。
    activeLayout = currentLayout

    // 数据集切换时重置缩放/平移 + 重新算 fit-to-container。
    zoom.value = 1
    panX.value = 0
    panY.value = 0
    if (containerSize.value.width > 0 && containerSize.value.height > 0) {
      fitZoom.value = computeFitZoom(
        currentLayout.canvasWidth,
        currentLayout.canvasHeight,
        containerSize.value.width,
        containerSize.value.height
      )
    } else {
      fitZoom.value = 1
    }
    prunePathCache(currentLayout.edges)
    paint(currentLayout)
    if (hasAnimatedEdges(currentLayout)) {
      startAnimation()
    } else {
      stopAnimation()
    }
  },
  { flush: 'post' }
)
</script>

<style scoped>
.runtime-scene-device-flow {
  position: relative;

  /*
   * 居中布局：canvas 物理尺寸由 layout 决定（紧凑），容器大小由 flex 父级
   * 撑满。canvas 水平垂直都居中，画布四周留出 device-flow 暗色背景，避免
   * 节点贴容器边缘被 overflow: hidden 裁切。
   *
   * 父容器（el-card body → RuntimeSceneMap → 这里）已经设了 flex column
   * 撑开，height: 100% + flex: 1 1 auto 把这一层也撑起来。内容超出由缩放/
   * 平移交互接管"导航"，不允许出现滚动条。
   */
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle, rgb(var(--color-primary-rgb) / 0.04) 1px, transparent 1px),
    linear-gradient(180deg, var(--color-industrial-dark-bg), var(--color-industrial-dark-bg));
  background-size:
    20px 20px,
    100% 100%;
  border-radius: 12px;
  border: 1px solid var(--runtime-border);
  padding: 0;
}

.runtime-scene-device-flow.is-compact {
  min-height: 80px;
}

.runtime-scene-device-flow__canvas {
  display: block;
  flex-shrink: 0;
  border-radius: 6px;

  /* Allow the canvas to receive pointer events for hit-test. */
  cursor: grab;

  /* 防止 canvas 边缘触发浏览器原生拖拽（图片拖动等）。 */
  user-select: none;
  -webkit-user-drag: none;
}

.runtime-scene-device-flow__canvas:active {
  cursor: grabbing;
}

.runtime-scene-device-flow__zoom-readout {
  position: absolute;
  right: 10px;
  bottom: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgb(var(--color-industrial-dark-bg-rgb) / 0.78);
  color: var(--runtime-text-muted);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  pointer-events: none;
  user-select: none;
}

.runtime-scene-device-flow__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 120px;
  padding: 32px;
  color: var(--runtime-text-muted);
  font-size: 13px;
}
</style>
