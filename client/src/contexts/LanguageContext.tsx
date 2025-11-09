import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru' | 'kk' | 'zh';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
    kk: string;
    zh: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ru: 'Панель', kk: 'Панель', zh: '仪表板' },
  'nav.fields': { en: 'Fields', ru: 'Поля', kk: 'Алқаптар', zh: '田地' },
  'nav.livestock': { en: 'Livestock', ru: 'Скот', kk: 'Мал', zh: '畜牧' },
  'nav.weather': { en: 'Weather', ru: 'Погода', kk: 'Ауа райы', zh: '天气' },
  'nav.recommendations': { en: 'AI Recommendations', ru: 'AI Рекомендации', kk: 'AI Ұсыныстар', zh: 'AI建议' },
  'nav.simulation': { en: 'Health Simulation', ru: 'Симуляция', kk: 'Симуляция', zh: '健康模拟' },
  'nav.about': { en: 'About', ru: 'О приложении', kk: 'Қосымша туралы', zh: '关于' },
  
  // Dashboard
  'dashboard.title': { en: 'Agricultural Dashboard', ru: 'Аграрная панель', kk: 'Ауыл шаруашылығы панелі', zh: '农业仪表板' },
  'dashboard.totalFields': { en: 'Total Fields', ru: 'Всего полей', kk: 'Барлық алқаптар', zh: '总田地' },
  'dashboard.totalLivestock': { en: 'Total Livestock', ru: 'Всего скота', kk: 'Барлық мал', zh: '总牲畜' },
  'dashboard.avgYield': { en: 'Avg. Yield', ru: 'Сред. урожай', kk: 'Орт. өнім', zh: '平均产量' },
  'dashboard.healthScore': { en: 'Health Score', ru: 'Здоровье', kk: 'Денсаулық', zh: '健康评分' },
  
  // Fields
  'fields.title': { en: 'Field Management', ru: 'Управление полями', kk: 'Алқаптарды басқару', zh: '田地管理' },
  'fields.addNew': { en: 'Add New Field', ru: 'Добавить поле', kk: 'Жаңа алқап қосу', zh: '添加新田地' },
  'fields.area': { en: 'Area', ru: 'Площадь', kk: 'Аумақ', zh: '面积' },
  'fields.crop': { en: 'Crop', ru: 'Культура', kk: 'Дақыл', zh: '作物' },
  'fields.hectares': { en: 'ha', ru: 'га', kk: 'га', zh: '公顷' },
  
  // Livestock
  'livestock.title': { en: 'Livestock Management', ru: 'Управление скотом', kk: 'Малды басқару', zh: '牲畜管理' },
  'livestock.addNew': { en: 'Add Livestock', ru: 'Добавить скот', kk: 'Мал қосу', zh: '添加牲畜' },
  'livestock.count': { en: 'Count', ru: 'Количество', kk: 'Саны', zh: '数量' },
  'livestock.type': { en: 'Type', ru: 'Тип', kk: 'Түрі', zh: '类型' },
  'livestock.cattle': { en: 'Cattle', ru: 'Коровы', kk: 'Сиырлар', zh: '牛' },
  'livestock.sheep': { en: 'Sheep', ru: 'Овцы', kk: 'Қойлар', zh: '羊' },
  'livestock.horses': { en: 'Horses', ru: 'Лошади', kk: 'Жылқылар', zh: '马' },
  
  // Weather
  'weather.title': { en: 'Weather Forecast', ru: 'Прогноз погоды', kk: 'Ауа райы болжамы', zh: '天气预报' },
  'weather.current': { en: 'Current Weather', ru: 'Текущая погода', kk: 'Ағымдағы ауа райы', zh: '当前天气' },
  'weather.humidity': { en: 'Humidity', ru: 'Влажность', kk: 'Ылғалдылық', zh: '湿度' },
  'weather.wind': { en: 'Wind', ru: 'Ветер', kk: 'Жел', zh: '风' },
  
  // AI Recommendations
  'ai.title': { en: 'AI Recommendations', ru: 'AI Рекомендации', kk: 'AI Ұсыныстар', zh: 'AI建议' },
  'ai.analyzing': { en: 'Analyzing your farm data...', ru: 'Анализ данных фермы...', kk: 'Ферма деректерін талдау...', zh: '分析农场数据...' },
  'ai.fertilizers': { en: 'Fertilizer Recommendations', ru: 'Рекомендации по удобрениям', kk: 'Тыңайтқыш ұсыныстары', zh: '肥料建议' },
  'ai.feeds': { en: 'Feed Recommendations', ru: 'Рекомендации по кормам', kk: 'Жем ұсыныстары', zh: '饲料建议' },
  
  // Simulation
  'simulation.title': { en: 'Livestock Health Simulation', ru: 'Симуляция здоровья скота', kk: 'Мал денсаулығын симуляциялау', zh: '牲畜健康模拟' },
  'simulation.healthy': { en: 'Healthy', ru: 'Здоров', kk: 'Сау', zh: '健康' },
  'simulation.attention': { en: 'Needs Attention', ru: 'Требует внимания', kk: 'Назар аудару қажет', zh: '需要注意' },
  'simulation.critical': { en: 'Critical', ru: 'Критическое', kk: 'Сыни', zh: '危急' },
  
  // About
  'about.title': { en: 'About AgriAI', ru: 'О AgriAI', kk: 'AgriAI туралы', zh: '关于AgriAI' },
  'about.description': { en: 'AI-powered agricultural platform for Kazakhstan', ru: 'AI-платформа для сельского хозяйства Казахстана', kk: 'Қазақстанның ауыл шаруашылығына арналған AI-платформасы', zh: '哈萨克斯坦人工智能农业平台' },
  
  // Common
  'common.loading': { en: 'Loading...', ru: 'Загрузка...', kk: 'Жүктелуде...', zh: '加载中...' },
  'common.save': { en: 'Save', ru: 'Сохранить', kk: 'Сақтау', zh: '保存' },
  'common.cancel': { en: 'Cancel', ru: 'Отмена', kk: 'Болдырмау', zh: '取消' },
  'common.delete': { en: 'Delete', ru: 'Удалить', kk: 'Жою', zh: '删除' },
  'common.edit': { en: 'Edit', ru: 'Редактировать', kk: 'Өңдеу', zh: '编辑' },
  'common.logout': { en: 'Logout', ru: 'Выйти', kk: 'Шығу', zh: '登出' },
  'common.login': { en: 'Login', ru: 'Войти', kk: 'Кіру', zh: '登录' },
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
