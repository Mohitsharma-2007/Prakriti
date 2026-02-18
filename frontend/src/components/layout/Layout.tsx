import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Bot, Settings, Scan } from 'lucide-react';

const Layout: React.FC = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#0a0f0a] text-white font-sans flex flex-col relative overflow-hidden selection:bg-green-500/30">
            {/* Global Aurora Background */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[100px]"></div>
            </div>

            <main className="container mx-auto px-4 pt-32 pb-4 max-w-2xl flex-grow z-10 relative">
                <Outlet />
            </main>

            {/* Glassmorphic Top Navigation Dock */}
            <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 w-auto max-w-lg z-50">
                <div className="flex items-center gap-1 px-4 py-3 bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-[#0a0a0a]/80 hover:border-white/20 hover:scale-[1.02]">

                    <Link to="/" className={`relative group p-3 rounded-2xl transition-all duration-300 ${location.pathname === '/' ? 'bg-white/10 text-green-400' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                        <Home className="w-6 h-6" />
                        {location.pathname === '/' && <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full shadow-[0_0_8px_currentColor]"></span>}
                        <span className="absolute top-14 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-md">Home</span>
                    </Link>

                    <Link to="/community" className={`relative group p-3 rounded-2xl transition-all duration-300 ${location.pathname === '/community' ? 'bg-white/10 text-green-400' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                        <Users className="w-6 h-6" />
                        {location.pathname === '/community' && <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full shadow-[0_0_8px_currentColor]"></span>}
                        <span className="absolute top-14 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-md">Community</span>
                    </Link>

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/10 mx-2"></div>

                    {/* Center FAB for AI */}
                    <Link to="/chat/ai" className="relative group mx-1">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform ${location.pathname === '/chat/ai'
                            ? 'bg-gradient-to-tr from-green-500 to-emerald-600 text-white scale-110 shadow-green-500/30 translate-y-2 rotate-3 hover:rotate-6'
                            : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:scale-105 hover:translate-y-1'
                            }`}>
                            <Bot className="w-7 h-7" />
                        </div>
                        <span className="absolute top-16 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-green-500 text-black font-bold text-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg -translate-y-2 group-hover:translate-y-0">Ask Prakriti</span>
                    </Link>

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/10 mx-2"></div>

                    <Link to="/scan" className={`relative group p-3 rounded-2xl transition-all duration-300 ${location.pathname === '/scan' ? 'bg-white/10 text-green-400' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                        <Scan className="w-6 h-6" />
                        {location.pathname === '/scan' && <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full shadow-[0_0_8px_currentColor]"></span>}
                        <span className="absolute top-14 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-md">Scan</span>
                    </Link>

                    <Link to="/history" className={`relative group p-3 rounded-2xl transition-all duration-300 ${location.pathname === '/history' ? 'bg-white/10 text-green-400' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                        <Settings className="w-6 h-6" />
                        {location.pathname === '/history' && <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full shadow-[0_0_8px_currentColor]"></span>}
                        <span className="absolute top-14 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-md">Settings</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default Layout;
