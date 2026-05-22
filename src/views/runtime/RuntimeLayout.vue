<template>
  <div class="runtime-layout">
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
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { useRuntimeSSEStore } from '@/stores/runtime-sse'

const store = useRuntimeSSEStore()

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
  background: #0f172a;
}

.runtime-layout__chrome {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgb(15 23 42 / 0.95);
  border-bottom: 1px solid rgb(245 158 11 / 0.12);
  backdrop-filter: blur(12px);
}
</style>
