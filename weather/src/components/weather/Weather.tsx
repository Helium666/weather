
import React, { useEffect, useState} from 'react';
import './styles/weather.css';

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
                console.log('API ответ:', data); // Добавляем лог
                setWeatherData({
                    city: data.name,
                    icon: data.weather[0].icon,
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
            }catch(error){
                setError('Ошибка при получении погоды');
                setLoading(false);
            }
        };

        return (
            <div className="weather-container">
                <h1>Погода</h1>
                
                <input 
                    type="text" 
                    placeholder="Введите название города" 
                    value={inputCity}
                    onChange={(e) => setInputCity(e.target.value)}
                />
                <button onClick={fetchWeather}>Узнать погоду</button>
                
                {loading && <p>Загружаем...</p>}
                {error && <p>{error}</p>}
                
                {weatherData && (
                    <div className="weather-info">
                        <h2>{weatherData.city}</h2>
                        <img 
                            src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`} 
                            alt="weather icon"
                        />
                        <p>{weatherData.temperature}°C</p>
                        <p>{weatherData.description}</p>
                        
                        <div className="weather-details">
                            {[
                                { label: 'Скорость ветра', value: `${weatherData.windSpeed} м/с` },
                                { label: 'Влажность', value: `${weatherData.humidity}%` },
                                { label: 'Облачность', value: `${weatherData.clouds}%` },
                                { label: 'Ощущается как', value: `${weatherData.feelsLike}°C` },
                                { label: 'Порывы до', value: `${weatherData.windGust} м/с` },
                                { label: 'Направление ветра', value: `${getWindDirection(weatherData.windDeg)}` },
                                { label: 'Видимость', value: `${weatherData.visibility} км` },
                                { label: 'Восход', value: formatTime(weatherData.sunrise) },
                                { label: 'Закат', value: formatTime(weatherData.sunset) }
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

export default Weather;
