export interface NapasBank { code: string; bin: string; name: string }

// BIN NAPAS (6 số) cho các ngân hàng phổ biến VN. Nguồn: chuẩn NAPAS VietQR.
export const NAPAS_BANKS: NapasBank[] = [
  { code: 'VCB', bin: '970436', name: 'Vietcombank' },
  { code: 'BIDV', bin: '970418', name: 'BIDV' },
  { code: 'VTB', bin: '970415', name: 'VietinBank' },
  { code: 'AGRIBANK', bin: '970405', name: 'Agribank' },
  { code: 'MB', bin: '970422', name: 'MB Bank' },
  { code: 'TCB', bin: '970407', name: 'Techcombank' },
  { code: 'ACB', bin: '970416', name: 'ACB' },
  { code: 'VPB', bin: '970432', name: 'VPBank' },
  { code: 'TPB', bin: '970423', name: 'TPBank' },
  { code: 'SACOMBANK', bin: '970403', name: 'Sacombank' },
  { code: 'HDBANK', bin: '970437', name: 'HDBank' },
  { code: 'VIB', bin: '970441', name: 'VIB' },
  { code: 'SHB', bin: '970443', name: 'SHB' },
  { code: 'MSB', bin: '970426', name: 'MSB' },
  { code: 'OCB', bin: '970448', name: 'OCB' },
]

export function getBank(code: string): NapasBank | undefined {
  return NAPAS_BANKS.find((b) => b.code === code)
}
