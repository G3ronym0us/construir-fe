interface ProductCardSkeletonProps {
  variant?: 'default' | 'compact';
}

export default function ProductCardSkeleton({ variant = 'default' }: ProductCardSkeletonProps) {
  const isCompact = variant === 'compact';

  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-sand-300 bg-white">
      <div className={`${isCompact ? 'h-[84px] sm:h-40' : 'h-[90px] sm:h-48'} bg-sand-200`} />
      <div className="space-y-2 p-2.5 sm:p-3">
        <div className="h-2 w-1/3 rounded bg-sand-200" />
        <div className="h-3 w-full rounded bg-sand-200" />
        <div className="h-3 w-2/3 rounded bg-sand-200" />
        <div className="h-4 w-1/2 rounded bg-sand-200" />
        <div className="h-10 w-full rounded-xl bg-sand-200" />
      </div>
    </div>
  );
}
