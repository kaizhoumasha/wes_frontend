<template>
  <button
    type="button"
    class="topology-rack-position-node"
    :class="{ 'is-compact': compact }"
    data-test="topology-rack-position-node"
    @click="$emit('click')"
  >
    <div class="topology-rack-position-node__top">
      <span class="topology-rack-position-node__kind-tag">货位</span>
    </div>
    <div class="topology-rack-position-node__name">{{ label || code }}</div>
    <div
      v-if="label && label !== code"
      class="topology-rack-position-node__code"
    >
      {{ code }}
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  code: string
  label?: string
  compact?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.topology-rack-position-node {
  position: absolute;
  width: 190px;
  min-height: 120px;
  padding: 18px;
  border: 1px solid rgb(59 130 246 / 0.36);
  border-radius: 8px;
  background: var(--runtime-surface);
  text-align: left;
  cursor: pointer;
  transition:
    transform 200ms ease-out,
    border-color 200ms ease-out,
    box-shadow 200ms ease-out;
  z-index: 2;
}

.topology-rack-position-node:hover {
  transform: translateY(-4px);
  border-color: rgb(59 130 246 / 0.6);
  box-shadow: 0 0 12px rgb(59 130 246 / 0.32);
}

.topology-rack-position-node__top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.topology-rack-position-node__kind-tag {
  padding: 2px 6px;
  border-radius: 3px;
  background: rgb(59 130 246 / 0.15);
  color: #60a5fa;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.topology-rack-position-node__name {
  margin-top: 14px;
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.topology-rack-position-node__code {
  margin-top: 4px;
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  overflow-wrap: anywhere;
}

/* Compact mode — match TopologyDeviceNode dimensions for layout parity */
.topology-rack-position-node.is-compact {
  width: 120px;
  min-height: 80px;
  padding: 10px;
}

.topology-rack-position-node.is-compact .topology-rack-position-node__name {
  margin-top: 6px;
  font-size: 13px;
}

.topology-rack-position-node.is-compact .topology-rack-position-node__code {
  font-size: 10px;
}

.topology-rack-position-node.is-compact .topology-rack-position-node__kind-tag {
  font-size: 9px;
}
</style>
