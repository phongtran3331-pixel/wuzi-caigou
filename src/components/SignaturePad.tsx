import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eraser, Check } from 'lucide-react'

interface SignaturePadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultName: string
  onSave: (name: string, dataUrl: string) => void
}

const INK = '#1d1813'

export function SignaturePad({ open, onOpenChange, defaultName, onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const hasInkRef = useRef(false)
  const [name, setName] = useState(defaultName)
  const [warn, setWarn] = useState('')

  useEffect(() => {
    if (open) {
      setName(defaultName)
      setWarn('')
      hasInkRef.current = false
      requestAnimationFrame(clearCanvas)
    }
  }, [open, defaultName])

  function setupCanvas(): CanvasRenderingContext2D | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = INK
    return ctx
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasInkRef.current = false
  }

  function pos(e: React.PointerEvent): { x: number; y: number } {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onPointerDown(e: React.PointerEvent) {
    const ctx = setupCanvas()
    if (!ctx) return
    drawingRef.current = true
    hasInkRef.current = true
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 0.01, y + 0.01)
    ctx.stroke()
    try {
      canvasRef.current?.setPointerCapture(e.pointerId)
    } catch {
      /* 合成事件无有效 pointerId，忽略 */
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drawingRef.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function onPointerUp() {
    drawingRef.current = false
  }

  function handleConfirm() {
    if (!name.trim()) {
      setWarn('请填写采购人姓名')
      return
    }
    if (!hasInkRef.current) {
      setWarn('请在画板中手写签名')
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(name.trim(), canvas.toDataURL('image/png'))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none border-foreground/20">
        <DialogHeader>
          <DialogTitle className="text-base tracking-tight">采购人签名</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sign-name" className="text-xs text-muted-foreground">
              采购人姓名
            </Label>
            <Input
              id="sign-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setWarn('')
              }}
              placeholder="请输入姓名"
              className="rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">手写签名（使用鼠标或手指书写）</Label>
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className="h-40 w-full touch-none border border-dashed border-input bg-white"
            />
          </div>
          {warn && <p className="text-xs text-destructive">{warn}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" className="btn-ghost-invert" onClick={clearCanvas}>
            <Eraser className="h-4 w-4" /> 清除重写
          </button>
          <button type="button" className="btn-solid" onClick={handleConfirm}>
            <Check className="h-4 w-4" /> 确认签名
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
