<template>
  <ErrorLayout status-code="503">
    <template #title>授权上下文暂不可用</template>
    <template #description>无法加载当前登录用户的授权数据。受保护页面暂不开放访问。</template>
    <template #info>
      <p
        v-if="retryError"
        class="retry-error"
      >
        {{ retryError }}
      </p>
    </template>
    <template #actions>
      <button
        class="retry-button"
        :disabled="isRetrying"
        @click="retry"
      >
        {{ isRetrying ? '正在重试…' : '重试加载授权数据' }}
      </button>
    </template>
    <template #hint>请检查网络或稍后重试；若问题持续存在，请联系系统管理员。</template>
  </ErrorLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { bootstrapAuthContext } from '@/app/bootstrap-auth-context'
import { withGuardErrorHandling } from '@/utils/guard-error-handler'
import ErrorLayout from './ErrorLayout.vue'

const DEFAULT_REDIRECT = '/dashboard'

const route = useRoute()
const router = useRouter()
const isRetrying = ref(false)
const retryError = ref('')

const redirectPath = computed(() => validatedRedirect(route.query.redirect))

function validatedRedirect(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  ) {
    return DEFAULT_REDIRECT
  }
  return value
}

async function retry(): Promise<void> {
  if (isRetrying.value) return

  isRetrying.value = true
  retryError.value = ''
  try {
    const result = await withGuardErrorHandling(
      () =>
        bootstrapAuthContext({
          forceRefresh: true,
          preserveAccessTokenOnFallback: true
        }),
      '授权上下文重试'
    )

    if (result === 'success') {
      await router.replace(redirectPath.value)
    } else if (result === 'unavailable') {
      retryError.value = '授权数据仍无法加载，请检查网络或稍后重试。'
    }
  } finally {
    isRetrying.value = false
  }
}
</script>

<style scoped>
.retry-button {
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  padding: 12px 24px;
  background: var(--color-primary);
  color: var(--color-industrial-dark-bg);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.retry-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.retry-error {
  margin: 0;
  color: var(--color-danger);
}
</style>
