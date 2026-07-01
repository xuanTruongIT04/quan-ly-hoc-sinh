import { getRequestConfig } from 'next-intl/server'

// Ứng dụng chỉ hỗ trợ 1 locale (vi), không có routing [locale] / URL prefix.
export default getRequestConfig(async () => {
  const locale = 'vi'
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default }
})
