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

ОБЯЗАТЕЛЬНО верни ответ ТОЛЬКО в формате JSON (без дополнительного текста):
{
  "summary": "Краткая сводка плана кормления",
  "dailyFeed": [
    {
      "ingredient": "название корма",
      "perAnimalKg": число_кг_на_1_голову_в_день,
      "percentage": процент_в_рационе,
      "costPerKg": цена_за_кг_в_тенге_или_null
    }
  ],
  "feedingSchedule": ["правило 1", "правило 2", "правило 3"],
  "nutritionTips": ["совет 1", "совет 2"],
  "costSavings": ["экономия 1 с ценами в ₸", "экономия 2"]
}

ВАЖНО:
- Укажи РЕАЛЬНЫЕ количества для типа животного "${livestock.type}"
- perAnimalKg должен быть конкретным числом (например: 4.5, 3.2, 1.8)
- Общее количество корма = perAnimalKg * ${livestock.count}
- НЕ используй проценты для количества, только для состава рациона
- Цены в тенге (₸), местные казахстанские корма
- 5-7 ингредиентов в рационе`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedData: any = null;
    
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing JSON from AI:", e);
      }
    }
    
    // Build dailyFeed from parsed data or use defaults
    let dailyFeed: { ingredient: string; percentage: number; amountPerAnimal: string; totalAmount: string; }[] = [];
    
    if (parsedData && parsedData.dailyFeed && Array.isArray(parsedData.dailyFeed)) {
      dailyFeed = parsedData.dailyFeed.map((feed: any) => {
        const perAnimal = Number(feed.perAnimalKg) || 0;
        const total = Math.round(perAnimal * livestock.count * 10) / 10;
        return {
          ingredient: feed.ingredient || "Неизвестно",
          percentage: Number(feed.percentage) || 0,
          amountPerAnimal: `${perAnimal} кг/день`,
          totalAmount: `${total} кг/день (всего для ${livestock.count} голов)`,
        };
      });
    }
    
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

    // Extract other fields from parsed JSON or use defaults
    const feedingSchedule = (parsedData && Array.isArray(parsedData.feedingSchedule)) 
      ? parsedData.feedingSchedule 
      : [
          "Кормить 2 раза в день",
          "Утром в 6:00 и вечером в 18:00",
          "Обеспечить постоянный доступ к воде",
        ];
    
    const nutritionTips = (parsedData && Array.isArray(parsedData.nutritionTips))
      ? parsedData.nutritionTips
      : [
          "Следите за качеством кормов",
          "Адаптируйте рацион по сезону",
        ];
    
    const costSavings = (parsedData && Array.isArray(parsedData.costSavings))
      ? parsedData.costSavings
      : [
          "Используйте местные корма - дешевле импортных на 30-40%",
          "Покупайте оптом для экономии 15-20%",
        ];
    
    return {
      summary: parsedData?.summary || `План кормления для ${livestock.count} ${livestock.type}`,
      dailyFeed,
      feedingSchedule,
      nutritionTips,
      costSavings,
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

export interface FeedAnalysis {
  summary: string;
  nutritionBalance: string[];
  costOptimization: string[];
  warnings: string[];
  suggestions: string[];
}

export async function analyzeFeedingData(livestock: {
  type: string;
  count: number;
}, feeds: Array<{ name: string; quantity: string; unit: string; pricePerUnit?: string }>): Promise<FeedAnalysis> {
  if (feeds.length === 0) {
    return {
      summary: "Добавьте корма для анализа",
      nutritionBalance: ["Введите данные о кормах для получения анализа"],
      costOptimization: [],
      warnings: ["Корма не добавлены! Добавьте корма для животных"],
      suggestions: ["Начните с добавления основных кормов: пшеница, ячмень, сено"],
    };
  }

  try {
    const feedList = feeds.map(f => `${f.name}: ${f.quantity} ${f.unit}${f.pricePerUnit ? ` по ${f.pricePerUnit}₸/${f.unit}` : ''}`).join('\n');
    
    const prompt = `Ты опытный казахстанский ветеринар-зоотехник. ПРОАНАЛИЗИРУЙ текущий рацион кормления и дай ПРАКТИЧНЫЕ советы.

Животные: ${livestock.count} голов ${livestock.type}

ТЕКУЩИЕ КОРМА (введены пользователем):
${feedList}

Дай АНАЛИЗ в формате (КРАТКО, по пунктам):
1. ОЦЕНКА БАЛАНСА: достаточно ли белка, энергии, витаминов? (2-3 пункта)
2. ЭКОНОМИЯ: как снизить затраты без потери качества? (2-3 конкретных совета с ценами в ₸)
3. ПРЕДУПРЕЖДЕНИЯ: что не так или чего не хватает? (1-2 критичных момента)
4. РЕКОМЕНДАЦИИ: что добавить или изменить? (2-3 практичных совета)

Каждый пункт - ОДНО короткое предложение с цифрами.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    const lines = text.split('\n').filter(l => l.trim());

    return {
      summary: `Анализ кормления для ${livestock.count} ${livestock.type}`,
      nutritionBalance: lines.filter(l => l.includes('баланс') || l.includes('белок') || l.includes('энерг') || l.includes('витамин')).slice(0, 3),
      costOptimization: lines.filter(l => l.includes('эконом') || l.includes('затрат') || l.includes('дешевле') || l.includes('₸')).slice(0, 3),
      warnings: lines.filter(l => l.includes('предупр') || l.includes('не хватает') || l.includes('недостат') || l.includes('опасн')).slice(0, 2),
      suggestions: lines.filter(l => l.includes('рекоменд') || l.includes('добавить') || l.includes('изменить') || l.includes('совет')).slice(0, 3),
    };
  } catch (error) {
    console.error("Ошибка анализа кормов:", error);
    return {
      summary: `Корма добавлены для ${livestock.count} ${livestock.type}`,
      nutritionBalance: ["Проверьте баланс белков и углеводов"],
      costOptimization: ["Используйте местные корма для экономии"],
      warnings: [],
      suggestions: ["Обратитесь к ветеринару для детальной консультации"],
    };
  }
}

export interface FertilizerAnalysis {
  summary: string;
  effectiveness: string[];
  costOptimization: string[];
  warnings: string[];
  suggestions: string[];
}

export async function analyzeFertilizerData(field: {
  name: string;
  cropType: string;
  area: number;
}, fertilizers: Array<{ name: string; quantity: string; unit: string; pricePerUnit?: string; applicationDate?: string }>): Promise<FertilizerAnalysis> {
  if (fertilizers.length === 0) {
    return {
      summary: "Добавьте удобрения для анализа",
      effectiveness: ["Введите данные об удобрениях для получения анализа"],
      costOptimization: [],
      warnings: ["Удобрения не добавлены! Добавьте удобрения для поля"],
      suggestions: ["Начните с добавления основных удобрений: азот, фосфор, калий"],
    };
  }

  try {
    const fertilizerList = fertilizers.map(f => 
      `${f.name}: ${f.quantity} ${f.unit}${f.pricePerUnit ? ` по ${f.pricePerUnit}₸/${f.unit}` : ''}${f.applicationDate ? `, внесение: ${new Date(f.applicationDate).toLocaleDateString('ru-RU')}` : ''}`
    ).join('\n');
    
    const prompt = `Ты опытный казахстанский агроном. ПРОАНАЛИЗИРУЙ план внесения удобрений и дай ПРАКТИЧНЫЕ советы.

Поле: ${field.name}
Культура: ${field.cropType}
Площадь: ${field.area} га

ТЕКУЩИЕ УДОБРЕНИЯ (введены пользователем):
${fertilizerList}

ВАЖНО: Учитывай площадь поля (${field.area} га) при оценке количества удобрений.
Норма внесения должна быть в кг/га, а общее количество = норма × ${field.area} га

ОБЯЗАТЕЛЬНО верни ответ ТОЛЬКО в формате JSON (без дополнительного текста):
{
  "summary": "Краткая оценка плана внесения удобрений",
  "effectiveness": ["оценка 1 с цифрами", "оценка 2"],
  "costOptimization": ["совет по экономии с ценами в ₸/га", "совет 2"],
  "warnings": ["предупреждение 1", "предупреждение 2"],
  "suggestions": ["рекомендация 1 с количеством кг/га", "рекомендация 2"]
}

Каждый пункт - ОДНО короткое предложение с цифрами и ценами в ₸.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedData: any = null;
    
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing JSON from AI:", e);
      }
    }

    return {
      summary: parsedData?.summary || `Анализ удобрений для поля ${field.name}`,
      effectiveness: (parsedData?.effectiveness && Array.isArray(parsedData.effectiveness)) 
        ? parsedData.effectiveness 
        : ["Проверьте соответствие нормам внесения"],
      costOptimization: (parsedData?.costOptimization && Array.isArray(parsedData.costOptimization))
        ? parsedData.costOptimization
        : ["Используйте местные удобрения для экономии"],
      warnings: (parsedData?.warnings && Array.isArray(parsedData.warnings))
        ? parsedData.warnings
        : [],
      suggestions: (parsedData?.suggestions && Array.isArray(parsedData.suggestions))
        ? parsedData.suggestions
        : ["Проведите анализ почвы перед внесением удобрений"],
    };
  } catch (error) {
    console.error("Ошибка анализа удобрений:", error);
    return {
      summary: `Удобрения добавлены для поля ${field.name}`,
      effectiveness: ["Проверьте соответствие нормам внесения"],
      costOptimization: ["Используйте местные удобрения для экономии"],
      warnings: [],
      suggestions: ["Проведите анализ почвы перед внесением удобрений"],
    };
  }
}
