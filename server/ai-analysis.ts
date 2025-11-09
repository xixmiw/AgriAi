import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FieldAnalysis {
  summary: string;
  recommendations: string[];
  yieldOptimization: string[];
  risks: string[];
  timeline: string;
}

export interface LivestockFeedingPlan {
  summary: string;
  dailyFeed: {
    ingredient: string;
    percentage: number;
    amountPerAnimal: string;
    totalAmount: string;
  }[];
  feedingSchedule: string[];
  nutritionTips: string[];
}

export async function analyzeField(field: {
  name: string;
  cropType: string;
  area: number;
  latitude: number;
  longitude: number;
}): Promise<FieldAnalysis> {
  try {
    const prompt = `Проанализируй поле для сельского хозяйства и дай КОНКРЕТНЫЙ план действий:

Поле: ${field.name}
Культура: ${field.cropType}
Площадь: ${field.area} га
Координаты: ${field.latitude}, ${field.longitude}

Дай краткий и структурированный ответ в формате:
1. Краткая общая оценка (1-2 предложения)
2. 3-5 конкретных рекомендаций для повышения урожайности
3. 2-3 основных риска
4. Примерный график действий на сезон

Отвечай КРАТКО, без лишних объяснений. Каждый пункт - максимум 1 предложение.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    
    const lines = text.split('\n').filter(l => l.trim());
    
    return {
      summary: lines[0] || "Анализ выполнен",
      recommendations: lines.slice(1, 6).filter(l => l.includes('рекомендац') || l.match(/^\d+\./)),
      yieldOptimization: lines.slice(1, 4).filter(l => l.includes('урожай') || l.includes('внос')),
      risks: lines.filter(l => l.includes('риск') || l.includes('опасн')).slice(0, 3),
      timeline: lines.find(l => l.includes('график') || l.includes('сезон')) || "Составьте график работ",
    };
  } catch (error) {
    console.error("Ошибка анализа поля:", error);
    return {
      summary: "Поле создано успешно",
      recommendations: ["Проведите анализ почвы", "Планируйте севооборот", "Учитывайте погодные условия"],
      yieldOptimization: ["Оптимизируйте внесение удобрений", "Контролируйте влажность почвы"],
      risks: ["Следите за погодными условиями"],
      timeline: "Составьте детальный график на сезон",
    };
  }
}

export async function generateFeedingPlan(livestock: {
  type: string;
  count: number;
}): Promise<LivestockFeedingPlan> {
  try {
    const prompt = `Составь КРАТКИЙ план кормления для ${livestock.count} голов ${livestock.type}.

Дай структурированный ответ:
1. Состав корма (5-7 ингредиентов с процентами, сумма должна быть 100%)
2. Количество корма на 1 животное в день
3. 3-4 правила кормления
4. 2-3 совета по питанию

Отвечай КРАТКО, без лишних объяснений. Формат процентов: "Пшеница: 30%, Ячмень: 25%" и т.д.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    
    const percentageMatches = text.match(/(\w+[а-яА-Я\s]+):\s*(\d+)%/g) || [];
    const dailyFeed = percentageMatches.slice(0, 7).map(match => {
      const [ingredient, percentStr] = match.split(':');
      const percentage = parseInt(percentStr);
      const perAnimal = Math.round(percentage * 0.15 * 10) / 10;
      const total = Math.round(perAnimal * livestock.count * 10) / 10;
      return {
        ingredient: ingredient.trim(),
        percentage: percentage || 0,
        amountPerAnimal: `${perAnimal} кг/день`,
        totalAmount: `${total} кг/день (всего для ${livestock.count} голов)`,
      };
    });

    if (dailyFeed.length === 0) {
      const defaultFeeds = [
        { ingredient: "Пшеница", percentage: 30, base: 4.5 },
        { ingredient: "Ячмень", percentage: 25, base: 3.8 },
        { ingredient: "Кукуруза", percentage: 20, base: 3.0 },
        { ingredient: "Сено", percentage: 15, base: 2.3 },
        { ingredient: "Витамины", percentage: 10, base: 1.5 }
      ];
      
      dailyFeed.push(...defaultFeeds.map(f => ({
        ingredient: f.ingredient,
        percentage: f.percentage,
        amountPerAnimal: `${f.base} кг/день`,
        totalAmount: `${Math.round(f.base * livestock.count * 10) / 10} кг/день (всего для ${livestock.count} голов)`,
      })));
    }

    const lines = text.split('\n').filter(l => l.trim() && !l.match(/^\d+%/) && !l.includes(':') || l.includes('раз'));
    
    return {
      summary: `План кормления для ${livestock.count} ${livestock.type}`,
      dailyFeed,
      feedingSchedule: lines.filter(l => l.includes('раз') || l.includes('корм')).slice(0, 4) || [
        "Кормить 2 раза в день",
        "Утром в 6:00 и вечером в 18:00",
        "Обеспечить постоянный доступ к воде",
      ],
      nutritionTips: lines.filter(l => !l.includes('раз') && l.length > 10).slice(0, 3) || [
        "Следите за качеством кормов",
        "Адаптируйте рацион по сезону",
      ],
    };
  } catch (error) {
    console.error("Ошибка создания плана кормления:", error);
    const defaultFeeds = [
      { ingredient: "Пшеница", percentage: 30, base: 4.5 },
      { ingredient: "Ячмень", percentage: 25, base: 3.8 },
      { ingredient: "Кукуруза", percentage: 20, base: 3.0 },
      { ingredient: "Сено", percentage: 15, base: 2.3 },
      { ingredient: "Витамины", percentage: 10, base: 1.5 }
    ];
    
    return {
      summary: `План кормления для ${livestock.count} ${livestock.type}`,
      dailyFeed: defaultFeeds.map(f => ({
        ingredient: f.ingredient,
        percentage: f.percentage,
        amountPerAnimal: `${f.base} кг/день`,
        totalAmount: `${Math.round(f.base * livestock.count * 10) / 10} кг/день (всего для ${livestock.count} голов)`,
      })),
      feedingSchedule: [
        "Кормить 2 раза в день: утром и вечером",
        "Обеспечить постоянный доступ к воде",
        "Регулярно проверять состояние животных",
      ],
      nutritionTips: [
        "Следите за качеством и свежестью кормов",
        "Адаптируйте рацион в зависимости от сезона и продуктивности",
      ],
    };
  }
}

export async function getFieldRecommendations(field: {
  name: string;
  cropType: string;
  area: number;
}, category: "fertilizer" | "soil" | "pesticides"): Promise<{
  title: string;
  recommendations: string[];
}> {
  const categoryNames = {
    fertilizer: "Удобрения",
    soil: "Почва",
    pesticides: "Пестициды и защита",
  };

  try {
    const prompt = `Дай КРАТКИЕ рекомендации по категории "${categoryNames[category]}" для поля:
Культура: ${field.cropType}
Площадь: ${field.area} га

Дай 4-5 конкретных пунктов. Каждый пункт - 1 короткое предложение.
Без длинных объяснений, только суть.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    const lines = text.split('\n')
      .filter(l => l.trim() && (l.match(/^\d+\./) || l.match(/^[-•]/)))
      .map(l => l.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, ''))
      .slice(0, 5);

    return {
      title: categoryNames[category],
      recommendations: lines.length > 0 ? lines : [
        "Проведите анализ перед применением",
        "Следуйте рекомендованным дозировкам",
        "Учитывайте погодные условия",
      ],
    };
  } catch (error) {
    console.error("Ошибка получения рекомендаций:", error);
    return {
      title: categoryNames[category],
      recommendations: [
        "Проведите профессиональный анализ",
        "Следуйте агрономическим рекомендациям",
        "Учитывайте местные условия",
      ],
    };
  }
}
