export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
  location: string;
}

export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY не настроен");
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ru`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OpenWeather API вернул ошибку: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name || "Неизвестная локация",
    };
  } catch (error) {
    console.error("Ошибка при получении погоды:", error);
    throw new Error(`Не удалось получить данные о погоде: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
}
