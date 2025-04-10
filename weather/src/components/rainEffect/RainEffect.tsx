import React from 'react';
import './styles/rain.css';

const RainEffect: React.FC = () => {
    return (
        <div className="rain">
            {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="drop" style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                    animationDelay: `${Math.random() * 2}s`
                }} />
            ))}
        </div>
    );
};

export default RainEffect;