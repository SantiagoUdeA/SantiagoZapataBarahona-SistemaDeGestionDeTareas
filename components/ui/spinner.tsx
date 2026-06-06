import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

interface SpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
  className?: string
}

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <HugeiconsIcon icon={Loading03Icon} role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }