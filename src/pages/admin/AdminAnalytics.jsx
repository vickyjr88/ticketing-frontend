import { useState, useEffect, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Ticket,
    Gift,
    Clock,
    Activity,
    DollarSign,
    Calendar,
    RefreshCw,
    ChevronDown,
    Zap,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    UserCheck,
    Shuffle,
    Tag,
    Bell,
} from 'lucide-react';
import { api } from '../../services/api';

// Simple sparkline chart component
const Sparkline = ({ data, color = '#6366f1' }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 30;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="sparkline">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
            />
        </svg>
    );
};

// Bar chart component
const BarChartSimple = ({ data, maxHeight = 120 }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.value)) || 1;

    return (
        <div className="bar-chart">
            {data.map((item, i) => (
                <div key={i} className="bar-container">
                    <div
                        className="bar"
                        style={{
                            height: `${(item.value / max) * maxHeight}px`,
                            backgroundColor: item.color || '#6366f1',
                        }}
                    />
                    <span className="bar-label">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

// Activity type icon mapper
const getActivityIcon = (type) => {
    switch (type) {
        case 'purchase': return <Ticket className="w-4 h-4" />;
        case 'checkin': return <UserCheck className="w-4 h-4" />;
        case 'lottery_win': return <Gift className="w-4 h-4" />;
        case 'waitlist': return <Bell className="w-4 h-4" />;
        case 'transfer': return <Shuffle className="w-4 h-4" />;
        default: return <Activity className="w-4 h-4" />;
    }
};

const getActivityColor = (type) => {
    switch (type) {
        case 'purchase': return '#10b981';
        case 'checkin': return '#6366f1';
        case 'lottery_win': return '#f59e0b';
        case 'waitlist': return '#8b5cf6';
        case 'transfer': return '#06b6d4';
        default: return '#6b7280';
    }
};

export default function AdminAnalytics() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [timeRange, setTimeRange] = useState(30);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const result = await api.getAnalyticsDashboard(timeRange);
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Failed to load analytics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadAnalytics();
    };

    // Calculate derived metrics
    const metrics = useMemo(() => {
        if (!data) return {};

        const totalRevenue = data.salesTimeSeries?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0;
        const totalOrders = data.salesTimeSeries?.reduce((sum, d) => sum + (d.orders || 0), 0) || 0;
        const peakHour = data.checkInDistribution?.reduce((max, d) => d.count > max.count ? d : max, { count: 0 });

        return {
            totalRevenue,
            totalOrders,
            avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
            peakHour: peakHour?.label || 'N/A',
            peakCheckIns: peakHour?.count || 0,
        };
    }, [data]);

    if (loading && !data) {
        return (
            <div className="analytics-loading">
                <div className="loading-spinner large"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="analytics-dashboard">
            {/* Header */}
            <div className="analytics-header">
                <div className="header-content">
                    <div className="header-title">
                        <BarChart3 className="w-8 h-8 text-indigo-600" />
                        <div>
                            <h1>Analytics Dashboard</h1>
                            <p>Real-time insights into your events</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(Number(e.target.value))}
                            className="time-select"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <button
                            className="refresh-btn"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'spinning' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                </div>
            )}

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card revenue">
                    <div className="kpi-icon">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Total Revenue</span>
                        <span className="kpi-value">KES {metrics.totalRevenue?.toLocaleString()}</span>
                        <Sparkline
                            data={data?.salesTimeSeries?.map(d => d.revenue) || []}
                            color="#10b981"
                        />
                    </div>
                </div>

                <div className="kpi-card orders">
                    <div className="kpi-icon">
                        <Ticket className="w-6 h-6" />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Total Orders</span>
                        <span className="kpi-value">{metrics.totalOrders?.toLocaleString()}</span>
                        <Sparkline
                            data={data?.salesTimeSeries?.map(d => d.orders) || []}
                            color="#6366f1"
                        />
                    </div>
                </div>

                <div className="kpi-card retention">
                    <div className="kpi-icon">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Customer Retention</span>
                        <span className="kpi-value">{data?.customerRetention?.retentionRate || '0%'}</span>
                        <span className="kpi-sub">
                            {data?.customerRetention?.repeatCustomers || 0} repeat customers
                        </span>
                    </div>
                </div>

                <div className="kpi-card peak">
                    <div className="kpi-icon">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Peak Check-in</span>
                        <span className="kpi-value">{metrics.peakHour}</span>
                        <span className="kpi-sub">{metrics.peakCheckIns} check-ins</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* Sales Trend */}
                <div className="chart-card large">
                    <div className="chart-header">
                        <h3><TrendingUp className="w-5 h-5" /> Sales Trend</h3>
                        <span className="chart-subtitle">Revenue over time</span>
                    </div>
                    <div className="chart-body">
                        <div className="area-chart">
                            {data?.salesTimeSeries?.slice(-14).map((d, i) => (
                                <div key={i} className="area-bar-container">
                                    <div
                                        className="area-bar"
                                        style={{
                                            height: `${Math.max((d.revenue / (Math.max(...data.salesTimeSeries.map(x => x.revenue)) || 1)) * 100, 2)}%`,
                                        }}
                                        title={`${d.date}: KES ${d.revenue?.toLocaleString()}`}
                                    >
                                        <span className="area-tooltip">
                                            KES {d.revenue?.toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="area-label">
                                        {new Date(d.date).getDate()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Check-in Distribution */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3><Clock className="w-5 h-5" /> Check-in Times</h3>
                        <span className="chart-subtitle">Hourly distribution</span>
                    </div>
                    <div className="chart-body">
                        <div className="hour-chart">
                            {data?.checkInDistribution?.filter((_, i) => i >= 8 && i <= 23).map((h, i) => (
                                <div key={i} className="hour-bar-container">
                                    <div
                                        className="hour-bar"
                                        style={{
                                            height: `${Math.max((h.count / (Math.max(...data.checkInDistribution.map(x => x.count)) || 1)) * 100, 2)}%`,
                                            backgroundColor: h.count === Math.max(...data.checkInDistribution.map(x => x.count))
                                                ? '#f59e0b'
                                                : '#6366f1',
                                        }}
                                        title={`${h.label}: ${h.count} check-ins`}
                                    />
                                    <span className="hour-label">{h.hour}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Breakdown & Revenue by Event */}
            <div className="charts-row">
                {/* Activity Breakdown */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3><Activity className="w-5 h-5" /> Activity Breakdown</h3>
                    </div>
                    <div className="chart-body">
                        <div className="activity-stats">
                            <div className="stat-row">
                                <div className="stat-icon tickets">
                                    <Ticket className="w-5 h-5" />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Standard Tickets</span>
                                    <span className="stat-value">{data?.activityBreakdown?.tickets?.standard?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                            <div className="stat-row">
                                <div className="stat-icon adopted">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Adopted Tickets</span>
                                    <span className="stat-value">{data?.activityBreakdown?.tickets?.adopted?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                            <div className="stat-row">
                                <div className="stat-icon checkins">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Check-ins</span>
                                    <span className="stat-value">{data?.activityBreakdown?.tickets?.checkedIn?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                            <div className="stat-row">
                                <div className="stat-icon transfers">
                                    <Shuffle className="w-5 h-5" />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Transfers</span>
                                    <span className="stat-value">{data?.activityBreakdown?.tickets?.transfers?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                            <div className="stat-row">
                                <div className="stat-icon lottery">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Lottery Entries</span>
                                    <span className="stat-value">
                                        {data?.activityBreakdown?.lottery?.entries?.toLocaleString() || 0}
                                        <span className="stat-sub"> ({data?.activityBreakdown?.lottery?.winRate || 0}% win rate)</span>
                                    </span>
                                </div>
                            </div>
                            <div className="stat-row">
                                <div className="stat-icon waitlist">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Waitlist</span>
                                    <span className="stat-value">{data?.activityBreakdown?.engagement?.waitlist?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                            <div className="stat-row">
                                <div className="stat-icon promo">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Promo Uses</span>
                                    <span className="stat-value">{data?.activityBreakdown?.engagement?.promoUsages?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue by Event */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3><Target className="w-5 h-5" /> Revenue by Event</h3>
                    </div>
                    <div className="chart-body">
                        <div className="event-revenue-list">
                            {data?.revenueByEvent?.slice(0, 5).map((event, i) => (
                                <div key={i} className="event-revenue-item">
                                    <div className="event-info">
                                        <span className="event-rank">#{i + 1}</span>
                                        <span className="event-title">{event.eventTitle}</span>
                                    </div>
                                    <div className="event-stats">
                                        <span className="event-revenue">KES {event.revenue?.toLocaleString()}</span>
                                        <span className="event-orders">{event.orderCount} orders</span>
                                    </div>
                                    <div className="event-bar">
                                        <div
                                            className="event-bar-fill"
                                            style={{
                                                width: `${(event.revenue / (data.revenueByEvent[0]?.revenue || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!data?.revenueByEvent || data.revenueByEvent.length === 0) && (
                                <p className="no-data">No revenue data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Retention */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3><Users className="w-5 h-5" /> Customer Loyalty</h3>
                    </div>
                    <div className="chart-body">
                        <div className="retention-chart">
                            {data?.customerRetention?.distribution && Object.entries(data.customerRetention.distribution).map(([key, value], i) => (
                                <div key={i} className="retention-bar-container">
                                    <span className="retention-label">{key}</span>
                                    <div className="retention-bar-wrapper">
                                        <div
                                            className="retention-bar"
                                            style={{
                                                width: `${(value / (data.customerRetention.totalCustomers || 1)) * 100}%`,
                                                backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'][i],
                                            }}
                                        />
                                    </div>
                                    <span className="retention-value">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="activity-feed-section">
                <div className="chart-card full-width">
                    <div className="chart-header">
                        <h3><Activity className="w-5 h-5" /> Live Activity Feed</h3>
                        <span className="chart-subtitle">Real-time system activity</span>
                    </div>
                    <div className="chart-body">
                        <div className="activity-feed">
                            {data?.activityFeed?.slice(0, 20).map((activity, i) => (
                                <div key={i} className="activity-item">
                                    <div
                                        className="activity-icon"
                                        style={{ backgroundColor: getActivityColor(activity.type) }}
                                    >
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="activity-content">
                                        <p className="activity-description">{activity.description}</p>
                                        <span className="activity-time">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(!data?.activityFeed || data.activityFeed.length === 0) && (
                                <p className="no-data">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .analytics-dashboard {
                    padding: 24px;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    min-height: 100vh;
                }

                .analytics-header {
                    margin-bottom: 24px;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .header-title h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .header-title p {
                    color: #64748b;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    gap: 12px;
                }

                .time-select {
                    padding: 8px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                    font-size: 14px;
                    cursor: pointer;
                }

                .refresh-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .refresh-btn:hover {
                    background: #4f46e5;
                }

                .refresh-btn:disabled {
                    opacity: 0.7;
                }

                .spinning {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .error-banner {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                }

                /* KPI Cards */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .kpi-card {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    gap: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .kpi-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .kpi-card.revenue .kpi-icon {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                }

                .kpi-card.orders .kpi-icon {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                }

                .kpi-card.retention .kpi-icon {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                }

                .kpi-card.peak .kpi-icon {
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    color: white;
                }

                .kpi-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .kpi-label {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 500;
                }

                .kpi-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                }

                .kpi-sub {
                    font-size: 12px;
                    color: #94a3b8;
                }

                /* Charts */
                .charts-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .chart-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    overflow: hidden;
                }

                .chart-card.large {
                    grid-column: span 2;
                }

                .chart-card.full-width {
                    grid-column: 1 / -1;
                }

                .chart-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .chart-header h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0;
                }

                .chart-subtitle {
                    font-size: 13px;
                    color: #94a3b8;
                }

                .chart-body {
                    padding: 20px;
                }

                /* Area Chart */
                .area-chart {
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    height: 150px;
                }

                .area-bar-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                }

                .area-bar {
                    width: 100%;
                    background: linear-gradient(180deg, #6366f1 0%, #a5b4fc 100%);
                    border-radius: 4px 4px 0 0;
                    position: relative;
                    transition: all 0.3s;
                    cursor: pointer;
                }

                .area-bar:hover {
                    background: linear-gradient(180deg, #4f46e5 0%, #818cf8 100%);
                }

                .area-tooltip {
                    display: none;
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1e293b;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    white-space: nowrap;
                }

                .area-bar:hover .area-tooltip {
                    display: block;
                }

                .area-label {
                    font-size: 10px;
                    color: #94a3b8;
                    margin-top: 4px;
                }

                /* Hour Chart */
                .hour-chart {
                    display: flex;
                    align-items: flex-end;
                    gap: 3px;
                    height: 120px;
                }

                .hour-bar-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                }

                .hour-bar {
                    width: 100%;
                    border-radius: 3px 3px 0 0;
                    transition: all 0.3s;
                    cursor: pointer;
                }

                .hour-label {
                    font-size: 9px;
                    color: #94a3b8;
                    margin-top: 4px;
                }

                /* Activity Stats */
                .activity-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .stat-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .stat-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .stat-icon.tickets { background: #6366f1; }
                .stat-icon.adopted { background: #f59e0b; }
                .stat-icon.checkins { background: #10b981; }
                .stat-icon.transfers { background: #06b6d4; }
                .stat-icon.lottery { background: #8b5cf6; }
                .stat-icon.waitlist { background: #ec4899; }
                .stat-icon.promo { background: #14b8a6; }

                .stat-info {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .stat-label {
                    font-size: 14px;
                    color: #475569;
                }

                .stat-value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .stat-sub {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 400;
                }

                /* Event Revenue */
                .event-revenue-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .event-revenue-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .event-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .event-rank {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6366f1;
                    background: #eef2ff;
                    padding: 2px 8px;
                    border-radius: 4px;
                }

                .event-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #1e293b;
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .event-stats {
                    display: flex;
                    gap: 16px;
                }

                .event-revenue {
                    font-size: 14px;
                    font-weight: 600;
                    color: #10b981;
                }

                .event-orders {
                    font-size: 12px;
                    color: #94a3b8;
                }

                .event-bar {
                    height: 6px;
                    background: #f1f5f9;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .event-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
                    border-radius: 3px;
                    transition: width 0.5s ease;
                }

                /* Retention Chart */
                .retention-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .retention-bar-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .retention-label {
                    width: 70px;
                    font-size: 13px;
                    color: #475569;
                }

                .retention-bar-wrapper {
                    flex: 1;
                    height: 24px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .retention-bar {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .retention-value {
                    width: 40px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                    text-align: right;
                }

                /* Activity Feed */
                .activity-feed {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 12px;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .activity-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .activity-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .activity-content {
                    flex: 1;
                    min-width: 0;
                }

                .activity-description {
                    font-size: 13px;
                    color: #1e293b;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .activity-time {
                    font-size: 11px;
                    color: #94a3b8;
                }

                .no-data {
                    text-align: center;
                    color: #94a3b8;
                    padding: 24px;
                }

                .analytics-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 400px;
                    gap: 16px;
                }

                .loading-spinner.large {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #e2e8f0;
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                /* Sparkline */
                .sparkline {
                    margin-top: 8px;
                }

                @media (max-width: 768px) {
                    .chart-card.large {
                        grid-column: span 1;
                    }
                    
                    .activity-feed {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
