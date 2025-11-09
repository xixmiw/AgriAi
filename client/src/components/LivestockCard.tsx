import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trash2, Plus, Minus, UtensilsCrossed, Skull } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ManageFeedsDialog } from './ManageFeedsDialog';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [feedsDialogOpen, setFeedsDialogOpen] = useState(false);

  const updateCount = useMutation({
    mutationFn: async (newCount: number) => {
      if (newCount < 1) return;
      const res = await apiRequest('PATCH', `/api/livestock/${id}`, { count: newCount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/livestock'] });
      toast({
        title: 'Успешно',
        description: 'Количество обновлено',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить количество',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/livestock/${id}`);
      if (!res.ok) throw new Error('Failed to delete livestock');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/livestock'] });
      toast({
        title: 'Успешно',
        description: 'Группа животных удалена',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить',
      });
    },
  });

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50" data-testid={testId}>
      <CardHeader className="border-b bg-accent/30">
        <CardTitle className="flex items-center justify-between">
          <span data-testid={`${testId}-type`}>{type}</span>
          <Badge variant={statusVariants[healthStatus]} data-testid={`${testId}-status`}>
            {statusLabels[healthStatus][language] || statusLabels[healthStatus]['ru']}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateCount.mutate(count - 1)}
            disabled={count <= 1 || updateCount.isPending}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-4xl font-bold text-primary" data-testid={`${testId}-count`}>
            {count}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateCount.mutate(count + 1)}
            disabled={updateCount.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 text-center">{t('livestock.count')}</p>
      </CardContent>
      <CardFooter className="gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setFeedsDialogOpen(true)}
        >
          <UtensilsCrossed className="h-4 w-4 mr-1" />
          Корма
        </Button>
        {count > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50"
            onClick={() => {
              if (window.confirm('Утилизировать мертвое животное? Это уменьшит количество на 1.')) {
                updateCount.mutate(count - 1);
              }
            }}
            disabled={updateCount.isPending}
          >
            <Skull className="h-4 w-4 mr-1" />
            Утилизация
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            if (window.confirm(`Удалить всю группу "${type}"?`)) {
              deleteMutation.mutate();
            }
          }}
          disabled={deleteMutation.isPending}
          data-testid={`${testId}-delete`}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {t('common.delete')}
        </Button>
      </CardFooter>
      <ManageFeedsDialog
        open={feedsDialogOpen}
        onOpenChange={setFeedsDialogOpen}
        livestockId={id}
      />
    </Card>
  );
}
