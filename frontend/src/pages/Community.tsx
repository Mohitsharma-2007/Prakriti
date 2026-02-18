import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Store, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Profile {
    id: string;
    full_name: string;
    role: 'farmer' | 'seller' | 'kisan_head';
    location: string;
}

export default function Community() {
    const { user } = useAuth();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // 1. Get Current Location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;

                    // 2. Update Profile
                    if (user) {
                        await supabase.from('profiles').update({
                            latitude,
                            longitude,
                            location_updated_at: new Date().toISOString()
                        }).eq('id', user.id);
                    }

                    // 3. Fetch Nearby Users via RPC
                    const { data, error } = await supabase.rpc('get_nearby_users', {
                        lat: latitude,
                        long: longitude,
                        radius_km: 50 // 50km radius
                    });

                    if (error) throw error;
                    setUsers(data || []);
                }, (err) => {
                    console.warn("Location denied, fetching all users fallback");
                    fetchAllUsersFallback();
                });
            } else {
                fetchAllUsersFallback();
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const fetchAllUsersFallback = async () => {
        const { data } = await supabase.from('profiles').select('*').neq('id', user?.id).limit(20);
        setUsers(data || []);
        setLoading(false);
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'seller': return <Store className="w-5 h-5 text-yellow-600" />;
            case 'kisan_head': return <Users className="w-5 h-5 text-blue-600" />;
            default: return <Users className="w-5 h-5 text-green-600" />;
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Community 🤝</h1>
                <div className="text-sm text-white/50">
                    Farmers near you (50km)
                </div>
            </header>

            {/* Categories / Filters (Mock for now) */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['All', 'Farmers', 'Sellers', 'Experts'].map((cat) => (
                    <button
                        key={cat}
                        className="px-4 py-1.5 rounded-full bg-white/10 text-white/70 text-sm font-medium whitespace-nowrap hover:bg-white/20 border border-white/5"
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* User List */}
            <div className="space-y-3">
                {loading ? (
                    <p className="text-center text-white/40 py-10">Finding friends nearby...</p>
                ) : users.length === 0 ? (
                    <div className="text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/10">
                        <p className="text-white/50">No farmers found nearby yet.</p>
                        <p className="text-xs text-white/30 mt-1">Invite your neighbors!</p>
                    </div>
                ) : (
                    users.map((profile: any) => (
                        <div key={profile.id} className="bg-white/5 p-4 rounded-xl shadow-sm border border-white/10 flex items-center justify-between backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 w-10 h-10 rounded-full flex items-center justify-center text-green-400 font-bold uppercase border border-green-500/30">
                                    {profile.full_name?.[0] || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white/90">{profile.full_name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-white/50 capitalize">
                                        {getRoleIcon(profile.role)}
                                        {profile.role?.replace('_', ' ')}
                                        {profile.distance_km && (
                                            <span className="text-green-400/80 ml-2">• {Math.round(profile.distance_km)} km away</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Link
                                to={`/chat/${profile.id}`}
                                className="bg-green-500/10 text-green-400 p-2 rounded-full hover:bg-green-500/20 transition-colors border border-green-500/20"
                                title="Message"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
