import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplet, Wind, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SoilDataCardProps {
  fieldName?: string;
  location?: string;
}

export default function SoilDataCard({ fieldName, location }: SoilDataCardProps) {
  const soilTemp = 18;
  const soilMoisture = 65;
  const soilPh = 6.8;
  const soilNitrogen = 72;

  const getMoistureStatus = (moisture: number) => {
    if (moisture < 30) return { text: 'Низкая', color: 'text-red-600' };
    if (moisture < 60) return { text: 'Средняя', color: 'text-yellow-600' };
    return { text: 'Оптимальная', color: 'text-green-600' };
  };

  const moistureStatus = getMoistureStatus(soilMoisture);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 hover:border-orange-500/50">
      <CardHeader className="border-b bg-orange-500/10">
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <Activity className="h-5 w-5" />
          Анализ почвы
        </CardTitle>
        {fieldName && (
          <p className="text-sm text-muted-foreground">{fieldName}</p>
        )}
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Thermometer className="h-4 w-4" />
              Температура
            </div>
            <div className="text-2xl font-bold">{soilTemp}°C</div>
            <p className="text-xs text-muted-foreground">На глубине 10см</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Droplet className="h-4 w-4" />
              Влажность
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{soilMoisture}%</div>
              <span className={`text-sm font-medium ${moistureStatus.color}`}>
                {moistureStatus.text}
              </span>
            </div>
            <Progress value={soilMoisture} className="h-2" />
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">pH уровень</span>
            <span className="font-semibold">{soilPh}</span>
          </div>
          <Progress value={(soilPh / 14) * 100} className="h-2" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Азот (N)</span>
            <span className="font-semibold">{soilNitrogen}%</span>
          </div>
          <Progress value={soilNitrogen} className="h-2" />
        </div>

        <div className="pt-4 border-t bg-muted/50 -mx-6 -mb-6 px-6 py-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            💡 Рекомендация: Уровень влажности оптимальный для посева. 
            pH нейтральный - подходит для большинства культур.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 italic">
            ℹ️ Демо-данные. Для реальных измерений почвы требуется OpenWeather Agro API (премиум подписка).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
