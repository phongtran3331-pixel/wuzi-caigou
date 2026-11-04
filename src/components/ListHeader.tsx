import { useEffect, useState } from 'react'
import { Search, Plus, Download, Printer, Pencil, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { PurchaseList, StatusFilter } from '@/types/procurement'
import type { ListStats } from '@/lib/procurement-utils'
import { formatMoney } from '@/lib/procurement-utils'
import { cn } from '@/lib/utils'

interface ListHeaderProps {
  list: PurchaseList
  stats: ListStats
  query: string
  onQuery: (q: string) => void
  filter: StatusFilter
  onFilter: (f: StatusFilter) => void
  onAddItem: () => void
  onExport: () => void
  onPrint: () => void
  onRename: (name: string, remark: string) => void
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '未购买' },
  { key: 'done', label: '已购买' },
]

export function ListHeader({
  list,
  stats,
  query,
  onQuery,
  filter,
  onFilter,
  onAddItem,
  onExport,
  onPrint,
  onRename,
}: ListHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(list.name)
  const [remark, setRemark] = useState(list.remark)

  useEffect(() => {
    if (!editing) {
      setName(list.name)
      setRemark(list.remark)
    }
  }, [list.name, list.remark, editing])

  const progress = stats.count === 0 ? 0 : Math.round((stats.purchasedCount / stats.count) * 100)

  function saveTitle() {
    const n = name.trim()
    if (n) onRename(n, remark.trim())
    setEditing(false)
  }

  const statChips: { label: string; value: string }[] = [
    { label: '预算总额', value: formatMoney(stats.total) },
    { label: '已购金额', value: formatMoney(stats.purchasedTotal) },
    { label: '待购金额', value: formatMoney(stats.total - stats.purchasedTotal) },
    { label: '可开发票', value: `${stats.invoiceYes} 项` },
  ]

  return (
    <header className="border-b border-border bg-card">
      {/* 标题区 */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex max-w-xl flex-col gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle()
                  if (e.key === 'Escape') setEditing(false)
                }}
                aria-label="采购表名称"
                className="rounded-none text-lg font-bold"
                autoFocus
              />
              <Input
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle()
                  if (e.key === 'Escape') setEditing(false)
                }}
                aria-label="备注"
                placeholder="备注（可留空）"
                className="rounded-none text-sm"
              />
              <div className="flex gap-2">
                <button type="button" className="btn-solid" onClick={saveTitle}>
                  <Check className="h-4 w-4" /> 保存
                </button>
                <button type="button" className="btn-ghost-invert" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" /> 取消
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h2 className="truncate text-xl font-bold tracking-tight">{list.name}</h2>
                <button
                  type="button"
                  className="icon-btn no-print"
                  title="重命名采购表"
                  aria-label="重命名采购表"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              {list.remark && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{list.remark}</p>
              )}
            </>
          )}
        </div>
        <p className="tnum mt-1.5 shrink-0 text-xs text-muted-foreground">
          建表日期 {list.createdAt} · 采购进度 {progress}%
        </p>
      </div>

      {/* 统计条 */}
      <div className="mt-4 flex items-stretch divide-x divide-border border-t border-border">
        {statChips.map((c) => (
          <div key={c.label} className="flex-1 px-6 py-3">
            <p className="text-[11px] text-muted-foreground">{c.label}</p>
            <p className="tnum mt-0.5 text-base font-bold">{c.value}</p>
          </div>
        ))}
        <div className="flex flex-1 flex-col justify-center px-6 py-3">
          <p className="text-[11px] text-muted-foreground">进度（{stats.purchasedCount}/{stats.count}）</p>
          <div className="mt-2 h-1.5 w-full bg-secondary">
            <div
              className="h-1.5 bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="no-print flex flex-wrap items-center gap-2 border-t border-border bg-background px-6 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="搜索物资名称 / 说明 / 采购人"
            aria-label="搜索物资"
            className="h-8 w-64 rounded-none border-input bg-card pl-8 text-sm"
          />
        </div>

        <div className="flex" role="tablist" aria-label="购买状态筛选">
          {FILTERS.map((f) => {
            const count =
              f.key === 'all'
                ? stats.count
                : f.key === 'pending'
                  ? stats.pendingCount
                  : stats.purchasedCount
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => onFilter(f.key)}
                className={cn(
                  'flex h-8 items-center gap-1.5 border border-foreground/40 px-3 text-sm transition-colors duration-150 -ml-px first:ml-0',
                  filter === f.key
                    ? 'bg-foreground text-background'
                    : 'bg-transparent text-foreground hover:bg-secondary',
                )}
              >
                {f.label}
                <span className="tnum text-xs opacity-60">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" className="btn-solid" onClick={onAddItem}>
            <Plus className="h-4 w-4" /> 添加物资
          </button>
          <button type="button" className="btn-ghost-invert" onClick={onExport}>
            <Download className="h-4 w-4" /> 导出 CSV
          </button>
          <button type="button" className="btn-ghost-invert" onClick={onPrint}>
            <Printer className="h-4 w-4" /> 打印
          </button>
        </div>
      </div>
    </header>
  )
}
