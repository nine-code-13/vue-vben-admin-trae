import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:book-open',
      order: 10,
      title: '小说管理',
    },
    name: 'NovelManagement',
    path: '/novel-management',
    children: [
      {
        name: 'NovelList',
        path: '/novel-management/novel',
        component: () => import('#/views/novel-management/novel/index.vue'),
        meta: {
          icon: 'lucide:book',
          title: $t('page.novelManagement.novelList'),
        },
      },
      {
        name: 'ChapterList',
        path: '/novel-management/chapter/:novelId',
        component: () => import('#/views/novel-management/chapter/index.vue'),
        meta: {
          hidden: true,
          title: $t('page.novelManagement.chapterList'),
        },
      },
    ],
  },
];

export default routes;
