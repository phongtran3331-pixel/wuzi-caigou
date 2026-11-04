import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  PenLine,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { InvoiceStatus, PurchaseItem } from '@/types/procurement'
import { INVOICE_LABEL } from '@/types/procurement'
import { extractUrl, formatMoney } from '@/lib/procurement-utils'
import { cn } from '@/lib/utils'

const GRID =
  'grid grid-cols-[44px_minmax(170px,1.5fr)_104px_minmax(150px,1.6fr)_112px_132px_120px_minmax(150px,1.2fr)_108px] gap-x-3'

interface ItemsTableProps {
  items: PurchaseItem[]
  editingId: string | null
  isAdding: boolean
  draft: PurchaseItem
  onStartEdit: (id: string) => void
  onStartAdd: () => void
  onDraftChange: (draft: PurchaseItem) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onSign: (id: string) => void
}

export function ItemsTable({
  items,
  editingId,
  isAdding,
  draft,
  onStartEdit,
  onStartAdd,
  onDraftChange,
  onSaveEdit,
  onCancelEdit,
  onToggle,
  onDelete,
  onSign,
}: ItemsTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      {/* 表头 */}
      <div
        className={cn(
          GRID,
          'sticky top-0 z-10 items-center border-b border-border bg-card px-6 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
        )}
      >
        <span aria-hidden>✓</span>
        <span>物资名称</span>
        <span>数量</span>
        <span>说明</span>
        <span className="text-right">金额</span>
        <span>采购链接</span>
        <span>发票</span>
        <span>采购人 · 签名</span>
        <span className="no-print">操作</span>
      </div>

      {items.length === 0 && !isAdding && (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            没有符合条件的物资。调整筛选，或立即添加。
          </p>
          <button type="button" className="btn-ghost-invert" onClick={onStartAdd}>
            添加第一条物资
          </button>
        </div>
      )}

      <ul>
        {items.map((it) =>
          editingId === it.id ? (
            <EditRow
              key={it.id}
              draft={draft}
              isNew={false}
              onChange={onDraftChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
            />
          ) : (
            <DisplayRow
              key={it.id}
              item={it}
              onToggle={() => onToggle(it.id)}
              onEdit={() => onStartEdit(it.id)}
              onDelete={() => onDelete(it.id)}
              onSign={() => onSign(it.id)}
            />
          ),
        )}
        {isAdding && (
          <EditRow
            draft={draft}
            isNew
            onChange={onDraftChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        )}
      </ul>
    </div>
  )
}

/* ---------------- 展示行 ---------------- */

function DisplayRow({
  item,
  onToggle,
  onEdit,
  onDelete,
  onSign,
}: {
  item: PurchaseItem
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onSign: () => void
}) {
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | null>(null)
  const url = extractUrl(item.link)

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    }
  }, [])

  async function handleCopy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 1200)
    } catch {
      window.prompt('复制失败，请手动复制：', url)
    }
  }

  return (
    <li
      className={cn(
        GRID,
        'items-center border-b border-border px-6 py-2.5 transition-colors duration-150 hover:bg-secondary/60',
        item.purchased && 'bg-accent/50 hover:bg-accent/70',
      )}
    >
      {/* 已购买标记 */}
      <button
        type="button"
        role="checkbox"
        aria-checked={item.purchased}
        aria-label={item.purchased ? `标记 ${item.name} 为未购买` : `标记 ${item.name} 为已购买`}
        onClick={onToggle}
        className={cn(
          'flex h-5 w-5 items-center justify-center border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          item.purchased ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card hover:border-foreground',
        )}
      >
        {item.purchased && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>

      <span className="truncate text-sm font-medium" title={item.name}>
        {item.name}
        {item.purchased && item.purchasedAt && (
          <span className="tnum ml-2 align-middle text-[11px] font-normal text-muted-foreground">
            {item.purchasedAt}
          </span>
        )}
      </span>

      <span className="tnum truncate text-sm text-muted-foreground">{item.quantity || '—'}</span>

      <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground" title={item.note}>
        {item.note || '—'}
      </span>

      <span className="tnum text-right text-sm font-semibold">{formatMoney(item.price)}</span>

      {/* 链接直通 */}
      <span className="flex items-center gap-1">
        {url ? (
          <>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-7 items-center gap-1 border border-foreground/60 px-2 text-xs transition-colors duration-150 hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ExternalLink className="h-3 w-3" /> 直达
            </a>
            <button
              type="button"
              className="icon-btn h-7 w-7"
              title="复制链接"
              aria-label={`复制 ${item.name} 的链接`}
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </span>

      <InvoiceBadge value={item.invoice} />

      {/* 采购人 + 签名 */}
      <span className="flex min-w-0 items-center gap-2">
        {item.signature ? (
          <img
            src={item.signature}
            alt={`${item.purchaser || '采购人'}的签名`}
            className="h-9 shrink-0 border border-dashed border-input bg-white px-1"
          />
        ) : null}
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium">{item.purchaser || '未指定'}</span>
          <button
            type="button"
            className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onSign}
          >
            <PenLine className="h-3 w-3" /> {item.signature ? '重签' : '签名'}
          </button>
        </span>
      </span>

      {/* 操作 */}
      <span className="no-print flex items-center gap-1">
        <button type="button" className="icon-btn" title="编辑" aria-label={`编辑 ${item.name}`} onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="icon-btn hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
          title="删除"
          aria-label={`删除 ${item.name}`}
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </span>
    </li>
  )
}

/* ---------------- 编辑行 ---------------- */

function EditRow({
  draft,
  isNew,
  onChange,
  onSave,
  onCancel,
}: {
  draft: PurchaseItem
  isNew: boolean
  onChange: (d: PurchaseItem) => void
  onSave: () => void
  onCancel: () => void
}) {
  const [err, setErr] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.name.trim()) {
      setErr('请填写物资名称')
      return
    }
    onSave()
  }

  return (
    <li className="border-b border-primary/40 bg-accent/40">
      <form onSubmit={submit} className={cn(GRID, 'items-center gap-y-2 px-6 py-3')}>
        <span aria-hidden className="text-xs text-muted-foreground">
          {isNew ? '新' : '改'}
        </span>
        <Input
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          placeholder="物资名称（必填）"
          aria-label="物资名称"
          autoFocus
          className="h-8 rounded-none bg-card text-sm"
        />
        <Input
          value={draft.quantity}
          onChange={(e) => onChange({ ...draft, quantity: e.target.value })}
          placeholder="数量"
          aria-label="数量"
          className="h-8 rounded-none bg-card text-sm"
        />
        <Input
          value={draft.note}
          onChange={(e) => onChange({ ...draft, note: e.target.value })}
          placeholder="说明"
          aria-label="说明"
          className="h-8 rounded-none bg-card text-sm"
        />
        <Input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={draft.price ?? ''}
          onChange={(e) =>
            onChange({ ...draft, price: e.target.value === '' ? null : Number(e.target.value) })
          }
          placeholder="金额"
          aria-label="金额"
          className="tnum h-8 rounded-none bg-card text-sm"
        />
        <Input
          value={draft.link}
          onChange={(e) => onChange({ ...draft, link: e.target.value })}
          placeholder="https:// 链接"
          aria-label="采购链接"
          className="h-8 rounded-none bg-card text-xs"
        />
        <InvoiceSelect
          value={draft.invoice}
          onChange={(v) => onChange({ ...draft, invoice: v })}
        />
        <Input
          value={draft.purchaser}
          onChange={(e) => onChange({ ...draft, purchaser: e.target.value })}
          placeholder="采购人"
          aria-label="采购人"
          className="h-8 rounded-none bg-card text-sm"
        />
        <span className="flex items-center gap-1">
          <button type="submit" className="btn-solid h-8 px-2.5 text-xs" title="保存">
            <Check className="h-3.5 w-3.5" /> 保存
          </button>
          <button type="button" className="btn-ghost-invert h-8 px-2.5 text-xs" onClick={onCancel}>
            <X className="h-3.5 w-3.5" /> 取消
          </button>
        </span>
      </form>
      {err && <p className="px-6 pb-2 text-xs text-destructive">{err}</p>}
    </li>
  )
}

/* ---------------- 发票 ---------------- */

function InvoiceBadge({ value }: { value: InvoiceStatus }) {
  return (
    <InvoiceSelect value={value} bare />
  )
}

function InvoiceSelect({
  value,
  onChange,
  bare = false,
}: {
  value: InvoiceStatus
  onChange?: (v: InvoiceStatus) => void
  bare?: boolean
}) {
  const styles: Record<InvoiceStatus, string> = {
    yes: 'border-primary/50 bg-primary/10 text-primary',
    no: 'border-border bg-transparent text-muted-foreground',
    unknown: 'border-dashed border-input bg-transparent text-muted-foreground',
  }
  return (
    <span className={cn('relative inline-flex h-7 w-full max-w-[108px] items-center', styles[value])}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value as InvoiceStatus)}
        disabled={!onChange}
        aria-label="是否可开发票"
        className={cn(
          'h-full w-full cursor-pointer appearance-none bg-transparent pl-2 pr-6 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          onChange ? '' : 'pointer-events-auto cursor-default',
          bare && 'border border-transparent',
          !bare && 'border-input',
        )}
      >
        <option value="yes">{INVOICE_LABEL.yes}</option>
        <option value="no">{INVOICE_LABEL.no}</option>
        <option value="unknown">{INVOICE_LABEL.unknown}</option>
      </select>
      {onChange && (
        <svg
          className="pointer-events-none absolute right-2 h-3 w-3 text-current opacity-60"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
    </span>
  )
}
