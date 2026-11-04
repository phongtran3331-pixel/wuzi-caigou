import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

interface NewListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, remark: string) => void
}

export function NewListDialog({ open, onOpenChange, onCreate }: NewListDialogProps) {
  const [name, setName] = useState('')
  const [remark, setRemark] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setRemark('')
      setErr('')
    }
  }, [open])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setErr('请填写采购表名称')
      return
    }
    onCreate(name.trim(), remark.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none border-foreground/20">
        <DialogHeader>
          <DialogTitle className="text-base tracking-tight">新建采购表</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-list-name" className="text-xs text-muted-foreground">
              采购表名称
            </Label>
            <Input
              id="new-list-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErr('')
              }}
              placeholder="例如：中秋活动物资采购"
              className="rounded-none"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-list-remark" className="text-xs text-muted-foreground">
              备注（可选）
            </Label>
            <Input
              id="new-list-remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="活动名称、负责人等"
              className="rounded-none"
            />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <DialogFooter>
            <button type="submit" className="btn-solid">
              <Plus className="h-4 w-4" /> 创建采购表
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
