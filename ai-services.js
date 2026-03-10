// backend/services/aiServices.js
const axios = require("axios");

// Gemini AI – safe initialization
let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (err) {
  console.warn("⚠ Gemini AI not configured, fallback advice will be used");
}

class AIServices {

  /* =========================
     1. REAL WEATHER DATA
  ========================= */
  static async getRealWeatherData(latitude, longitude) {
    try {
      if (!process.env.OPENWEATHER_API_KEY) {
        throw new Error("OpenWeather API key missing");
      }

      const currentRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: process.env.OPENWEATHER_API_KEY,
            units: "metric",
          },
          timeout: 8000,
        }
      );

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: process.env.OPENWEATHER_API_KEY,
            units: "metric",
          },
          timeout: 8000,
        }
      );

      return this.processOpenWeatherData(
        currentRes.data,
        forecastRes.data
      );

    } catch (error) {
      console.error("Weather API failed:", error.message);
      return this.getMockWeatherData();
    }
  }

  static processOpenWeatherData(currentData, forecastData) {
    const current = {
      temperature: Math.round(currentData.main.temp),
      condition: currentData.weather[0].description,
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6),
      rainfall: currentData.rain ? `${currentData.rain["1h"] || 0} mm` : "0 mm",
      pressure: `${currentData.main.pressure} hPa`,
      visibility: `${(currentData.visibility / 1000).toFixed(1)} km`,
    };

    const forecast = [];
    for (let i = 0; i < 5; i++) {
      const item = forecastData.list[i * 8];
      forecast.push({
        day: ["Today", "Tomorrow", "Wed", "Thu", "Fri"][i],
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: item.weather[0].description,
        rainChance: item.pop ? Math.round(item.pop * 100) : 0,
        humidity: item.main.humidity,
      });
    }

    return { current, forecast };
  }

  static getMockWeatherData() {
    return {
      current: {
        temperature: 27,
        condition: "Partly Cloudy",
        humidity: 78,
        windSpeed: 16,
        rainfall: "12 mm",
        pressure: "1009 hPa",
        visibility: "9 km",
      },
      forecast: [
        { day: "Today", high: 29, low: 24, condition: "Cloudy", rainChance: 40 },
        { day: "Tomorrow", high: 28, low: 23, condition: "Light Rain", rainChance: 65 },
        { day: "Wed", high: 27, low: 23, condition: "Rain", rainChance: 80 },
        { day: "Thu", high: 28, low: 24, condition: "Cloudy", rainChance: 50 },
        { day: "Fri", high: 29, low: 24, condition: "Sunny", rainChance: 20 },
      ],
    };
  }

  /* =========================
     2. AI FARMING ADVICE
  ========================= */
  static async getAIAdvice(question, context = {}) {
    try {
      if (!genAI) {
        return this.getFallbackAdvice(question, context);
      }

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
You are an agricultural expert for Indian farmers.

Context:
${JSON.stringify(context, null, 2)}

Question:
${question}

Give clear, simple and practical advice in bullet points.
`;

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout")), 8000)
        ),
      ]);

      return result.response.text();

    } catch (error) {
      console.error("Gemini AI error:", error.message);
      return this.getFallbackAdvice(question, context);
    }
  }

  static getFallbackAdvice(question, context) {
    const q = question.toLowerCase();

    if (q.includes("fertilizer")) {
      return `Use balanced NPK fertilizer. Apply urea in split doses and avoid overuse.`;
    }

    if (q.includes("pest")) {
      return `Use neem-based pesticides first. Monitor crops weekly for pest symptoms.`;
    }

    if (q.includes("water") || q.includes("irrigation")) {
      return `Irrigate crops early morning or evening. Avoid water stagnation.`;
    }

    return `Consult the nearest Krishi Vigyan Kendra for location-specific advice.`;
  }

  /* =========================
     3. LIVE MARKET PRICES
  ========================= */
  static async getLiveMarketPrices(commodity = "") {
    try {
      const response = await axios.get(
        "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
        {
          params: {
            "api-key": process.env.AGMARKNET_API_KEY,
            format: "json",
            limit: 20,
            "filters[commodity]": commodity,
          },
          timeout: 10000,
        }
      );

      if (response.data?.records) {
        return response.data.records.map(r => ({
          commodity: r.commodity,
          market: r.market,
          state: r.state,
          price: `₹${r.modal_price}/quintal`,
          date: r.arrival_date,
        }));
      }

      return this.getMockMarketData(commodity);

    } catch (error) {
      console.error("Market API failed:", error.message);
      return this.getMockMarketData(commodity);
    }
  }

  static getMockMarketData(commodity) {
    return Array.from({ length: 5 }, (_, i) => ({
      commodity: commodity || "Wheat",
      market: `Market ${i + 1}`,
      state: ["Karnataka", "Punjab", "Maharashtra"][i % 3],
      price: `₹${2200 + Math.floor(Math.random() * 300)}/quintal`,
      date: new Date().toISOString().split("T")[0],
      note: "Mock data",
    }));
  }
}

module.exports = AIServices;
