import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-zinc-200 rounded", className)} />;
}

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-8 w-24 bg-zinc-200 rounded animate-pulse" />
        <div className="h-3 w-20 bg-zinc-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="h-8 w-full bg-zinc-100 rounded animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 w-full bg-zinc-50 rounded animate-pulse" />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-zinc-200 rounded animate-pulse",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
          )}
        />
      ))}
    </div>
  );
}
