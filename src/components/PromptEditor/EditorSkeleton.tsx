/**
 * EditorSkeleton 组件 - 加载骨架屏
 */

export function EditorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-24 bg-gray-700 rounded"></div>

      {/* Avatar Skeleton */}
      <div className="bg-[#252429] rounded-xl p-6">
        <div className="h-5 w-24 bg-gray-700 rounded mb-4"></div>
        <div className="flex gap-6 items-start">
          <div className="w-28 h-28 rounded-full bg-gray-700"></div>
          <div className="flex flex-col gap-3">
            <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
        <div className="h-3 w-3/4 bg-gray-700 rounded mt-3"></div>
      </div>

      {/* Name Skeleton */}
      <div className="bg-[#252429] rounded-xl p-6">
        <div className="h-5 w-16 bg-gray-700 rounded mb-3"></div>
        <div className="h-12 w-full bg-gray-700 rounded-lg"></div>
        <div className="h-3 w-24 bg-gray-700 rounded mt-2"></div>
      </div>

      {/* Description Skeleton */}
      <div className="bg-[#252429] rounded-xl p-6">
        <div className="h-5 w-32 bg-gray-700 rounded mb-3"></div>
        <div className="h-32 w-full bg-gray-700 rounded-lg"></div>
        <div className="h-3 w-24 bg-gray-700 rounded mt-2"></div>
      </div>

      {/* Content Skeleton */}
      <div className="bg-[#252429] rounded-xl p-6">
        <div className="h-5 w-20 bg-gray-700 rounded mb-3"></div>
        <div className="h-64 w-full bg-gray-700 rounded-lg"></div>
        <div className="h-3 w-32 bg-gray-700 rounded mt-2"></div>
      </div>

      {/* Welcome Message Skeleton */}
      <div className="bg-[#252429] rounded-xl p-6">
        <div className="h-5 w-28 bg-gray-700 rounded mb-3"></div>
        <div className="h-12 w-full bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}
