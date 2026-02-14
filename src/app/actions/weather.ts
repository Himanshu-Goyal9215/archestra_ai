"use server";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "http://api.weatherapi.com/v1";

export interface WeatherData {
    location: {
        name: string;
        region: string;
        country: string;
        lat: number;
        lon: number;
        tz_id: string;
        localtime_epoch: number;
        localtime: string;
    };
    current: {
        last_updated: string;
        temp_c: number;
        temp_f: number;
        is_day: number;
        condition: { text: string; icon: string; code: number };
        wind_mph: number;
        wind_kph: number;
        wind_degree: number;
        wind_dir: string;
        pressure_mb: number;
        pressure_in: number;
        precip_mm: number;
        precip_in: number;
        humidity: number;
        cloud: number;
        feelslike_c: number;
        feelslike_f: number;
        vis_km: number;
        vis_miles: number;
        gust_mph: number;
        gust_kph: number;
        uv: number;
        air_quality?: {
            co: number;
            no2: number;
            o3: number;
            so2: number;
            pm2_5: number;
            pm10: number;
            "us-epa-index": number;
            "gb-defra-index": number;
        };
    };
}

export interface ForecastData extends WeatherData {
    forecast: {
        forecastday: Array<{
            date: string;
            day: {
                maxtemp_c: number;
                maxtemp_f: number;
                mintemp_c: number;
                mintemp_f: number;
                avgtemp_c: number;
                avgtemp_f: number;
                maxwind_kph: number;
                totalprecip_mm: number;
                avghumidity: number;
                daily_chance_of_rain: number;
                daily_chance_of_snow: number;
                condition: { text: string; icon: string; code: number };
                uv: number;
            };
            astro: {
                sunrise: string;
                sunset: string;
                moonrise: string;
                moonset: string;
                moon_phase: string;
                moon_illumination: number;
            };
            hour: Array<{
                time: string;
                temp_c: number;
                temp_f: number;
                condition: { text: string; icon: string };
                wind_kph: number;
                humidity: number;
                chance_of_rain: number;
                feelslike_c: number;
            }>;
        }>;
    };
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
    if (!WEATHER_API_KEY) {
        throw new Error("Weather API key not configured");
    }

    const res = await fetch(
        `${BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&aqi=yes`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!res.ok) {
        throw new Error(`Weather API error: ${res.statusText}`);
    }

    return res.json();
}

export async function getForecast(city: string, days: number = 3): Promise<ForecastData> {
    if (!WEATHER_API_KEY) {
        throw new Error("Weather API key not configured");
    }

    const res = await fetch(
        `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=${days}&aqi=yes`,
        { next: { revalidate: 300 } }
    );

    if (!res.ok) {
        throw new Error(`Weather API error: ${res.statusText}`);
    }

    return res.json();
}

export async function getTimezone(city: string) {
    if (!WEATHER_API_KEY) {
        throw new Error("Weather API key not configured");
    }

    const res = await fetch(
        `${BASE_URL}/timezone.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}`,
        { next: { revalidate: 600 } }
    );

    if (!res.ok) {
        throw new Error(`Weather API error: ${res.statusText}`);
    }

    return res.json();
}
