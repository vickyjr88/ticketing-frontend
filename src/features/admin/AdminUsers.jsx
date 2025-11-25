import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, TrendingUp, FileText, Shield, Search, AlertCircle, Activity, LayoutGrid, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [latest, setLatest] = useState(null);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, latestRes, usersRes, brandsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/latest', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/brands', { headers })
      ]);

      if (!statsRes.ok || !latestRes.ok || !usersRes.ok || !brandsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      setStats(await statsRes.json());
      setLatest(await latestRes.json());
      setUsers(await usersRes.json());
      setBrands(await brandsRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
  if (error) return <div className="p-8 text-center text-red-600 flex flex-col items-center gap-2"><AlertCircle />{error}</div>;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'brands' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Brands
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={Users} title="Total Users" value={stats?.users} color="bg-blue-50 text-blue-600" />
            <StatsCard icon={Briefcase} title="Total Brands" value={stats?.brands} color="bg-purple-50 text-purple-600" />
            <StatsCard icon={TrendingUp} title="Total Trends" value={stats?.trends} color="bg-green-50 text-green-600" />
            <StatsCard icon={FileText} title="Content Generated" value={stats?.content} color="bg-orange-50 text-orange-600" />
          </div>

          {/* Latest Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LatestSection title="Latest Users" icon={Users} items={latest?.users} renderItem={user => (
              <div key={user.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            )} />

            <LatestSection title="Latest Brands" icon={Briefcase} items={latest?.brands} renderItem={brand => (
              <div key={brand.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{brand.name}</p>
                  <p className="text-xs text-gray-500">{brand.industry}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(brand.created_at).toLocaleDateString()}</span>
              </div>
            )} />

            <LatestSection title="Latest Trends" icon={TrendingUp} items={latest?.trends} renderItem={trend => (
              <div key={trend.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-medium text-sm text-gray-900 truncate">{trend.topic}</p>
                  <p className="text-xs text-gray-500">{trend.source}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(trend.timestamp).toLocaleTimeString()}</span>
              </div>
            )} />

            <LatestSection title="Latest Content" icon={FileText} items={latest?.content} renderItem={content => (
              <div key={content.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-medium text-sm text-gray-900 truncate">{content.trend}</p>
                  <p className="text-xs text-gray-500 capitalize">{content.status}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(content.generated_at).toLocaleTimeString()}</span>
              </div>
            )} />
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">All Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
              />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => navigate(`/admin/user/${user.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {user.name?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{user.subscription_tier}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BRANDS TAB */}
      {activeTab === 'brands' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">All Brands</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search brands or owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
              />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Brand</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Industry</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBrands.map(brand => (
                  <tr key={brand.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => navigate(`/brand/${brand.id}`)}>
                    <td className="px-6 py-4 font-medium text-sm text-gray-900">{brand.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{brand.industry}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{brand.owner.name}</div>
                      <div className="text-xs text-gray-500">{brand.owner.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${brand.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(brand.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ icon: Icon, title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function LatestSection({ title, icon: Icon, items, renderItem }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Icon size={18} className="text-gray-400" />
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="px-6">
        {items?.length > 0 ? items.map(renderItem) : <p className="py-4 text-sm text-gray-500 text-center">No activity yet</p>}
      </div>
    </div>
  );
}
