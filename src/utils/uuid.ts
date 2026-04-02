// 生成唯一ID（纯JS实现，不依赖原生模块）
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const random2 = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${random}-${random2}`;
};
