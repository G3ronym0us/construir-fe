export default function CategoryCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2">
      <div className="aspect-[4/3] rounded-2xl bg-sand-200" />
      <div className="h-3 w-3/4 rounded bg-sand-200" />
    </div>
  );
}
