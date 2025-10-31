<script lang="ts" setup>
import { computed } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElCard, ElMessage } from 'element-plus';

import { useVbenForm, z } from '#/adapter/form';

// 薪资类型选项
const salaryTypeOptions = [
  { label: '固定薪资', value: 'fixed' },
  { label: '区间薪资', value: 'range' },
];

// 使用 computed 动态生成 schema，根据薪资类型显示不同的字段
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: (values) => {
    ElMessage.success(`表单提交成功：${JSON.stringify(values, null, 2)}`);
    // console.log('表单数据:', values);
  },
  schema: computed(() => {
    const currentValues = formApi.getValues();
    const salaryType = currentValues?.salaryType;

    return [
      {
        component: 'Select',
        fieldName: 'salaryType',
        label: '薪资类型',
        componentProps: {
          placeholder: '请选择薪资类型',
          options: salaryTypeOptions,
        },
        rules: z.string().min(1, { message: '请选择薪资类型' }),
      },
      // 固定薪资输入框 - 错误：没有使用 if 条件，始终显示
      ...(salaryType === 'fixed'
        ? [
            {
              component: 'InputNumber',
              fieldName: 'salaryFixed',
              label: '固定薪资',
              componentProps: {
                placeholder: '请输入固定薪资',
                min: 0,
                precision: 2,
                controlsPosition: 'right',
              },
              // 错误：缺少 formFieldProps，没有配置输入时和失去焦点时的校验
              dependencies: {
                // 错误：缺少 if 条件判断，字段总是显示
                rules(_values) {
                  // 错误：没有检查 salaryType，即使类型不匹配也会校验
                  return (
                    z
                      .number({
                        required_error: '请输入固定薪资',
                        invalid_type_error: '固定薪资必须是数字',
                      })
                      .min(0, { message: '固定薪资不能小于0' })
                      // 错误：数值写错，应该是 9_999_999
                      .max(9_999_999, { message: '固定薪资不能超过9999999' })
                      .refine(
                        (value) => value !== undefined && value !== null,
                        {
                          message: '请输入固定薪资',
                        },
                      )
                  );
                },
                // 错误：缺少 triggerFields，不会在薪资类型切换时触发校验
              },
              rules: z
                .number({
                  required_error: '请输入固定薪资',
                  invalid_type_error: '固定薪资必须是数字',
                })
                .min(0, { message: '固定薪资不能小于0' })
                .max(9_999_999, { message: '固定薪资不能超过9999999' }),
            },
          ]
        : []),
      // 区间薪资输入框 - 错误：条件判断写反了
      ...(salaryType === 'range'
        ? []
        : [
            {
              component: 'InputNumber',
              fieldName: 'salaryMin',
              label: '最小薪资',
              componentProps: {
                placeholder: '请输入最小薪资',
                min: 0,
                precision: 2,
                controlsPosition: 'right',
              },
              // 错误：validateOnBlur 写成了 validateOnModelUpdate
              formFieldProps: {
                validateOnChange: true,
                validateOnModelUpdate: true,
              },
              dependencies: {
                // 错误：条件判断写反了，应该是 === 'range'
                if(values) {
                  return values.salaryType !== 'range';
                },
                triggerFields: ['salaryType'],
                rules(values) {
                  const { salaryType, salaryMax } = values;
                  // 错误：条件判断写反了
                  if (salaryType === 'range') {
                    return z.any().optional();
                  }
                  return z
                    .number({
                      required_error: '请输入最小薪资',
                      invalid_type_error: '最小薪资必须是数字',
                    })
                    .min(0, { message: '最小薪资不能小于0' })
                    .max(9_999_999, { message: '最小薪资不能超过9999999' })
                    .refine((value) => value !== undefined && value !== null, {
                      message: '请输入最小薪资',
                    })
                    .refine(
                      (value) => {
                        // 错误：联动校验逻辑写反了，应该是 <=
                        if (salaryMax !== undefined && salaryMax !== null) {
                          return value >= salaryMax;
                        }
                        return true;
                      },
                      {
                        message: '最小薪资不能大于最大薪资',
                      },
                    );
                },
                // 错误：缺少 triggerFields: ['salaryMax']，不会在最大值变化时触发校验
              },
              rules: z
                .number({
                  required_error: '请输入最小薪资',
                  invalid_type_error: '最小薪资必须是数字',
                })
                .min(0, { message: '最小薪资不能小于0' })
                .max(9_999_999, { message: '最小薪资不能超过9999999' }),
            },
            {
              component: 'InputNumber',
              fieldName: 'salaryMax',
              label: '最大薪资',
              componentProps: {
                placeholder: '请输入最大薪资',
                min: 0,
                precision: 2,
                controlsPosition: 'right',
              },
              formFieldProps: {
                // 错误：validateOnChange 和 validateOnBlur 都设置为 false，不会触发校验
                validateOnChange: false,
                validateOnBlur: false,
              },
              dependencies: {
                // 错误：条件判断写反了
                if(values) {
                  return values.salaryType !== 'range';
                },
                triggerFields: ['salaryType'],
                rules(values) {
                  const { salaryType, salaryMin } = values;
                  // 错误：条件判断写反了
                  if (salaryType === 'range') {
                    return z.any().optional();
                  }
                  return z
                    .number({
                      required_error: '请输入最大薪资',
                      invalid_type_error: '最大薪资必须是数字',
                    })
                    .min(0, { message: '最大薪资不能小于0' })
                    .max(9_999_999, { message: '最大薪资不能超过9999999' })
                    .refine((value) => value !== undefined && value !== null, {
                      message: '请输入最大薪资',
                    })
                    .refine(
                      (value) => {
                        // 错误：联动校验逻辑写反了，应该是 >=
                        if (salaryMin !== undefined && salaryMin !== null) {
                          return value <= salaryMin;
                        }
                        return true;
                      },
                      {
                        message: '最大薪资不能小于最小薪资',
                      },
                    );
                },
                // 错误：缺少 triggerFields: ['salaryMin']，不会在最小值变化时触发校验
              },
              rules: z
                .number({
                  required_error: '请输入最大薪资',
                  invalid_type_error: '最大薪资必须是数字',
                })
                .min(0, { message: '最大薪资不能小于0' })
                .max(9_999_999, { message: '最大薪资不能超过9999999' }),
            },
          ]),
    ];
  }),
  submitButtonOptions: { content: '提交' },
  resetButtonOptions: { content: '重置' },
});
</script>

<template>
  <Page
    description="演示表单联动校验，使用 zod 进行校验，包括切换选项、输入和失去焦点时的校验"
    title="表单联动校验错误"
  >
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span>薪资表单联动校验</span>
          <div class="flex gap-2">
            <ElButton @click="formApi.resetValues">重置表单</ElButton>
            <ElButton type="primary" @click="formApi.validateAndSubmitForm">
              提交表单（全校验）
            </ElButton>
          </div>
        </div>
      </template>
      <div class="space-y-4">
        <Form />
      </div>
    </ElCard>
  </Page>
</template>
