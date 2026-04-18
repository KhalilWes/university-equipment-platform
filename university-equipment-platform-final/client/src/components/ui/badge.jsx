import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { badgeVariants } from './badge-variants'

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

export { Badge }
