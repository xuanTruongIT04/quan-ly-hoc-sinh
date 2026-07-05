'use client'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import html2canvas from 'html2canvas-pro'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { getTheme } from '@/lib/receipt-themes'
import { ReceiptCard } from './ReceiptCard'
import { Button } from '@/components/ui/button'

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    let n = 0
    function tick() {
      n += 16
      if (n >= ms) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

export function BatchReceiptExport({
  studentIds,
  year,
  month,
  label,
}: {
  studentIds: string[]
  year: number
  month: number
  label: string
}) {
  const t = useTranslations('receipt')
  const { students, receiptTheme, getComment, getExtraFee, isPaid } = useAppStore()
  const [busy, setBusy] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const hiddenRef = useRef<HTMLDivElement>(null)
  const qrReadyRef = useRef<(() => void) | null>(null)
  const theme = getTheme(receiptTheme)

  async function run() {
    const ids = studentIds.filter((id) => students.some((s) => s.id === id))
    if (ids.length === 0) {
      toast.error(t('batchEmpty'))
      return
    }
    setBusy(true)
    let done = 0
    for (const id of ids) {
      const student = students.find((s) => s.id === id)
      try {
        const qrReady = new Promise<void>((resolve) => {
          qrReadyRef.current = resolve
        })
        flushSync(() => setCurrentId(id))
        await Promise.race([qrReady, sleep(1500)]) // chờ QR canvas vẽ xong (tối đa 1.5s)
        await sleep(50) // đệm nhỏ cho chắc
        if (hiddenRef.current) {
          const canvas = await html2canvas(hiddenRef.current, { backgroundColor: null, scale: 2 })
          const link = document.createElement('a')
          link.download = `phieu-hoc-phi-${student?.fullName ?? id}-${year}-${String(month).padStart(2, '0')}.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          done++
          toast.success(t('batchDone', { n: done, total: ids.length }))
        }
        await sleep(300) // tránh trình duyệt chặn multi-download
      } catch {
        toast.error(t('batchError', { name: student?.fullName ?? id }))
      }
    }
    setCurrentId(null)
    setBusy(false)
  }

  return (
    <>
      <Button variant="outline" size="sm" disabled={busy} onClick={run}>
        {busy ? t('batchBusy') : label}
      </Button>
      {/* container ẩn off-screen để chụp từng phiếu */}
      <div style={{ position: 'absolute', left: -9999, top: 0 }} aria-hidden>
        {currentId && (
          <div ref={hiddenRef}>
            <ReceiptCard
              studentId={currentId}
              year={year}
              month={month}
              comment={getComment(currentId, year, month)}
              theme={theme}
              extraFee={getExtraFee(currentId, year, month)}
              paid={isPaid(currentId, year, month)}
              onQrReady={() => qrReadyRef.current?.()}
            />
          </div>
        )}
      </div>
    </>
  )
}
