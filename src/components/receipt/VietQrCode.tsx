'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { useSettingsStore } from '@/store/useSettingsStore'
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
  const bankCfg = useSettingsStore((s) => s.bank)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bank = getBank(bankCfg.bankCode)
  const configured = !!bank && !!bankCfg.accountNumber

  useEffect(() => {
    if (!configured || !bank || !canvasRef.current) return
    const payload = buildVietQrPayload({
      bin: bank.bin,
      accountNumber: bankCfg.accountNumber,
      amount,
      addInfo,
    })
    QRCode.toCanvas(canvasRef.current, payload, { width: 180, margin: 1 })
      .then(() => onReady?.())
      .catch(() => onReady?.())
  }, [configured, bank, bankCfg.accountNumber, amount, addInfo, onReady])

  useEffect(() => {
    // Chưa cấu hình bank: không có QR để vẽ, báo ready ngay để không chặn batch export.
    if (!configured) onReady?.()
  }, [configured, onReady])

  if (!configured) {
    return (
      <div className="flex h-[180px] w-[180px] items-center justify-center rounded-lg border border-dashed border-pink-300 bg-pink-50 p-3 text-center text-xs text-pink-500">
        ⚙️ Chưa cấu hình tài khoản — vào Thiết lập trung tâm để điền
      </div>
    )
  }
  return <canvas ref={canvasRef} className="rounded-lg" />
}
