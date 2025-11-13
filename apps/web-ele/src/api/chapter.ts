// 模拟章节数据
const mockChapters = [
  {
    id: 'CH001',
    novelId: 'NOVEL001',
    title: '第一章 陨落的天才',
    chapterNumber: 1,
    isPaid: true,
    price: 5,
    content:
      '<p>在斗气大陆上，斗气修炼，几乎是所有少年少女们都为之疯狂的事情。</p>',
    creator: 'admin',
    createTime: '2011-07-20 12:30:00',
  },
  {
    id: 'CH002',
    novelId: 'NOVEL001',
    title: '第二章 神秘的戒指',
    chapterNumber: 2,
    isPaid: true,
    price: 5,
    content: '<p>在萧炎失落之际，他发现了母亲留下的一枚神秘戒指。</p>',
    creator: 'admin',
    createTime: '2011-07-21 10:00:00',
  },
  {
    id: 'CH003',
    novelId: 'NOVEL002',
    title: '第一章 青阳镇',
    chapterNumber: 1,
    isPaid: false,
    price: 0,
    content:
      '<p>大炎王朝天都郡炎城青阳镇，一个落魄的林氏子弟林动，在山洞间偶然捡到一块神秘的石符。</p>',
    creator: 'admin',
    createTime: '2013-05-10 14:00:00',
  },
];

// 获取章节列表
export async function getChapterListApi(params: any) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  let filteredData = [...mockChapters];

  // 过滤逻辑
  if (params.chapterId) {
    filteredData = filteredData.filter(
      (chapter) => chapter.id === params.chapterId,
    );
  }
  if (params.chapterTitle) {
    filteredData = filteredData.filter((chapter) =>
      chapter.title.includes(params.chapterTitle),
    );
  }
  if (params.isPaid !== undefined && params.isPaid !== 'all') {
    filteredData = filteredData.filter(
      (chapter) => chapter.isPaid === (params.isPaid === 'paid'),
    );
  }
  if (params.createTime) {
    const [startDate, endDate] = params.createTime;
    filteredData = filteredData.filter((chapter) => {
      const createTime = new Date(chapter.createTime);
      return createTime >= startDate && createTime <= endDate;
    });
  }
  if (params.novelId) {
    filteredData = filteredData.filter(
      (chapter) => chapter.novelId === params.novelId,
    );
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

// 新建章节
export async function createChapterApi(data: any) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 检查章节号是否重复
  const existingChapter = mockChapters.find(
    (chapter) =>
      chapter.novelId === data.novelId &&
      chapter.chapterNumber === data.chapterNumber,
  );
  if (existingChapter) {
    throw new Error(`章节 ${data.chapterNumber} 已存在`);
  }

  const newChapter = {
    id: `CH${String(mockChapters.length + 1).padStart(3, '0')}`,
    ...data,
    creator: 'admin',
    createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
  mockChapters.push(newChapter);
  return newChapter;
}

// 编辑章节
export async function updateChapterApi(id: string, data: any) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 检查章节号是否重复（排除当前章节）
  if (data.chapterNumber !== undefined) {
    const existingChapter = mockChapters.find(
      (chapter) =>
        chapter.id !== id &&
        chapter.novelId === data.novelId &&
        chapter.chapterNumber === data.chapterNumber,
    );
    if (existingChapter) {
      throw new Error(`章节 ${data.chapterNumber} 已存在`);
    }
  }

  const index = mockChapters.findIndex((chapter) => chapter.id === id);
  if (index !== -1) {
    mockChapters[index] = { ...mockChapters[index], ...data };
    return mockChapters[index];
  }
  throw new Error('章节不存在');
}

// 删除章节
export async function deleteChapterApi(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const index = mockChapters.findIndex((chapter) => chapter.id === id);
  if (index !== -1) {
    mockChapters.splice(index, 1);
    return true;
  }
  throw new Error('章节不存在');
}

// 获取小说的章节数量
export async function getChapterCountApi(novelId: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockChapters.filter((chapter) => chapter.novelId === novelId).length;
}
