export type InvoiceStatus = 'yes' | 'no' | 'unknown'

export interface PurchaseItem {
  id: string
  name: string
  quantity: string
  note: string
  /** 原始链接文本（可包含分享文案，展示时自动提取其中 URL） */
  link: string
  /** 总价（元），null 表示未定 */
  price: number | null
  invoice: InvoiceStatus
  purchased: boolean
  purchaser: string
  /** 签名图片 dataURL */
  signature: string | null
  purchasedAt: string | null
}

export interface PurchaseList {
  id: string
  name: string
  remark: string
  createdAt: string
  items: PurchaseItem[]
}

export type StatusFilter = 'all' | 'pending' | 'done'

export const INVOICE_LABEL: Record<InvoiceStatus, string> = {
  yes: '可开发票',
  no: '不可开',
  unknown: '待确认',
}
