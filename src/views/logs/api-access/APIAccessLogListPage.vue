<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createAPIAccessLogPageConfig } from './config/pageConfig'

const config = createAPIAccessLogPageConfig()
</script>
