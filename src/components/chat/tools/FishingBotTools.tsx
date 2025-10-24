'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Cloud, Fish, Plus, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CatchReport {
  id: string;
  species: string;
  weight: string;
  length: string;
  time: string;
  notes: string;
  date: string;
}

interface WeatherData {
  temp: string;
  condition: string;
  pressure: string;
  humidity: string;
  windSpeed: string;
}

interface FishingBotToolsProps {
  conversationId: string;
  onDataChange: (toolType: string, data: any) => void;
  initialData?: {
    venue?: string;
    weather?: WeatherData;
    catches?: CatchReport[];
  };
}

export function FishingBotTools({ conversationId, onDataChange, initialData }: FishingBotToolsProps) {
  const [venue, setVenue] = useState(initialData?.venue || '');
  const [weather, setWeather] = useState<WeatherData | null>(initialData?.weather || null);
  const [catches, setCatches] = useState<CatchReport[]>(initialData?.catches || []);
  const [showCatchForm, setShowCatchForm] = useState(false);
  const [newCatch, setNewCatch] = useState<Partial<CatchReport>>({
    species: '',
    weight: '',
    length: '',
    time: '',
    notes: '',
  });

  const updateVenue = (value: string) => {
    setVenue(value);
    onDataChange('venue', value);
    // Clear weather when venue changes
    if (weather) {
      setWeather(null);
      onDataChange('weather', null);
    }
  };

  const fetchWeather = async () => {
    if (!venue.trim()) return;
    
    try {
      // Using Open-Meteo API (free, no API key needed)
      // First, geocode the venue name
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(venue)}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        alert('Location not found. Try a different venue name.');
        return;
      }
      
      const { latitude, longitude } = geoData.results[0];
      
      // Fetch weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=mph`
      );
      const weatherData = await weatherResponse.json();
      
      const weatherCodes: { [key: number]: string } = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light drizzle',
        53: 'Drizzle',
        55: 'Heavy drizzle',
        61: 'Light rain',
        63: 'Rain',
        65: 'Heavy rain',
        71: 'Light snow',
        73: 'Snow',
        75: 'Heavy snow',
        80: 'Rain showers',
        81: 'Rain showers',
        82: 'Heavy rain showers',
        95: 'Thunderstorm',
      };
      
      const weatherInfo: WeatherData = {
        temp: `${Math.round(weatherData.current.temperature_2m)}°C`,
        condition: weatherCodes[weatherData.current.weather_code] || 'Unknown',
        pressure: `${weatherData.current.pressure_msl} hPa`,
        humidity: `${weatherData.current.relative_humidity_2m}%`,
        windSpeed: `${Math.round(weatherData.current.wind_speed_10m)} mph`,
      };
      
      setWeather(weatherInfo);
      onDataChange('weather', weatherInfo);
    } catch (error) {
      console.error('Error fetching weather:', error);
      alert('Failed to fetch weather data. Please try again.');
    }
  };

  const addCatch = () => {
    if (!newCatch.species) return;
    
    const catchReport: CatchReport = {
      id: Date.now().toString(),
      species: newCatch.species || '',
      weight: newCatch.weight || '',
      length: newCatch.length || '',
      time: newCatch.time || new Date().toLocaleTimeString(),
      notes: newCatch.notes || '',
      date: new Date().toLocaleDateString(),
    };
    
    const updated = [...catches, catchReport];
    setCatches(updated);
    onDataChange('catches', updated);
    setNewCatch({ species: '', weight: '', length: '', time: '', notes: '' });
    setShowCatchForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Venue */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Fishing Venue
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter venue name..."
            value={venue}
            onChange={(e) => updateVenue(e.target.value)}
            className="flex-1 bg-gray-900 border-gray-600"
          />
          <Button 
            onClick={fetchWeather} 
            disabled={!venue.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Get Weather
          </Button>
        </div>
        {venue && (
          <div className="mt-2 text-sm text-gray-400">
            Current location: <span className="text-white">{venue}</span>
          </div>
        )}
      </Card>

      {/* Weather Widget */}
      {weather && (
        <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Conditions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-sm text-gray-400">Temperature</div>
              <div className="text-xl font-semibold text-white">{weather.temp}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-sm text-gray-400">Condition</div>
              <div className="text-xl font-semibold text-white">{weather.condition}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-sm text-gray-400">Pressure</div>
              <div className="text-xl font-semibold text-white">{weather.pressure}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-sm text-gray-400">Humidity</div>
              <div className="text-xl font-semibold text-white">{weather.humidity}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-sm text-gray-400">Wind Speed</div>
              <div className="text-xl font-semibold text-white">{weather.windSpeed}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Catch Report */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <Fish className="w-5 h-5" />
            Catch Log
          </h3>
          <Button 
            onClick={() => setShowCatchForm(!showCatchForm)}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Catch
          </Button>
        </div>

        {showCatchForm && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700 space-y-3">
            <Input
              placeholder="Species (e.g., Bass, Trout)"
              value={newCatch.species}
              onChange={(e) => setNewCatch({ ...newCatch, species: e.target.value })}
              className="bg-gray-900 border-gray-600"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Weight (e.g., 5 lbs)"
                value={newCatch.weight}
                onChange={(e) => setNewCatch({ ...newCatch, weight: e.target.value })}
                className="bg-gray-900 border-gray-600"
              />
              <Input
                placeholder="Length (e.g., 18 in)"
                value={newCatch.length}
                onChange={(e) => setNewCatch({ ...newCatch, length: e.target.value })}
                className="bg-gray-900 border-gray-600"
              />
            </div>
            <Input
              placeholder="Time caught (optional)"
              value={newCatch.time}
              onChange={(e) => setNewCatch({ ...newCatch, time: e.target.value })}
              className="bg-gray-900 border-gray-600"
            />
            <textarea
              placeholder="Notes (bait, location, conditions...)"
              value={newCatch.notes}
              onChange={(e) => setNewCatch({ ...newCatch, notes: e.target.value })}
              className="w-full h-24 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex gap-2">
              <Button onClick={addCatch} className="flex-1 bg-green-600 hover:bg-green-700">
                Save Catch
              </Button>
              <Button 
                onClick={() => {
                  setShowCatchForm(false);
                  setNewCatch({ species: '', weight: '', length: '', time: '', notes: '' });
                }}
                variant="outline"
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {catches.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No catches logged yet. Tight lines!</p>
          ) : (
            catches.map((catchItem) => (
              <div key={catchItem.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-white text-lg">{catchItem.species}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-3 mt-1">
                      {catchItem.weight && <span>Weight: {catchItem.weight}</span>}
                      {catchItem.length && <span>Length: {catchItem.length}</span>}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" />
                      {catchItem.date} at {catchItem.time}
                    </div>
                    {catchItem.notes && (
                      <div className="text-sm text-gray-300 mt-2 italic">
                        "{catchItem.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

