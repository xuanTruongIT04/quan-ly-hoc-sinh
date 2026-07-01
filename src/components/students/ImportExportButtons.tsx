'use client'
import { useRef } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { exportJson, parseImportedJson } from '@/lib/repositories/io'
import { Button } from '@/components/ui/button'

export function ImportExportButtons() {
  const t = useTranslations('students')
  const { students, attendance, replaceAll } = useAppStore()
  const inputRef = useRef<HTMLInputElement>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = parseImportedJson(await file.text())
      replaceAll(data)
      toast.success(t('imported'))
    } catch {
      toast.error(t('importError'))
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => exportJson({ students, attendance })}>{t('export')}</Button>
      <Button variant="outline" onClick={() => inputRef.current?.click()}>{t('import')}</Button>
      <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={onFile} />
    </div>
  )
}
