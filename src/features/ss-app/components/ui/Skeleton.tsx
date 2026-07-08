type SkeletonProps = {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[rgba(122,82,255,0.12)] ${className}`}
    />
  )
}
