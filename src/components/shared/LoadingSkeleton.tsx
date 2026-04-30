/**
 * LoadingSkeleton
 *
 * Reusable loading skeleton components for different content types.
 * Provides visual feedback while data is loading.
 */

interface SkeletonProps {
  className?: string;
}

/**
 * Generic skeleton line (shimmer effect)
 */
export const SkeletonLine = ({ className = 'h-4 w-full' }: SkeletonProps) => (
  <div className={`${className} bg-slate-200 rounded animate-pulse`} />
);

/**
 * Form field skeleton
 */
export const SkeletonFormField = () => (
  <div className="space-y-2">
    <SkeletonLine className="h-4 w-24" />
    <SkeletonLine className="h-10 w-full" />
  </div>
);

/**
 * Form preview skeleton (multiple fields)
 */
export const SkeletonFormPreview = ({ fieldCount = 4 }: { fieldCount?: number }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="bg-slate-200 h-20 animate-pulse" />
    <div className="p-6 space-y-6">
      {Array.from({ length: fieldCount }).map((_, i) => (
        <SkeletonFormField key={i} />
      ))}
      <SkeletonLine className="h-10 w-full" />
    </div>
  </div>
);

/**
 * Dashboard card skeleton
 */
export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
    <div className="flex items-center gap-3">
      <SkeletonLine className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-3 w-24" />
      </div>
    </div>
  </div>
);

/**
 * Table row skeleton
 */
export const SkeletonTableRow = ({ columnCount = 4 }: { columnCount?: number }) => (
  <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
    {Array.from({ length: columnCount }).map((_, i) => (
      <SkeletonLine key={i} className="h-4 flex-1" />
    ))}
  </div>
);

/**
 * Dashboard list skeleton
 */
export const SkeletonDashboard = ({ itemCount = 3 }: { itemCount?: number }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <SkeletonLine className="h-4 w-32" />
      </div>
      {Array.from({ length: itemCount }).map((_, i) => (
        <SkeletonTableRow key={i} columnCount={4} />
      ))}
    </div>
  </div>
);
