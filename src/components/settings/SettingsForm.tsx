'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSettingsStore } from '@/store/useSettingsStore'
import { NAPAS_BANKS } from '@/lib/napas-banks'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-xs font-semibold text-[#8d6e63]">{children}</div>
}

export function SettingsForm() {
  const { teacherName, schoolName, defaultFee, receiptGreeting, bank, setSettings, resetSettings } = useSettingsStore()
  const [form, setForm] = useState({ teacherName, schoolName, defaultFee, receiptGreeting, bank })

  function save() {
    setSettings({
      teacherName: form.teacherName.trim(),
      schoolName: form.schoolName.trim(),
      defaultFee: Number.isFinite(form.defaultFee) && form.defaultFee >= 0 ? form.defaultFee : 0,
      receiptGreeting: form.receiptGreeting,
      bank: {
        bankCode: form.bank.bankCode.trim(),
        accountNumber: form.bank.accountNumber.trim(),
        accountName: form.bank.accountName.trim(),
      },
    })
    toast.success('Đã lưu thiết lập ✅')
  }

  function reset() {
    resetSettings()
    const s = useSettingsStore.getState()
    setForm({ teacherName: s.teacherName, schoolName: s.schoolName, defaultFee: s.defaultFee, receiptGreeting: s.receiptGreeting, bank: s.bank })
    toast.info('Đã khôi phục mặc định')
  }

  return (
    <div className="candy-card max-w-lg space-y-4">
      <div>
        <FieldLabel>Tên giáo viên</FieldLabel>
        <input className="candy-input w-full" value={form.teacherName} onChange={(e) => setForm({ ...form, teacherName: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Tên trường / lớp (hiện trên phiếu)</FieldLabel>
        <input className="candy-input w-full" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Ngân hàng</FieldLabel>
        <select
          className="candy-input w-full"
          value={form.bank.bankCode}
          onChange={(e) => setForm({ ...form, bank: { ...form.bank, bankCode: e.target.value } })}
        >
          <option value="">— Chọn ngân hàng —</option>
          {NAPAS_BANKS.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <FieldLabel>Số tài khoản</FieldLabel>
        <input className="candy-input w-full" value={form.bank.accountNumber} onChange={(e) => setForm({ ...form, bank: { ...form.bank, accountNumber: e.target.value } })} />
      </div>
      <div>
        <FieldLabel>Tên chủ tài khoản</FieldLabel>
        <input className="candy-input w-full" value={form.bank.accountName} onChange={(e) => setForm({ ...form, bank: { ...form.bank, accountName: e.target.value } })} />
      </div>
      <div>
        <FieldLabel>Học phí mặc định (VND)</FieldLabel>
        <input type="number" min={0} className="candy-input w-full" value={form.defaultFee} onChange={(e) => setForm({ ...form, defaultFee: Number(e.target.value) })} />
      </div>
      <div>
        <FieldLabel>Lời chào trên phiếu</FieldLabel>
        <input className="candy-input w-full" value={form.receiptGreeting} onChange={(e) => setForm({ ...form, receiptGreeting: e.target.value })} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" className="candy-btn" onClick={save}>💾 Lưu thiết lập</button>
        <button type="button" className="candy-btn-outline" onClick={reset}>↺ Khôi phục mặc định</button>
      </div>
    </div>
  )
}
