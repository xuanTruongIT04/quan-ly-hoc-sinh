import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(vnd: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(vnd || 0)) + 'đ'
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function isInMonth(dateISO: string, year: number, month: number): boolean {
  return dateISO.startsWith(monthKey(year, month) + '-')
}

export function localTodayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
