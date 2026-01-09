import { Cards } from '@/components/ui/cards';

export function InstructorProfileSkeleton() {
  return (
    <div className="min-h-screen relative bg-white">
      <div className="fixed top-0 left-0 right-0 h-24 bg-primary z-40" />
      
      <div className="relative z-10">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Back button skeleton */}
            <div className="h-10 w-32 bg-slate-200 rounded mb-8 animate-pulse" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column Skeleton */}
              <div className="lg:col-span-1">
                <Cards className="overflow-hidden border-slate-200">
                  <div className="h-80 bg-slate-200 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4" />
                    <div className="h-6 bg-slate-200 rounded animate-pulse w-1/2" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="h-10 bg-slate-200 rounded animate-pulse" />
                  </div>
                </Cards>
              </div>

              {/* Right Column Skeleton */}
              <div className="lg:col-span-2 space-y-8">
                <Cards className="p-8 border-slate-200">
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-24 mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
                  </div>
                </Cards>

                <Cards className="p-8 border-slate-200">
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-32 mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />
                    ))}
                  </div>
                </Cards>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function InstructorsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <Cards key={i} className="overflow-hidden border-slate-200">
          <div className="h-64 bg-slate-200 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
            <div className="h-px bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-10 bg-slate-200 rounded animate-pulse" />
          </div>
        </Cards>
      ))}
    </div>
  );
}
