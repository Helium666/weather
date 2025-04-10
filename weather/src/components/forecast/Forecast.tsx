import React from 'react';
import './styles/forecast.css';

export type ForecastDay = {
    date: string;
    day: string;
    temperature: number;
    icon: string;
    description: string;
}

interface ForecastProps {
    forecast: ForecastDay[];
    onClose: () => void;
}

const Forecast: React.FC<ForecastProps> = ({ forecast, onClose }) => {
    return (
        <div className="forecast-overlay">
            <div className="forecast-container">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Прогноз на 5 дней</h2>
                <div className="forecast-items">
                    {forecast.map((day) => (
                        <div key={day.date} className="forecast-item">
                            <p className="day">{day.day}</p>
                            <img 
                                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                                alt={day.description}
                            />
                            <p className="temp">{day.temperature}°C</p>
                            <p className="description">{day.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Forecast;