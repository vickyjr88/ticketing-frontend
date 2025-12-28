import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Users,
    ShoppingCart,
    Ticket,
    Gift,
    TrendingUp,
    DollarSign,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Clock
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboardStats, orders] = await Promise.all([
                api.getAdminStats(),
                api.getAdminOrders({ limit: 5 })
            ]);
            setStats(dashboardStats);
            setRecentOrders(orders?.orders || orders || []);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Welcome Header */}
            <div className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-welcome">
                        <h1>Welcome back, {user?.first_name || 'Admin'}!</h1>
                        <p>Here's what's happening with your events today.</p>
                    </div>
                    <div className="header-actions">
                        <Link to="/admin/events/new" className="btn-primary">
                            <Calendar className="w-4 h-4" />
                            Create Event
                        </Link>
                    </div>
                </div>
            </div>

            {error && (
                <div className="admin-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card gradient-purple">
                    <div className="stat-icon">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Revenue</p>
                        <h3 className="stat-value">{formatCurrency(stats?.totalRevenue || 0)}</h3>
                        <div className="stat-change positive">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+12.5% from last month</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card gradient-blue">
                    <div className="stat-icon">
                        <Ticket className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Tickets Sold</p>
                        <h3 className="stat-value">{stats?.totalTicketsSold || 0}</h3>
                        <div className="stat-change positive">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>{stats?.ticketsSoldToday || 0} today</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card gradient-green">
                    <div className="stat-icon">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Active Events</p>
                        <h3 className="stat-value">{stats?.activeEvents || 0}</h3>
                        <div className="stat-subtext">
                            <span>{stats?.draftEvents || 0} drafts</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card gradient-orange">
                    <div className="stat-icon">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Users</p>
                        <h3 className="stat-value">{stats?.totalUsers || 0}</h3>
                        <div className="stat-change positive">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>{stats?.newUsersToday || 0} new today</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="admin-content-grid">
                {/* Recent Orders */}
                <div className="admin-card">
                    <div className="card-header">
                        <h2>
                            <ShoppingCart className="w-5 h-5" />
                            Recent Orders
                        </h2>
                        <Link to="/admin/orders" className="card-link">
                            View All
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="orders-list">
                        {recentOrders.length === 0 ? (
                            <div className="empty-state">
                                <ShoppingCart className="w-12 h-12" />
                                <p>No orders yet</p>
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order.id} className="order-item">
                                    <div className="order-info">
                                        <div className="order-customer">
                                            <span className="customer-name">
                                                {order.user?.first_name} {order.user?.last_name}
                                            </span>
                                            <span className="order-id">#{order.id?.slice(0, 8)}</span>
                                        </div>
                                        <span className="order-event">{order.event?.title}</span>
                                    </div>
                                    <div className="order-meta">
                                        <span className={`order-status status-${order.status?.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                        <span className="order-amount">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="admin-card">
                    <div className="card-header">
                        <h2>
                            <Activity className="w-5 h-5" />
                            Quick Actions
                        </h2>
                    </div>
                    <div className="quick-actions">
                        <Link to="/admin/events" className="quick-action-btn">
                            <div className="action-icon bg-purple">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="action-content">
                                <span className="action-title">Manage Events</span>
                                <span className="action-desc">View and edit all events</span>
                            </div>
                        </Link>

                        <Link to="/admin/orders" className="quick-action-btn">
                            <div className="action-icon bg-blue">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <div className="action-content">
                                <span className="action-title">View Orders</span>
                                <span className="action-desc">Track all purchases</span>
                            </div>
                        </Link>

                        <Link to="/admin/users" className="quick-action-btn">
                            <div className="action-icon bg-green">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="action-content">
                                <span className="action-title">User Management</span>
                                <span className="action-desc">Manage user accounts</span>
                            </div>
                        </Link>

                        <Link to="/admin/lottery" className="quick-action-btn">
                            <div className="action-icon bg-orange">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div className="action-content">
                                <span className="action-title">Lottery Manager</span>
                                <span className="action-desc">Run lottery draws</span>
                            </div>
                        </Link>

                        <Link to="/admin/scanner" className="quick-action-btn">
                            <div className="action-icon bg-pink">
                                <Ticket className="w-5 h-5" />
                            </div>
                            <div className="action-content">
                                <span className="action-title">Ticket Scanner</span>
                                <span className="action-desc">Scan and validate tickets</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="bottom-stats">
                <div className="admin-card mini-stats">
                    <div className="mini-stat">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <div>
                            <span className="mini-stat-value">{stats?.pendingOrders || 0}</span>
                            <span className="mini-stat-label">Pending Orders</span>
                        </div>
                    </div>
                    <div className="mini-stat">
                        <Ticket className="w-5 h-5 text-blue-500" />
                        <div>
                            <span className="mini-stat-value">{stats?.ticketsCheckedIn || 0}</span>
                            <span className="mini-stat-label">Checked In Today</span>
                        </div>
                    </div>
                    <div className="mini-stat">
                        <Gift className="w-5 h-5 text-orange-500" />
                        <div>
                            <span className="mini-stat-value">{stats?.lotteryEntries || 0}</span>
                            <span className="mini-stat-label">Lottery Entries</span>
                        </div>
                    </div>
                    <div className="mini-stat">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <div>
                            <span className="mini-stat-value">{stats?.conversionRate || '0%'}</span>
                            <span className="mini-stat-label">Conversion Rate</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
