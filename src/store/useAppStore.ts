import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AppData, Student, AttendanceRecord, ExtraFee } from '@/types'
import { commentKey } from '@/types'
import { STORAGE_KEY } from '@/lib/repositories/storage'
import { SEED_DATA } from '@/data/students'
import type { ThemeId } from '@/lib/receipt-themes'

function genId(): string {
  return 's_' + Math.random().toString(36).slice(2, 10)
}

interface AppState extends AppData {
  comments: Record<string, string>
  addStudent: (s: Omit<Student, 'id'>) => void
  updateStudent: (id: string, patch: Partial<Student>) => void
  removeStudent: (id: string) => void
  addStudentsBulk: (list: Omit<Student, 'id'>[]) => void
  setAttendance: (studentId: string, date: string, status: 'present' | 'absent') => void
  markClassPresent: (studentIds: string[], date: string) => void
  replaceAll: (data: AppData) => void
  classNames: () => string[]
  setComment: (studentId: string, year: number, month: number, text: string) => void
  getComment: (studentId: string, year: number, month: number) => string
  receiptTheme: ThemeId
  setReceiptTheme: (id: ThemeId) => void
  extraFees: Record<string, ExtraFee>
  payments: Record<string, boolean>
  setExtraFee: (studentId: string, year: number, month: number, amount: number, note: string) => void
  getExtraFee: (studentId: string, year: number, month: number) => ExtraFee
  setPaid: (studentId: string, year: number, month: number, paid: boolean) => void
  isPaid: (studentId: string, year: number, month: number) => boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      students: SEED_DATA.students,
      attendance: SEED_DATA.attendance,
      comments: {},

      addStudent: (s) => set((st) => ({ students: [...st.students, { ...s, id: genId() }] })),

      updateStudent: (id, patch) =>
        set((st) => ({ students: st.students.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

      removeStudent: (id) =>
        set((st) => ({
          students: st.students.filter((x) => x.id !== id),
          attendance: st.attendance.filter((a) => a.studentId !== id),
        })),

      addStudentsBulk: (list) =>
        set((st) => ({ students: [...st.students, ...list.map((s) => ({ ...s, id: genId() }))] })),

      setAttendance: (studentId, date, status) =>
        set((st) => {
          const rest = st.attendance.filter((a) => !(a.studentId === studentId && a.date === date))
          return { attendance: [...rest, { studentId, date, status }] }
        }),

      markClassPresent: (studentIds, date) =>
        set((st) => {
          const rest = st.attendance.filter((a) => !(studentIds.includes(a.studentId) && a.date === date))
          const added: AttendanceRecord[] = studentIds.map((studentId) => ({ studentId, date, status: 'present' }))
          return { attendance: [...rest, ...added] }
        }),

      replaceAll: (data) => set({ students: data.students, attendance: data.attendance }),

      classNames: () => Array.from(new Set(get().students.map((s) => s.className))).filter(Boolean),

      setComment: (studentId, year, month, text) =>
        set((st) => ({ comments: { ...st.comments, [commentKey(studentId, year, month)]: text } })),

      getComment: (studentId, year, month) => get().comments[commentKey(studentId, year, month)] ?? '',

      receiptTheme: 'strawberry',
      setReceiptTheme: (id) => set({ receiptTheme: id }),

      extraFees: {},
      payments: {},
      setExtraFee: (studentId, year, month, amount, note) =>
        set((st) => ({ extraFees: { ...st.extraFees, [commentKey(studentId, year, month)]: { amount, note } } })),
      getExtraFee: (studentId, year, month) =>
        get().extraFees[commentKey(studentId, year, month)] ?? { amount: 0, note: '' },
      setPaid: (studentId, year, month, paid) =>
        set((st) => ({ payments: { ...st.payments, [commentKey(studentId, year, month)]: paid } })),
      isPaid: (studentId, year, month) => get().payments[commentKey(studentId, year, month)] ?? false,
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ students: s.students, attendance: s.attendance, comments: s.comments, receiptTheme: s.receiptTheme, extraFees: s.extraFees, payments: s.payments }),
    },
  ),
)
