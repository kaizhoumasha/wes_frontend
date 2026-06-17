<template>
  <section class="runtime-hold-panel runtime-hold-disposition">
    <header>
      <h2>物料处置</h2>
      <span>{{ disposition }}</span>
    </header>

    <div class="runtime-hold-segment">
      <label
        v-for="option in allowedDispositions"
        :key="option"
      >
        <input
          type="radio"
          name="runtime-hold-disposition"
          :value="option"
          :checked="disposition === option"
          @change="$emit('update:disposition', option)"
        />
        {{ dispositionLabel(option) }}
      </label>
    </div>

    <label class="runtime-hold-field">
      <span>Session 结论</span>
      <select
        data-test="runtime-hold-resolution"
        :value="resolution"
        @change="$emit('update:resolution', ($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="item in allowedResolutions"
          :key="item"
          :value="item"
        >
          {{ item }}
        </option>
      </select>
    </label>

    <template v-if="disposition === 'RETURN_TO_NG'">
      <div
        v-if="reasonCatalogError"
        class="runtime-hold-alert is-danger"
      >
        NG 原因不可用
      </div>
      <label class="runtime-hold-field">
        <span>NG 原因</span>
        <select
          data-test="runtime-hold-ng-reason"
          :value="ngReasonCode"
          :disabled="reasonCatalogError || ngReasons.length === 0"
          @change="$emit('update:ngReasonCode', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">选择原因</option>
          <option
            v-for="reason in ngReasons"
            :key="`${reason.source}:${reason.code}`"
            :value="reason.code"
          >
            {{ reason.label }}
          </option>
        </select>
      </label>
      <label class="runtime-hold-field">
        <span>NG 位置扫码</span>
        <input
          data-test="ng-location-scan"
          :value="ngLocationScan"
          placeholder="NG-RACK-01"
          @input="$emit('update:ngLocationScan', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <label class="runtime-hold-field">
        <span>物料扫码</span>
        <input
          data-test="material-scan-payload"
          :disabled="!ngLocationScan"
          :value="materialScanPayload"
          placeholder="PkgID / barcode"
          @input="$emit('update:materialScanPayload', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <label class="runtime-hold-check">
        <input
          type="checkbox"
          :checked="lineClearChecked"
          @change="$emit('update:lineClearChecked', ($event.target as HTMLInputElement).checked)"
        />
        <span>line_clear_checked</span>
      </label>
      <label class="runtime-hold-check">
        <input
          type="checkbox"
          :checked="lateCallbackReviewed"
          @change="
            $emit('update:lateCallbackReviewed', ($event.target as HTMLInputElement).checked)
          "
        />
        <span>late_callback_reviewed</span>
      </label>
    </template>

    <label
      v-if="disposition === 'CONTINUE' && resolution === 'COMPLETED'"
      class="runtime-hold-field"
    >
      <span>成功回调 data JSON</span>
      <textarea
        data-test="continue-result-payload"
        :value="continueResultPayloadText"
        rows="6"
        spellcheck="false"
        :placeholder="continueResultPayloadPlaceholder"
        @input="
          $emit('update:continueResultPayloadText', ($event.target as HTMLTextAreaElement).value)
        "
      />
    </label>

    <label class="runtime-hold-field">
      <span>现场备注</span>
      <textarea
        :value="operatorNote"
        rows="4"
        @input="$emit('update:operatorNote', ($event.target as HTMLTextAreaElement).value)"
      />
    </label>
  </section>
</template>

<script setup lang="ts">
import type { NgReasonOption } from '@/types/runtime'

defineProps<{
  disposition: string
  allowedDispositions: string[]
  resolution: string
  allowedResolutions: string[]
  ngReasons: NgReasonOption[]
  ngReasonCode: string
  reasonCatalogError: boolean
  ngLocationScan: string
  materialScanPayload: string
  lineClearChecked: boolean
  lateCallbackReviewed: boolean
  continueResultPayloadText: string
  operatorNote: string
}>()

defineEmits<{
  'update:disposition': [value: string]
  'update:resolution': [value: string]
  'update:ngReasonCode': [value: string]
  'update:ngLocationScan': [value: string]
  'update:materialScanPayload': [value: string]
  'update:lineClearChecked': [value: boolean]
  'update:lateCallbackReviewed': [value: boolean]
  'update:continueResultPayloadText': [value: string]
  'update:operatorNote': [value: string]
}>()

const continueResultPayloadPlaceholder =
  '{"reel_diameter":"178.0","reel_thickness":"15.0","measurement_result":"OK"}'

function dispositionLabel(value: string): string {
  return value === 'RETURN_TO_NG' ? '退回 NG' : '继续'
}
</script>

<style scoped>
.runtime-hold-panel {
  padding: 18px;
  border: 1px solid rgb(var(--color-primary-rgb) / 14%);
  border-radius: 8px;
  background: rgb(var(--color-industrial-dark-surface-rgb) / 74%);
}

.runtime-hold-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.runtime-hold-panel h2 {
  margin: 0;
  color: var(--color-industrial-dark-text);
  font-size: 16px;
}

.runtime-hold-panel header span {
  color: var(--color-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.runtime-hold-disposition {
  display: grid;
  gap: 14px;
}

.runtime-hold-segment {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.runtime-hold-segment label,
.runtime-hold-check {
  display: flex;
  align-items: center;
  min-height: 44px;
  gap: 10px;
  color: var(--color-industrial-light-border-hover);
}

.runtime-hold-field {
  display: grid;
  gap: 6px;
  color: var(--color-industrial-dark-text-secondary);
  font-size: 12px;
}

.runtime-hold-field span {
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
}

.runtime-hold-field input,
.runtime-hold-field select,
.runtime-hold-field textarea {
  width: 100%;
  min-height: 44px;
  border: 1px solid rgb(var(--color-primary-rgb) / 22%);
  border-radius: 8px;
  background: rgb(var(--color-industrial-dark-bg-rgb) / 72%);
  color: var(--color-industrial-dark-text);
  padding: 10px 12px;
}

.runtime-hold-field input:disabled,
.runtime-hold-field select:disabled {
  color: var(--color-industrial-dark-text-muted);
  border-color: rgb(var(--color-industrial-dark-text-muted-rgb) / 35%);
}

.runtime-hold-alert {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.runtime-hold-alert.is-danger {
  color: var(--color-danger-light);
  background: rgb(var(--color-danger-rgb) / 14%);
}
</style>
