import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
        {icon && <div className="text-zinc-400 mb-1">{icon}</div>}
        <h3 className="text-base font-semibold text-zinc-700">{title}</h3>
        {description && (
          <p className="text-sm text-zinc-500 max-w-xs">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
