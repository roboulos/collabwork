import React, { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const baseClasses = "fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 animate-slide-up flex items-center gap-2 z-50"
  const typeClasses = type === 'success' 
    ? "bg-green-50 text-green-800 border border-green-200" 
    : "bg-red-50 text-red-800 border border-red-200"

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {type === 'success' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="font-medium">{message}</span>
    </div>
  )
}