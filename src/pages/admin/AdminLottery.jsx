import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Gift,
    Play,
    Users,
    Trophy,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Eye,
    Ticket
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminLottery() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [lotteryStats, setLotteryStats] = useState(null);
    const [winners, setWinners] = useState([]);
    const [running, setRunning] = useState(false);
    const [drawResult, setDrawResult] = useState(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await api.getEvents();
            // Filter events with lottery enabled
            const lotteryEvents = data.filter(e => e.lottery_enabled);
            setEvents(lotteryEvents);
        } catch (err) {
            console.error('Failed to load events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadEventLotteryData = async (event) => {
        try {
            setSelectedEvent(event);
            setError(null);

            const [stats, eventWinners] = await Promise.all([
                api.getLotteryStats(event.id),
                api.getLotteryWinners(event.id)
            ]);

            setLotteryStats(stats);
            setWinners(eventWinners || []);
        } catch (err) {
            console.error('Failed to load lottery data:', err);
            setError(err.message);
        }
    };

    const runLotteryDraw = async () => {
        if (!selectedEvent) return;

        try {
            setRunning(true);
            setError(null);
            setDrawResult(null);

            const result = await api.runLotteryDraw(selectedEvent.id);

            setDrawResult({
                success: true,
                winners: result.winners || [],
                message: `Successfully selected ${result.winners?.length || 0} winners!`
            });

            // Reload data
            await loadEventLotteryData(selectedEvent);

        } catch (err) {
            console.error('Lottery draw failed:', err);
            setDrawResult({
                success: false,
                message: err.message || 'Failed to run lottery draw'
            });
        } finally {
            setRunning(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-KE', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isDrawDatePassed = (date) => {
        return new Date(date) < new Date();
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading lottery data...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="page-title">
                    <Gift className="w-8 h-8" />
                    <div>
                        <h1>Lottery Manager</h1>
                        <p>Manage lottery draws for events</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="admin-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="lottery-layout">
                {/* Events List */}
                <div className="lottery-events-section">
                    <div className="admin-card">
                        <div className="card-header">
                            <h2>
                                <Calendar className="w-5 h-5" />
                                Lottery Events
                            </h2>
                        </div>
                        <div className="lottery-events-list">
                            {events.length === 0 ? (
                                <div className="empty-state">
                                    <Gift className="w-12 h-12" />
                                    <p>No lottery-enabled events</p>
                                    <Link to="/admin/events/new" className="btn-secondary mt-4">
                                        Create Event
                                    </Link>
                                </div>
                            ) : (
                                events.map((event) => (
                                    <button
                                        key={event.id}
                                        className={`lottery-event-card ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                                        onClick={() => loadEventLotteryData(event)}
                                    >
                                        <div className="event-info">
                                            <h3>{event.title}</h3>
                                            <div className="event-meta">
                                                <span>
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(event.start_date)}
                                                </span>
                                                {event.lottery_draw_date && (
                                                    <span className={isDrawDatePassed(event.lottery_draw_date) ? 'draw-passed' : 'draw-upcoming'}>
                                                        <Clock className="w-4 h-4" />
                                                        Draw: {formatDate(event.lottery_draw_date)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Eye className="w-5 h-5" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Lottery Details */}
                <div className="lottery-details-section">
                    {!selectedEvent ? (
                        <div className="admin-card empty-selection">
                            <Gift className="w-16 h-16" />
                            <h3>Select an Event</h3>
                            <p>Choose an event from the list to view lottery details</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="lottery-stats-grid">
                                <div className="lottery-stat-card">
                                    <Users className="w-8 h-8 text-blue-500" />
                                    <div>
                                        <span className="stat-value">{lotteryStats?.totalEntries || 0}</span>
                                        <span className="stat-label">Total Entries</span>
                                    </div>
                                </div>
                                <div className="lottery-stat-card">
                                    <Ticket className="w-8 h-8 text-purple-500" />
                                    <div>
                                        <span className="stat-value">{lotteryStats?.availableTickets || 0}</span>
                                        <span className="stat-label">Available Prizes</span>
                                    </div>
                                </div>
                                <div className="lottery-stat-card">
                                    <Trophy className="w-8 h-8 text-yellow-500" />
                                    <div>
                                        <span className="stat-value">{lotteryStats?.totalWinners || 0}</span>
                                        <span className="stat-label">Winners Selected</span>
                                    </div>
                                </div>
                            </div>

                            {/* Draw Action */}
                            <div className="admin-card lottery-action-card">
                                <div className="action-header">
                                    <h3>
                                        <Play className="w-5 h-5" />
                                        Run Lottery Draw
                                    </h3>
                                    {selectedEvent.lottery_draw_date && (
                                        <span className={`draw-date ${isDrawDatePassed(selectedEvent.lottery_draw_date) ? 'passed' : ''}`}>
                                            Scheduled: {formatDate(selectedEvent.lottery_draw_date)}
                                        </span>
                                    )}
                                </div>

                                <p className="action-description">
                                    Running the draw will randomly select winners from all eligible entries.
                                    This action cannot be undone.
                                </p>

                                {drawResult && (
                                    <div className={`draw-result ${drawResult.success ? 'success' : 'error'}`}>
                                        {drawResult.success ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6" />
                                        )}
                                        <span>{drawResult.message}</span>
                                    </div>
                                )}

                                <button
                                    className="btn-primary btn-large"
                                    onClick={runLotteryDraw}
                                    disabled={running || (lotteryStats?.total_entries === 0)}
                                >
                                    {running ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Running Draw...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5" />
                                            Run Lottery Draw
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Winners List */}
                            <div className="admin-card">
                                <div className="card-header">
                                    <h2>
                                        <Trophy className="w-5 h-5" />
                                        Winners ({winners.length})
                                    </h2>
                                </div>
                                <div className="winners-list">
                                    {winners.length === 0 ? (
                                        <div className="empty-state">
                                            <Trophy className="w-10 h-10" />
                                            <p>No winners yet</p>
                                            <span className="text-muted">Run the lottery draw to select winners</span>
                                        </div>
                                    ) : (
                                        winners.map((winner, index) => (
                                            <div key={winner.id} className="winner-item">
                                                <div className="winner-rank">
                                                    #{index + 1}
                                                </div>
                                                <div className="winner-info">
                                                    <span className="winner-name">
                                                        {winner.user?.first_name} {winner.user?.last_name}
                                                    </span>
                                                    <span className="winner-email">{winner.user?.email}</span>
                                                </div>
                                                <div className="winner-status">
                                                    {winner.ticket ? (
                                                        <span className="status claimed">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Ticket Issued
                                                        </span>
                                                    ) : (
                                                        <span className="status pending">
                                                            <Clock className="w-4 h-4" />
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
