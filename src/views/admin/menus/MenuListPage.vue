<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createMenuPageConfig } from './config/pageConfig'

const config = createMenuPageConfig()
</script>
