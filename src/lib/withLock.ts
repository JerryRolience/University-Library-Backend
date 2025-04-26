import AsyncLock from "async-lock";

const globalLock = new AsyncLock();

interface WithLockOptions {
  timeout?: number;
  maxPending?: number;
}

export async function withLock<T>(
  key: string,
  callback: () => Promise<T>,
  options?: WithLockOptions
): Promise<T> {
  const defaultOptions = {
    timeout: 5000, // 5s default
    maxPending: 10,
    ...options,
  };

  try {
    return await globalLock.acquire(key, callback, defaultOptions);
  } catch (err: any) {
    if (err?.message.includes("timed out")) {
      throw new Error(
        `${key} is currently being processed. Please try again later.`
      );
    }
    throw err;
  }
}
