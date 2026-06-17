<template>
  <div
    class="runtime-layout"
    :class="{ 'is-immersive': isImmersiveRoute }"
  >
    <template v-if="!isImmersiveRoute">
      <div class="runtime-layout__chrome">
        <RuntimeStatusBadge
          :label="store.connectionLabel"
          :tone="store.connectionTone"
          :pulse="store.live && store.state === 'connected'"
        />
        <el-switch
          :model-value="store.live"
          inline-prompt
          active-text="Live"
          inactive-text="Frozen"
          @change="value => store.toggleLive(Boolean(value))"
        />
        <RuntimeLastUpdated
          :value="store.lastRefreshedAt"
          :frozen="!store.live"
        />
      </div>
      <RuntimeFrozenNotice v-if="!store.live" />
    </template>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { useRuntimeSSEStore } from '@/stores/runtime-sse'

const store = useRuntimeSSEStore()
const route = useRoute()
const isImmersiveRoute = computed(() => route.meta.runtimeImmersive === true)

onMounted(() => {
  store.connect()
})

onBeforeUnmount(() => {
  store.disconnect()
})
</script>

<style scoped>
.runtime-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  background: var(--color-industrial-dark-bg);
}

.runtime-layout.is-immersive {
  min-height: 100%;
  gap: 0;
  background: transparent;
}

.runtime-layout__chrome {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgb(var(--color-industrial-dark-bg-rgb) / 0.95);
  border-bottom: 1px solid rgb(var(--color-primary-rgb) / 0.12);
  backdrop-filter: blur(12px);
}
</style>
