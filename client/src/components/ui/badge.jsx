import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { cva } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-900',
        primary: 'bg-teal-100 text-teal-900',
        success: 'bg-green-100 text-green-900',
        warning: 'bg-yellow-100 text-yellow-900',
        danger: 'bg-red-100 text-red-900',
        outline: 'border border-gray-300 text-gray-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Badge = forwardRef(
  ({ className, variant, ...props }, ref) => (
    <div
      className={cn(badgeVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
