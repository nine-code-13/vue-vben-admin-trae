<script lang="ts" setup>
import { ref } from 'vue';

import {
  ElButton,
  ElDialog,
  ElDrawer,
  ElMessage,
  ElMessageBox,
} from 'element-plus';

import { useVbenForm, z } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchUpdateNovelStatusApi,
  createNovelApi,
  deleteNovelApi,
  downloadTemplateApi,
  exportNovelListApi,
  getCategoryListApi,
  getCopyrightHolderListApi,
  getNovelListApi,
  importNovelListApi,
  updateNovelApi,
} from '#/api/novel';

import ChapterList from '../chapter/index.vue';

// 格式化浏览量
const formatViewCount = (count: number): string => {
  if (count === 0) return '0';
  if (count >= 1_000_000) {
    if (count >= 99_999_999) return '999m+';
    return `${(count / 1_000_000).toFixed(1)}m`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref('新建小说');
const dialogMode = ref<'create' | 'edit' | 'view'>('create');
const selectedNovel = ref<any>(null);

// 章节列表抽屉
const chapterDrawerVisible = ref(false);
const currentNovelId = ref<string>('');

// 批量操作
const selectedRowKeys = ref<string[]>([]);

// 新建/编辑/预览表单
const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  labelWidth: 120,
  handleSubmit: async (values) => {
    try {
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (dialogMode.value === 'create') {
        await createNovelApi(values);
        ElMessage.success('新建成功');
      } else if (dialogMode.value === 'edit' && selectedNovel.value) {
        await updateNovelApi(selectedNovel.value.id, values);
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
      fieldName: 'name',
      label: '小说名称',
      componentProps: {
        placeholder: '请输入小说名称',
        maxlength: 120,
      },
      rules: z.string().min(1, { message: '请输入小说名称' }),
    },
    {
      component: 'Input',
      fieldName: 'chineseName',
      label: '中文名称',
      componentProps: {
        placeholder: '请输入中文名称',
        maxlength: 120,
      },
      rules: z.string().min(1, { message: '请输入中文名称' }),
    },
    {
      component: 'ApiSelect',
      fieldName: 'category',
      label: '分类',
      componentProps: {
        placeholder: '请选择分类',
        api: getCategoryListApi,
      },
      rules: z.string().min(1, { message: '请选择分类' }),
    },
    {
      component: 'Select',
      fieldName: 'language',
      label: '语言',
      componentProps: {
        placeholder: '请选择语言',
        options: [{ label: '英语', value: '英语' }],
      },
      defaultValue: '英语',
      rules: z.string().min(1, { message: '请选择语言' }),
    },
    {
      component: 'Input',
      fieldName: 'author',
      label: '作者',
      componentProps: {
        placeholder: '请输入作者',
        maxlength: 40,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'copyrightHolder',
      label: '版权方',
      componentProps: {
        placeholder: '请选择版权方',
        api: getCopyrightHolderListApi,
      },
      rules: z.string().min(1, { message: '请选择版权方' }),
    },
    {
      component: 'Input',
      fieldName: 'introduction',
      label: '简介',
      componentProps: {
        placeholder: '请输入简介',
        maxlength: 200,
        type: 'textarea',
        rows: 3,
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'authorizationTime',
      label: '授权时间',
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
    {
      component: 'Upload',
      fieldName: 'cover',
      label: '封面上传',
      componentProps: {
        action: 'https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15',
        accept: 'image/*',
        showFileList: true,
        fileList: [],
      },
      rules: z.string().min(1, { message: '请上传封面' }),
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
      fieldName: 'wordCount',
      label: '字数',
      componentProps: {
        placeholder: '请输入字数',
        min: 1,
        max: 99_999_999,
        precision: 0,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'viewCount',
      label: '浏览量',
      componentProps: {
        placeholder: '请输入浏览量',
        min: 1,
        max: 99_999_999,
        precision: 0,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '上架', value: '上架' },
          { label: '下架', value: '下架' },
        ],
      },
      defaultValue: '下架',
      rules: z.string().min(1, { message: '请选择状态' }),
    },
  ],
});

// 搜索表单配置
const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'novelId',
      label: '小说编号',
      componentProps: {
        placeholder: '请输入小说编号',
      },
    },
    {
      component: 'Input',
      fieldName: 'novelName',
      label: '小说名称',
      componentProps: {
        placeholder: '请输入小说名称',
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'category',
      label: '分类',
      defaultValue: 'all',
      componentProps: {
        placeholder: '请选择分类',
        api: getCategoryListApi,
        options: [{ label: '全部', value: 'all' }, ...getCategoryListApi()],
      },
    },
    {
      component: 'Input',
      fieldName: 'copyrightHolder',
      label: '版权方',
      componentProps: {
        placeholder: '请输入版权方',
      },
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
          { label: '上架', value: '上架' },
          { label: '下架', value: '下架' },
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
      title: '小说编号',
      width: 120,
    },
    {
      field: 'name',
      title: '小说名称',
      width: 200,
    },
    {
      field: 'language',
      title: '语言',
      width: 100,
    },
    {
      field: 'chapters',
      title: '章数',
      width: 100,
    },
    {
      field: 'viewCount',
      title: '浏览量',
      width: 120,
      slots: {
        default: ({ row }: { row: any }) => formatViewCount(row.viewCount),
      },
    },
    {
      field: 'category',
      title: '分类',
      width: 120,
    },
    {
      field: 'chineseName',
      title: '中文名称',
      width: 200,
    },
    {
      field: 'copyrightHolder',
      title: '版权方',
      width: 150,
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
      field: 'status',
      title: '状态',
      width: 120,
      slots: {
        default: ({ row }: { row: any }) => (
          <ElButton
            onClick={() => toggleStatus(row)}
            size="small"
            type={row.status === '上架' ? 'success' : 'warning'}
          >
            {row.status === '上架' ? '上架' : '下架'}
          </ElButton>
        ),
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
      width: 200,
      slots: {
        default: ({ row }: { row: any }) => [
          <ElButton
            onClick={() => openDialog('edit', row)}
            size="small"
            style={{ marginRight: '8px' }}
            type="primary"
          >
            编辑
          </ElButton>,
          <ElButton
            onClick={() => openChapterList(row.id)}
            size="small"
            style={{ marginRight: '8px' }}
            type="success"
          >
            章节列表
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
          ...filters,
        };
        const result = await getNovelListApi(params);
        return result;
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
    slots: {
      buttons: () => [
        <ElButton
          onClick={() => handleImport()}
          size="small"
          style={{ marginRight: '8px' }}
          type="primary"
        >
          导入
        </ElButton>,
        <ElButton
          onClick={() => downloadTemplate()}
          size="small"
          style={{ marginRight: '8px' }}
          type="warning"
        >
          模板下载
        </ElButton>,
        <ElButton onClick={() => handleExport()} size="small" type="success">
          导出
        </ElButton>,
      ],
    },
  },
};

// 表格配置
const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

// 导入对话框可见性
const importDialogVisible = ref(false);
// 导入文件列表
const importFileList = ref([]);

// 打开导入对话框
function handleImport() {
  importDialogVisible.value = true;
}

// 导入成功后的回调
function handleImportSuccess(response: any) {
  importDialogVisible.value = false;
  importFileList.value = [];
  ElMessage.success(
    `导入成功，共导入 ${response.successCount} 条小说，失败 ${response.failureCount} 条`,
  );
  gridApi.commitProxy('reload');
}

// 导入失败后的回调
function handleImportError(error: any) {
  ElMessage.error(`导入失败：${error.message}`);
}

// 导入前的处理
function handleBeforeUpload(file: File) {
  // 检查文件大小
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('上传文件大小不能超过 5MB!');
    return false;
  }
  // 检查文件类型
  const isExcel =
    file.type === 'application/vnd.ms-excel' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!');
    return false;
  }
  return true;
}

// 提交导入
function handleImportSubmit() {
  if (importFileList.value.length === 0) {
    ElMessage.warning('请选择要导入的文件');
    return;
  }
  const file = importFileList.value[0].raw;
  if (!file) {
    ElMessage.warning('请选择要导入的文件');
    return;
  }
  importNovelListApi(file)
    .then((response) => {
      handleImportSuccess(response);
    })
    .catch((error) => {
      handleImportError(error);
    });
}

// 下载导入模板
function downloadTemplate() {
  downloadTemplateApi()
    .then((response) => {
      // 创建下载链接
      const blob = new Blob([response.data], {
        type: 'application/vnd.ms-excel',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '小说导入模板.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      ElMessage.success('模板下载成功');
    })
    .catch((error) => {
      ElMessage.error(`模板下载失败：${error.message}`);
    });
}

// 导出功能
const handleExport = async () => {
  try {
    const params = formApi.getValues();
    const response = await exportNovelListApi(params);
    // 创建下载链接
    const blob = new Blob([response.data], {
      type: 'application/vnd.ms-excel',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '小说列表.xlsx';
    link.click();
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error(`导出失败：${error.message}`);
  }
};

// 打开对话框
function openDialog(mode: 'create' | 'edit' | 'view', row?: any) {
  const isView = mode === 'view';
  dialogMode.value = mode;
  dialogTitle.value =
    mode === 'create' ? '新建小说' : mode === 'edit' ? '编辑小说' : '预览小说';

  if (mode === 'create') {
    formApi.setValues({});
  } else if (row) {
    selectedNovel.value = row;
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

// 打开章节列表
function openChapterList(novelId: string) {
  currentNovelId.value = novelId;
  chapterDrawerVisible.value = true;
}

// 切换状态
async function toggleStatus(row: any) {
  try {
    const newStatus = row.status === '上架' ? '下架' : '上架';
    await updateNovelApi(row.id, { status: newStatus });
    row.status = newStatus;
    ElMessage.success('状态修改成功');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '状态修改失败');
  }
}

// 删除小说
async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这本小说吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await deleteNovelApi(id);
    ElMessage.success('删除成功');
    gridApi.commitProxy('reload');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : '删除失败');
    }
  }
}

// 批量上架
async function batch上架() {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning('请选择要上架的小说');
    return;
  }
  try {
    await ElMessageBox.confirm('确定要批量上架选中的小说吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await batchUpdateNovelStatusApi(selectedRowKeys.value, '上架');
    ElMessage.success('批量上架成功');
    gridApi.commitProxy('reload');
    selectedRowKeys.value = [];
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : '批量上架失败');
    }
  }
}

// 批量下架
async function batch下架() {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning('请选择要下架的小说');
    return;
  }
  try {
    await ElMessageBox.confirm('确定要批量下架选中的小说吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await batchUpdateNovelStatusApi(selectedRowKeys.value, '下架');
    ElMessage.success('批量下架成功');
    gridApi.commitProxy('reload');
    selectedRowKeys.value = [];
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : '批量下架失败');
    }
  }
}
</script>

<template>
  <div class="w-full p-3">
    <Grid class="w-full">
      <template #toolbar-tools>
        <ElButton type="primary" @click="openDialog('create')">
          新建小说
        </ElButton>
        <ElButton
          type="primary"
          @click="batch上架"
          :disabled="selectedRowKeys.length === 0"
        >
          批量上架
        </ElButton>
        <ElButton
          type="warning"
          @click="batch下架"
          :disabled="selectedRowKeys.length === 0"
        >
          批量下架
        </ElButton>
        <ElButton type="primary" @click="handleExport"> 导出 </ElButton>
      </template>
    </Grid>
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="true"
      :destroy-on-close="true"
    >
      <Form :disabled="dialogMode === 'view'" />
    </ElDialog>
    <ElDrawer
      v-model="chapterDrawerVisible"
      title="章节列表"
      direction="rtl"
      :before-close="
        () => {
          chapterDrawerVisible = false;
          return true;
        }
      "
      style="width: 800px"
    >
      <ChapterList
        :novel-id="currentNovelId"
        @close="chapterDrawerVisible = false"
      />
    </ElDrawer>
    <!-- 导入对话框 -->
    <ElDialog
      v-model:visible="importDialogVisible"
      title="导入小说"
      width="500px"
      :before-close="() => (importDialogVisible.value = false)"
    >
      <div style="margin-bottom: 20px">
        <ElUpload
          v-model:file-list="importFileList"
          accept=".xlsx,.xls"
          :auto-upload="false"
          :limit="1"
          :before-upload="handleBeforeUpload"
        >
          <ElButton type="primary">选择文件</ElButton>
          <template #tip>
            <div class="el-upload__tip">只能上传Excel文件，且不超过5MB</div>
          </template>
        </ElUpload>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="importDialogVisible.value = false">取消</ElButton>
          <ElButton type="primary" @click="handleImportSubmit"> 导入 </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
/* 样式代码保持不变 */
</style>
