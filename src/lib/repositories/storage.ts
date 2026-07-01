import type { AppData } from '@/types'
import { SEED_DATA } from '@/data/students'

export const STORAGE_KEY = 'qlhs_data_v1'

export function loadData(): AppData {
  if (typeof window === 'undefined') return SEED_DATA
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_DATA
    return JSON.parse(raw) as AppData
  } catch {
    return SEED_DATA
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
