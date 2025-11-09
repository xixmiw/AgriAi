import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import type { Field, Livestock } from '@shared/schema';

export default function Recommendations() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: fields = [], isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });

  const { data: livestock = [], isLoading: livestockLoading } = useQuery<Livestock[]>({
    queryKey: ['/api/livestock'],
  });

  const hasData = fields.length > 0 || livestock.length > 0;
  const isLoading = fieldsLoading || livestockLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="title-recommendations">
          <Sparkles className="h-8 w-8 text-primary" />
          {t('ai.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          Инновационные рекомендации на основе AI-анализа от Gemini AI
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {hasData ? t('ai.analyzing') : 'Ожидание данных'}
            <Badge variant="default" className="ml-auto">Gemini AI</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {hasData
              ? 'AI анализирует данные ваших полей, погодные условия Казахстана, состояние скота и текущие рыночные цены для генерации персонализированных рекомендаций.'
              : 'Для получения AI-рекомендаций необходимо добавить информацию о ваших полях и животных.'}
          </p>
        </CardContent>
      </Card>

      {!hasData && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Начните с добавления данных</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gemini AI сможет предоставить персонализированные рекомендации по:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Удобрениям и пестицидам с ценами и комбинациями</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Оптимизированным формулам кормов для увеличения надоев и производства шерсти</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Использованию техники для экономии топлива</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Подготовке к зиме и прогнозу рисков</span>
              </li>
            </ul>
            <div className="flex gap-4 pt-4">
              <Button onClick={() => setLocation('/fields')} data-testid="button-goto-fields">
                <Plus className="h-4 w-4 mr-2" />
                Добавить поле
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/livestock')}
                data-testid="button-goto-livestock"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить скот
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Интеграция AI в процессе</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI-рекомендации на основе Gemini будут доступны после настройки интеграции с API. 
              Продолжайте добавлять данные о полях и животных для более точного анализа.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
