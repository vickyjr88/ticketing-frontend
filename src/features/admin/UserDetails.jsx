import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Shield, Briefcase, Activity } from 'lucide-react';

export default function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch user details');
            setUser(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!user) return <div className="p-8 text-center">User not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-3xl">
                                {user.name?.[0]}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                <div className="flex items-center gap-4 mt-2 text-gray-500">
                                    <span className="flex items-center gap-1.5 text-sm">
                                        <Mail size={16} />
                                        {user.email}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm">
                                        <Calendar size={16} />
                                        Joined {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                {user.role}
                            </span>
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 capitalize">
                                {user.subscription_tier}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} capitalize`}>
                                {user.subscription_status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Brands Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="text-indigo-600" />
                            Brands ({user.brands?.length || 0})
                        </h2>

                        {user.brands?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.brands.map(brand => (
                                    <div key={brand.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/brand/${brand.id}`)}>
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-gray-900">{brand.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${brand.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                                                {brand.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">{brand.industry}</p>
                                        <p className="text-xs text-gray-400">Created {new Date(brand.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                                No brands created yet.
                            </div>
                        )}
                    </div>

                    {/* Usage Stats Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-indigo-600" />
                            Usage History
                        </h2>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            {user.usage?.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {user.usage.map((stat, index) => (
                                        <div key={index} className="p-4 flex justify-between items-center">
                                            <span className="font-medium text-gray-900">{stat.month}</span>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-indigo-600">{stat.content_generated_count} Posts</div>
                                                <div className="text-xs text-gray-400">{stat.api_calls_count} API Calls</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No usage data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
