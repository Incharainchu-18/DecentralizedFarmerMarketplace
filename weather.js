const express = require("express");
const router = express.Router();
const axios = require("axios");

// API Keys
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

/* ==================================================
   GET CURRENT WEATHER
================================================== */
router.get("/current", async (req, res) => {
  try {
    const location = req.query.location || "Karwar, Karnataka";
    let weatherData = null;

    /* -------- OpenWeather API -------- */
    if (OPENWEATHER_API_KEY) {
      try {
        const response = await axios.get(
          "https://api.openweathermap.org/data/2.5/weather",
          {
            params: {
              q: location,
              appid: OPENWEATHER_API_KEY,
              units: "metric",
            },
          }
        );

        weatherData = {
          temperature: Math.round(response.data.main.temp),
          feelsLike: Math.round(response.data.main.feels_like),
          condition: response.data.weather[0].description,
          humidity: response.data.main.humidity,
          windSpeed: Math.round(response.data.wind.speed * 3.6),
          pressure: `${response.data.main.pressure} hPa`,
          visibility: `${(response.data.visibility / 1000).toFixed(1)} km`,
          sunrise: new Date(response.data.sys.sunrise * 1000).toLocaleTimeString(),
          sunset: new Date(response.data.sys.sunset * 1000).toLocaleTimeString(),
          rainfall: response.data.rain?.["1h"] || 0,
          uvIndex: Math.floor(Math.random() * 11),
          location: response.data.name,
        };
      } catch {
        console.warn("OpenWeather failed");
      }
    }

    /* -------- WeatherAPI fallback -------- */
    if (!weatherData && WEATHER_API_KEY) {
      try {
        const response = await axios.get(
          "http://api.weatherapi.com/v1/current.json",
          {
            params: {
              key: WEATHER_API_KEY,
              q: location,
            },
          }
        );

        weatherData = {
          temperature: response.data.current.temp_c,
          feelsLike: response.data.current.feelslike_c,
          condition: response.data.current.condition.text,
          humidity: response.data.current.humidity,
          windSpeed: response.data.current.wind_kph,
          pressure: `${response.data.current.pressure_mb} hPa`,
          visibility: `${response.data.current.vis_km} km`,
          rainfall: response.data.current.precip_mm,
          uvIndex: response.data.current.uv,
          location: response.data.location.name,
        };
      } catch {
        console.warn("WeatherAPI failed");
      }
    }

    /* -------- Mock fallback -------- */
    if (!weatherData) {
      const isCoastal = location.toLowerCase().includes("karwar");
      weatherData = generateMockWeatherData(isCoastal, location);
    }

    res.json({ success: true, data: weatherData });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch weather data",
    });
  }
});

/* ==================================================
   GET 5-DAY FORECAST
================================================== */
router.get("/forecast", async (req, res) => {
  try {
    const location = req.query.location || "Karwar, Karnataka";

    if (!OPENWEATHER_API_KEY) {
      return res.json({
        success: true,
        data: generateMockForecastData(location.includes("karwar")),
      });
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          q: location,
          appid: OPENWEATHER_API_KEY,
          units: "metric",
        },
      }
    );

    const daily = {};

    response.data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];
      if (!daily[date]) daily[date] = [];
      daily[date].push(item);
    });

    const forecast = Object.keys(daily).slice(0, 5).map(date => {
      const temps = daily[date].map(i => i.main.temp);
      return {
        date,
        maxTemp: Math.round(Math.max(...temps)),
        minTemp: Math.round(Math.min(...temps)),
        condition: mostFrequent(daily[date].map(i => i.weather[0].description)),
      };
    });

    res.json({ success: true, data: forecast });

  } catch {
    res.json({
      success: true,
      data: generateMockForecastData(true),
    });
  }
});

/* ==================================================
   HELPERS
================================================== */
function mostFrequent(arr) {
  const freq = {};
  arr.forEach(v => freq[v] = (freq[v] || 0) + 1);
  return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
}

function generateMockWeatherData(isCoastal, location) {
  return {
    temperature: isCoastal ? 27 : 30,
    feelsLike: isCoastal ? 29 : 33,
    condition: "Partly Cloudy",
    humidity: isCoastal ? 80 : 60,
    windSpeed: isCoastal ? 18 : 10,
    rainfall: isCoastal ? "12 mm" : "4 mm",
    uvIndex: 7,
    location,
  };
}

function generateMockForecastData(isCoastal) {
  const days = [];
  for (let i = 0; i < 5; i++) {
    days.push({
      date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
      maxTemp: isCoastal ? 28 : 32,
      minTemp: isCoastal ? 24 : 22,
      condition: "Cloudy",
    });
  }
  return days;
}

module.exports = router;
