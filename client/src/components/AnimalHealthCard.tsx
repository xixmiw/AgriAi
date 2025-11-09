import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface AnimalHealthCardProps {
  id: string;
  type: string;
  tagId: string;
  temperature: number;
  heartRate: number;
  status: 'healthy' | 'attention' | 'critical';
  testId?: string;
}

const statusConfig = {
  healthy: { variant: 'default' as const, label: 'Healthy', color: 'text-green-600' },
  attention: { variant: 'secondary' as const, label: 'Needs Attention', color: 'text-yellow-600' },
  critical: { variant: 'destructive' as const, label: 'Critical', color: 'text-red-600' },
};

export default function AnimalHealthCard({
  id,
  type,
  tagId,
  temperature,
  heartRate,
  status,
  testId,
}: AnimalHealthCardProps) {
  const config = statusConfig[status];

  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{type}</CardTitle>
          <Badge variant={config.variant} data-testid={`${testId}-status`}>
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground" data-testid={`${testId}-tag`}>
          Tag: {tagId}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Temperature:</span>
          <span className={`font-medium ${config.color}`} data-testid={`${testId}-temp`}>
            {temperature}°C
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Heart Rate:
          </span>
          <span className="font-medium" data-testid={`${testId}-hr`}>
            {heartRate} bpm
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
