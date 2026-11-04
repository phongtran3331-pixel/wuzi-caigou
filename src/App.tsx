import { useMemo, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ListHeader } from '@/components/ListHeader'
import { ItemsTable } from '@/components/ItemsTable'
import { NewListDialog } from '@/components/NewListDialog'
import { SignaturePad } from '@/components/SignaturePad'
import { usePersistentState } from '@/hooks/usePersistentState'
import { createSeedLists } from '@/data/seed'
import type { PurchaseItem, PurchaseList, StatusFilter } from '@/types/procurement'
import { createEmptyItem, exportListCsv, genId, listStats } from '@/lib/procurement-utils'

const NEW_ID = '__new__'

function today(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export default function App() {
  const [lists, setLists] = usePersistentState<PurchaseList[]>('wuzi-caigou:v1', createSeedLists)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<PurchaseItem>(createEmptyItem)
  const [newListOpen, setNewListOpen] = useState(false)
  const [signTargetId, setSignTargetId] = useState<string | null>(null)

  const activeList = lists.find((l) => l.id === activeId) ?? lists[0] ?? null
  const stats = useMemo(() => (activeList ? listStats(activeList) : null), [activeList])

  /** 在当前表上执行修改 */
  function mutateActive(fn: (list: PurchaseList) => PurchaseList) {
    if (!activeList) return
    setLists((prev) => prev.map((l) => (l.id === activeList.id ? fn(l) : l)))
  }

  function patchItem(itemId: string, patch: Partial<PurchaseItem>) {
    mutateActive((l) => ({
      ...l,
      items: l.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
    }))
  }

  /* ---------- 采购表 ---------- */

  function handleCreateList(name: string, remark: string) {
    const list: PurchaseList = {
      id: genId(),
      name,
      remark,
      createdAt: today(),
      items: [],
    }
    setLists((prev) => [...prev, list])
    setActiveId(list.id)
    setQuery('')
    setFilter('all')
    cancelEdit()
  }

  function handleDeleteList(id: string) {
    const list = lists.find((l) => l.id === id)
    if (!list) return
    if (!window.confirm(`确定删除采购表「${list.name}」？表内 ${list.items.length} 项物资将一并删除。`)) return
    setLists((prev) => prev.filter((l) => l.id !== id))
    if (activeId === id) setActiveId(null)
    cancelEdit()
  }

  function handleRename(name: string, remark: string) {
    mutateActive((l) => ({ ...l, name, remark }))
  }

  /* ---------- 物资行 ---------- */

  function handleToggle(itemId: string) {
    const it = activeList?.items.find((i) => i.id === itemId)
    if (!it) return
    patchItem(itemId, {
      purchased: !it.purchased,
      purchasedAt: !it.purchased ? today() : null,
    })
  }

  function startEdit(itemId: string) {
    const it = activeList?.items.find((i) => i.id === itemId)
    if (!it) return
    setDraft({ ...it })
    setEditingId(itemId)
  }

  function startAdd() {
    setDraft(createEmptyItem())
    setEditingId(NEW_ID)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function saveEdit() {
    if (!activeList || !draft.name.trim()) return
    if (editingId === NEW_ID) {
      mutateActive((l) => ({ ...l, items: [...l.items, { ...draft, id: genId() }] }))
    } else if (editingId) {
      patchItem(editingId, draft)
    }
    setEditingId(null)
  }

  function handleDeleteItem(itemId: string) {
    const it = activeList?.items.find((i) => i.id === itemId)
    if (!it) return
    if (!window.confirm(`确定删除物资「${it.name}」？`)) return
    mutateActive((l) => ({ ...l, items: l.items.filter((i) => i.id !== itemId) }))
    if (editingId === itemId) setEditingId(null)
  }

  /* ---------- 签名 ---------- */

  const signTarget = activeList?.items.find((i) => i.id === signTargetId) ?? null

  function handleSignature(name: string, dataUrl: string) {
    if (!signTarget) return
    patchItem(signTarget.id, {
      purchaser: name,
      signature: dataUrl,
      purchased: true,
      purchasedAt: signTarget.purchasedAt ?? today(),
    })
    setSignTargetId(null)
  }

  /* ---------- 筛选 ---------- */

  const filteredItems = useMemo(() => {
    if (!activeList) return []
    const q = query.trim().toLowerCase()
    return activeList.items.filter((it) => {
      if (filter === 'pending' && it.purchased) return false
      if (filter === 'done' && !it.purchased) return false
      if (
        q &&
        ![it.name, it.note, it.purchaser, it.quantity].some((f) =>
          (f ?? '').toLowerCase().includes(q),
        )
      )
        return false
      return true
    })
  }, [activeList, query, filter])

  if (!activeList || !stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">还没有采购表</p>
          <button type="button" className="btn-solid" onClick={() => setNewListOpen(true)}>
            新建第一张采购表
          </button>
        </div>
        <NewListDialog open={newListOpen} onOpenChange={setNewListOpen} onCreate={handleCreateList} />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <Sidebar
        lists={lists}
        activeId={activeList.id}
        onSelect={(id) => {
          setActiveId(id)
          setQuery('')
          setFilter('all')
          cancelEdit()
        }}
        onNew={() => setNewListOpen(true)}
        onDelete={handleDeleteList}
      />

      <main className="flex min-w-0 flex-1 flex-col print-full">
        <ListHeader
          list={activeList}
          stats={stats}
          query={query}
          onQuery={setQuery}
          filter={filter}
          onFilter={setFilter}
          onAddItem={startAdd}
          onExport={() => exportListCsv(activeList)}
          onPrint={() => window.print()}
          onRename={handleRename}
        />
        <ItemsTable
          items={filteredItems}
          editingId={editingId === NEW_ID ? null : editingId}
          isAdding={editingId === NEW_ID}
          draft={draft}
          onStartEdit={startEdit}
          onStartAdd={startAdd}
          onDraftChange={setDraft}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onToggle={handleToggle}
          onDelete={handleDeleteItem}
          onSign={(id) => setSignTargetId(id)}
        />
      </main>

      <NewListDialog open={newListOpen} onOpenChange={setNewListOpen} onCreate={handleCreateList} />
      <SignaturePad
        open={signTarget != null}
        onOpenChange={(o) => {
          if (!o) setSignTargetId(null)
        }}
        defaultName={signTarget?.purchaser ?? ''}
        onSave={handleSignature}
      />
    </div>
  )
}
