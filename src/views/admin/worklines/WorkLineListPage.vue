<template>
  <CrudPageContainer
    v-if="config"
    :config="config"
  />
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { worklineApiMethods } from '@/api/modules/workline'
import { buildRuntimeWorklineQuery } from '@/utils/runtime-route'
import { createWorkLinePageConfig } from './config/pageConfig'

const router = useRouter()

function openRuntime(workline: Workline) {
  router.push({ name: 'RuntimeWorklines', query: buildRuntimeWorklineQuery(workline.id) })
}

const pageActions = {
  openRuntime
}

const config = shallowRef<ReturnType<typeof createWorkLinePageConfig> | null>(null)

onMounted(async () => {
  try {
    const pluginOptions = await worklineApiMethods.options().send()
    config.value = createWorkLinePageConfig(pageActions, pluginOptions)
  } catch (error) {
    console.error('加载作业线插件选项失败:', error)
    ElMessage.error('加载作业线插件选项失败')
    config.value = createWorkLinePageConfig(pageActions)
  }
})
</script>
