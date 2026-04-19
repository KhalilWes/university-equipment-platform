import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { buttonVariants } from './button-variants'

const Button = forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button }
