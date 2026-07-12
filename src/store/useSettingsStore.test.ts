import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore, DEFAULT_SETTINGS } from './useSettingsStore'

beforeEach(() => {
  useSettingsStore.setState({ ...DEFAULT_SETTINGS })
})

describe('useSettingsStore', () => {
  it('khởi tạo bằng DEFAULT_SETTINGS (từ CONFIG)', () => {
    const s = useSettingsStore.getState()
    expect(s.teacherName).toBe(DEFAULT_SETTINGS.teacherName)
    expect(s.bank.accountName).toBe(DEFAULT_SETTINGS.bank.accountName)
  })

  it('setSettings merge một phần, giữ field khác', () => {
    useSettingsStore.getState().setSettings({ teacherName: 'Cô Nhung' })
    expect(useSettingsStore.getState().teacherName).toBe('Cô Nhung')
    expect(useSettingsStore.getState().schoolName).toBe(DEFAULT_SETTINGS.schoolName)
  })

  it('setSettings merge bank lồng nhau', () => {
    useSettingsStore.getState().setSettings({ bank: { ...useSettingsStore.getState().bank, accountNumber: '123' } })
    expect(useSettingsStore.getState().bank.accountNumber).toBe('123')
  })

  it('resetSettings đưa về DEFAULT_SETTINGS', () => {
    useSettingsStore.getState().setSettings({ teacherName: 'X' })
    useSettingsStore.getState().resetSettings()
    expect(useSettingsStore.getState().teacherName).toBe(DEFAULT_SETTINGS.teacherName)
  })
})
