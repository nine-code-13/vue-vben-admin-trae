<script lang="ts" setup>
import { ref } from 'vue';

import { ElButton, ElDialog, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenForm, z } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createChapterApi,
  deleteChapterApi,
  getChapterListApi,
  updateChapterApi,
} from '#/api/chapter';

// 接收小说ID作为prop
const props = defineProps<{
  novelId: string;
}>();

// 定义事件
const emit = defineEmits<{
  close: [];
}>();

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref('新建章节');
const dialogMode = ref<'create' | 'edit' | 'view'>('create');
const selectedChapter = ref<any>(null);

// 新建/编辑/预览表单
const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  labelWidth: 120,
  handleSubmit: async (values) => {
    try {
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (dialogMode.value === 'create') {
        await createChapterApi({
          ...values,
          novelId: props.novelId,
        });
        ElMessage.success('新建成功');
      } else if (dialogMode.value === 'edit' && selectedChapter.value) {
        await updateChapterApi(selectedChapter.value.id, values);
        ElMessage.success('编辑成功');
      }
      dialogVisible.value = false;
      // 刷新列表
      gridApi.commitProxy('reload');
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '操作失败');
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
      component: 'Input',
      fieldName: 'title',
      label: '章节标题',
      componentProps: {
        placeholder: '请输入章节标题',
        maxlength: 120,
      },
      rules: z.string().min(1, { message: '请输入章节标题' }),
    },
    {
      component: 'InputNumber',
      fieldName: 'chapterNumber',
      label: '章节',
      componentProps: {
        placeholder: '请输入章节',
        min: 1,
        max: 99,
        precision: 0,
      },
      rules: z
        .number()
        .min(1, { message: '请输入章节' })
        .max(99, { message: '章节不能超过99' }),
    },
    {
      component: 'Select',
      fieldName: 'isPaid',
      label: '是否收费',
      componentProps: {
        placeholder: '请选择是否收费',
        options: [
          { label: '收费', value: true },
          { label: '免费', value: false },
        ],
      },
      defaultValue: true,
      rules: z
        .boolean()
        .refine((val) => val !== undefined, { message: '请选择是否收费' }),
    },
    {
      component: 'InputNumber',
      fieldName: 'price',
      label: '章节价格',
      componentProps: {
        placeholder: '请输入章节价格',
        min: 1,
        max: 9999,
        precision: 0,
      },
      show: (formData: any) => formData.isPaid === true,
      rules: z
        .number()
        .min(1, { message: '请输入章节价格' })
        .max(9999, { message: '章节价格不能超过9999' }),
    },
    {
      component: 'Input',
      fieldName: 'content',
      label: '章节内容',
      componentProps: {
        placeholder: '请输入章节内容',
        type: 'textarea',
        rows: 10,
      },
      rules: z.string().min(1, { message: '请输入章节内容' }),
    },
  ],
});

// 搜索表单配置
const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'chapterId',
      label: '章节编号',
      componentProps: {
        placeholder: '请输入章节编号',
      },
    },
    {
      component: 'Input',
      fieldName: 'chapterTitle',
      label: '章节标题',
      componentProps: {
        placeholder: '请输入章节标题',
      },
    },
    {
      component: 'Select',
      fieldName: 'isPaid',
      label: '是否收费',
      defaultValue: 'all',
      componentProps: {
        placeholder: '请选择是否收费',
        options: [
          { label: '全部', value: 'all' },
          { label: '收费', value: 'paid' },
          { label: '免费', value: 'free' },
        ],
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'createTime',
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
    {
      field: 'id',
      title: '章节编号',
      width: 120,
    },
    {
      field: 'title',
      title: '章节标题',
      width: 250,
    },
    {
      field: 'chapterNumber',
      title: '章节',
      width: 100,
    },
    {
      field: 'isPaid',
      title: '是否收费',
      width: 120,
      slots: {
        default: ({ row }: { row: any }) => (row.isPaid ? '收费' : '免费'),
      },
    },
    {
      field: 'price',
      title: '章节价格',
      width: 120,
      slots: {
        default: ({ row }: { row: any }) => (row.isPaid ? row.price : '-'),
      },
    },
    {
      field: 'creator',
      title: '创建用户',
      width: 120,
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 200,
    },
    {
      title: '操作',
      fixed: 'right',
      width: 180,
      slots: {
        default: ({ row }: { row: any }) => [
          <ElButton
            onClick={() => openDialog('view', row)}
            size="small"
            style={{ marginRight: '8px' }}
            type="primary"
          >
            查看
          </ElButton>,
          <ElButton
            onClick={() => openDialog('edit', row)}
            size="small"
            style={{ marginRight: '8px' }}
            type="success"
          >
            编辑
          </ElButton>,
          <ElButton
            onClick={() => handleDelete(row.id)}
            size="small"
            type="danger"
          >
            删除
          </ElButton>,
        ],
      },
    },
  ],
  pagerConfig: {
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page, filters }: { filters: any; page: any }) => {
        const params = {
          pageIndex: page.currentPage,
          pageSize: page.pageSize,
          novelId: props.novelId,
          ...filters,
        };
        const result = await getChapterListApi(params);
        return result;
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

// 表格配置
const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

// 打开对话框
function openDialog(mode: 'create' | 'edit' | 'view', row?: any) {
  const isView = mode === 'view';
  dialogMode.value = mode;
  dialogTitle.value =
    mode === 'create' ? '新建章节' : mode === 'edit' ? '编辑章节' : '查看章节';

  if (mode === 'create') {
    formApi.setValues({});
  } else if (row) {
    selectedChapter.value = row;
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

// 删除章节
async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await deleteChapterApi(id);
    ElMessage.success('删除成功');
    gridApi.commitProxy('reload');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : '删除失败');
    }
  }
}

// 关闭抽屉
function handleClose() {
  emit('close');
}
</script>

<template>
  <div class="w-full p-3">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-xl font-bold">章节管理</h3>
      <ElButton type="primary" @click="openDialog('create')">
        新建章节
      </ElButton>
    </div>
    <Grid class="w-full" />
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="true"
      :destroy-on-close="true"
    >
      <Form :disabled="dialogMode === 'view'" />
    </ElDialog>
  </div>
</template>

<style scoped>
/* 样式代码保持不变 */
</style>
