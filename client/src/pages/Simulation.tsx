import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, AlertCircle, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import type { Livestock } from '@shared/schema';

export default function Simulation() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: livestock = [], isLoading } = useQuery<Livestock[]>({
    queryKey: ['/api/livestock'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  const hasLivestock = livestock.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="title-simulation">
          {t('simulation.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          Мониторинг здоровья животных в реальном времени через IoT датчики
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {hasLivestock ? 'IoT мониторинг' : 'Ожидание данных'}
            <Badge variant="default" className="ml-auto">Health Tracking</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {hasLivestock
              ? 'Система мониторинга здоровья через IoT чипы позволяет отслеживать температуру, пульс и общее состояние животных в режиме реального времени.'
              : 'Для мониторинга здоровья животных необходимо сначала добавить информацию о вашем скоте.'}
          </p>
        </CardContent>
      </Card>

      {!hasLivestock && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Начните с добавления животных</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Система мониторинга здоровья позволяет:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Отслеживать температуру тела и пульс каждого животного</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Получать уведомления о проблемах со здоровьем в режиме реального времени</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Предотвращать заболевания через раннее обнаружение симптомов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Оптимизировать уход и кормление на основе данных о здоровье</span>
              </li>
            </ul>
            <Button onClick={() => setLocation('/livestock')} data-testid="button-goto-livestock">
              <Plus className="h-4 w-4 mr-2" />
              Добавить животных
            </Button>
          </CardContent>
        </Card>
      )}

      {hasLivestock && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('simulation.healthy')}</CardTitle>
                <Heart className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-healthy">
                  —
                </div>
                <Badge variant="default" className="mt-2">IoT интеграция в процессе</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('simulation.attention')}</CardTitle>
                <Activity className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="stat-attention">
                  —
                </div>
                <Badge variant="secondary" className="mt-2">Ожидание датчиков</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('simulation.critical')}</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="stat-critical">
                  —
                </div>
                <Badge variant="destructive" className="mt-2">Система мониторинга</Badge>
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Настройка IoT датчиков</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Для активации мониторинга здоровья животных необходимо подключить IoT чипы. 
                Данные о температуре, пульсе и активности будут отображаться здесь в режиме реального времени.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
