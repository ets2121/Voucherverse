import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-[linear-gradient(110deg,#333_8%,#444_18%,#333_33%)] bg-[length:200%_100%]", className)}
      {...props}
    />
  )
}

export { Skeleton }
