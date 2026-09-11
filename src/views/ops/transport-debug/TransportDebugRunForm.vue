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
  'update:testMode': [enabled: boolean]
  'update:rackId': [rackId: string]
  'update:worklineCode': [value: string]
  'update:location': [key: 'workstation' | 'infeed_position' | 'outfeed_position', value: string]
  'update:scanner': [index: number, value: string]
}>()

function updateTestMode(value: string | number | boolean): void {
  emit('update:testMode', Boolean(value))
}
</script>
<template>
  <section
    class="run-config"
    data-test="run-config"
  >
    <div class="config-toolbar">
      <label class="test-mode-control">
        测试模式
        <el-switch
          :model-value="config.testMode.value"
          aria-label="测试模式"
          @update:model-value="updateTestMode"
        />
      </label>
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
    <el-alert
      v-if="config.testMode.value"
      title="测试模式已开启：活动轮次期间，STATION_SCANxx 的扫码完成事件会向同一扫码点下发真实 MOVE_FORWARD 指令。"
      type="warning"
      :closable="false"
      show-icon
    />

    <section class="location-config">
      <h3>联调区域与设备</h3>
      <div class="location-fields">
        <label>
          工作线编码
          <el-input
            :model-value="config.worklineCode.value"
            aria-label="工作线编码"
            @update:model-value="emit('update:worklineCode', $event)"
          />
        </label>
        <label>
          五层货架工作区
          <el-input
            :model-value="config.locations.value.workstation"
            aria-label="五层货架工作区"
            placeholder="例如 KT11"
            @update:model-value="emit('update:location', 'workstation', $event)"
          />
        </label>
        <label>
          投料口
          <el-input
            :model-value="config.locations.value.infeed_position"
            aria-label="投料口"
            placeholder="例如 CNV0101"
            @update:model-value="emit('update:location', 'infeed_position', $event)"
          />
        </label>
        <label>
          出料口
          <el-input
            :model-value="config.locations.value.outfeed_position"
            aria-label="出料口"
            placeholder="例如 CNV0102"
            @update:model-value="emit('update:location', 'outfeed_position', $event)"
          />
        </label>
        <label
          v-for="(_, index) in config.locations.value.scan_device_codes"
          :key="index"
        >
          SCAN{{ index + 1 }} 设备
          <el-input
            :model-value="config.locations.value.scan_device_codes[index]"
            :aria-label="`SCAN${index + 1} 设备`"
            @update:model-value="emit('update:scanner', index, $event)"
          />
        </label>
      </div>
      <p>
        SCAN4 为出料口扫码设备，其扫码结果触发料箱回架。启动后，本轮和后续轮次使用启动时的区域配置。
      </p>
    </section>

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

.location-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.location-fields label {
  display: grid;
  gap: 6px;
}

.test-mode-control {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
