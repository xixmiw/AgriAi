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
    cost?: string;
  }[];
  feedingSchedule: string[];
  nutritionTips: string[];
  costSavings: string[];
}

export async function analyzeField(field: {
  name: string;
  cropType: string;
  area: number;
  latitude: number;
  longitude: number;
}): Promise<FieldAnalysis> {
  try {
    const prompt = `Ты опытный казахстанский агроном. Дай ПРАКТИЧНЫЕ, ЭКОНОМНЫЕ рекомендации с РЕАЛЬНЫМИ ценами в тенге (₸).

Поле: ${field.name}
Культура: ${field.cropType}
Площадь: ${field.area} га
Координаты: ${field.latitude}, ${field.longitude} (Казахстан)

ОБЯЗАТЕЛЬНО для каждой рекомендации указывай:
- Стоимость в ₸/га и общие затраты
- Ожидаемый прирост урожая в тоннах
- ROI (возврат инвестиций) в процентах
- Дешевую альтернативу (если есть)

Формат ответа (КРАТКО, по пунктам):
1. Прогноз урожайности: X тонн/га, потенциал: Y тонн/га (+Z%)
2. 3-5 КОНКРЕТНЫХ действий с ценами:
   "Внести азот 60 кг/га в марте-апреле → стоимость 8,000₸/га (всего ${Math.round(field.area * 8000).toLocaleString()}₸) → +20% урожая (+0.5 т/га) → прибыль +50,000₸/га. АЛЬТЕРНАТИВА: Местная аммиачная селитра 5,500₸/га (-30% цена)"
3. 2-3 риска с потерями: "Град в июне → минус 30% урожая (потеря 200,000₸)"
4. График: "Март: посев. Апрель: азот. Май: гербициды. Июль: полив. Сентябрь: уборка"

ВАЖНО: ВСЕ цифры и цены ОБЯЗАТЕЛЬНЫ! Каждый пункт - ОДНО предложение.`;

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
    const prompt = `Ты опытный казахстанский ветеринар-зоотехник. Составь ЭКОНОМНЫЙ и ЭФФЕКТИВНЫЙ план кормления.

Животные: ${livestock.count} голов ${livestock.type}

ЦЕЛЬ: Максимальная продуктивность при минимальных затратах.
Укажи ТОЧНЫЕ цифры и ДЕШЕВЫЕ альтернативы дорогим кормам.

Формат ответа (КРАТКО):
1. СОСТАВ КОРМА (5-7 ингредиентов, ТОЧНЫЕ проценты, сумма = 100%):
   Формат: "Пшеница: 30%, Ячмень: 25%..." и т.д.
2. КОЛИЧЕСТВО: сколько кг на 1 животное в день (ТОЧНАЯ цифра)
3. ГРАФИК КОРМЛЕНИЯ (3-4 правила: когда, сколько раз, как)
4. ЭКОНОМИЯ (2-3 совета по замене дорогих кормов дешевыми аналогами)

Пример: "Замените импортный протеин (150₸/кг) на местный ячмень (40₸/кг) → экономия 30%"
Каждый пункт - ОДНО предложение с цифрами и ценами в тенге.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    
    const percentageMatches = text.match(/([А-Яа-яA-Za-z\s]+?):\s*(\d+)%/g) || [];
    const dailyFeed = percentageMatches.slice(0, 7).map(match => {
      const parts = match.split(':');
      if (parts.length < 2) return null;
      const ingredient = parts[0].trim();
      const percentStr = parts[1].trim();
      const percentage = parseInt(percentStr);
      const perAnimal = Math.round(percentage * 0.15 * 10) / 10;
      const total = Math.round(perAnimal * livestock.count * 10) / 10;
      return {
        ingredient: ingredient,
        percentage: percentage || 0,
        amountPerAnimal: `${perAnimal} кг/день`,
        totalAmount: `${total} кг/день (всего для ${livestock.count} голов)`,
      };
    }).filter(Boolean) as { ingredient: string; percentage: number; amountPerAnimal: string; totalAmount: string; }[];

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

    // Normalize lines: trim and prepare for case-insensitive matching
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5);
    
    // FIRST: Extract cost-saving lines (highest priority) - case-insensitive
    const costSavings = lines.filter(l => {
      const lower = l.toLowerCase();
      const hasCostKeyword = lower.includes('₸') || lower.includes('тенге') || 
        lower.includes('экономи') || lower.includes('замен') || 
        lower.includes('дешев') || lower.includes('альтернатив') ||
        lower.includes('roi') || lower.includes('рентабельн') ||
        lower.includes('выгод') || lower.includes('сберег');
      const isNotPercentage = !l.match(/^\d+%/);
      return hasCostKeyword && isNotPercentage;
    }).slice(0, 5);
    
    // SECOND: Extract feeding schedule (only from lines NOT in costSavings)
    const costSavingsSet = new Set(costSavings);
    const remainingLines = lines.filter(l => !costSavingsSet.has(l));
    
    const feedingSchedule = remainingLines.filter(l => {
      const lower = l.toLowerCase();
      const hasScheduleKeyword = lower.includes('раз') || lower.includes('график') || 
        lower.includes('время') || (lower.includes('корм') && !l.match(/^\d+%/));
      const noCost = !lower.includes('₸') && !lower.includes('тенге');
      return hasScheduleKeyword && noCost;
    }).slice(0, 4);
    
    // THIRD: Extract nutrition tips (only from remaining lines)
    const scheduleSet = new Set(feedingSchedule);
    const nutritionTips = remainingLines.filter(l => {
      const lower = l.toLowerCase();
      return !scheduleSet.has(l) &&
        !l.match(/^\d+%/) &&
        l.length > 15 &&
        !lower.includes('₸') && !lower.includes('тенге');
    }).slice(0, 3);
    
    return {
      summary: `План кормления для ${livestock.count} ${livestock.type}`,
      dailyFeed,
      feedingSchedule: feedingSchedule.length > 0 ? feedingSchedule : [
        "Кормить 2 раза в день",
        "Утром в 6:00 и вечером в 18:00",
        "Обеспечить постоянный доступ к воде",
      ],
      nutritionTips: nutritionTips.length > 0 ? nutritionTips : [
        "Следите за качеством кормов",
        "Адаптируйте рацион по сезону",
      ],
      costSavings: costSavings.length > 0 ? costSavings : [
        "Используйте местные корма - дешевле импортных на 30-40%",
        "Покупайте оптом для экономии 15-20%",
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
      costSavings: [
        "Используйте местные корма - дешевле импортных на 30-40%",
        "Покупайте оптом для экономии 15-20%",
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
