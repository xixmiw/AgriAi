import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Wheat, 
  Sprout, 
  TrendingUp, 
  Heart,
  AlertCircle,
  CheckCircle,
  Thermometer,
  Droplets,
  Wind,
  Sun
} from 'lucide-react';
import type { Field, Livestock } from '@shared/schema';

export default function OverallAnalysis() {
  const { data: fields = [], isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });

  const { data: livestock = [], isLoading: livestockLoading } = useQuery<Livestock[]>({
    queryKey: ['/api/livestock'],
  });

  const calculateFieldHealth = (fields: Field[]) => {
    if (fields.length === 0) return 0;
    const avgHealth = fields.reduce((sum, field) => {
      const health = field.cropType ? 75 : 50;
      return sum + health;
    }, 0) / fields.length;
    return Math.round(avgHealth);
  };

  const calculateLivestockHealth = (livestock: Livestock[]) => {
    if (livestock.length === 0) return 0;
    const avgHealth = livestock.reduce((sum, item) => {
      const health = item.count > 10 ? 80 : 65;
      return sum + health;
    }, 0) / livestock.length;
    return Math.round(avgHealth);
  };

  const fieldHealth = calculateFieldHealth(fields);
  const livestockHealth = calculateLivestockHealth(livestock);
  const overallHealth = fields.length > 0 || livestock.length > 0 
    ? Math.round((fieldHealth + livestockHealth) / 2) 
    : 0;

  const getHealthStatus = (health: number) => {
    if (health >= 75) return { label: 'Отлично', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    if (health >= 50) return { label: 'Хорошо', color: 'text-yellow-600 bg-yellow-100', icon: Activity };
    return { label: 'Требует внимания', color: 'text-red-600 bg-red-100', icon: AlertCircle };
  };

  const overallStatus = getHealthStatus(overallHealth);
  const fieldStatus = getHealthStatus(fieldHealth);
  const livestockStatus = getHealthStatus(livestockHealth);

  if (fieldsLoading || livestockLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  const hasData = fields.length > 0 || livestock.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Общий анализ</h1>
          <p className="text-muted-foreground mt-1">
            Комплексная оценка состояния хозяйства
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Нет данных для анализа</h3>
            <p className="text-muted-foreground">
              Добавьте поля и животных, чтобы получить общий анализ состояния хозяйства
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Общий анализ</h1>
        <p className="text-muted-foreground mt-1">
          Комплексная оценка состояния хозяйства
        </p>
      </div>

      <Card className="border-2 hover:shadow-lg transition-shadow">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-green-600" />
              Общее состояние хозяйства
            </span>
            <Badge className={overallStatus.color}>
              <overallStatus.icon className="h-4 w-4 mr-1" />
              {overallStatus.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Уровень здоровья</span>
                <span className="text-sm font-bold text-green-600">{overallHealth}%</span>
              </div>
              <Progress value={overallHealth} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Wheat className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                <div className="text-2xl font-bold">{fields.length}</div>
                <div className="text-xs text-muted-foreground">Полей</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Sprout className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">
                  {livestock.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Голов скота</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">—</div>
                <div className="text-xs text-muted-foreground">Урожайность</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold">—</div>
                <div className="text-xs text-muted-foreground">Прибыль</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-amber-50 dark:bg-amber-950">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wheat className="h-5 w-5 text-amber-600" />
                Здоровье полей
              </span>
              <Badge className={fieldStatus.color}>
                <fieldStatus.icon className="h-4 w-4 mr-1" />
                {fieldStatus.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Общая оценка</span>
                <span className="text-sm font-bold text-amber-600">{fieldHealth}%</span>
              </div>
              <Progress value={fieldHealth} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Влажность почвы</span>
                </div>
                <span className="text-sm font-medium">—</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">pH уровень</span>
                </div>
                <span className="text-sm font-medium">—</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Питательность</span>
                </div>
                <span className="text-sm font-medium">—</span>
              </div>
            </div>

            {fields.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-semibold mb-2">Последние поля:</h4>
                <ul className="space-y-1">
                  {fields.slice(0, 3).map(field => (
                    <li key={field.id} className="text-sm text-muted-foreground flex justify-between">
                      <span>{field.name}</span>
                      <span className="text-xs">{field.cropType || 'Не указано'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-green-50 dark:bg-green-950">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                Здоровье скота
              </span>
              <Badge className={livestockStatus.color}>
                <livestockStatus.icon className="h-4 w-4 mr-1" />
                {livestockStatus.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Общая оценка</span>
                <span className="text-sm font-bold text-green-600">{livestockHealth}%</span>
              </div>
              <Progress value={livestockHealth} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Температура</span>
                </div>
                <span className="text-sm font-medium">—</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-sm">Вакцинация</span>
                </div>
                <span className="text-sm font-medium">—</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Рацион</span>
                </div>
                <span className="text-sm font-medium">—</span>
              </div>
            </div>

            {livestock.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-semibold mb-2">Последние группы:</h4>
                <ul className="space-y-1">
                  {livestock.slice(0, 3).map(item => (
                    <li key={item.id} className="text-sm text-muted-foreground flex justify-between">
                      <span>{item.type}</span>
                      <span className="text-xs">{item.count} голов</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-blue-600" />
            Рекомендации по улучшению
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Анализ почвы</h4>
                <p className="text-sm text-muted-foreground">
                  Проведите анализ почвы для точных данных о pH и питательности
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Мониторинг здоровья</h4>
                <p className="text-sm text-muted-foreground">
                  Регулярно обновляйте данные о здоровье животных и состоянии полей
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">AI-консультация</h4>
                <p className="text-sm text-muted-foreground">
                  Используйте AI-чат для получения персонализированных рекомендаций
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
