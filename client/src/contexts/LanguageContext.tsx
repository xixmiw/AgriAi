import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru' | 'kk';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
    kk: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ru: 'Панель', kk: 'Панель' },
  'nav.fields': { en: 'Fields', ru: 'Поля', kk: 'Алқаптар' },
  'nav.livestock': { en: 'Livestock', ru: 'Скот', kk: 'Мал' },
  'nav.weather': { en: 'Weather', ru: 'Погода', kk: 'Ауа райы' },
  'nav.recommendations': { en: 'AI Recommendations', ru: 'AI Рекомендации', kk: 'AI Ұсыныстар' },
  'nav.simulation': { en: 'Health Simulation', ru: 'Симуляция', kk: 'Симуляция' },
  'nav.about': { en: 'About', ru: 'О приложении', kk: 'Қосымша туралы' },
  
  // Dashboard
  'dashboard.title': { en: 'Agricultural Dashboard', ru: 'Аграрная панель', kk: 'Ауыл шаруашылығы панелі' },
  'dashboard.totalFields': { en: 'Total Fields', ru: 'Всего полей', kk: 'Барлық алқаптар' },
  'dashboard.totalLivestock': { en: 'Total Livestock', ru: 'Всего скота', kk: 'Барлық мал' },
  'dashboard.avgYield': { en: 'Avg. Yield', ru: 'Сред. урожай', kk: 'Орт. өнім' },
  'dashboard.healthScore': { en: 'Health Score', ru: 'Здоровье', kk: 'Денсаулық' },
  
  // Fields
  'fields.title': { en: 'Field Management', ru: 'Управление полями', kk: 'Алқаптарды басқару' },
  'fields.addNew': { en: 'Add New Field', ru: 'Добавить поле', kk: 'Жаңа алқап қосу' },
  'fields.area': { en: 'Area', ru: 'Площадь', kk: 'Аумақ' },
  'fields.crop': { en: 'Crop', ru: 'Культура', kk: 'Дақыл' },
  'fields.hectares': { en: 'ha', ru: 'га', kk: 'га' },
  
  // Livestock
  'livestock.title': { en: 'Livestock Management', ru: 'Управление скотом', kk: 'Малды басқару' },
  'livestock.addNew': { en: 'Add Livestock', ru: 'Добавить скот', kk: 'Мал қосу' },
  'livestock.count': { en: 'Count', ru: 'Количество', kk: 'Саны' },
  'livestock.type': { en: 'Type', ru: 'Тип', kk: 'Түрі' },
  'livestock.cattle': { en: 'Cattle', ru: 'Коровы', kk: 'Сиырлар' },
  'livestock.sheep': { en: 'Sheep', ru: 'Овцы', kk: 'Қойлар' },
  'livestock.horses': { en: 'Horses', ru: 'Лошади', kk: 'Жылқылар' },
  
  // Weather
  'weather.title': { en: 'Weather Forecast', ru: 'Прогноз погоды', kk: 'Ауа райы болжамы' },
  'weather.current': { en: 'Current Weather', ru: 'Текущая погода', kk: 'Ағымдағы ауа райы' },
  'weather.humidity': { en: 'Humidity', ru: 'Влажность', kk: 'Ылғалдылық' },
  'weather.wind': { en: 'Wind', ru: 'Ветер', kk: 'Жел' },
  
  // AI Recommendations
  'ai.title': { en: 'AI Recommendations', ru: 'AI Рекомендации', kk: 'AI Ұсыныстар' },
  'ai.analyzing': { en: 'Analyzing your farm data...', ru: 'Анализ данных фермы...', kk: 'Ферма деректерін талдау...' },
  'ai.fertilizers': { en: 'Fertilizer Recommendations', ru: 'Рекомендации по удобрениям', kk: 'Тыңайтқыш ұсыныстары' },
  'ai.feeds': { en: 'Feed Recommendations', ru: 'Рекомендации по кормам', kk: 'Жем ұсыныстары' },
  
  // Simulation
  'simulation.title': { en: 'Livestock Health Simulation', ru: 'Симуляция здоровья скота', kk: 'Мал денсаулығын симуляциялау' },
  'simulation.healthy': { en: 'Healthy', ru: 'Здоров', kk: 'Сау' },
  'simulation.attention': { en: 'Needs Attention', ru: 'Требует внимания', kk: 'Назар аудару қажет' },
  'simulation.critical': { en: 'Critical', ru: 'Критическое', kk: 'Сыни' },
  
  // About
  'about.title': { en: 'About AgriAI', ru: 'О AgriAI', kk: 'AgriAI туралы' },
  'about.description': { en: 'AI-powered agricultural platform for Kazakhstan', ru: 'AI-платформа для сельского хозяйства Казахстана', kk: 'Қазақстанның ауыл шаруашылығына арналған AI-платформасы' },
  
  // Common
  'common.loading': { en: 'Loading...', ru: 'Загрузка...', kk: 'Жүктелуде...' },
  'common.save': { en: 'Save', ru: 'Сохранить', kk: 'Сақтау' },
  'common.cancel': { en: 'Cancel', ru: 'Отмена', kk: 'Болдырмау' },
  'common.delete': { en: 'Delete', ru: 'Удалить', kk: 'Жою' },
  'common.edit': { en: 'Edit', ru: 'Редактировать', kk: 'Өңдеу' },
  'common.logout': { en: 'Logout', ru: 'Выйти', kk: 'Шығу' },
  'common.login': { en: 'Login', ru: 'Войти', kk: 'Кіру' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
