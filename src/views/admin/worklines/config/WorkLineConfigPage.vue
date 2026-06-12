<template>
  <div
    v-loading="loading"
    class="config-page min-h-screen bg-slate-950 text-slate-100 p-6 font-sans"
  >
    <!-- 顶部状态轨 -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800"
    >
      <div class="flex items-center gap-4">
        <el-button
          circle
          size="large"
          class="!bg-slate-900 !border-slate-800 !text-slate-300 hover:!text-amber-500"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5" />
        </el-button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-slate-100">
              {{ workline?.line_name || '作业线配置' }}
            </h1>
            <span
              class="font-mono text-sm px-2.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400"
            >
              {{ workline?.line_code }}
            </span>
            <el-tag
              :type="workline?.is_active ? 'success' : 'info'"
              effect="dark"
              class="!border-transparent"
            >
              {{ workline?.is_active ? '已激活' : '已停用' }}
            </el-tag>
          </div>
          <p class="text-sm text-slate-400 mt-1">
            {{ workline?.description || '暂无描述信息' }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-mono text-xs text-slate-500">VERSION: V{{ workline?.version || 0 }}</span>
        <el-button
          type="primary"
          plain
          class="!bg-slate-900 !border-slate-800 !text-amber-500 hover:!bg-slate-800"
          @click="refreshData(true)"
        >
          <RefreshCw
            class="w-4 h-4 mr-2"
            :class="{ 'animate-spin': refreshing }"
          />
          刷新状态
        </el-button>
      </div>
    </div>

    <!-- 主体布局 -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- 左侧配置大区 -->
      <div class="xl:col-span-2 space-y-6">
        <!-- 基础信息卡片 -->
        <el-card
          shadow="never"
          class="!bg-slate-900 !border-slate-800 !text-slate-100"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold flex items-center gap-2">
                <Settings class="w-5 h-5 text-amber-500" />
                基础信息
              </span>
              <el-button
                type="primary"
                size="small"
                class="!bg-amber-500 !border-transparent hover:!bg-amber-600"
                @click="openEditDialog"
              >
                <Edit class="w-4 h-4 mr-1.5" />
                编辑配置
              </el-button>
            </div>
          </template>

          <el-descriptions
            :column="2"
            border
            class="config-descriptions"
          >
            <el-descriptions-item label="作业线编码">
              <span class="font-mono text-slate-300 font-medium">{{ workline?.line_code }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="作业线名称">
              <span class="text-slate-300 font-medium">{{ workline?.line_name }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="作业线类型">
              <el-tag
                :type="lineTypeTagType"
                size="small"
                effect="plain"
                class="!border-slate-800"
              >
                {{ lineTypeLabel }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="区域名称">
              <span class="text-slate-300 font-medium">{{ workline?.zone_name || '-' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="运行模式">
              <el-tag
                :type="runModeTagType"
                size="small"
                effect="plain"
                class="!border-slate-800"
              >
                {{ runModeLabel }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="描述说明">
              <span class="text-slate-400">{{ workline?.description || '-' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 插件合同卡片 -->
        <el-card
          shadow="never"
          class="!bg-slate-900 !border-slate-800 !text-slate-100"
        >
          <template #header>
            <span class="text-lg font-semibold flex items-center gap-2">
              <Layers class="w-5 h-5 text-amber-500" />
              插件合同
            </span>
          </template>

          <div
            v-if="!workline?.plugin_key"
            class="text-center py-6 text-slate-500"
          >
            未配置插件，请先编辑配置选择工作线插件。
          </div>
          <div
            v-else
            class="space-y-4"
          >
            <el-descriptions
              :column="2"
              border
              class="config-descriptions"
            >
              <el-descriptions-item label="插件标识">
                <span class="font-mono text-slate-300 font-medium">{{ workline?.plugin_key }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="合同版本">
                <span class="font-mono text-slate-300 font-medium">
                  {{ workline?.contract_version || '未指定' }}
                </span>
              </el-descriptions-item>
            </el-descriptions>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div class="bg-slate-950 p-4 border border-slate-850 rounded">
                <span
                  class="text-xs font-semibold text-slate-400 tracking-wider block mb-2 uppercase"
                >
                  支持的事件 (Events)
                </span>
                <div class="flex flex-wrap gap-2">
                  <el-tag
                    v-for="ev in selectedPluginEvents"
                    :key="ev.event"
                    size="small"
                    type="info"
                    class="!bg-slate-900 !border-slate-850 !text-slate-300 font-mono"
                  >
                    {{ ev.event }}
                  </el-tag>
                  <span
                    v-if="!selectedPluginEvents.length"
                    class="text-sm text-slate-500"
                  >
                    无
                  </span>
                </div>
              </div>
              <div class="bg-slate-950 p-4 border border-slate-850 rounded">
                <span
                  class="text-xs font-semibold text-slate-400 tracking-wider block mb-2 uppercase"
                >
                  支持的命令 (Commands)
                </span>
                <div class="flex flex-wrap gap-2">
                  <el-tag
                    v-for="cmd in selectedPluginCommands"
                    :key="cmd.command"
                    size="small"
                    type="info"
                    class="!bg-slate-900 !border-slate-850 !text-slate-300 font-mono"
                  >
                    {{ cmd.command }}
                  </el-tag>
                  <span
                    v-if="!selectedPluginCommands.length"
                    class="text-sm text-slate-500"
                  >
                    无
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 设备拓扑与角色覆盖清单 -->
        <el-card
          shadow="never"
          class="!bg-slate-900 !border-slate-800 !text-slate-100"
        >
          <template #header>
            <span class="text-lg font-semibold flex items-center gap-2">
              <Cpu class="w-5 h-5 text-amber-500" />
              设备拓扑角色覆盖
            </span>
          </template>

          <div
            v-if="!workline?.plugin_key"
            class="text-center py-6 text-slate-500"
          >
            未配置插件，无角色拓扑需求。
          </div>
          <div v-else>
            <el-table
              :data="roleCoverageList"
              class="config-table"
              style="width: 100%"
            >
              <el-table-column
                label="角色名称"
                min-width="150"
              >
                <template #default="{ row }">
                  <span class="font-mono text-sm text-amber-500 font-medium">{{ row.role }}</span>
                </template>
              </el-table-column>

              <el-table-column
                label="数量要求"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <span class="font-mono text-slate-300">
                    {{ row.min_count }}{{ row.max_count !== null ? `/${row.max_count}` : '+' }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column
                label="已绑定设备"
                min-width="200"
              >
                <template #default="{ row }">
                  <div class="flex flex-wrap gap-2.5">
                    <span
                      v-if="!row.devices.length"
                      class="text-sm text-slate-500 font-light"
                    >
                      -
                    </span>
                    <el-tooltip
                      v-for="d in row.devices"
                      :key="d.id"
                      placement="top"
                    >
                      <template #content>
                        <div class="p-1 space-y-1 font-mono text-xs">
                          <div>编码: {{ d.device_code }}</div>
                          <div>名称: {{ d.device_name }}</div>
                          <div>启用: {{ d.is_active ? '是' : '否' }}</div>
                          <div>能力: {{ d.capabilities_json?.join(', ') || '无' }}</div>
                        </div>
                      </template>
                      <el-tag
                        size="small"
                        :type="row.status === 'PASS' ? 'success' : 'warning'"
                        class="!bg-slate-950 !border-slate-850 cursor-help"
                        :closable="!workline?.is_active"
                        @close="handleUnbindDevice(d)"
                      >
                        {{ d.device_code }}
                      </el-tag>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                label="状态"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <el-tag
                    :type="row.status === 'PASS' ? 'success' : 'danger'"
                    size="small"
                    effect="dark"
                  >
                    {{ row.status === 'PASS' ? '通过' : row.statusReason }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column
                label="操作"
                width="120"
                align="center"
                fixed="right"
              >
                <template #default="{ row }">
                  <el-button
                    link
                    type="primary"
                    class="!text-amber-500 hover:!text-amber-400 flex items-center disabled:!text-slate-500"
                    :disabled="workline?.is_active"
                    @click="openBindDeviceDialog(row)"
                  >
                    <ExternalLink class="w-4 h-4 mr-1" />
                    {{ row.devices.length ? '调整' : '去绑定' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>

      <!-- 右侧预检与控制区 (Sticky) -->
      <div class="space-y-6">
        <div class="sticky top-6 space-y-6">
          <el-card
            shadow="never"
            class="!bg-slate-900 !border-slate-800 !text-slate-100 config-card__precheck"
          >
            <template #header>
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold flex items-center gap-2">
                  <Activity class="w-5 h-5 text-amber-500" />
                  配置预检
                </span>
                <el-tag
                  :type="configStatus?.can_activate ? 'success' : 'danger'"
                  effect="dark"
                >
                  {{ configStatus?.can_activate ? '预检通过' : '有阻塞项' }}
                </el-tag>
              </div>
            </template>

            <!-- 预检项列表 -->
            <div class="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              <div
                v-for="check in checksList"
                :key="check.code"
                class="flex gap-3 p-3 bg-slate-950 border border-slate-850 rounded text-sm transition hover:border-slate-800"
              >
                <div class="mt-0.5">
                  <CheckCircle2
                    v-if="check.status === 'PASS'"
                    class="w-4.5 h-4.5 text-emerald-500"
                  />
                  <AlertTriangle
                    v-else-if="check.status === 'WARN'"
                    class="w-4.5 h-4.5 text-amber-500"
                  />
                  <XCircle
                    v-else
                    class="w-4.5 h-4.5 text-rose-500"
                  />
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-slate-200">{{ check.title }}</span>
                    <el-tag
                      v-if="check.status !== 'PASS'"
                      :type="check.severity === 'BLOCKER' ? 'danger' : 'warning'"
                      size="small"
                      effect="plain"
                      class="!scale-90"
                    >
                      {{ check.severity === 'BLOCKER' ? '阻断' : '警告' }}
                    </el-tag>
                  </div>
                  <p class="text-xs text-slate-400 mt-1">
                    {{ check.message }}
                  </p>
                </div>
              </div>
              <div
                v-if="!checksList.length"
                class="text-center py-6 text-slate-500"
              >
                无预检项，请刷新获取。
              </div>
            </div>

            <!-- 控制按钮区 -->
            <div class="mt-6 pt-6 border-t border-slate-850 space-y-4">
              <!-- 已激活状态 -->
              <template v-if="workline?.is_active">
                <div
                  class="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs rounded leading-relaxed"
                >
                  作业线当前处于激活状态，运行时设备事件及回调已正常对接。如需调整设备角色与插件契约，请先停用作业线。
                </div>
                <el-button
                  type="danger"
                  class="w-full !h-11 !bg-rose-600 hover:!bg-rose-500 !border-transparent flex items-center justify-center font-semibold tracking-wider text-base"
                  :loading="actionLoading"
                  @click="handleDeactivate"
                >
                  <Square class="w-4 h-4 mr-2" />
                  停用作业线
                </el-button>
              </template>

              <!-- 未激活状态 -->
              <template v-else>
                <div
                  v-if="!configStatus?.can_activate"
                  class="p-3 bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs rounded leading-relaxed"
                >
                  请修复上述红色的阻断项（配置插件、绑定角色、检验能力等）后，重新进行配置预检，以激活作业线。
                </div>
                <div
                  v-else
                  class="p-3 bg-amber-950/20 border border-amber-900/30 text-amber-400 text-xs rounded leading-relaxed"
                >
                  作业线预检已全部通过，可以激活。激活后回调将被接收，运行时控制台可进入。
                </div>
                <el-button
                  type="primary"
                  class="w-full !h-11 flex items-center justify-center font-semibold tracking-wider text-base !bg-amber-500 hover:!bg-amber-600 !border-transparent disabled:!bg-slate-800 disabled:!text-slate-500 disabled:!border-transparent"
                  :disabled="!configStatus?.can_activate"
                  :loading="actionLoading"
                  @click="handleActivate"
                >
                  <Play class="w-4 h-4 mr-2" />
                  激活作业线
                </el-button>
              </template>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 编辑配置对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑作业线配置"
      width="600px"
      append-to-body
      class="config-dialog"
      :close-on-click-modal="false"
    >
      <el-alert
        v-if="workline?.is_active"
        title="已启用作业线受拓扑保护"
        type="warning"
        description="已启用作业线下不允许修改插件、契约版本或运行模式。如需调整，请先在工作台停用作业线。"
        show-icon
        :closable="false"
        class="!mb-4 !bg-amber-950/20 !border-amber-900/30 !text-amber-400"
      />

      <el-form
        ref="formRef"
        :model="editForm"
        label-position="top"
        class="config-form"
      >
        <div class="grid grid-cols-2 gap-4">
          <el-form-item
            label="作业线编码"
            prop="line_code"
          >
            <el-input
              v-model="editForm.line_code"
              disabled
              class="!bg-slate-900"
            />
          </el-form-item>
          <el-form-item
            label="作业线名称"
            prop="line_name"
            required
          >
            <el-input
              v-model="editForm.line_name"
              placeholder="请输入作业线名称"
            />
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item
            label="作业线类型"
            prop="line_type"
            required
          >
            <el-select
              v-model="editForm.line_type"
              placeholder="请选择类型"
              class="w-full"
              :disabled="workline?.is_active"
            >
              <el-option
                label="自动线"
                value="AUTO"
              />
              <el-option
                label="人工线"
                value="MANUAL"
              />
              <el-option
                label="混合线"
                value="HYBRID"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="区域名称"
            prop="zone_name"
          >
            <el-input
              v-model="editForm.zone_name"
              placeholder="请输入区域名称"
            />
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item
            label="运行模式"
            prop="run_mode"
            required
          >
            <el-select
              v-model="editForm.run_mode"
              placeholder="请选择运行模式"
              class="w-full"
              :disabled="workline?.is_active"
            >
              <el-option
                label="自动运行"
                value="AUTO"
              />
              <el-option
                label="人工确认"
                value="MANUAL"
              />
              <el-option
                label="沙箱模拟"
                value="SIMULATION"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="执行插件"
            prop="plugin_key"
          >
            <el-select
              v-model="editForm.plugin_key"
              placeholder="请选择插件"
              clearable
              class="w-full"
              :disabled="workline?.is_active"
              @change="handlePluginChange"
            >
              <el-option
                v-for="p in pluginOptions"
                :key="p.plugin_key"
                :label="p.label || p.plugin_key"
                :value="p.plugin_key"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item
          label="契约版本"
          prop="contract_version"
        >
          <el-input
            v-model="editForm.contract_version"
            placeholder="插件契约版本，选择插件后自动填充"
            :disabled="workline?.is_active"
          />
        </el-form-item>

        <el-form-item
          label="描述说明"
          prop="description"
        >
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入作业线描述说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-3 pb-2">
          <el-button
            class="!bg-slate-900 !border-slate-800 !text-slate-300 hover:!bg-slate-800"
            @click="editDialogVisible = false"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            class="!bg-amber-500 !border-transparent hover:!bg-amber-600"
            :loading="saveLoading"
            @click="handleSaveConfig"
          >
            保存配置
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 运行负载阻断器对话框 -->
    <el-dialog
      v-model="blockerDialogVisible"
      title="停用受阻: 存在未完成运行负载"
      width="560px"
      append-to-body
      class="config-dialog config-dialog__blocker"
    >
      <div class="flex gap-4 p-1">
        <div class="text-rose-500 mt-0.5">
          <ShieldAlert class="w-10 h-10" />
        </div>
        <div class="flex-1 space-y-3">
          <h3 class="text-base font-semibold text-slate-100">
            检测到有未完成的工作流，暂时无法停用该作业线。
          </h3>
          <p class="text-sm text-slate-400 leading-relaxed">
            为了避免强行停用导致运行中的数据发生错乱，请先在运行看板或监控大屏中处理完以下挂起的事项：
          </p>

          <div
            class="bg-slate-950 p-4 border border-slate-850 rounded space-y-3 font-mono text-sm mt-3"
          >
            <div
              class="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-2"
            >
              <span>负载类型</span>
              <span>待结项目数</span>
            </div>
            <div class="flex justify-between items-center text-slate-300">
              <span>活跃会话 (Active Sessions)</span>
              <span class="text-amber-500 font-bold">
                {{ workloadSummary?.by_type?.sessions || 0 }}
              </span>
            </div>
            <div class="flex justify-between items-center text-slate-300">
              <span>挂起命令 (Pending Commands)</span>
              <span class="text-amber-500 font-bold">
                {{ workloadSummary?.by_type?.commands || 0 }}
              </span>
            </div>
            <div class="flex justify-between items-center text-slate-300">
              <span>消息信箱 (Unfinished Inboxes)</span>
              <span class="text-amber-500 font-bold">
                {{ workloadSummary?.by_type?.inboxes || 0 }}
              </span>
            </div>
            <div class="flex justify-between items-center text-slate-300">
              <span>外发信箱 (Unsent Outboxes)</span>
              <span class="text-amber-500 font-bold">
                {{ workloadSummary?.by_type?.outboxes || 0 }}
              </span>
            </div>
            <div class="flex justify-between items-center text-slate-300">
              <span>阻塞暂停 (Runtime Holds)</span>
              <span class="text-amber-500 font-bold">
                {{ workloadSummary?.by_type?.runtime_holds || 0 }}
              </span>
            </div>
            <div
              class="flex justify-between items-center text-slate-100 border-t border-slate-900 pt-2 font-semibold"
            >
              <span>总阻断数</span>
              <span class="text-rose-500">{{ workloadSummary?.count || 0 }}</span>
            </div>
          </div>

          <div
            v-if="workloadSummary?.sample"
            class="bg-slate-950/60 p-3.5 border border-slate-900 rounded text-xs mt-3 leading-relaxed"
          >
            <span class="text-slate-400 font-medium block mb-1">首条负载样例:</span>
            <div class="font-mono text-slate-300 whitespace-pre-wrap break-all">
              {{ workloadSummary.sample }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pb-2">
          <el-button
            class="!bg-slate-900 !border-slate-800 !text-slate-300 hover:!bg-slate-800"
            @click="blockerDialogVisible = false"
          >
            确定
          </el-button>
          <el-button
            type="primary"
            class="!bg-amber-500 !border-transparent hover:!bg-amber-600"
            @click="navigateToRuntimeMonitor"
          >
            去运行看板处理
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设备直接绑定对话框 -->
    <el-dialog
      v-model="bindDeviceDialogVisible"
      :title="`调整设备角色绑定 - ${bindingRole}`"
      width="520px"
      append-to-body
      class="config-dialog"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <p class="text-sm text-slate-400 leading-relaxed">
          您可以直接选择空闲或属于本作业线的设备进行绑定。已被其他作业线占用的设备不允许直接选择绑定。
        </p>

        <el-form label-position="top">
          <el-form-item label="选择绑定设备 (支持多选)">
            <el-select
              v-model="selectedDeviceIds"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择要绑定的设备"
              class="w-full !bg-slate-900"
            >
              <el-option
                v-for="d in allDevicesOptions"
                :key="d.id"
                :label="`${d.device_code} - ${d.device_name}`"
                :value="d.id"
                :disabled="d.disabled"
              >
                <div class="flex items-center justify-between w-full pr-2">
                  <span
                    class="font-mono text-sm"
                    :class="{ 'text-slate-500': d.disabled }"
                  >
                    {{ d.device_code }}
                  </span>
                  <span
                    class="text-xs"
                    :class="d.disabled ? 'text-rose-500' : 'text-slate-400'"
                  >
                    {{ d.device_name }} {{ d.statusText }}
                  </span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pb-2">
          <el-button
            class="!bg-slate-900 !border-slate-800 !text-slate-300 hover:!bg-slate-800"
            @click="bindDeviceDialogVisible = false"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            class="!bg-amber-500 !border-transparent hover:!bg-amber-600"
            :loading="bindLoading"
            @click="handleSaveDeviceBinding"
          >
            确认绑定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  RefreshCw,
  Cpu,
  Layers,
  Edit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Square,
  ExternalLink,
  Settings,
  ShieldAlert,
  Activity
} from 'lucide-vue-next'
import { workLinesApiMethods } from '@/api/modules/workLines'
import { worklineApiMethods } from '@/api/modules/workline'
import { devicesApiMethods } from '@/api/modules/devices'
import { buildRuntimeWorklineQuery } from '@/utils/runtime-route'
import type { components } from '@/api/generated/openapi-types'

type WorkLine = components['schemas']['WorkLineResponse']
type WorkLineConfigurationStatus = components['schemas']['WorkLineConfigurationStatus']
type Device = components['schemas']['DeviceResponse']
type WorkLinePluginOption = components['schemas']['WorkLinePluginOption']
type WorkLinePluginManifestSummary = components['schemas']['WorkLinePluginManifestSummary']
type WorkLineUpdate = components['schemas']['WorkLineUpdate']

interface WorkloadSummary {
  count: number
  sample?: string | null
  by_type?: {
    sessions?: number
    commands?: number
    inboxes?: number
    outboxes?: number
    runtime_holds?: number
  } | null
}

interface RoleCoverageItem {
  role: string
  min_count: number
  max_count: number | null
  devices: Device[]
  status: string
  statusReason: string
}

// 路由与环境
const route = useRoute()
const router = useRouter()
const worklineId = computed(() => Number(route.params.id))

// 数据状态
const loading = ref(false)
const refreshing = ref(false)
const actionLoading = ref(false)
const workline = ref<WorkLine | null>(null)
const configStatus = ref<WorkLineConfigurationStatus | null>(null)
const devicesList = ref<Device[]>([])
const pluginOptions = ref<WorkLinePluginOption[]>([])
const selectedPluginManifest = ref<WorkLinePluginManifestSummary | null>(null)

// 设备直接绑定
const bindDeviceDialogVisible = ref(false)
const bindLoading = ref(false)
const bindingRole = ref('')
const selectedDeviceIds = ref<number[]>([])
const allDevicesList = ref<Device[]>([])
const originallyBoundDevices = ref<Device[]>([])

const allDevicesOptions = computed(() => {
  const currentWlId = workline.value?.id
  return allDevicesList.value.map(d => {
    const isOccupied =
      d.work_line_id !== null && d.work_line_id !== undefined && d.work_line_id !== currentWlId
    let statusText = '（空闲）'
    if (d.work_line_id !== null && d.work_line_id !== undefined) {
      if (d.work_line_id === currentWlId) {
        statusText = d.device_role ? `（当前已绑定为 ${d.device_role}）` : '（当前已关联）'
      } else {
        statusText = `（已被作业线 ID ${d.work_line_id} 占用）`
      }
    }
    return {
      ...d,
      disabled: isOccupied,
      statusText
    }
  })
})

// 编辑配置表单
const editDialogVisible = ref(false)
const saveLoading = ref(false)
const formRef = ref()
const editForm = ref({
  line_code: '',
  line_name: '',
  line_type: 'AUTO',
  zone_name: '',
  run_mode: 'AUTO',
  plugin_key: '' as string | null,
  contract_version: '' as string | null,
  description: ''
})

// 停用阻断
const blockerDialogVisible = ref(false)
const workloadSummary = ref<WorkloadSummary | null>(null)

// 基础字段显示
const lineTypeLabel = computed(() => {
  const t = workline.value?.line_type
  if (t === 'AUTO') return '自动线'
  if (t === 'MANUAL') return '人工线'
  if (t === 'HYBRID') return '混合线'
  return t || '-'
})

const lineTypeTagType = computed(() => {
  const t = workline.value?.line_type
  if (t === 'AUTO') return 'primary'
  if (t === 'MANUAL') return 'warning'
  if (t === 'HYBRID') return 'success'
  return 'info'
})

const runModeLabel = computed(() => {
  const m = workline.value?.run_mode
  if (m === 'AUTO') return '自动运行'
  if (m === 'MANUAL') return '人工确认'
  if (m === 'SIMULATION') return '沙箱模拟'
  return m || '-'
})

const runModeTagType = computed(() => {
  const m = workline.value?.run_mode
  if (m === 'AUTO') return 'primary'
  if (m === 'MANUAL') return 'warning'
  if (m === 'SIMULATION') return 'info'
  return 'info'
})

// 当前选中的插件合同详情
const selectedPluginEvents = computed(() => selectedPluginManifest.value?.events ?? [])
const selectedPluginCommands = computed(() => selectedPluginManifest.value?.commands ?? [])

// 设备角色覆盖数据构建
const roleCoverageList = computed<RoleCoverageItem[]>(() => {
  const manifest = selectedPluginManifest.value
  if (!manifest) return []

  const requiredRoles = manifest.devices || []
  return requiredRoles.map(req => {
    // 过滤出绑定到当前角色与本工作线下的设备
    const boundDevices = devicesList.value.filter(d => d.device_role === req.role)

    // 判断状态
    let status = 'PASS'
    let statusReason = '通过'

    if (boundDevices.length < req.min_count) {
      status = 'FAIL'
      statusReason = '缺失设备'
    } else if (
      req.max_count !== null &&
      req.max_count !== undefined &&
      boundDevices.length > req.max_count
    ) {
      status = 'FAIL'
      statusReason = '超出限额'
    } else {
      // 检查设备能力
      const checksForRole = configStatus.value?.checks || []
      const deviceCapabilityErrors = checksForRole.filter(
        c => c.code === 'DEVICE_CAPABILITY' && c.context?.role === req.role && c.status === 'FAIL'
      )
      if (deviceCapabilityErrors.length > 0) {
        status = 'FAIL'
        statusReason = '能力不匹配'
      }
    }

    return {
      role: req.role,
      min_count: req.min_count,
      max_count: req.max_count ?? null,
      devices: boundDevices,
      status,
      statusReason
    }
  })
})

// 预检项描述列表
const checksList = computed(() => {
  const checks = configStatus.value?.checks || []
  return checks.map(c => {
    let title = '配置检查'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context = c.context as any
    let message = context?.message || ''

    if (c.code === 'PLUGIN_CONFIGURED') {
      title = '工作线执行插件'
      message =
        c.status === 'PASS'
          ? `已成功选择插件: ${context?.plugin_key}`
          : context?.message || '尚未配置有效插件'
    } else if (c.code === 'CONTRACT_VERSION_CURRENT') {
      title = '插件契约版本'
      message =
        c.status === 'PASS'
          ? `契约版本一致: ${context?.expected}`
          : `版本不匹配 (当前: ${context?.actual || '无'}, 期望: ${context?.expected})`
    } else if (c.code === 'RUN_MODE_ALLOWED') {
      title = '运行模式校验'
      message =
        c.status === 'PASS'
          ? `运行模式合法: ${context?.run_mode}`
          : `运行模式 ${context?.run_mode} 在当前环境 ${context?.app_env} 下不可用 (沙箱模式仅支持开发/测试)`
    } else if (c.code === 'ROLE_REQUIREMENT') {
      title = `角色覆盖: ${context?.role}`
      message =
        c.status === 'PASS'
          ? `已满足要求 (${context?.count}/${context?.min_count})`
          : `设备数量不符 (当前: ${context?.count}, 要求: ${context?.min_count}${context?.max_count ? `-${context?.max_count}` : '+'})`
    } else if (c.code === 'DEVICE_CAPABILITY') {
      title = `设备能力: ${context?.device_code}`
      message =
        c.status === 'PASS'
          ? '设备能力匹配成功'
          : `缺失插件要求能力: ${context?.missing_capabilities?.join(', ')}`
    } else if (c.code === 'EVENT_SOURCE_CAPABILITY') {
      title = `事件回调能力: ${context?.event_type}`
      message =
        c.status === 'PASS'
          ? '已绑定能发送该事件的设备'
          : `缺少设备支持事件回调，关联角色: ${context?.roles?.join(', ')}`
    } else if (c.code === 'COMMAND_TARGET_CAPABILITY') {
      title = `命令下发能力: ${context?.command_type}`
      message =
        c.status === 'PASS'
          ? '已绑定能接收该命令的设备'
          : `缺少设备支持接收该命令，关联角色: ${context?.roles?.join(', ')}`
    }

    return {
      code: c.code,
      title,
      message,
      status: c.status,
      severity: c.severity
    }
  })
})

// 数据获取
let manifestRequestSeq = 0

async function loadSelectedPluginManifest(pluginKey: string | null | undefined) {
  const requestSeq = ++manifestRequestSeq
  selectedPluginManifest.value = null
  if (!pluginKey) return

  try {
    const manifest = await worklineApiMethods.manifest({ plugin_key: pluginKey }).send()
    if (requestSeq === manifestRequestSeq) {
      selectedPluginManifest.value = manifest
    }
  } catch (error: unknown) {
    if (requestSeq === manifestRequestSeq) {
      selectedPluginManifest.value = null
    }
    const err = error as Error
    console.error('加载插件合同详情失败:', err)
    ElMessage.error(err.message || '加载插件合同详情失败')
  }
}

watch(
  () => [workline.value?.plugin_key ?? null, workline.value?.contract_version ?? null] as const,
  ([pluginKey]) => {
    void loadSelectedPluginManifest(pluginKey)
  }
)

async function refreshData(isManual = false) {
  if (isManual) {
    refreshing.value = true
  } else {
    loading.value = true
  }

  try {
    const id = worklineId.value

    // 1. 获取工作线基础信息
    workline.value = await workLinesApiMethods.getById(id).send()

    // 2. 获取预检状态
    configStatus.value = await workLinesApiMethods.configurationStatus({ id }).send()

    // 3. 获取已绑定设备列表
    const devicesRes = (await devicesApiMethods
      .query({
        limit: 100,
        filters: {
          couple: 'and',
          conditions: [
            {
              field: 'work_line_id',
              op: 'eq',
              value: id
            }
          ]
        }
      })
      .send()) as { items?: Device[] }
    devicesList.value = devicesRes?.items || []

    if (isManual) {
      ElMessage.success('状态已刷新')
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('获取作业线配置状态失败:', err)
    ElMessage.error(err.message || '获取配置状态失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 导航
function goBack() {
  router.push({ name: 'WorkLineList' })
}

async function openBindDeviceDialog(row: RoleCoverageItem) {
  bindingRole.value = row.role
  originallyBoundDevices.value = [...row.devices]
  selectedDeviceIds.value = row.devices.map(d => d.id)
  bindDeviceDialogVisible.value = true

  try {
    const res = (await devicesApiMethods
      .query({
        limit: 100,
        filters: {
          couple: 'and',
          conditions: [
            {
              field: 'is_active',
              op: 'eq',
              value: true
            }
          ]
        }
      })
      .send()) as { items?: Device[] }

    const activeDevices = res?.items || []
    const mergedList = [...activeDevices]

    // 确保已绑定的设备即使不活跃也能在列表中正常显示
    for (const d of originallyBoundDevices.value) {
      if (!mergedList.some(item => item.id === d.id)) {
        mergedList.push(d)
      }
    }
    allDevicesList.value = mergedList
  } catch (error: unknown) {
    const err = error as Error
    console.error('获取所有设备列表失败:', err)
    ElMessage.error(err.message || '获取设备列表失败')
  }
}

async function handleSaveDeviceBinding() {
  if (!workline.value) return

  const unbindTargets = originallyBoundDevices.value.filter(
    d => !selectedDeviceIds.value.includes(d.id)
  )
  const bindTargets = selectedDeviceIds.value
    .map(id => allDevicesList.value.find(d => d.id === id))
    .filter((d): d is Device => !!d && !originallyBoundDevices.value.some(ob => ob.id === d.id))

  bindLoading.value = true
  try {
    // 1. 解绑不再选择的设备
    for (const d of unbindTargets) {
      await devicesApiMethods
        .update(d.id, {
          version: d.version,
          work_line_id: null,
          device_role: null
        })
        .send()
    }

    // 2. 绑定新选中的设备
    for (const d of bindTargets) {
      await devicesApiMethods
        .update(d.id, {
          version: d.version,
          work_line_id: workline.value.id,
          device_role: bindingRole.value
        })
        .send()
    }

    ElMessage.success('调整设备角色绑定成功')
    bindDeviceDialogVisible.value = false
    await refreshData()
  } catch (error: unknown) {
    const err = error as Error
    console.error('调整设备角色绑定失败:', err)
    ElMessage.error(err.message || '调整设备角色绑定失败')
  } finally {
    bindLoading.value = false
  }
}

async function handleUnbindDevice(d: Device) {
  if (workline.value?.is_active) {
    ElMessage.warning('作业线处于启用状态，无法解绑设备')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要从当前作业线解绑设备 ${d.device_code} (${d.device_name}) 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'config-message-box'
      }
    )

    loading.value = true
    await devicesApiMethods
      .update(d.id, {
        version: d.version,
        work_line_id: null,
        device_role: null
      })
      .send()

    ElMessage.success(`解绑设备 ${d.device_code} 成功`)
    await refreshData()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      const err = error as Error
      console.error('解绑设备失败:', err)
      ElMessage.error(err.message || '解绑设备失败')
    }
  } finally {
    loading.value = false
  }
}

function navigateToRuntimeMonitor() {
  if (!workline.value) return
  router.push({
    name: 'RuntimeMonitor',
    query: buildRuntimeWorklineQuery(workline.value.id)
  })
}

// 打开编辑弹窗
async function openEditDialog() {
  const item = workline.value
  if (!item) return

  editForm.value = {
    line_code: item.line_code,
    line_name: item.line_name,
    line_type: item.line_type,
    zone_name: item.zone_name || '',
    run_mode: item.run_mode,
    plugin_key: item.plugin_key || '',
    contract_version: item.contract_version || '',
    description: item.description || ''
  }

  editDialogVisible.value = true
}

// 插件改变自动带出默认契约版本
function handlePluginChange(val: string | null) {
  if (!val) {
    editForm.value.contract_version = ''
    return
  }
  const option = pluginOptions.value.find(p => p.plugin_key === val)
  if (option) {
    editForm.value.contract_version = option.default_contract_version || ''
  }
}

// 保存配置
async function handleSaveConfig() {
  if (!workline.value) return
  saveLoading.value = true

  try {
    const id = workline.value.id

    // 构建提交数据
    const patchData: WorkLineUpdate = {
      line_name: editForm.value.line_name,
      zone_name: editForm.value.zone_name || null,
      description: editForm.value.description || null,
      version: workline.value.version // 乐观锁控制
    }

    // 只有在未激活时，才可以修改拓扑敏感字段
    if (!workline.value.is_active) {
      patchData.line_type = editForm.value.line_type as components['schemas']['LineType']
      patchData.run_mode = editForm.value.run_mode as components['schemas']['WorkLineRunMode']
      patchData.plugin_key = editForm.value.plugin_key || null
      patchData.contract_version = editForm.value.contract_version || null
    }

    await workLinesApiMethods.update(id, patchData).send()

    ElMessage.success('保存配置成功')
    editDialogVisible.value = false
    await refreshData()
  } catch (error: unknown) {
    const err = error as Error
    console.error('保存配置失败:', err)
    ElMessage.error(err.message || '保存配置失败')
  } finally {
    saveLoading.value = false
  }
}

// 激活作业线
async function handleActivate() {
  if (!workline.value || !configStatus.value?.can_activate) return

  try {
    await ElMessageBox.confirm(
      `确定要激活作业线【${workline.value.line_name}】吗？激活后，该线体设备的回调和运行时事件将被正常接收处理，不能再直接修改插件及设备拓扑配置。`,
      '激活确认',
      {
        confirmButtonText: '确定激活',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: '!bg-amber-500 hover:!bg-amber-600 !border-transparent'
      }
    )

    actionLoading.value = true
    await workLinesApiMethods
      .activate({ id: workline.value.id }, { version: workline.value.version })
      .send()

    ElMessage.success('作业线激活成功！')
    await refreshData()
  } catch (error: unknown) {
    if (error === 'cancel') return
    const err = error as Error
    console.error('激活失败:', err)
    ElMessage.error(err.message || '激活失败')
  } finally {
    actionLoading.value = false
  }
}

// 停用作业线
async function handleDeactivate() {
  if (!workline.value) return

  try {
    await ElMessageBox.confirm(
      `停用作业线【${workline.value.line_name}】后，所有设备回调将按未激活拒绝，但配置与角色绑定将予以保留。确定停用吗？`,
      '停用确认',
      {
        confirmButtonText: '确定停用',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: '!bg-rose-600 hover:!bg-rose-500 !border-transparent'
      }
    )

    actionLoading.value = true
    await workLinesApiMethods
      .deactivate({ id: workline.value.id }, { version: workline.value.version })
      .send()

    ElMessage.success('作业线已停用')
    await refreshData()
  } catch (error: unknown) {
    if (error === 'cancel') return
    console.error('停用失败:', error)

    // 如果是因为存在运行负载抛出 BusinessException 阻断
    const err = error as { message?: string; detail?: { workload?: WorkloadSummary } }
    if (err.detail && err.detail.workload) {
      workloadSummary.value = err.detail.workload
      blockerDialogVisible.value = true
    } else {
      ElMessage.error(err.message || '停用失败')
    }
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // 获取全部可用插件选项
    pluginOptions.value = await worklineApiMethods.options().send()

    // 加载工作线详细数据
    await refreshData()
  } catch (error) {
    console.error('配置工作台初始化失败:', error)
    ElMessage.error('初始化配置工作台失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.config-page :deep(.el-card) {
  --el-card-border-color: #334155;
  --el-card-bg-color: #1e293b;
  --el-card-padding: 20px;
}

.config-page :deep(.el-card__header) {
  border-bottom: 1.5px solid #334155;
  padding: 14px 20px;
  background-color: rgb(30, 41, 59, 0.5);
}

.config-descriptions :deep(.el-descriptions__body) {
  background-color: transparent;
}

.config-descriptions :deep(.el-descriptions__label) {
  background-color: rgb(15, 23, 42, 0.45) !important;
  color: #94a3b8 !important;
  border-color: #334155 !important;
  width: 140px;
}

.config-descriptions :deep(.el-descriptions__content) {
  background-color: transparent !important;
  color: #f8fafc !important;
  border-color: #334155 !important;
}

.config-table :deep(.el-table__header-wrapper) th {
  background-color: #0f172a !important;
  color: #94a3b8 !important;
  border-bottom: 2px solid #334155 !important;
}

.config-table :deep(.el-table__row) td {
  background-color: #1e293b !important;
  border-bottom: 1px solid #334155 !important;
  color: #f8fafc;
}

.config-table :deep(.el-table__row):hover td {
  background-color: rgb(15, 23, 42, 0.3) !important;
}

.config-table :deep(.el-table__inner-wrapper::after),
.config-table :deep(.el-table::before) {
  background-color: #334155 !important;
}

/* 弹出框主题化 */
.config-dialog :deep(.el-dialog) {
  background-color: #1e293b !important;
  border: 1px solid #334155 !important;
  border-radius: 8px;
}

.config-dialog :deep(.el-dialog__title) {
  color: #f8fafc !important;
  font-weight: 600;
}

.config-dialog :deep(.el-dialog__body) {
  color: #e2e8f0 !important;
}

.config-dialog :deep(.el-form-item__label) {
  color: #94a3b8 !important;
  font-weight: 500;
}

.config-dialog :deep(.el-input__wrapper) {
  background-color: #0f172a !important;
  box-shadow: 0 0 0 1px #334155 inset !important;
}

.config-dialog :deep(.el-input__inner) {
  color: #f8fafc !important;
}

.config-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #f59e0b inset !important;
}

.config-dialog :deep(.el-textarea__inner) {
  background-color: #0f172a !important;
  box-shadow: 0 0 0 1px #334155 inset !important;
  color: #f8fafc !important;
}

.config-dialog :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #f59e0b inset !important;
}

.config-dialog :deep(.el-select__wrapper) {
  background-color: #0f172a !important;
  box-shadow: 0 0 0 1px #334155 inset !important;
}

.config-dialog :deep(.el-select__selected-item) {
  color: #f8fafc !important;
}

.config-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #334155;
  padding-top: 16px;
}
</style>
