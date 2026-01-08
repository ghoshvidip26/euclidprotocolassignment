"use client"

import { AlertCircle, X } from "lucide-react"

interface ErrorAlertProps {
  message: string
  onDismiss: () => void
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="flex items-start gap-4 p-4 mb-6 bg-destructive/10 border border-destructive rounded-lg">
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-destructive font-medium">Error</p>
        <p className="text-sm text-destructive/80 mt-1">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-destructive/60 hover:text-destructive transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
