import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center space-y-8 mt-10">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-primary">Namaste Farmer! 🙏</h2>
                <p className="text-slate-600">Your AI Crop Doctor is here.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg w-full text-center space-y-4 border border-slate-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl">
                    📸
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Check Crop Health</h3>
                <p className="text-sm text-slate-500">
                    Upload a photo of your crop to detect diseases instantly.
                </p>
                <button
                    onClick={() => navigate('/scan')}
                    className="w-full py-3 px-6 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-lime-600 transition-colors transform active:scale-95"
                >
                    Scan Now
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-secondary/20 p-4 rounded-xl text-center border border-secondary/30">
                    <span className="text-2xl block mb-1">🌦️</span>
                    <span className="text-sm font-medium text-slate-700">Weather</span>
                </div>
                <div className="bg-accent/20 p-4 rounded-xl text-center border border-accent/30">
                    <span className="text-2xl block mb-1">🧪</span>
                    <span className="text-sm font-medium text-slate-700">Soil Info</span>
                </div>
            </div>
        </div>
    );
};

export default Home;
