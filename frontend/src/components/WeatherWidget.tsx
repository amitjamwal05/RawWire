'use client';
import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, MapPin, Loader2, CloudLightning } from 'lucide-react';

let cachedWeather: any = null;
let cachedLocation: string | null = null;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;

export default function WeatherWidget() {
  const [weather, setWeather] = useState<any>(cachedWeather);
  const [location, setLocation] = useState<string>(cachedLocation || 'Detecting location...');
  const [loading, setLoading] = useState<boolean>(!cachedWeather);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedWeather) return; // Already fetched

    const fetchFallbackWeather = async () => {
      try {
        const lat = 40.7128;
        const lon = -74.0060;
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const weatherData = await weatherRes.json();
        
        cachedWeather = weatherData.current_weather;
        cachedLocation = 'New York (Fallback)';
        
        setWeather(cachedWeather);
        setLocation(cachedLocation);
        setError(null);
      } catch (err) {
        setError('Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      fetchFallbackWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Fetch Weather
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          
          // Fetch City Name
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const geoData = await geoRes.json();
          
          const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state || 'Local Area';
          
          cachedWeather = weatherData.current_weather;
          cachedLocation = city;
          
          setWeather(cachedWeather);
          setLocation(cachedLocation);
          setError(null);
        } catch (err) {
          fetchFallbackWeather();
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        // Fallback to New York if permission denied
        fetchFallbackWeather();
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="bg-hover-bg rounded-2xl border border-border mt-4 p-5 flex items-center justify-center gap-3 text-muted">
        <Loader2 className="animate-spin text-accent" size={20} />
        <span className="text-sm font-medium">Fetching local weather...</span>
      </div>
    );
  }

  if (error || !weather) return null;

  // WMO Weather interpretation codes
  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-yellow-400 drop-shadow-md" size={28} />;
    if (code <= 3) return <Cloud className="text-gray-300 drop-shadow-md" size={28} />;
    if (code <= 48) return <Cloud className="text-gray-400 drop-shadow-md" size={28} />;
    if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain className="text-blue-400 drop-shadow-md" size={28} />;
    if (code <= 77 || (code >= 85 && code <= 86)) return <Snowflake className="text-blue-200 drop-shadow-md" size={28} />;
    if (code >= 95) return <CloudLightning className="text-purple-400 drop-shadow-md" size={28} />;
    return <Cloud className="text-gray-400 drop-shadow-md" size={28} />;
  };

  const getConditionText = (code: number) => {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67 || (code >= 80 && code <= 82)) return 'Rainy';
    if (code <= 77 || (code >= 85 && code <= 86)) return 'Snowy';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  return (
    <div className="bg-gradient-to-br from-hover-bg to-background rounded-2xl border border-border mt-4 p-5 flex items-center justify-between group overflow-hidden relative shadow-sm transition-all hover:border-accent/30">
      <div className="flex flex-col z-10">
        <div className="flex items-center gap-1.5 text-muted text-sm font-medium mb-1.5">
          <MapPin size={14} className="text-accent" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black tracking-tighter text-foreground">
            {Math.round(weather.temperature)}°<span className="text-xl text-muted">C</span>
          </span>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent leading-none bg-accent/10 px-2 py-1 rounded-md">
              {getConditionText(weather.weathercode)}
            </span>
          </div>
        </div>
      </div>
      <div className="z-10 bg-background/80 backdrop-blur-sm p-3 rounded-full border border-border shadow-inner">
        {getWeatherIcon(weather.weathercode)}
      </div>
    </div>
  );
}
