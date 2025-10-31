<script lang="ts" setup>
import { h, ref } from 'vue';

import { ElButton, ElDialog, ElMessage, ElSwitch } from 'element-plus';

import { useVbenForm, z } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

defineOptions({ name: 'PasswordManagement' });

// 对话框相关
const dialogVisible = ref(false);
const drawerTitle = ref('新建口令');
const drawerMode = ref<'create' | 'edit' | 'view'>('create');

// 新建/编辑/预览表单
const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  labelWidth: 120,
  handleSubmit: async (values) => {
    try {
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (drawerMode.value === 'create') {
        ElMessage.success('新建成功');
      }
      dialogVisible.value = false;
      // 刷新列表
      gridApi.commitProxy('reload');
    } catch {
      ElMessage.error('操作失败');
    }
  },
  showResetButton: true,
  resetButtonOptions: {
    content: '取消',
    onClick: () => {
      dialogVisible.value = false;
    },
  },
  submitButtonOptions: { content: '确认' },
  schema: [
    {
      component: 'ApiSelect',
      fieldName: 'novel_id',
      label: '选择小说',
      componentProps: {
        placeholder: '点击选择小说',
        api: async () => [
          { label: '斗破苍穹 (NOVEL001)', value: 'NOVEL001' },
          { label: '武动乾坤 (NOVEL002)', value: 'NOVEL002' },
          { label: '大主宰 (NOVEL003)', value: 'NOVEL003' },
          { label: '元尊 (NOVEL004)', value: 'NOVEL004' },
          { label: '圣墟 (NOVEL005)', value: 'NOVEL005' },
        ],
      },
      rules: z.string().min(1, { message: '请选择小说' }),
    },
    {
      component: 'Input',
      fieldName: 'channel_name',
      label: '渠道名称',
      componentProps: {
        placeholder: '请输入渠道名称',
        maxlength: 40,
      },
      rules: z.string().min(1, { message: '请输入渠道名称' }),
    },
    {
      component: 'InputNumber',
      fieldName: 'generate_count',
      label: '生成数量',
      componentProps: {
        placeholder: '请输入生成数量',
        min: 1,
        max: 99,
        precision: 0,
      },
      rules: z
        .number({ message: '请输入生成数量' })
        .min(1, { message: '请输入生成数量' })
        .max(99, { message: '生成数量不能超过99' }),
    },
  ],
});

function openDialog(mode: 'create' | 'edit' | 'view', row?: any) {
  const isView = mode === 'view';
  drawerMode.value = mode;
  drawerTitle.value =
    mode === 'create' ? '新建口令' : mode === 'edit' ? '编辑口令' : '预览口令';

  if (mode === 'create') {
    formApi.setValues({});
  } else if (row) {
    formApi.setValues({
      ...row,
    });
  }
  formApi.setState({
    commonConfig: {
      disabled: isView,
    },
    showDefaultActions: !isView,
  });
  dialogVisible.value = true;
}

// 搜索表单配置
const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'novel_id',
      label: '小说编号',
      componentProps: { placeholder: '请输入小说编号' },
    },
    {
      component: 'Input',
      fieldName: 'novel_name',
      label: '小说名称',
      componentProps: { placeholder: '请输入小说名称' },
    },
    {
      component: 'Input',
      fieldName: 'channel_name',
      label: '渠道名称',
      componentProps: { placeholder: '请输入渠道名称' },
    },
    {
      component: 'Input',
      fieldName: 'password',
      label: '口令',
      componentProps: { placeholder: '请输入口令' },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      defaultValue: 'all',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '全部', value: 'all' },
          { label: '有效', value: '1' },
          { label: '无效', value: '0' },
        ],
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'create_time',
      label: '创建时间',
      componentProps: {
        type: 'daterange',
        placeholder: '开始日期至结束日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        rangeSeparator: '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
      },
    },
  ],
  submitButtonOptions: { content: '查询' },
};

// 表格配置
const gridOptions = {
  columns: [
    { field: 'id', title: '口令编号' },
    { field: 'novel_id', title: '小说编号' },
    { field: 'novel_name', title: '小说名称' },
    { field: 'channel_name', title: '渠道名称' },
    { field: 'password', title: '口令' },
    { field: 'creator', title: '创建用户' },
    { field: 'create_time', title: '创建时间' },
    {
      title: '状态',
      field: 'status',
      slots: {
        default: ({ row }: { row: any }) => [
          h(ElSwitch, {
            modelValue: row.status === 1,
            onChange: async (value: boolean) => {
              try {
                // 模拟API调用延迟
                await new Promise((resolve) => setTimeout(resolve, 500));
                row.status = value ? 1 : 0;
                ElMessage.success('状态修改成功');
              } catch {
                ElMessage.error('状态修改失败');
              }
            },
          }),
        ],
      },
    },
  ],
  pagerConfig: {
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({
        page,
        sorts,
        filters,
      }: {
        filters: any;
        page: any;
        sorts: any;
      }) => {
        // 生成模拟数据
        const generateMockData = () => {
          const mockList: any[] = [];
          const novelNames = ['斗破苍穹', '武动乾坤', '大主宰', '元尊', '圣墟'];
          const channelNames = ['抖音', '快手', '微信', '微博', '小红书'];
          const creators = ['admin', 'system', 'operator', 'manager'];
          const passwords = ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345'];

          for (let i = 1; i <= 100; i++) {
            mockList.push({
              id: i,
              novel_id: `NOVEL${String(i).padStart(3, '0')}`,
              novel_name:
                novelNames[Math.floor(Math.random() * novelNames.length)],
              channel_name:
                channelNames[Math.floor(Math.random() * channelNames.length)],
              password: passwords[Math.floor(Math.random() * passwords.length)],
              creator: creators[Math.floor(Math.random() * creators.length)],
              create_time: new Date(
                Date.now() -
                  Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
              ).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              }),
              status: Math.random() > 0.5 ? 1 : 0,
            });
          }
          return mockList;
        };

        // 模拟API调用延迟
        await new Promise((resolve) => setTimeout(resolve, 500));

        const allData = generateMockData();
        const startIndex = (page.currentPage - 1) * page.pageSize;
        const endIndex = startIndex + page.pageSize;
        const items = allData.slice(startIndex, endIndex);

        return {
          items,
          total: allData.length,
        };
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true,
  },
};

// 表格配置
const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

// 导出功能
const handleExport = async () => {
  try {
    // 模拟导出延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ElMessage.success('导出成功');
  } catch {
    ElMessage.error('导出失败');
  }
};
</script>

<template>
  <div class="w-full p-3">
    <Grid class="w-full">
      <template #toolbar-tools>
        <ElButton type="primary" @click="openDialog('create')">
          新建口令
        </ElButton>
        <ElButton type="primary" @click="handleExport"> 导出 </ElButton>
      </template>
    </Grid>
    <ElDialog
      v-model="dialogVisible"
      :title="drawerTitle"
      width="500px"
      :close-on-click-modal="true"
      :destroy-on-close="true"
    >
      <Form :disabled="drawerMode === 'view'" />
    </ElDialog>
  </div>
</template>

<style scoped>
/* 样式代码保持不变 */
</style>
