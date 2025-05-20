import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex w-full max-w-sm items-center justify-between rounded-lg border p-4 shadow-lg",
        variant === "default" ? "bg-background" : "bg-destructive text-destructive-foreground"
      )}
    >
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState<ToastProps | null>(null)

  const showToast = React.useCallback((props: ToastProps) => {
    setToast(props)
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }, [])

  return {
    toast,
    showToast,
  }
} 