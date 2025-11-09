import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  testId?: string;
}

export default function MetricCard({ title, value, icon: Icon, trend, testId }: MetricCardProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`${testId}-value`}>{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1" data-testid={`${testId}-trend`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
