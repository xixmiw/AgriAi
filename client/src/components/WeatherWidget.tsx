import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cloud, Droplets, Wind, Sun } from 'lucide-react';

// TODO: remove mock functionality - this will be replaced with real OpenWeather API data
const mockWeatherData = {
  current: {
    temp: 18,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
  },
  forecast: [
    { day: 'Mon', temp: 20, icon: Sun },
    { day: 'Tue', temp: 19, icon: Cloud },
    { day: 'Wed', temp: 17, icon: Cloud },
    { day: 'Thu', temp: 21, icon: Sun },
    { day: 'Fri', temp: 22, icon: Sun },
  ],
};

export default function WeatherWidget() {
  const { t } = useLanguage();

  return (
    <Card data-testid="widget-weather">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          {t('weather.current')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold" data-testid="text-temp">
                {mockWeatherData.current.temp}°C
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-condition">
                {mockWeatherData.current.condition}
              </p>
            </div>
            <Cloud className="h-12 w-12 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('weather.humidity')}</p>
                <p className="text-sm font-medium" data-testid="text-humidity">
                  {mockWeatherData.current.humidity}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('weather.wind')}</p>
                <p className="text-sm font-medium" data-testid="text-wind">
                  {mockWeatherData.current.windSpeed} km/h
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between gap-2">
              {mockWeatherData.forecast.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1" data-testid={`forecast-day-${i}`}>
                  <p className="text-xs text-muted-foreground">{day.day}</p>
                  <day.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{day.temp}°</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
