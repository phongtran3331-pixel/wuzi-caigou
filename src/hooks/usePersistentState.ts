import { useEffect, useState } from 'react'

/** 状态持久化到 localStorage（仅当前浏览器） */
export function usePersistentState<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw != null) return JSON.parse(raw) as T
    } catch {
      /* 忽略损坏数据，回退到初始值 */
    }
    return initial()
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* 存储满等异常不影响使用 */
    }
  }, [key, value])

  return [value, setValue] as const
}
