import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6">
      <header className="text-4xl font-bold mx-6 mb-3">
        <Skeleton className="h-10 w-40" />
      </header>
      <div className="container mx-auto pt-10 pb-15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="lg:hidden flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
        <div className="hidden lg:block rounded-md border">
          <div className="p-4 space-y-4">
            <div className="flex gap-4 border-b pb-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
