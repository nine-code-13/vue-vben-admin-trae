// 模拟小说数据
const mockNovels = [
  {
    id: 'NOVEL001',
    name: '斗破苍穹',
    chineseName: '斗破苍穹',
    category: '玄幻',
    language: '中文',
    author: '天蚕土豆',
    copyrightHolder: '起点中文网',
    introduction:
      '天才少年萧炎在创造了家族空前绝后的修炼纪录后突然成了废人，整整三年时间，家族冷遇，旁人轻视，被未婚妻退婚……种种打击接踵而至。',
    authorizationStartDate: '2011-07-20',
    authorizationEndDate: '2021-07-20',
    cover: 'https://example.com/cover1.jpg',
    isPaid: true,
    wordCount: 1_464_000,
    viewCount: 1_549_000,
    status: '上架',
    creator: 'admin',
    createTime: '2011-07-20 12:00:00',
    chapters: 1623,
  },
  {
    id: 'NOVEL002',
    name: '武动乾坤',
    chineseName: '武动乾坤',
    category: '玄幻',
    language: '中文',
    author: '天蚕土豆',
    copyrightHolder: '起点中文网',
    introduction:
      '大炎王朝天都郡炎城青阳镇，一个落魄的林氏子弟林动，在山洞间偶然捡到一块神秘的石符，从此林动的命运开始改变！',
    authorizationStartDate: '2013-05-10',
    authorizationEndDate: '2023-05-10',
    cover: 'https://example.com/cover2.jpg',
    isPaid: true,
    wordCount: 1_306_000,
    viewCount: 1_234_567,
    status: '上架',
    creator: 'admin',
    createTime: '2013-05-10 10:30:00',
    chapters: 1398,
  },
  {
    id: 'NOVEL003',
    name: '大主宰',
    chineseName: '大主宰',
    category: '玄幻',
    language: '中文',
    author: '天蚕土豆',
    copyrightHolder: '起点中文网',
    introduction:
      '大千世界，位面交汇，万族林立，群雄荟萃，一位位来自下位面的天之至尊，在这无尽世界，演绎着令人向往的传奇，追求着那主宰之路。',
    authorizationStartDate: '2015-07-18',
    authorizationEndDate: '2025-07-18',
    cover: 'https://example.com/cover3.jpg',
    isPaid: true,
    wordCount: 1_611_000,
    viewCount: 987_654,
    status: '下架',
    creator: 'admin',
    createTime: '2015-07-18 09:15:00',
    chapters: 1548,
  },
];

// 获取小说列表
export async function getNovelListApi(params: any) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  let filteredData = [...mockNovels];

  // 过滤逻辑
  if (params.novelId) {
    filteredData = filteredData.filter((novel) => novel.id === params.novelId);
  }
  if (params.novelName) {
    filteredData = filteredData.filter((novel) =>
      novel.name.includes(params.novelName),
    );
  }
  if (params.category && params.category !== 'all') {
    filteredData = filteredData.filter(
      (novel) => novel.category === params.category,
    );
  }
  if (params.copyrightHolder) {
    filteredData = filteredData.filter((novel) =>
      novel.copyrightHolder.includes(params.copyrightHolder),
    );
  }
  if (params.status && params.status !== 'all') {
    filteredData = filteredData.filter(
      (novel) => novel.status === params.status,
    );
  }
  if (params.createTime) {
    const [startDate, endDate] = params.createTime;
    filteredData = filteredData.filter((novel) => {
      const createTime = new Date(novel.createTime);
      return createTime >= startDate && createTime <= endDate;
    });
  }

  // 分页
  const pageSize = params.pageSize || 20;
  const pageIndex = params.pageIndex || 1;
  const startIndex = (pageIndex - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = filteredData.slice(startIndex, endIndex);

  return {
    items,
    total: filteredData.length,
  };
}

// 新建小说
export async function createNovelApi(data: any) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const { authorizationTime, ...rest } = data;
  const newNovel = {
    id: `NOVEL${String(mockNovels.length + 1).padStart(3, '0')}`,
    ...rest,
    authorizationStartDate: authorizationTime
      ? authorizationTime[0]
      : undefined,
    authorizationEndDate: authorizationTime ? authorizationTime[1] : undefined,
    chapters: 0,
    creator: 'admin',
    createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
  mockNovels.push(newNovel);
  return newNovel;
}

// 编辑小说
export async function updateNovelApi(id: string, data: any) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const index = mockNovels.findIndex((novel) => novel.id === id);
  if (index !== -1) {
    const { authorizationTime, ...rest } = data;
    mockNovels[index] = {
      ...mockNovels[index],
      ...rest,
      authorizationStartDate: authorizationTime
        ? authorizationTime[0]
        : mockNovels[index].authorizationStartDate,
      authorizationEndDate: authorizationTime
        ? authorizationTime[1]
        : mockNovels[index].authorizationEndDate,
    };
    return mockNovels[index];
  }
  throw new Error('小说不存在');
}

// 删除小说
export async function deleteNovelApi(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const index = mockNovels.findIndex((novel) => novel.id === id);
  if (index !== -1) {
    mockNovels.splice(index, 1);
    return true;
  }
  throw new Error('小说不存在');
}

// 导入小说
export const importNovelListApi = async (
  file: File,
): Promise<{ failed: number; success: number }> => {
  // 模拟API请求
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 模拟导入结果
  return { success: 10, failed: 2 };
};

// 下载导入模板
export const downloadTemplateApi = async (): Promise<Blob> => {
  // 模拟API请求
  await new Promise((resolve) => setTimeout(resolve, 500));
  // 模拟模板文件
  const blob = new Blob(['小说导入模板内容'], {
    type: 'application/vnd.ms-excel',
  });
  return blob;
};

// 导出小说
export const exportNovelListApi = async (filters?: any): Promise<Blob> => {
  // 模拟API请求
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 模拟导出文件
  const blob = new Blob(['小说导出内容'], { type: 'application/vnd.ms-excel' });
  return blob;
};

// 批量上架/下架小说
export async function batchUpdateNovelStatusApi(ids: string[], status: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  ids.forEach((id) => {
    const index = mockNovels.findIndex((novel) => novel.id === id);
    if (index !== -1) {
      mockNovels[index].status = status;
    }
  });
  return true;
}

// 获取分类列表
export async function getCategoryListApi() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { label: '玄幻', value: '玄幻' },
    { label: '武侠', value: '武侠' },
    { label: '都市', value: '都市' },
    { label: '科幻', value: '科幻' },
    { label: '言情', value: '言情' },
  ];
}

// 获取版权方列表
export async function getCopyrightHolderListApi() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { label: '起点中文网', value: '起点中文网' },
    { label: '纵横中文网', value: '纵横中文网' },
    { label: '17K小说网', value: '17K小说网' },
    { label: '红袖添香', value: '红袖添香' },
  ];
}
