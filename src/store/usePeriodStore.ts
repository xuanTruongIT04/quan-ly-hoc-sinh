import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const now = new Date()

interface PeriodState {
  year: number
  month: number
  setYear: (y: number) => void
  setMonth: (m: number) => void
}

export const usePeriodStore = create<PeriodState>()(
  persist(
    (set) => ({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      setYear: (year) => set({ year }),
      setMonth: (month) => set({ month }),
    }),
    { name: 'qlhs_period_v1' },
  ),
)
