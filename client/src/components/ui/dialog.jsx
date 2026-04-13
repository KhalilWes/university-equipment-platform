import { createContext, useContext, useState, forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

const DialogContext = createContext()

const useDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialog must be used within a Dialog component')
  }
  return context
}

const Dialog = ({ open = false, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = useState(open)
  const isControlled = onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (newOpen) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = forwardRef(({ className, ...props }, ref) => {
  const { onOpenChange } = useDialog()
  return (
    <button
      ref={ref}
      onClick={() => onOpenChange(true)}
      className={cn(className)}
      {...props}
    />
  )
})
DialogTrigger.displayName = 'DialogTrigger'

const DialogContent = forwardRef(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = useDialog()

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg',
          className
        )}
        {...props}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </>
  )
})
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('border-b border-gray-200 px-6 py-4', className)} {...props} />
)

const DialogTitle = ({ className, ...props }) => (
  <h2
    className={cn('text-lg font-semibold text-gray-900', className)}
    {...props}
  />
)

const DialogDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-gray-500', className)} {...props} />
)

const DialogBody = ({ className, ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props} />
)

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn('border-t border-gray-200 flex justify-end gap-3 px-6 py-4', className)}
    {...props}
  />
)

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
}
