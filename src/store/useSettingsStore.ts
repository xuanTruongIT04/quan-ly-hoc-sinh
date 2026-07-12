import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types'
import { CONFIG } from '@/lib/config'

export const DEFAULT_SETTINGS: Settings = {
  teacherName: CONFIG.teacherName,
  schoolName: CONFIG.schoolName,
  defaultFee: CONFIG.defaultFee,
  receiptGreeting: CONFIG.receiptGreeting,
  bank: { ...CONFIG.bank },
}

interface SettingsState extends Settings {
  setSettings: (patch: Partial<Settings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSettings: (patch) => set((s) => ({ ...s, ...patch })),
      resetSettings: () => set({ ...DEFAULT_SETTINGS, bank: { ...DEFAULT_SETTINGS.bank } }),
    }),
    {
      name: 'qlhs_settings_v1',
      partialize: (s) => ({
        teacherName: s.teacherName,
        schoolName: s.schoolName,
        defaultFee: s.defaultFee,
        receiptGreeting: s.receiptGreeting,
        bank: s.bank,
      }),
    },
  ),
)
