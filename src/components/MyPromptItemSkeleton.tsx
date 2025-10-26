/**
 * 我的提示词列表项骨架屏组件
 */
export function MyPromptItemSkeleton() {
  return (
    <div className="bg-[#313135] rounded-[18px] p-6 border border-white/5 animate-pulse">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        {/* Left: Thumbnail Skeleton */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <div className="w-full md:w-[150px] h-[180px] md:h-[210px] rounded-lg bg-[#4a4a4a]" />
        </div>

        {/* Middle: Content Skeleton */}
        <div className="flex flex-col justify-between md:h-[210px] flex-1 md:flex-none pt-1 gap-4 md:gap-0">
          {/* Title and Visibility */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              {/* Title skeleton */}
              <div className="h-6 bg-[#4a4a4a] rounded w-48" />
              {/* Visibility badge skeleton */}
              <div className="h-7 w-20 bg-[#4a4a4a] rounded-md flex-shrink-0" />
            </div>
            {/* Tags skeleton */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-6 w-24 bg-[#4a4a4a] rounded-md" />
              <div className="h-6 w-20 bg-[#4a4a4a] rounded-md" />
            </div>
          </div>

          {/* Actions skeleton */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="h-10 w-24 bg-[#4a4a4a] rounded-[18px]" />
            <div className="h-10 w-20 bg-[#4a4a4a] rounded-[18px]" />
            <div className="h-10 w-20 bg-[#4a4a4a] rounded-[18px]" />
          </div>
        </div>

        {/* Right: Stats Skeleton */}
        <div className="flex-1 flex flex-col md:min-h-[210px] justify-center py-1 w-full md:w-auto">
          <div className="flex gap-6 sm:gap-8 lg:gap-16 justify-center md:justify-end items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-12 bg-[#4a4a4a] rounded" />
              <div className="h-3 w-16 bg-[#4a4a4a] rounded" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-12 bg-[#4a4a4a] rounded" />
              <div className="h-3 w-16 bg-[#4a4a4a] rounded" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-12 bg-[#4a4a4a] rounded" />
              <div className="h-3 w-16 bg-[#4a4a4a] rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 我的提示词列表骨架屏
 * @param count 骨架屏数量，默认5个
 */
export function MyPromptsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <MyPromptItemSkeleton key={index} />
      ))}
    </div>
  );
}
