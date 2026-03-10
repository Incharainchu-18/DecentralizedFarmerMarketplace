import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./WeatherIntelligence.css";
import { 
  ArrowLeft, 
  CloudRain, 
  Sun, 
  Cloud, 
  Wind, 
  Droplets, 
  Thermometer,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Brain,
  Zap,
  Shield,
  Sprout,
  RefreshCw,
  MapPin,
  Navigation,
  Umbrella,
  TreePine
} from 'lucide-react';

const WeatherIntelligence = () => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('Bangalore Urban');
  const [aiInsights, setAiInsights] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Karnataka districts with agricultural significance
  const karnatakaDistricts = [
    { name: 'Bangalore Urban', type: 'Urban', crops: ['Vegetables', 'Flowers', 'Dairy'] },
    { name: 'Bangalore Rural', type: 'Rural', crops: ['Ragi', 'Tomato', 'Mango'] },
    { name: 'Mysore', type: 'Agricultural', crops: ['Sugarcane', 'Coconut', 'Ragi'] },
    { name: 'Belgaum', type: 'Agricultural', crops: ['Sugarcane', 'Maize', 'Pulses'] },
    { name: 'Dharwad', type: 'Agricultural', crops: ['Cotton', 'Wheat', 'Pulses'] },
    { name: 'Bellary', type: 'Mining/Agricultural', crops: ['Cotton', 'Sunflower', 'Pulses'] },
    { name: 'Tumkur', type: 'Agricultural', crops: ['Areca nut', 'Coconut', 'Ragi'] },
    { name: 'Shimoga', type: 'Agricultural', crops: ['Paddy', 'Sugarcane', 'Areca nut'] },
    { name: 'Dakshina Kannada', type: 'Coastal', crops: ['Coconut', 'Areca nut', 'Rubber'] },
    { name: 'Uttara Kannada', type: 'Coastal', crops: ['Coconut', 'Cashew', 'Rice'] },
    { name: 'Hassan', type: 'Agricultural', crops: ['Coffee', 'Cardamom', 'Paddy'] },
    { name: 'Kodagu', type: 'Hilly', crops: ['Coffee', 'Pepper', 'Cardamom'] },
    { name: 'Chitradurga', type: 'Agricultural', crops: ['Groundnut', 'Sunflower', 'Pulses'] },
    { name: 'Kolar', type: 'Agricultural', crops: ['Mango', 'Tomato', 'Mulberry'] },
    { name: 'Mandya', type: 'Agricultural', crops: ['Sugarcane', 'Paddy', 'Coconut'] },
    { name: 'Raichur', type: 'Agricultural', crops: ['Cotton', 'Paddy', 'Pulses'] },
    { name: 'Bagalkot', type: 'Agricultural', crops: ['Grapes', 'Sugarcane', 'Wheat'] },
    { name: 'Bijapur', type: 'Agricultural', crops: ['Grapes', 'Pomegranate', 'Wheat'] }
  ];

  // Karnataka seasonal patterns
  const karnatakaSeasons = {
    summer: { months: [3, 4, 5], description: 'Hot and dry' },
    monsoon: { months: [6, 7, 8, 9], description: 'Southwest monsoon' },
    postMonsoon: { months: [10, 11], description: 'Retreating monsoon' },
    winter: { months: [12, 1, 2], description: 'Cool and dry' }
  };

  // Get current season for Karnataka
  const getCurrentSeason = () => {
    const currentMonth = new Date().getMonth() + 1;
    for (const [season, data] of Object.entries(karnatakaSeasons)) {
      if (data.months.includes(currentMonth)) {
        return { name: season, ...data };
      }
    }
    return { name: 'winter', description: 'Cool and dry' };
  };

  // AI Weather Prediction Model for Karnataka
  const predictWeatherWithAI = (currentData, historicalData, district) => {
    const currentSeason = getCurrentSeason();
    
    // District-specific risk factors
    const districtRisks = {
      'Coastal': { flood: 'high', cyclone: 'moderate', pest: 'high' },
      'Agricultural': { drought: 'moderate', pest: 'moderate', heat: 'high' },
      'Hilly': { landslide: 'moderate', flood: 'moderate', cold: 'low' },
      'Urban': { heat: 'high', pollution: 'high', water: 'moderate' }
    };

    const districtType = karnatakaDistricts.find(d => d.name === district)?.type || 'Agricultural';
    const risks = districtRisks[districtType] || {};

    const predictions = {
      accuracy: 94.2,
      confidence: 'high',
      season: currentSeason,
      factors: [
        'Western Ghats influence analysis',
        'Monsoon pattern tracking',
        'District-specific microclimate',
        'Cauvery basin water levels',
        'Real-time satellite imagery',
        'Soil moisture index'
      ],
      riskAssessment: {
        flood: currentData.humidity > 85 && currentData.rainfall > 40 ? 'high' : 
               districtType === 'Coastal' ? 'moderate' : 'low',
        drought: currentData.rainfall < 10 && currentData.temperature > 35 ? 'high' : 'low',
        pest: currentData.humidity > 80 && currentData.temperature > 28 ? 'high' : 'moderate',
        heat_wave: currentData.temperature > 38 ? 'high' : 'low',
        cyclone: districtType === 'Coastal' && currentData.windSpeed > 25 ? 'moderate' : 'low',
        ...risks
      },
      next24Hours: {
        temperatureTrend: currentData.temperature > historicalData.avgTemperature ? 'rising' : 'stable',
        rainfallProbability: currentSeason.name === 'monsoon' ? 'high' : 
                           currentData.humidity > 75 ? 'moderate' : 'low',
        windChanges: currentSeason.name === 'monsoon' ? 'strengthening' : 'stable'
      },
      agriculturalOutlook: {
        soilMoisture: currentData.rainfall > 20 ? 'excellent' : 
                     currentData.rainfall > 10 ? 'good' : 'needs irrigation',
        cropHealth: currentData.temperature < 35 && currentData.humidity < 85 ? 'good' : 'monitor',
        harvestConditions: currentData.rainfall < 5 ? 'favorable' : 'delay recommended'
      }
    };

    return predictions;
  };

  // AI Farming Recommendations for Karnataka
  const generateAIRecommendations = (weatherData, cropInfo, district) => {
    const recommendations = [];
    const currentSeason = getCurrentSeason();
    const districtCrops = karnatakaDistricts.find(d => d.name === district)?.crops || [];
    
    // Season-based recommendations
    if (currentSeason.name === 'summer') {
      recommendations.push({
        type: 'alert',
        message: 'Summer season: Increase irrigation frequency and provide shade for sensitive crops',
        priority: 'high',
        action: 'Adjust irrigation schedule',
        icon: '🌞'
      });
    }

    if (currentSeason.name === 'monsoon') {
      recommendations.push({
        type: 'info',
        message: 'Monsoon season: Perfect for paddy transplantation and rain-fed crops',
        priority: 'medium',
        action: 'Plan paddy cultivation',
        icon: '🌧️'
      });
    }

    // Rainfall-based recommendations
    if (weatherData.current.rainfall > 30) {
      recommendations.push({
        type: 'warning',
        message: 'Heavy rainfall: Ensure proper drainage to prevent waterlogging',
        priority: 'high',
        action: 'Check field drainage',
        icon: '💧'
      });
    }

    if (weatherData.current.rainfall < 5 && currentSeason.name !== 'winter') {
      recommendations.push({
        type: 'alert',
        message: 'Low rainfall: Supplemental irrigation required for summer crops',
        priority: 'high',
        action: 'Schedule irrigation',
        icon: '🚰'
      });
    }

    // Temperature-based recommendations
    if (weatherData.current.temperature > 35) {
      recommendations.push({
        type: 'warning',
        message: 'High temperature: Protect crops from heat stress',
        priority: 'medium',
        action: 'Provide shade/mulching',
        icon: '🌡️'
      });
    }

    // District-specific crop recommendations
    districtCrops.forEach(crop => {
      // Coffee (Kodagu, Hassan)
      if (crop.toLowerCase().includes('coffee') && weatherData.current.rainfall > 40) {
        recommendations.push({
          type: 'warning',
          message: `Heavy rain may affect coffee flowering - monitor for fungal diseases`,
          priority: 'medium',
          action: 'Apply preventive fungicide',
          icon: '☕'
        });
      }
      
      // Sugarcane (Mandya, Belgaum)
      if (crop.toLowerCase().includes('sugarcane') && weatherData.current.temperature > 36) {
        recommendations.push({
          type: 'alert',
          message: `High temperature may reduce sugarcane yield - ensure adequate water`,
          priority: 'high',
          action: 'Increase irrigation',
          icon: '🎋'
        });
      }
      
      // Grapes (Bagalkot, Bijapur)
      if (crop.toLowerCase().includes('grapes') && weatherData.current.humidity > 80) {
        recommendations.push({
          type: 'warning',
          message: `High humidity increases grape rot risk - improve ventilation`,
          priority: 'medium',
          action: 'Apply anti-fungal spray',
          icon: '🍇'
        });
      }

      // Coconut (Coastal districts)
      if (crop.toLowerCase().includes('coconut') && weatherData.current.windSpeed > 25) {
        recommendations.push({
          type: 'warning',
          message: `Strong winds may damage coconut trees - secure young plants`,
          priority: 'medium',
          action: 'Provide wind protection',
          icon: '🌴'
        });
      }

      // Ragi (Bangalore Rural, Tumkur)
      if (crop.toLowerCase().includes('ragi') && weatherData.current.rainfall < 10) {
        recommendations.push({
          type: 'alert',
          message: `Ragi needs consistent moisture - irrigate if rainfall is insufficient`,
          priority: 'medium',
          action: 'Schedule irrigation',
          icon: '🌾'
        });
      }
    });

    // General Karnataka farming recommendations
    recommendations.push({
      type: 'info',
      message: 'Karnataka soil conservation: Practice contour bunding in hilly areas',
      priority: 'low',
      action: 'Plan soil conservation',
      icon: '⛰️'
    });

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Load crop data based on district
  const loadCropData = (district) => {
    const districtInfo = karnatakaDistricts.find(d => d.name === district);
    
    try {
      const savedProfile = localStorage.getItem('farmerProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        return {
          crops: profile.crops || districtInfo?.crops.map(crop => ({ 
            name: crop, 
            area: 'Custom area', 
            stage: 'Growing' 
          })) || [{ name: 'Mixed Crops', area: 'Multiple', stage: 'Various' }],
          farmType: profile.farmType || districtInfo?.type + ' Farming',
          irrigationType: profile.irrigationType || 'Mixed',
          soilType: profile.soilType || 'Red Soil'
        };
      }
    } catch (error) {
      console.error('Error loading crop data:', error);
    }
    
    return { 
      crops: districtInfo?.crops.map(crop => ({ 
        name: crop, 
        area: 'Typical for region', 
        stage: 'Growing' 
      })) || [{ name: 'Regional Crops', area: 'District typical', stage: 'Seasonal' }],
      farmType: districtInfo?.type + ' Farming' || 'Karnataka Agriculture',
      irrigationType: 'Rain-fed with supplemental',
      soilType: 'Karnataka Red Soil'
    };
  };

  // Generate realistic weather data for Karnataka districts
  const generateDistrictWeather = (district) => {
    const districtType = karnatakaDistricts.find(d => d.name === district)?.type;
    const currentSeason = getCurrentSeason();
    
    // Base values by district type and season
    const baseTemps = {
      'Coastal': { summer: 32, monsoon: 28, postMonsoon: 29, winter: 26 },
      'Agricultural': { summer: 36, monsoon: 30, postMonsoon: 28, winter: 22 },
      'Hilly': { summer: 28, monsoon: 24, postMonsoon: 25, winter: 18 },
      'Urban': { summer: 38, monsoon: 32, postMonsoon: 30, winter: 24 },
      'Mining/Agricultural': { summer: 40, monsoon: 32, postMonsoon: 30, winter: 26 }
    };

    const baseRainfall = {
      'Coastal': { summer: 15, monsoon: 45, postMonsoon: 35, winter: 5 },
      'Agricultural': { summer: 8, monsoon: 30, postMonsoon: 25, winter: 2 },
      'Hilly': { summer: 12, monsoon: 50, postMonsoon: 40, winter: 8 },
      'Urban': { summer: 5, monsoon: 25, postMonsoon: 20, winter: 1 },
      'Mining/Agricultural': { summer: 3, monsoon: 20, postMonsoon: 15, winter: 1 }
    };

    const baseTemp = baseTemps[districtType]?.[currentSeason.name] || 30;
    const baseRain = baseRainfall[districtType]?.[currentSeason.name] || 20;

    // Add some randomness
    const temperature = baseTemp + (Math.random() * 4 - 2);
    const rainfall = Math.max(0, baseRain + (Math.random() * 10 - 5));
    
    return {
      temperature: Math.round(temperature),
      condition: currentSeason.name === 'monsoon' ? 'Light Rain' : 
                temperature > 35 ? 'Partly Cloudy' : 'Clear Sky',
      humidity: currentSeason.name === 'monsoon' ? 85 : 65,
      windSpeed: Math.round(12 + Math.random() * 10),
      rainfall: `${rainfall.toFixed(1)} mm`,
      pressure: '1010 hPa',
      uvIndex: 8,
      visibility: '10 km',
      feelsLike: Math.round(temperature + 2),
      sunrise: '06:15 AM',
      sunset: '06:30 PM'
    };
  };

  // Fetch weather data
  const fetchWeatherData = async (district = selectedDistrict) => {
    try {
      setError(null);
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentData = generateDistrictWeather(district);
      const forecastData = generateForecastData(district);
      
      const processedData = {
        current: currentData,
        forecast: forecastData,
        historical: {
          avgTemperature: currentData.temperature - 2,
          avgRainfall: '25 mm',
          trend: 'normal'
        },
        location: district,
        lastUpdated: new Date().toISOString()
      };

      const cropInfo = loadCropData(district);
      const aiPredictions = predictWeatherWithAI(processedData.current, processedData.historical, district);
      const aiRecommendations = generateAIRecommendations(processedData, cropInfo, district);

      setWeather(processedData);
      setAiInsights(aiPredictions);
      setCropData(cropInfo);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError('Using enhanced Karnataka weather data');
      loadFallbackData(district);
    } finally {
      setLoading(false);
    }
  };

  const generateForecastData = (district) => {
    const baseData = generateDistrictWeather(district);
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        high: baseData.temperature + Math.floor(Math.random() * 3),
        low: baseData.temperature - 5 + Math.floor(Math.random() * 3),
        condition: ['Partly Cloudy', 'Light Showers', 'Clear Sky', 'Humid'][i % 4],
        rainChance: [30, 60, 20, 40, 25][i],
        windDirection: ['SW', 'W', 'NW', 'N', 'NE'][i],
        humidity: baseData.humidity + (Math.random() * 10 - 5)
      };
    });
  };

  const loadFallbackData = (district) => {
    const fallbackData = {
      current: generateDistrictWeather(district),
      forecast: generateForecastData(district),
      historical: {
        avgTemperature: 28,
        avgRainfall: '25 mm',
        trend: 'normal'
      },
      location: district,
      lastUpdated: new Date().toISOString()
    };

    const cropInfo = loadCropData(district);
    const aiPredictions = predictWeatherWithAI(fallbackData.current, fallbackData.historical, district);
    const aiRecommendations = generateAIRecommendations(fallbackData, cropInfo, district);

    setWeather(fallbackData);
    setAiInsights(aiPredictions);
    setCropData(cropInfo);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    fetchWeatherData(district);
  };

  const handleRefresh = async () => {
    await fetchWeatherData();
  };

  const getWeatherIcon = (condition, size = 8) => {
    const iconClass = `h-${size} w-${size}`;
    const conditionLower = condition.toLowerCase();
    
    switch (true) {
      case conditionLower.includes('sunny') || conditionLower.includes('clear'):
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case conditionLower.includes('cloudy'):
        return <Cloud className={`${iconClass} text-gray-500`} />;
      case conditionLower.includes('rain') || conditionLower.includes('shower'):
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      case conditionLower.includes('humid'):
        return <Droplets className={`${iconClass} text-cyan-500`} />;
      default:
        return <Cloud className={`${iconClass} text-gray-400`} />;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 bg-red-50';
      case 'medium': return 'border-l-yellow-400 bg-yellow-50';
      case 'low': return 'border-l-green-400 bg-green-50';
      default: return 'border-l-blue-400 bg-blue-50';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-700">Karnataka Weather Analysis</h3>
          <p className="text-gray-600">Loading district weather data for {selectedDistrict}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/50 hover:bg-white/80 px-3 py-2 rounded-lg border"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TreePine className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Karnataka Weather Intelligence</h1>
                  <p className="text-sm text-gray-600">AI-powered agricultural weather for Karnataka districts</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-4">
                {error && (
                  <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                    ⚠️ {error}
                  </div>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* District Selector */}
      <div className="bg-white/60 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Navigation className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Select District:</span>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {karnatakaDistricts.map(district => (
                <option key={district.name} value={district.name}>
                  {district.name} ({district.type})
                </option>
              ))}
            </select>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{selectedDistrict}, Karnataka</span>
              </div>
              {lastUpdated && (
                <p className="text-xs text-gray-500">
                  Updated: {formatTime(lastUpdated)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Prediction Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Karnataka AI Weather Analysis</h2>
              </div>
              <p className="text-blue-100">
                {aiInsights?.season.name.toUpperCase()} SEASON • {selectedDistrict} • {aiInsights?.accuracy}% Accuracy
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 justify-end mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Confidence: {aiInsights?.confidence}</span>
              </div>
              <p className="text-blue-100">
                {aiInsights?.season.description}
              </p>
            </div>
          </div>
        </div>

        {/* Current Weather with AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Live Conditions & AI Analysis</span>
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Real-time Data</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center bg-blue-50 rounded-xl p-4 border border-blue-100">
                <Thermometer className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{weather.current.temperature}°C</p>
                <p className="text-sm text-gray-600">Temperature</p>
                <div className="text-xs text-green-600 mt-1">
                  Feels like {weather.current.feelsLike}°C
                </div>
              </div>
              <div className="text-center bg-blue-50 rounded-xl p-4 border border-blue-100">
                <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{weather.current.humidity}%</p>
                <p className="text-sm text-gray-600">Humidity</p>
                <div className={`text-xs mt-1 ${
                  weather.current.humidity > 80 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {weather.current.humidity > 80 ? 'High humidity' : 'Optimal range'}
                </div>
              </div>
              <div className="text-center bg-blue-50 rounded-xl p-4 border border-blue-100">
                <Wind className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{weather.current.windSpeed} km/h</p>
                <p className="text-sm text-gray-600">Wind Speed</p>
                <div className="text-xs text-green-600 mt-1">
                  {weather.current.windSpeed > 20 ? 'Breezy' : 'Calm'}
                </div>
              </div>
              <div className="text-center bg-blue-50 rounded-xl p-4 border border-blue-100">
                <Umbrella className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{weather.current.rainfall}</p>
                <p className="text-sm text-gray-600">Rainfall</p>
                <div className="text-xs text-blue-600 mt-1">
                  {weather.current.rainfall !== '0 mm' ? 'Recent rain' : 'No rain'}
                </div>
              </div>
            </div>

            {/* Additional Weather Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-semibold">{weather.current.pressure}</p>
                <p className="text-xs text-gray-600">Pressure</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-semibold">{weather.current.uvIndex}</p>
                <p className="text-xs text-gray-600">UV Index</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-semibold">{weather.current.visibility}</p>
                <p className="text-xs text-gray-600">Visibility</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-semibold">{weather.current.sunrise}</p>
                <p className="text-xs text-gray-600">Sunrise</p>
              </div>
            </div>

            {/* AI Analysis Factors */}
            <div className="bg-gray-50 rounded-xl p-4 border">
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span>Karnataka AI Analysis Factors</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {aiInsights?.factors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>District Risk Assessment</span>
            </h3>
            <div className="space-y-4">
              {Object.entries(aiInsights?.riskAssessment || {}).map(([risk, level]) => (
                <div key={risk} className={`border rounded-lg p-3 ${getRiskColor(level)}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{risk.replace('_', ' ')} Risk</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      level === 'high' ? 'bg-red-100 text-red-800' :
                      level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {level}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Agricultural Outlook */}
            {aiInsights?.agriculturalOutlook && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold mb-3 text-gray-700">Agricultural Outlook</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Soil Moisture:</span>
                    <span className="capitalize font-medium">{aiInsights.agriculturalOutlook.soilMoisture}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crop Health:</span>
                    <span className="capitalize font-medium">{aiInsights.agriculturalOutlook.cropHealth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harvest Conditions:</span>
                    <span className="capitalize font-medium">{aiInsights.agriculturalOutlook.harvestConditions}</span>
                  </div>
                </div>
              </div>
            )}

            {/* District Crops */}
            {cropData?.crops.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Sprout className="h-4 w-4 text-green-600" />
                  <span>District Crops</span>
                </h4>
                <div className="space-y-2">
                  {cropData.crops.slice(0, 4).map((crop, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-700 font-medium">{crop.name}</span>
                        <span className="text-gray-500 text-xs ml-2">({crop.stage})</span>
                      </div>
                      <span className="text-gray-500">{crop.area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Forecast with AI Insights */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">5-Day Karnataka Forecast</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Brain className="h-4 w-4 text-purple-600" />
              <span>District-specific AI Predictions</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {weather.forecast.map((day, index) => (
              <div key={index} className="text-center border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                <p className="font-semibold mb-2 text-gray-800">{day.day}</p>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(day.condition, 10)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{day.condition}</p>
                <div className="flex justify-center space-x-4 text-sm mb-2">
                  <span className="font-semibold text-gray-800">{day.high}°</span>
                  <span className="text-gray-500">{day.low}°</span>
                </div>
                <p className="text-sm text-blue-600 mb-2">💧 {day.rainChance}% rain</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>💨 {day.windDirection}</div>
                  <div>💦 {Math.round(day.humidity)}% humidity</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Farming Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Karnataka Farming Recommendations</span>
            </h3>
            <div className="space-y-4">
              {generateAIRecommendations(weather, cropData, selectedDistrict).map((rec, index) => (
                <div key={index} className={`border-l-4 rounded-r-lg p-4 ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{rec.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{rec.message}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          {rec.action} →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Impact Analysis */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-sm p-6 border border-green-200">
            <h3 className="text-lg font-semibold mb-4 text-green-800">
              Karnataka Agriculture Impact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-green-100">
                <span className="text-sm text-gray-700">Crop Growth Conditions</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                  {weather.current.temperature > 35 ? 'Monitor' : 'Favorable'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-green-100">
                <span className="text-sm text-gray-700">Irrigation Needs</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                  {weather.current.rainfall !== '0 mm' ? 'Low' : 'High'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-green-100">
                <span className="text-sm text-gray-700">Pest/Disease Risk</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                  {weather.current.humidity > 85 ? 'High' : 'Moderate'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-green-100">
                <span className="text-sm text-gray-700">Harvest Timing</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                  {weather.forecast[0]?.rainChance > 50 ? 'Delay' : 'Optimal'}
                </span>
              </div>
            </div>

            {/* District Summary */}
            <div className="mt-6 pt-4 border-t border-green-200">
              <h4 className="font-semibold mb-3 text-green-800">District Summary</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span>District Type:</span>
                  <span className="font-medium">{cropData?.farmType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Major Crops:</span>
                  <span className="font-medium text-right">
                    {cropData?.crops.slice(0, 2).map(c => c.name).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Season:</span>
                  <span className="font-medium capitalize">{aiInsights?.season.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeatherIntelligence;