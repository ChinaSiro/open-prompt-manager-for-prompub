/**
 * 前端加密/解密工具
 * 使用 AES-GCM 加密算法
 */

// 固定的应用级盐值
const APP_SALT = "flowgpt-encryption-salt-v1";

// 获取或生成设备专用密钥
async function getDeviceKey(): Promise<string> {
  const DEVICE_KEY_STORAGE = "flowgpt_device_key";

  // 尝试从 localStorage 获取现有密钥
  let deviceKey = localStorage.getItem(DEVICE_KEY_STORAGE);

  if (!deviceKey) {
    // 如果不存在，生成一个新的随机密钥
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
    deviceKey = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 保存到 localStorage
    localStorage.setItem(DEVICE_KEY_STORAGE, deviceKey);
  }

  return deviceKey;
}

// 生成或获取加密密钥
async function getEncryptionKey(): Promise<CryptoKey> {
  // 使用设备专用密钥 + 应用盐值
  const deviceKey = await getDeviceKey();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`${deviceKey}-${APP_SALT}`),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  // 派生真正的加密密钥
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(APP_SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * 加密字符串
 */
export async function encryptString(text: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(text);

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedText,
    );

    // 组合 IV 和加密数据
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // 转换为 Base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("加密失败:", error);
    throw new Error("加密失败");
  }
}

/**
 * 解密字符串
 */
export async function decryptString(encryptedText: string): Promise<string> {
  try {
    const key = await getEncryptionKey();

    // 从 Base64 解码
    const combined = Uint8Array.from(atob(encryptedText), (c) =>
      c.charCodeAt(0),
    );

    // 分离 IV 和加密数据
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedData,
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("解密失败:", error);
    throw new Error("解密失败");
  }
}

/**
 * 保存加密的配置到 localStorage
 */
export async function saveEncryptedConfig(
  key: string,
  value: string,
): Promise<void> {
  const encrypted = await encryptString(value);
  localStorage.setItem(key, encrypted);
}

/**
 * 从 localStorage 读取并解密配置
 */
export async function getEncryptedConfig(key: string): Promise<string | null> {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    return await decryptString(encrypted);
  } catch (error) {
    console.error(`解密配置 ${key} 失败:`, error);
    return null;
  }
}

/**
 * 删除加密的配置
 */
export function removeEncryptedConfig(key: string): void {
  localStorage.removeItem(key);
}
