import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Edit, Trash2 } from 'lucide-react';

interface LivestockCardProps {
  id: string;
  type: string;
  count: number;
  healthStatus: 'healthy' | 'attention' | 'critical';
  testId?: string;
}

const statusVariants = {
  healthy: 'default' as const,
  attention: 'secondary' as const,
  critical: 'destructive' as const,
};

const statusLabels = {
  healthy: { en: 'Healthy', ru: 'Здоровы', kk: 'Сау' },
  attention: { en: 'Attention', ru: 'Внимание', kk: 'Назар' },
  critical: { en: 'Critical', ru: 'Критично', kk: 'Сыни' },
};

export default function LivestockCard({
  id,
  type,
  count,
  healthStatus,
  testId,
}: LivestockCardProps) {
  const { t, language } = useLanguage();

  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span data-testid={`${testId}-type`}>{type}</span>
          <Badge variant={statusVariants[healthStatus]} data-testid={`${testId}-status`}>
            {statusLabels[healthStatus][language]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`${testId}-count`}>
          {count}
        </div>
        <p className="text-sm text-muted-foreground">{t('livestock.count')}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => console.log('Edit livestock:', id)}
          data-testid={`${testId}-edit`}
        >
          <Edit className="h-4 w-4 mr-1" />
          {t('common.edit')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => console.log('Delete livestock:', id)}
          data-testid={`${testId}-delete`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
