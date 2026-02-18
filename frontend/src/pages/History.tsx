import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Calendar, ChevronRight, Filter, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Diagnosis {
    id: number;
    image_url: string;
    disease_name: string;
    confidence: number;
    created_at: string;
    treatment: string;
}

export default function History() {
    const { user } = useAuth();
    const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'healthy' | 'disease'>('all');

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        if (!user) return;

        const { data } = await supabase
            .from('diagnoses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setDiagnoses(data);
        setLoading(false);
    };

    const filteredDiagnoses = diagnoses.filter(d => {
        const matchesSearch = d.disease_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all'
            ? true
            : filter === 'healthy'
                ? d.disease_name.toLowerCase().includes('healthy')
                : !d.disease_name.toLowerCase().includes('healthy');

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h1 className="text-2xl font-bold text-slate-800">Crop History 📜</h1>
                <p className="text-slate-500 text-sm">Your past scans and treatments</p>
            </header>

            {/* Search & Filter */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search crops or diseases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                    />
                </div>
                <button
                    onClick={() => setFilter(prev => prev === 'all' ? 'disease' : prev === 'disease' ? 'healthy' : 'all')}
                    className={`p-2 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${filter !== 'all' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="capitalize">{filter}</span>
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredDiagnoses.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-400">No records found.</p>
                    </div>
                ) : (
                    filteredDiagnoses.map((diag) => (
                        <div key={diag.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex gap-3">
                            <img src={diag.image_url} alt="Crop" className="w-20 h-20 object-cover rounded-xl shrink-0" />
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-800">{diag.disease_name}</h3>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(diag.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={`text-xs font-medium mt-1 ${diag.disease_name.toLowerCase().includes('healthy') ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                    {Math.round(diag.confidence * 100)}% Confidence
                                </p>
                                <div className="mt-2 flex items-center text-primary text-xs font-medium">
                                    View details <ChevronRight className="w-3 h-3 ml-auto" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
