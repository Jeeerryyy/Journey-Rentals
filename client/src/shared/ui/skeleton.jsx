import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-2xl", className)}
      {...props}
    />
  );
}

export { Skeleton }
