import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
    Plus,
    Activity,
    Calendar,
    ChevronRight,
    Droplets,
    Sun,
    Wind,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';

interface Diagnosis {
    id: number;
    image_url: string;
    disease_name: string;
    confidence: number;
    created_at: string;
}

export default function Dashboard() {
    const { user, profile } = useAuth();
    const [recentDiagnoses, setRecentDiagnoses] = useState<Diagnosis[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Data for "Daily Report"
    const dailyStats = {
        healthy: 12,
        attention: 3,
        waterLevel: 'Optimal',
        sunlight: 'High'
    };

    useEffect(() => {
        fetchDiagnoses();
    }, [user]);

    const fetchDiagnoses = async () => {
        if (!user) return;

        const { data } = await supabase
            .from('diagnoses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setRecentDiagnoses(data);
        setLoading(false);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header Section */}
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Namaste, {profile?.full_name?.split(' ')[0] || 'Farmer'}! 🌾
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {profile?.location || 'India'} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <Link to="/scan" className="bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg shadow-primary/30 transition-all">
                    <Plus className="w-6 h-6" />
                </Link>
            </header>

            {/* Weather / Quick Status Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-green-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-xl -ml-10 -mb-10"></div>

                <div className="flex justify-between items-center relative z-10 mb-6">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">
                        <Sun className="w-3 h-3" /> 28°C Sunny
                    </div>
                    <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30 transition-colors">
                        <Activity className="w-5 h-5" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div>
                        <p className="text-green-100 text-xs mb-1">Crop Health</p>
                        <div className="text-2xl font-bold flex items-baseline gap-1">
                            92%
                            <span className="text-xs font-normal text-green-100">Optimal</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-green-100 text-xs mb-1">Next Water</p>
                        <div className="text-2xl font-bold flex items-baseline gap-1">
                            4 hrs
                            <span className="text-xs font-normal text-green-100">Due</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Scans (Horizontal Scroll) */}
            <section>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="font-bold text-white">Recent Scans</h2>
                    <Link to="/history" className="text-green-400 text-xs font-medium flex items-center hover:text-green-300">
                        View All <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="min-w-[140px] h-40 bg-white/5 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : recentDiagnoses.length === 0 ? (
                    <div className="text-center py-6 bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
                        <p className="text-white/40 text-sm">No scans yet. Add your first crop!</p>
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                        {recentDiagnoses.map((diag) => (
                            <div key={diag.id} className="min-w-[140px] snap-start bg-white/5 p-2 rounded-2xl border border-white/10 shadow-lg first:ml-1 backdrop-blur-sm">
                                <img src={diag.image_url} alt="Crop" className="w-full h-24 object-cover rounded-xl mb-2" />
                                <h3 className="font-semibold text-white/90 text-xs truncate px-1">
                                    {diag.disease_name}
                                </h3>
                                <p className={`text-[10px] px-1 font-medium ${diag.disease_name.toLowerCase().includes('healthy') ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {new Date(diag.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Daily Health Report (Vertical List) */}
            <section>
                <h2 className="font-bold text-white mb-4 px-1">Daily Insights</h2>
                <div className="bg-white/5 rounded-3xl p-5 shadow-lg border border-white/10 space-y-6 backdrop-blur-md">

                    {/* Item 1 */}
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                            <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white/90 text-sm">Irrigation Advice</h3>
                            <p className="text-xs text-white/50 mt-1 leading-relaxed">
                                Soil moisture is low (45%). Recommend watering crops tomorrow morning before sunrise.
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full"></div>

                    {/* Item 2 */}
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                            <Sun className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white/90 text-sm">Heat Warning</h3>
                            <p className="text-xs text-white/50 mt-1 leading-relaxed">
                                Temperatures expected to reach 34°C. Ensure shading for young saplings.
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full"></div>

                    {/* Item 3 */}
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white/90 text-sm">Growth Update</h3>
                            <p className="text-xs text-white/50 mt-1 leading-relaxed">
                                Your Wheat crop is in the vegetative stage. Current growth rate is optimal.
                            </p>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
