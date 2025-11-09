import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import MetricCard from '@/components/MetricCard';
import WeatherWidget from '@/components/WeatherWidget';
import AIRecommendationCard from '@/components/AIRecommendationCard';
import { Wheat, Sprout, TrendingUp, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import type { Field, Livestock } from '@shared/schema';

export default function Dashboard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: fields = [], isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });

  const { data: livestock = [], isLoading: livestockLoading } = useQuery<Livestock[]>({
    queryKey: ['/api/livestock'],
  });

  const totalFields = fields.length;
  const totalLivestock = livestock.reduce((sum, item) => sum + item.count, 0);
  const hasData = totalFields > 0 || totalLivestock > 0;

  if (fieldsLoading || livestockLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="title-dashboard">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Добро пожаловать в AgriAI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Начните с добавления информации о ваших полях и животных. 
              После этого AI проанализирует данные и предоставит персонализированные рекомендации.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => setLocation('/fields')}
                data-testid="button-add-first-field"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить поле
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/livestock')}
                data-testid="button-add-first-livestock"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить скот
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="title-dashboard">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('dashboard.totalFields')}
          value={totalFields}
          icon={Wheat}
          testId="metric-fields"
        />
        <MetricCard
          title={t('dashboard.totalLivestock')}
          value={totalLivestock}
          icon={Sprout}
          testId="metric-livestock"
        />
        <MetricCard
          title={t('dashboard.avgYield')}
          value="—"
          icon={TrendingUp}
          trend="Данные появятся после анализа"
          testId="metric-yield"
        />
        <MetricCard
          title={t('dashboard.healthScore')}
          value="—"
          icon={Heart}
          trend="Данные появятся после анализа"
          testId="metric-health"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('ai.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-рекомендации появятся после анализа ваших данных. Продолжайте добавлять информацию о полях и животных.
              </p>
            </CardContent>
          </Card>
        </div>
        <div>
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
}
