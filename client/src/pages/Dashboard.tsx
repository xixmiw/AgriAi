import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import MetricCard from '@/components/MetricCard';
import SoilDataCard from '@/components/SoilDataCard';
import { Wheat, Sprout, TrendingUp, Heart, Plus, Sparkles } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" data-testid="title-dashboard">
          {t('dashboard.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {new Date().toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <SoilDataCard 
            fieldName={fields[0]?.name}
            location={fields[0] ? `${fields[0].latitude}°, ${fields[0].longitude}°` : undefined}
          />
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full border-2 hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-pink-500/10">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Sparkles className="h-6 w-6 animate-pulse" />
                <span className="text-xl">AI-Ассистент</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                Ваш персональный агро-консультант готов помочь с:
              </p>
              <ul className="text-sm space-y-3">
                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors">
                  <span className="text-green-600 text-lg font-bold">✓</span>
                  <span className="text-base">Анализом урожайности</span>
                </li>
                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors">
                  <span className="text-green-600 text-lg font-bold">✓</span>
                  <span className="text-base">Планами кормления</span>
                </li>
                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors">
                  <span className="text-green-600 text-lg font-bold">✓</span>
                  <span className="text-base">Прогнозами и советами</span>
                </li>
              </ul>
              <Button 
                onClick={() => setLocation('/ai-chat')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base py-6"
              >
                Открыть чат
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
