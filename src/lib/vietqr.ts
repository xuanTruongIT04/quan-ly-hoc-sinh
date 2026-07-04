// Xây payload QR chuyển khoản theo chuẩn EMVCo / VietQR (NAPAS).

function tlv(tag: string, value: string): string {
  const len = String(value.length).padStart(2, '0')
  return `${tag}${len}${value}`
}

// CRC-16/CCITT-FALSE: poly 0x1021, init 0xFFFF, no reflect, xorout 0x0000.
export function crc16Ccitt(input: string): string {
  let crc = 0xffff
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function buildVietQrPayload(args: {
  bin: string
  accountNumber: string
  amount?: number
  addInfo?: string
}): string {
  const { bin, accountNumber, amount, addInfo } = args

  // Field 38 — Merchant Account Information (lồng)
  const beneficiary = tlv('00', bin) + tlv('01', accountNumber)
  const merchantAccount =
    tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA')

  let payload =
    tlv('00', '01') + // Payload Format Indicator
    tlv('01', amount != null ? '12' : '11') + // POI: 12 dynamic, 11 static
    tlv('38', merchantAccount) +
    tlv('53', '704') // currency VND

  if (amount != null) payload += tlv('54', String(Math.round(amount)))
  payload += tlv('58', 'VN') // country

  if (addInfo) payload += tlv('62', tlv('08', addInfo)) // Additional Data → Purpose

  payload += '6304' // CRC tag + length
  payload += crc16Ccitt(payload)
  return payload
}
