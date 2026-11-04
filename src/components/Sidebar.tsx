import { Plus, Trash2, ClipboardList } from 'lucide-react'
import type { PurchaseList } from '@/types/procurement'
import { listStats, formatMoney } from '@/lib/procurement-utils'
import { cn } from '@/lib/utils'

interface SidebarProps {
  lists: PurchaseList[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function Sidebar({ lists, activeId, onSelect, onNew, onDelete }: SidebarProps) {
  return (
    <aside className="no-print flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar-background">
      <div className="border-b border-sidebar-border px-5 py-5">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" strokeWidth={2.2} />
          <h1 className="text-lg font-bold tracking-tight">物资采购管理</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">自管委员会 · 策创部</p>
      </div>

      <div className="px-4 pt-4">
        <button type="button" className="btn-solid w-full justify-center" onClick={onNew}>
          <Plus className="h-4 w-4" /> 新建采购表
        </button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4" aria-label="采购表列表">
        <ul className="space-y-1">
          {lists.map((list) => {
            const s = listStats(list)
            const pct = s.count === 0 ? 0 : Math.round((s.purchasedCount / s.count) * 100)
            const active = list.id === activeId
            return (
              <li key={list.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(list.id)}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'w-full border px-3 py-2.5 text-left transition-colors duration-150',
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-transparent hover:border-border hover:bg-sidebar-accent',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{list.name}</span>
                    <span
                      className={cn(
                        'tnum shrink-0 text-xs',
                        active ? 'text-background/70' : 'text-muted-foreground',
                      )}
                    >
                      {formatMoney(s.total)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'mt-1 flex items-center justify-between text-xs',
                      active ? 'text-background/70' : 'text-muted-foreground',
                    )}
                  >
                    <span className="tnum">
                      {s.count} 项 · 已购 {s.purchasedCount}
                    </span>
                    <span className="tnum">{pct}%</span>
                  </span>
                  <span
                    className={cn(
                      'mt-1.5 block h-1 w-full',
                      active ? 'bg-background/25' : 'bg-border',
                    )}
                  >
                    <span
                      className={cn(
                        'block h-1 transition-[width] duration-300',
                        active ? 'bg-background' : 'bg-primary',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </button>
                <button
                  type="button"
                  title="删除采购表"
                  aria-label={`删除采购表 ${list.name}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(list.id)
                  }}
                  className={cn(
                    'absolute right-2 top-2 h-7 w-7 items-center justify-center border transition-colors',
                    active
                      ? 'border-background/40 text-background/80 hover:bg-background hover:text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-destructive hover:text-destructive-foreground',
                    'hidden group-hover:flex',
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <p className="border-t border-sidebar-border px-5 py-3 text-[11px] leading-relaxed text-muted-foreground">
        数据保存在本浏览器中，跨设备不同步。
      </p>
    </aside>
  )
}
