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
  const getGradient = () => {
    if (testId?.includes('fields')) return 'from-amber-500/20 to-yellow-500/20';
    if (testId?.includes('livestock')) return 'from-green-500/20 to-emerald-500/20';
    if (testId?.includes('yield')) return 'from-blue-500/20 to-cyan-500/20';
    if (testId?.includes('health')) return 'from-red-500/20 to-pink-500/20';
    return 'from-gray-500/20 to-slate-500/20';
  };

  const getIconColor = () => {
    if (testId?.includes('fields')) return 'text-amber-600 dark:text-amber-400';
    if (testId?.includes('livestock')) return 'text-green-600 dark:text-green-400';
    if (testId?.includes('yield')) return 'text-blue-600 dark:text-blue-400';
    if (testId?.includes('health')) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <Card 
      data-testid={testId}
      className={`border-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${getGradient()}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-background/50">
          <Icon className={`h-5 w-5 ${getIconColor()}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight" data-testid={`${testId}-value`}>{value}</div>
        {trend && (
          <p className="text-sm text-muted-foreground mt-2" data-testid={`${testId}-trend`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
