import WeatherWidget from '../WeatherWidget';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function WeatherWidgetExample() {
  return (
    <LanguageProvider>
      <div className="p-4 max-w-sm">
        <WeatherWidget />
      </div>
    </LanguageProvider>
  );
}
