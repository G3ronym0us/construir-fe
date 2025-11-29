export default function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200" />

      {/* Content skeleton */}
      <div className="p-5">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        {/* Description skeleton */}
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}
