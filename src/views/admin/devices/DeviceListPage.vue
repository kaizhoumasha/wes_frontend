<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createDevicePageConfig } from './config/pageConfig'

const config = createDevicePageConfig()
</script>
