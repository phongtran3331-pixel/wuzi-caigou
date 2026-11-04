import type { PurchaseItem, PurchaseList } from '@/types/procurement'

export function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** 从淘宝/拼多多分享文案中提取第一个 URL */
export function extractUrl(raw: string): string | null {
  const m = raw.match(/https?:\/\/[^\s，。；、）】」'"<>）]+/)
  return m ? m[0] : null
}

export function formatMoney(n: number | null): string {
  if (n == null || Number.isNaN(n)) return '—'
  return `¥${n.toFixed(2)}`
}

export interface ListStats {
  count: number
  total: number
  purchasedCount: number
  purchasedTotal: number
  invoiceYes: number
  pendingCount: number
}

export function listStats(list: PurchaseList): ListStats {
  let total = 0
  let purchasedTotal = 0
  let purchasedCount = 0
  let invoiceYes = 0
  for (const it of list.items) {
    if (it.price != null) total += it.price
    if (it.purchased) {
      purchasedCount++
      if (it.price != null) purchasedTotal += it.price
    }
    if (it.invoice === 'yes') invoiceYes++
  }
  return {
    count: list.items.length,
    total,
    purchasedCount,
    purchasedTotal,
    invoiceYes,
    pendingCount: list.items.length - purchasedCount,
  }
}

export function createEmptyItem(): PurchaseItem {
  return {
    id: genId(),
    name: '',
    quantity: '',
    note: '',
    link: '',
    price: null,
    invoice: 'unknown',
    purchased: false,
    purchaser: '',
    signature: null,
    purchasedAt: null,
  }
}

function csvCell(v: string | number | null): string {
  if (v == null) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportListCsv(list: PurchaseList): void {
  const header = ['物资', '数量', '说明', '金额', '链接', '发票', '采购人', '是否已购买', '购买时间']
  const rows = list.items.map((it) =>
    [
      it.name,
      it.quantity,
      it.note,
      it.price != null ? it.price.toFixed(2) : '',
      extractUrl(it.link) ?? '',
      it.invoice === 'yes' ? '可开发票' : it.invoice === 'no' ? '不可开' : '待确认',
      it.purchaser,
      it.purchased ? '已购买' : '未购买',
      it.purchasedAt ?? '',
    ]
      .map(csvCell)
      .join(','),
  )
  const csv = '﻿' + [header.map(csvCell).join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${list.name.replace(/[\\/:*?"<>|]/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
