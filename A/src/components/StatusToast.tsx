import { useEffect } from 'react'

type StatusToastProps = {
  message: string
  variant?: 'success' | 'error'
  onDismiss?: () => void
  autoHideMs?: number
}

export default function StatusToast({
  message,
  variant = 'success',
  onDismiss,
  autoHideMs = 5000,
}: StatusToastProps) {
  useEffect(() => {
    if (!onDismiss || autoHideMs <= 0) {
      return
    }

    const timer = window.setTimeout(onDismiss, autoHideMs)
    return () => window.clearTimeout(timer)
  }, [autoHideMs, message, onDismiss])

  return (
    <div
      className={`status-toast status-toast--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <span className="status-toast__icon" aria-hidden="true">
        {variant === 'success' ? '✓' : '!'}
      </span>
      <p className="status-toast__message">{message}</p>
      {onDismiss && (
        <button type="button" className="status-toast__close" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  )
}
