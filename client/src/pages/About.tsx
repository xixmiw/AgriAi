import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Cloud, Leaf, TrendingUp, Activity, Globe } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    titleKey: 'AI-анализ',
    descKey: 'Gemini AI анализирует данные полей, погоду и дает персонализированные рекомендации по удобрениям, кормам и технике для максимальной эффективности.',
  },
  {
    icon: Cloud,
    titleKey: 'Погодный мониторинг',
    descKey: 'Интеграция с OpenWeather API для получения актуальных данных о погоде в Казахстане и прогнозирования рисков.',
  },
  {
    icon: Leaf,
    titleKey: 'Управление полями',
    descKey: 'Учет полей с координатами, размером и типом культур. AI-рекомендации по севообороту и удобрениям.',
  },
  {
    icon: Activity,
    titleKey: 'Мониторинг скота',
    descKey: 'Симуляция здоровья животных через IoT датчики с отслеживанием температуры, пульса и общего состояния.',
  },
  {
    icon: TrendingUp,
    titleKey: 'Увеличение производства',
    descKey: 'Инновационные комбинации кормов и удобрений для повышения надоев молока, производства шерсти и урожайности.',
  },
  {
    icon: Globe,
    titleKey: 'Многоязычность',
    descKey: 'Поддержка русского, английского и казахского языков для удобства фермеров Казахстана.',
  },
];

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4" data-testid="title-about">
          {t('about.title')}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t('about.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-8">
        {features.map((feature, i) => (
          <Card key={i} className="hover:shadow-xl transition-all duration-300 hover:scale-105" data-testid={`feature-${i}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.titleKey}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.descKey}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Технологии
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Platform:</span>
              <span className="font-semibold text-purple-600">Google Gemini AI</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Weather API:</span>
              <span className="font-semibold text-blue-600">OpenWeatherMap</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Frontend:</span>
              <span className="font-semibold">React + TypeScript</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Backend:</span>
              <span className="font-semibold">Node.js + Express</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Region:</span>
              <span className="font-semibold">🇰🇿 Kazakhstan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader>
            <CardTitle>AgriAI Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Современная система управления сельским хозяйством с использованием искусственного интеллекта.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Анализ почвы и погоды</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>AI рекомендации</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Управление полями и скотом</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Многоязычная поддержка</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
