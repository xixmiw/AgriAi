import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Droplets, Wind, Thermometer, MapPin, Loader2 } from 'lucide-react';
import type { Field } from '@shared/schema';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
  location: string;
}

export default function Weather() {
  const { t } = useLanguage();

  const { data: fields = [], isLoading: isLoadingFields } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="title-weather">
          {t('weather.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          Прогноз погоды для ваших полей
        </p>
      </div>

      {isLoadingFields ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : fields.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Нет добавленных полей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Добавьте поля с координатами, чтобы видеть актуальную погоду для каждого местоположения.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <WeatherCard
              key={field.id}
              fieldName={field.name}
              latitude={parseFloat(field.latitude)}
              longitude={parseFloat(field.longitude)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WeatherCard({ fieldName, latitude, longitude }: { fieldName: string; latitude: number; longitude: number }) {
  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: ['/api/weather', latitude, longitude],
    queryFn: async () => {
      const res = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`);
      if (!res.ok) {
        throw new Error('Не удалось получить погоду');
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-base">{fieldName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Ошибка загрузки погоды</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{fieldName}</span>
          <Badge variant="outline" className="font-normal">
            <MapPin className="h-3 w-3 mr-1" />
            {weather.location}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <p className="text-sm text-muted-foreground capitalize">{weather.description}</p>
            </div>
            <Cloud className="h-12 w-12 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ощущается</p>
                <p className="text-sm font-medium">{weather.feelsLike}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Влажность</p>
                <p className="text-sm font-medium">{weather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ветер</p>
                <p className="text-sm font-medium">{weather.windSpeed} м/с</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Давление</p>
                <p className="text-sm font-medium">{weather.pressure} гПа</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
