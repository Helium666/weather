import React, { useEffect, useState} from 'react';
import './styles/weather.css';
import Forecast, { ForecastDay } from '../forecast/Forecast';
import RainEffect from '../rainEffect/RainEffect';

type weather = {
    icon: string;
    city: string;
    temperature: number;
    description: string;
    windSpeed: number;
    humidity: number;
    clouds: number;
    feelsLike: number;
    visibility: number;
    sunrise: number;
    sunset: number;
    windDeg: number;
    windGust: number;
}



const Weather:React.FC = () => {
    const apiKey = 'e60068e3c0e4eca4c55726f696ee407c';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [inputCity, setInputCity] = useState('');
    const [weatherData, setWeatherData] = useState<weather>();
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [showForecast, setShowForecast] = useState(false);
  

    const handleSetInputCity = (input:string) => {
        const cityAliases: { [key: string]: string } = {
            'спб': 'Санкт-Петербург',
            '52': 'Санкт-Петербург',
            'питер': 'Санкт-Петербург',
        };
        const normalizedCity = input.toLowerCase().trim();
        setInputCity(cityAliases[normalizedCity] || input);
    }

    const fetchWeather = async () => {
        try{
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?` + 
                `q=${inputCity}` +
                `&appid=${apiKey}` +
                `&units=metric` + 
                `&lang=ru`
            );
            const data = await response.json();
            console.log('API ответ:', data);

            // Получаем локальное время в городе
            const localTime = new Date();
            const cityTime = new Date(localTime.getTime() + (data.timezone * 1000));
            const hours = cityTime.getHours();
            
            // Определяем день или ночь и корректируем код иконки
            const isDaytime = hours >= 6 && hours < 18;
            const iconCode = data.weather[0].icon.replace('n', isDaytime ? 'd' : 'n');

            setWeatherData({
                city: data.name,
                icon: iconCode,  // Используем исправленный код иконки
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                windSpeed: Number(data.wind.speed.toFixed(2)),
                humidity: data.main.humidity,
                clouds: data.clouds.all,
                feelsLike: Math.round(data.main.feels_like),
                visibility: data.visibility / 1000,
                sunrise: data.sys.sunrise * 1000,
                sunset: data.sys.sunset * 1000,
                windDeg: data.wind.deg,
                windGust: data.wind.gust || 0
            });
           
            setLoading(false);
        } catch(error) {
            setError('Ошибка при получении погоды');
            setLoading(false);
        }
    };

    const fetchForecast = async () => {
        if (!inputCity) return;
        
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?` +
                `q=${inputCity}` +
                `&appid=${apiKey}` +
                `&units=metric` +
                `&lang=ru`
            );
            const data = await response.json();
            
            const dailyData = data.list
                .filter((item: any) => item.dt_txt.includes('12:00:00'))
                .slice(0, 5)
                .map((item: any) => {
                    const date = new Date(item.dt * 1000);
                    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                    return {
                        date: item.dt_txt.split(' ')[0],
                        day: days[date.getDay()],
                        temperature: Math.round(item.main.temp),
                        icon: item.weather[0].icon,
                        description: item.weather[0].description
                    };
                });
            
            setForecast(dailyData);
            setShowForecast(true);
        } catch (error) {
            setError('Ошибка при получении прогноза');
        }
    };

    const getMyLocation = async () => {

    };

    return (
        <div className="weather-container" style={{ background: getWeatherBackground(weatherData?.description) }}>
            {weatherData?.description?.includes('дождь') && <RainEffect />}
            <h1>Погода</h1>
            
            <div className="input-container">
                <input 
                    type="text" 
                    placeholder="Введите название города" 
                    value={inputCity}
                    onChange={(e) => handleSetInputCity(e.target.value)}
                />
                <div className="buttons-group">
                    <button onClick={fetchWeather}>Узнать погоду</button>
                    <button onClick={fetchForecast}>Прогноз</button>
                    <button onClick={getMyLocation}>Моя погода</button>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                {weatherData && (
                    <div className="weather-info">
                        <h2>{weatherData.city}</h2>
                        <img 
                            src={`https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`} 
                            alt="weather icon"
                            style={{ 
                                width: '120px',
                                height: '120px',
                                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))'
                            }}
                        />
                        <p>{weatherData.temperature}°C</p>
                        <p>{weatherData.description}</p>
                        
                        <div className="weather-details">
                            {[
                                { label: 'Влажность', value: `${weatherData.humidity}%` },
                                { label: 'Облачность', value: `${weatherData.clouds}%` },
                                { label: 'Ощущается как', value: `${weatherData.feelsLike}°C` },
                                { label: 'Скорость ветра', value: `${weatherData.windSpeed} м/с` },
                                { label: 'Порывы до', value: `${weatherData.windGust} м/с` },
                                { label: 'Направление ветра', value: `${getWindDirection(weatherData.windDeg)}` },
                                { label: 'Видимость', value: `${weatherData.visibility} км` },
                                { label: 'Восход', value: formatTime(weatherData.sunrise) },
                                { label: 'Закат', value: formatTime(weatherData.sunset) },
                            ].map(({ label, value }) => (
                                <div key={label} className="detail-item">
                                    <p>{label}</p>
                                    <p>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {showForecast && (
                <Forecast 
                    forecast={forecast} 
                    onClose={() => setShowForecast(false)} 
                />
            )}
        </div>
    );
}

const getWindDirection = (deg: number): string => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(deg / 45) % 8];
};

const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getWeatherBackground = (description: string | undefined) => {
    if (!description) return 'linear-gradient(to bottom right, #1e1e1e, #2d2d2d)';
    
    const weatherTypes = {
        солнечно: 'linear-gradient(to bottom right, #FFB75E, #ED8F03)',
        ясно: 'linear-gradient(to bottom right, #FFB75E, #ED8F03)',
        облачно: 'linear-gradient(to bottom right, #757F9A, #D7DDE8)',
        пасмурно: 'linear-gradient(to bottom right, #757F9A, #D7DDE8)',
        дождь: 'linear-gradient(to bottom right, #536976, #292E49)',
        снег: 'linear-gradient(to bottom right, #E6DADA, #274046)',
        гроза: 'linear-gradient(to bottom right, #283E51, #4B79A1)',
    };

    const weatherType = Object.keys(weatherTypes).find(type => 
        description.toLowerCase().includes(type)
    );

    return weatherTypes[weatherType as keyof typeof weatherTypes] || weatherTypes.облачно;
};

export default Weather;
