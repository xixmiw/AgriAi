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

const statusLabels: Record<string, Record<string, string>> = {
  healthy: { en: 'Healthy', ru: 'Здоровы', kk: 'Сау', zh: '健康' },
  attention: { en: 'Attention', ru: 'Внимание', kk: 'Назар', zh: '注意' },
  critical: { en: 'Critical', ru: 'Критично', kk: 'Сыни', zh: '危急' },
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
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2" data-testid={testId}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardTitle className="flex items-center justify-between">
          <span data-testid={`${testId}-type`}>{type}</span>
          <Badge variant={statusVariants[healthStatus]} data-testid={`${testId}-status`}>
            {statusLabels[healthStatus][language] || statusLabels[healthStatus]['ru']}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent" data-testid={`${testId}-count`}>
          {count}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{t('livestock.count')}</p>
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
