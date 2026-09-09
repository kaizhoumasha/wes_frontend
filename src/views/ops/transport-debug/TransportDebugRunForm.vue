<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import type { useTransportDebugRunConfig } from './useTransportDebugRunConfig'
defineProps<{
  config: ReturnType<typeof useTransportDebugRunConfig>
  totalRounds: number | undefined
  roundError: string | null
}>()
const emit = defineEmits<{
  'update:totalRounds': [rounds: number | undefined]
  'update:rackId': [rackId: string]
}>()
</script>
<template>
  <section
    class="run-config"
    data-test="run-config"
  >
    <div class="config-toolbar">
      <label>
        联调轮数
        <el-input-number
          :model-value="totalRounds"
          :min="1"
          :max="1000"
          :precision="0"
          :step="1"
          step-strictly
          aria-label="自动联调轮数"
          @update:model-value="emit('update:totalRounds', $event)"
        />
      </label>
      <el-input
        :model-value="config.rackId.value"
        placeholder="按现场实际输入货架编码，例如 510056"
        aria-label="自动联调货架编码"
        @update:model-value="emit('update:rackId', $event)"
      />
      <AppButton @click="config.addGroup()">新增货架面</AppButton>
    </div>

    <article
      v-for="(group, groupIndex) in config.groups.value"
      :key="groupIndex"
      class="face-group"
    >
      <header>
        <strong>面组 {{ groupIndex + 1 }}</strong>
        <AppButton @click="config.removeGroup(groupIndex)">删除</AppButton>
      </header>
      <el-input
        v-model="group.face"
        placeholder="原样输入，例如 90、270"
        aria-label="货架面原始值"
      />
      <div
        v-for="(bin, binIndex) in group.bins"
        :key="binIndex"
        class="bin-row"
      >
        <el-input
          v-model="bin.bin_code"
          placeholder="料箱编码，例如 A000001922"
          aria-label="料箱编码"
        />
        <el-input
          v-model="bin.slot_id"
          placeholder="当前货架槽位，例如 510056A3F2C101"
          aria-label="当前货架槽位"
        />
        <AppButton
          :disabled="group.bins.length <= 1"
          @click="config.removeBin(groupIndex, binIndex)"
        >
          删除料箱
        </AppButton>
      </div>
      <AppButton
        :disabled="group.bins.length >= 4"
        @click="config.addBin(groupIndex)"
      >
        新增料箱
      </AppButton>
    </article>

    <p
      v-if="config.validationError.value || roundError"
      class="validation-error"
    >
      {{ config.validationError.value || roundError }}
    </p>
    <section
      v-if="config.preview.value"
      class="preview-panel"
    >
      <h3>下发顺序预览</h3>
      <pre>{{ config.preview.value }}</pre>
    </section>
  </section>
</template>
<style scoped src="./TransportDebugRunPanel.css"></style>

<style scoped>
.config-toolbar :deep(.el-input) {
  width: 100%;
}
</style>
