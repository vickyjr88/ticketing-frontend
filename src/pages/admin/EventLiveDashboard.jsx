import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import { Users, CreditCard, Activity, MapPin } from 'lucide-react';

export default function EventLiveDashboard() {
    const { id } = useParams();
    const socket = useSocket();
    const [event, setEvent] = useState(null);
    const [stats, setStats] = useState({
        totalCheckIns: 0,
        revenue: 0,
        gateStats: [],
        capacity: 0
    });
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        loadEventData();
    }, [id]);

    useEffect(() => {
        if (socket && id) {
            socket.emit('joinEvent', id);

            socket.on('checkInUpdate', (data) => {
                console.log('Check-in update:', data);
                // Update stats
                setStats(prev => ({
                    ...prev,
                    totalCheckIns: data.totalCheckIns || (prev.totalCheckIns + 1),
                    // Update specific gate count logic would go here if data.gate is provided
                }));

                // Add log
                const newLog = {
                    id: Date.now(),
                    message: `Ticket ${data.ticketId.slice(0, 8)}... checked in at ${data.gate || 'Gate'}`,
                    timestamp: new Date(),
                    type: 'check-in'
                };
                setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50
            });

            socket.on('statsUpdate', (data) => {
                setStats(prev => ({ ...prev, ...data }));
            });

            return () => {
                socket.emit('leaveEvent', id);
                socket.off('checkInUpdate');
                socket.off('statsUpdate');
            };
        }
    }, [socket, id]);

    const loadEventData = async () => {
        try {
            const eventData = await api.getEvent(id);
            setEvent(eventData);

            // Calculate capacity from tiers
            const capacity = eventData.ticket_tiers?.reduce((sum, t) => sum + t.initial_quantity, 0) || 0;

            // Fetch gate stats to get total check-in count
            const gateStats = await api.getGateStats(id).catch(() => []);
            const totalCheckIns = gateStats.reduce((sum, g) => sum + (parseInt(g.count) || 0), 0);

            // Get event revenue from order totals
            let revenue = 0;
            try {
                const orders = await api.getEventOrders(id);
                if (orders?.data) {
                    revenue = orders.data.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
                }
            } catch (e) {
                console.log('Could not fetch orders for revenue');
            }

            setStats({
                totalCheckIns,
                revenue,
                gateStats,
                capacity
            });

            // Load recent check-in activity for this event
            try {
                const recentActivity = await api.getEventCheckIns(id, 20).catch(() => ({ data: [] }));
                if (recentActivity?.data) {
                    const initialLogs = recentActivity.data.map((ticket, i) => ({
                        id: ticket.id || `init-${i}`,
                        message: `${ticket.holder?.first_name || 'Guest'} checked in at ${ticket.checked_in_gate || 'gate'}`,
                        timestamp: new Date(ticket.checked_in_at),
                        type: 'check-in'
                    }));
                    setLogs(initialLogs.slice(0, 50));
                }
            } catch (e) {
                console.log('Could not fetch recent check-ins:', e);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!event) return <div className="p-8">Loading...</div>;

    const percentage = stats.capacity > 0 ? Math.round((stats.totalCheckIns / stats.capacity) * 100) : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{event.title} - Live Dashboard</h1>
            <p className="text-gray-500 mb-8">Real-time monitoring</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Check-in Counter */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Live Check-ins</p>
                            <h2 className="text-3xl font-bold text-gray-900">{stats.totalCheckIns}</h2>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage}% of capacity ({stats.capacity})</p>
                </div>

                {/* Revenue */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CreditCard className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <h2 className="text-3xl font-bold text-gray-900">KES {stats.revenue.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <Activity className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Alerts</p>
                            <h2 className="text-3xl font-bold text-gray-900">0</h2>
                            <p className="text-xs text-gray-500">No unusual patterns detected</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Feed */}
                <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" /> Live Activity Feed
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">Waiting for activity...</p>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                                    <div className="p-2 bg-blue-50 rounded-full">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{log.message}</p>
                                        <p className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Gate Status (Placeholder) */}
                <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold mb-4">Gate Efficiency</h3>
                    <p className="text-gray-500">Gate data will appear here as tickets are scanned.</p>
                </div>
            </div>
        </div>
    );
}
