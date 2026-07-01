import { z } from 'zod'
import type { AppData } from '@/types'

const studentSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  className: z.string(),
  feeMode: z.enum(['per_session', 'fixed_monthly']),
  fee: z.number(),
  fee2: z.number().optional(),
  startDate: z.string(),
  sortOrder: z.number(),
})

const attendanceSchema = z.object({
  studentId: z.string(),
  date: z.string(),
  status: z.enum(['present', 'absent']),
})

export const appDataSchema = z.object({
  students: z.array(studentSchema),
  attendance: z.array(attendanceSchema),
})

export function parseImportedJson(text: string): AppData {
  const obj = JSON.parse(text) // ném SyntaxError nếu sai cú pháp
  return appDataSchema.parse(obj) // ném ZodError nếu sai cấu trúc
}

export function exportJson(data: AppData): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `qlhs-data-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
