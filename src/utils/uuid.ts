import * as Crypto from 'expo-crypto';

// 生成唯一ID
export const generateId = (): string => {
  return Crypto.randomUUID();
};
