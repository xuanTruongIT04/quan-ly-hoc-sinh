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
  status: z.enum(['present', 'present2', 'absent']),
})

export const appDataSchema = z.object({
  students: z.array(studentSchema),
  attendance: z.array(attendanceSchema),
})

export function parseImportedJson(text: string): AppData {
  try {
    const obj = JSON.parse(text)
    return appDataSchema.parse(obj)
  } catch (e) {
    throw new Error(`File không hợp lệ: ${e instanceof Error ? e.message : String(e)}`)
  }
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
