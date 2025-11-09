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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-500/50 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-yellow-500/10">
      <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <Activity className="h-6 w-6" />
          <span className="text-xl">Анализ почвы</span>
        </CardTitle>
        {fieldName && (
          <p className="text-base text-muted-foreground font-medium">{fieldName}</p>
        )}
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Thermometer className="h-5 w-5 text-orange-600" />
              Температура
            </div>
            <div className="text-3xl font-bold">{soilTemp}°C</div>
            <p className="text-sm text-muted-foreground">На глубине 10см</p>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Droplet className="h-5 w-5 text-blue-600" />
              Влажность
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{soilMoisture}%</div>
              <span className={`text-sm font-bold ${moistureStatus.color}`}>
                {moistureStatus.text}
              </span>
            </div>
            <Progress value={soilMoisture} className="h-2" />
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <div className="space-y-2 p-3 rounded-lg bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-muted-foreground">pH уровень</span>
              <span className="text-xl font-bold">{soilPh}</span>
            </div>
            <Progress value={(soilPh / 14) * 100} className="h-2" />
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-muted-foreground">Азот (N)</span>
              <span className="text-xl font-bold">{soilNitrogen}%</span>
            </div>
            <Progress value={soilNitrogen} className="h-2" />
          </div>
        </div>

        <div className="pt-4 border-t bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 -mx-6 -mb-6 px-6 py-4 space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            💡 <span className="font-semibold">Рекомендация:</span> Уровень влажности оптимальный для посева. 
            pH нейтральный - подходит для большинства культур.
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 italic">
            ℹ️ Демо-данные. Для реальных измерений почвы требуется OpenWeather Agro API.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
