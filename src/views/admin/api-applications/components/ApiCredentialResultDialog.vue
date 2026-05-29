<script setup lang="ts">
/**
 * ApiCredentialResultDialog - API 凭证展示对话框
 *
 * 展示创建或重置后返回的 API 应用凭证信息。
 * app_secret 仅在创建/重置时返回一次，需在此对话框中展示给用户。
 */
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

// ==================== Props & Emits ====================

interface Props {
  appId: string
  appSecret: string
  appName?: string
  isReset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  appName: '',
  isReset: false
})

const visible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  closed: []
}>()

// ==================== State ====================

const showSecret = ref(false)
const hasCopiedSecret = ref(false)

// ==================== Computed ====================

const dialogTitle = computed(() => (props.isReset ? '密钥已重置' : '应用创建成功'))

const warningMessage = computed(() =>
  props.isReset
    ? '旧密钥已立即失效，请妥善保存新密钥（仅显示一次）'
    : '请妥善保存 app_secret，关闭后将无法再次查看'
)

const displayAppId = computed(() => props.appId || '—')
const displayAppSecret = computed(() => props.appSecret || '—')

// ==================== Methods ====================

function resetState() {
  showSecret.value = false
  hasCopiedSecret.value = false
}

function toggleSecretVisibility() {
  showSecret.value = !showSecret.value
}

async function copySecret() {
  if (!props.appSecret) return
  try {
    await navigator.clipboard.writeText(props.appSecret)
    hasCopiedSecret.value = true
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

async function copyAppId() {
  if (!props.appId) return
  try {
    await navigator.clipboard.writeText(props.appId)
    ElMessage.success('App ID 已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

async function handleConfirm() {
  if (!hasCopiedSecret.value) {
    try {
      await ElMessageBox.confirm(
        '你还未复制 App Secret，关闭后将无法查看。确定关闭吗？',
        '确认关闭',
        {
          confirmButtonText: '确定关闭',
          cancelButtonText: '再看一下',
          type: 'warning'
        }
      )
      visible.value = false
    } catch {
      // 用户取消关闭
    }
  } else {
    visible.value = false
  }
}

// ==================== Watchers ====================

watch(visible, isOpen => {
  if (isOpen) {
    resetState()
  } else {
    emit('closed')
  }
})
</script>

<template>
  <StandardDialog
    v-model="visible"
    :title="dialogTitle"
    size="sm"
    confirm-text="知道了"
    confirm-icon="lucide:check"
    hide-cancel
    @confirm="handleConfirm"
  >
    <div class="credential-result-dialog">
      <!-- 应用名称 -->
      <div
        v-if="appName"
        class="app-name-banner"
      >
        <AppIcon
          icon="ep:key"
          :size="18"
        />
        <span>{{ appName }}</span>
      </div>

      <!-- App ID -->
      <div class="credential-field">
        <div class="credential-field__header">
          <span class="credential-field__label">App ID</span>
          <button
            type="button"
            class="credential-field__copy"
            @click="copyAppId"
          >
            <AppIcon
              icon="ep:document-copy"
              :size="14"
            />
            复制
          </button>
        </div>
        <div class="credential-field__value">
          <code>{{ displayAppId }}</code>
        </div>
      </div>

      <!-- App Secret -->
      <div class="credential-field credential-field--secret">
        <div class="credential-field__header">
          <span class="credential-field__label">App Secret</span>
          <div class="credential-field__actions">
            <button
              type="button"
              class="credential-field__action"
              @click="toggleSecretVisibility"
            >
              <AppIcon
                :icon="showSecret ? 'ep:view' : 'ep:hide'"
                :size="14"
              />
              {{ showSecret ? '隐藏' : '显示' }}
            </button>
            <button
              type="button"
              class="credential-field__copy"
              @click="copySecret"
            >
              <AppIcon
                :icon="hasCopiedSecret ? 'ep:check' : 'ep:document-copy'"
                :size="14"
              />
              {{ hasCopiedSecret ? '已复制' : '复制' }}
            </button>
          </div>
        </div>
        <div class="credential-field__value credential-field__value--secret">
          <code v-if="showSecret">{{ displayAppSecret }}</code>
          <span
            v-else
            class="credential-field__masked"
          >
            ••••••••••••••••••••••••
          </span>
        </div>
      </div>

      <!-- 安全警告 -->
      <div class="security-warning">
        <AppIcon
          icon="ep:warning-filled"
          :size="16"
        />
        <span>{{ warningMessage }}</span>
      </div>
    </div>
  </StandardDialog>
</template>

<style scoped>
.credential-result-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ==================== 应用名称横幅 ==================== */
.app-name-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}

/* ==================== 凭证字段 ==================== */
.credential-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.credential-field__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.credential-field__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.credential-field__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credential-field__copy,
.credential-field__action {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  font-size: 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  background: var(--el-color-primary-light-9);
  border: none;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.credential-field__copy:hover,
.credential-field__action:hover {
  background: var(--el-color-primary-light-8);
}

.credential-field__value {
  padding: 10px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  word-break: break-all;
}

.credential-field__value code {
  font-family: var(--el-font-family-code), monospace;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.credential-field__value--secret {
  position: relative;
}

.credential-field__masked {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  letter-spacing: 1px;
}

/* ==================== 安全警告 ==================== */
.security-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
  border-radius: 6px;
}

.security-warning .app-icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--el-color-warning);
}
</style>
