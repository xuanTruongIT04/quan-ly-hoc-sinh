'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { CONFIG } from '@/lib/config'
import { getBank } from '@/lib/napas-banks'
import { buildVietQrPayload } from '@/lib/vietqr'

export function VietQrCode({
  amount,
  addInfo,
  onReady,
}: {
  amount: number
  addInfo: string
  onReady?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bank = getBank(CONFIG.bank.bankCode)
  const configured = !!bank && !!CONFIG.bank.accountNumber

  useEffect(() => {
    if (!configured || !bank || !canvasRef.current) return
    const payload = buildVietQrPayload({
      bin: bank.bin,
      accountNumber: CONFIG.bank.accountNumber,
      amount,
      addInfo,
    })
    QRCode.toCanvas(canvasRef.current, payload, { width: 180, margin: 1 })
      .then(() => onReady?.())
      .catch(() => onReady?.())
  }, [configured, bank, amount, addInfo, onReady])

  useEffect(() => {
    // Chưa cấu hình bank: không có QR để vẽ, báo ready ngay để không chặn batch export.
    if (!configured) onReady?.()
  }, [configured, onReady])

  if (!configured) {
    return (
      <div className="flex h-[180px] w-[180px] items-center justify-center rounded-lg border border-dashed border-pink-300 bg-pink-50 p-3 text-center text-xs text-pink-500">
        ⚙️ Chưa cấu hình tài khoản ngân hàng trong src/lib/config.ts
      </div>
    )
  }
  return <canvas ref={canvasRef} className="rounded-lg" />
}
