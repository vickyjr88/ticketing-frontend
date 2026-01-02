import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Calendar,
    Plus,
    Edit,
    Trash2,
    Eye,
    Search,
    Filter,
    ChevronDown,
    Clock,
    MapPin,
    Ticket,
    Gift,
    MoreVertical,
    AlertCircle,
    CheckCircle,
    XCircle,

    Bell,
    BarChart,
    Star
} from 'lucide-react';
import { api } from '../../services/api';
import Pagination from '../../components/Pagination';

export default function AdminEvents() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Waitlist state
    const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
    const [waitlistStats, setWaitlistStats] = useState(null);
    const [loadingWaitlist, setLoadingWaitlist] = useState(false);
    const [selectedEventForWaitlist, setSelectedEventForWaitlist] = useState(null);

    // Gate Stats state
    const [gateStatsModalOpen, setGateStatsModalOpen] = useState(false);
    const [gateStats, setGateStats] = useState(null);
    const [loadingGateStats, setLoadingGateStats] = useState(false);
    const [selectedEventForGate, setSelectedEventForGate] = useState(null);

    // Complimentary Ticket State
    const [complimentaryModalOpen, setComplimentaryModalOpen] = useState(false);
    const [selectedEventForComp, setSelectedEventForComp] = useState(null);
    const [compForm, setCompForm] = useState({ email: '', tierId: '', quantity: 1 });
    const [submittingComp, setSubmittingComp] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState(null);
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        loadEvents(1);
    }, [statusFilter]);

    const loadEvents = async (page = 1) => {
        try {
            setLoading(true);
            setCurrentPage(page);
            const status = statusFilter === 'all' ? undefined : statusFilter.toUpperCase();

            let response;
            if (user?.role === 'ADMIN') {
                // Admin sees ALL events regardless of creator or status
                response = await api.getAllEventsAdmin(page, ITEMS_PER_PAGE);
                // Client-side filter by status if needed (or pass status to API)
                let data = response.data || response;
                if (status && Array.isArray(data)) {
                    data = data.filter(e => e.status === status);
                }
                setEvents(Array.isArray(data) ? data : []);
                if (response.meta) {
                    setPaginationMeta(response.meta);
                }
            } else {
                // Regular users see only their own events
                const data = await api.getMyEvents();
                let filtered = data;
                // Client-side filter for my-events
                if (status && Array.isArray(filtered)) {
                    filtered = filtered.filter(e => e.status === status);
                }
                setEvents(filtered || []);
                setPaginationMeta(null); // No pagination for my-events endpoint
            }
        } catch (err) {
            console.error('Failed to load events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        loadEvents(page);
    };

    const handleDelete = async () => {
        if (!eventToDelete) return;

        try {
            setDeleting(true);
            await api.deleteEvent(eventToDelete.id);
            setEvents(events.filter(e => e.id !== eventToDelete.id));
            setDeleteModalOpen(false);
            setEventToDelete(null);
        } catch (err) {
            console.error('Failed to delete event:', err);
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleViewWaitlist = async (event) => {
        setSelectedEventForWaitlist(event);
        setWaitlistModalOpen(true);
        setWaitlistStats(null);
        setLoadingWaitlist(true);

        try {
            const stats = await api.getEventWaitlist(event.id);
            setWaitlistStats(stats);
        } catch (err) {
            console.error('Failed to load waitlist stats:', err);
            // Don't show error to user, just show empty or partial state
        } finally {
            setLoadingWaitlist(false);
        }
    };

    const handleOpenComp = (event) => {
        const tiers = event.ticket_tiers || [];
        setSelectedEventForComp(event);
        setCompForm({
            email: '',
            tierId: tiers.length > 0 ? tiers[0].id : '',
            quantity: 1
        });
        setComplimentaryModalOpen(true);
    };

    const handleSubmitComp = async (e) => {
        e.preventDefault();
        setSubmittingComp(true);
        try {
            await api.issueComplimentaryTicket({
                eventId: selectedEventForComp.id,
                tierId: compForm.tierId,
                email: compForm.email,
                quantity: Number(compForm.quantity)
            });
            setComplimentaryModalOpen(false);
            alert('Complimentary tickets issued successfully!');
        } catch (err) {
            console.error('Failed to issue tickets:', err);
            setError(err.message || 'Failed to issue tickets');
        } finally {
            setSubmittingComp(false);
        }
    };

    const handleFeatureEvent = async (event) => {
        if (!confirm(`Set "${event.title}" as the featured event?`)) return;
        try {
            await api.featureEvent(event.id);
            loadEvents(); // Refresh list to show updated status
        } catch (err) {
            console.error(err);
            alert('Failed to feature event');
        }
    };

    const handleViewGateStats = async (event) => {
        setSelectedEventForGate(event);
        setGateStatsModalOpen(true);
        setGateStats(null);
        setLoadingGateStats(true);

        try {
            const stats = await api.getGateStats(event.id);
            // Expected format: [{ gate: 'Gate A', count: 10 }, ...]
            setGateStats(stats);
        } catch (err) {
            console.error('Failed to load gate stats:', err);
        } finally {
            setLoadingGateStats(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-KE', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-KE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            PUBLISHED: { class: 'status-published', icon: CheckCircle, label: 'Published' },
            DRAFT: { class: 'status-draft', icon: Clock, label: 'Draft' },
            CANCELLED: { class: 'status-cancelled', icon: XCircle, label: 'Cancelled' },
            COMPLETED: { class: 'status-completed', icon: CheckCircle, label: 'Completed' },
            ARCHIVED: { class: 'status-archived', icon: AlertCircle, label: 'Archived' }
        };
        const badge = badges[status] || badges.DRAFT;
        const Icon = badge.icon;
        return (
            <span className={`event-status ${badge.class}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading events...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="page-title">
                    <Calendar className="w-8 h-8" />
                    <div>
                        <h1>Events Management</h1>
                        <p>Create and manage your events</p>
                    </div>
                </div>
                <Link to="/admin/events/new" className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Create Event
                </Link>
            </div>

            {error && (
                <div className="admin-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Filters */}
            <div className="admin-filters">
                <div className="search-box">
                    <Search className="w-5 h-5 search-icon" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                        {user?.role === 'ADMIN' && (
                            <option value="archived">Archived</option>
                        )}
                    </select>
                </div>
            </div>

            {/* Events Grid */}
            <div className="events-grid-admin">
                {filteredEvents.length === 0 ? (
                    <div className="empty-state-large">
                        <Calendar className="w-16 h-16" />
                        <h3>No events found</h3>
                        <p>Create your first event to get started</p>
                        <Link to="/admin/events/new" className="btn-primary">
                            <Plus className="w-4 h-4" />
                            Create Event
                        </Link>
                    </div>
                ) : (
                    filteredEvents.map((event) => (
                        <div key={event.id} className="event-card-admin">
                            <div className="event-image">
                                {event.banner_image_url ? (
                                    <img src={event.banner_image_url} alt={event.title} />
                                ) : (
                                    <div className="event-image-placeholder">
                                        <Calendar className="w-12 h-12" />
                                    </div>
                                )}
                                {getStatusBadge(event.status)}
                            </div>

                            <div className="event-content">
                                <h3 className="event-title">{event.title}</h3>

                                <div className="event-details">
                                    <div className="event-detail">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatDate(event.start_date)} at {formatTime(event.start_date)}</span>
                                    </div>
                                    <div className="event-detail">
                                        <MapPin className="w-4 h-4" />
                                        <span>{event.venue || 'Venue TBA'}</span>
                                    </div>
                                    <div className="event-detail">
                                        <Ticket className="w-4 h-4" />
                                        <span>{event.ticket_tiers?.length || 0} ticket tiers</span>
                                    </div>
                                </div>

                                {event.lottery_enabled && (
                                    <div className="event-badge lottery">
                                        Lottery Enabled
                                    </div>
                                )}
                            </div>

                            <div className="event-actions">
                                <Link to={`/events/${event.id}`} className="action-btn view" title="View Public Page">
                                    <Eye className="w-4 h-4" />
                                </Link>
                                <Link to={`/admin/events/${event.id}/edit`} className="action-btn edit" title="Edit Event">
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                    className="action-btn delete"
                                    title="Delete Event"
                                    onClick={() => {
                                        setEventToDelete(event);
                                        setDeleteModalOpen(true);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    className="action-btn view"
                                    title="View Waitlist"
                                    onClick={() => handleViewWaitlist(event)}
                                >
                                    <Bell className="w-4 h-4" />
                                </button>
                                <button
                                    className="action-btn view"
                                    title="View Gate Stats"
                                    onClick={() => handleViewGateStats(event)}
                                >
                                    <BarChart className="w-4 h-4" />
                                </button>
                                <button
                                    className="action-btn edit"
                                    title="Issue Complimentary Ticket"
                                    onClick={() => handleOpenComp(event)}
                                >
                                    <Gift className="w-4 h-4" />
                                </button>
                                <button
                                    className="action-btn"
                                    title={event.is_featured ? "Featured Event" : "Feature this Event"}
                                    onClick={() => handleFeatureEvent(event)}
                                >
                                    <Star className={`w-4 h-4 ${event.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {paginationMeta && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={paginationMeta.totalPages}
                    onPageChange={handlePageChange}
                    hasNextPage={paginationMeta.hasNextPage}
                    hasPrevPage={paginationMeta.hasPrevPage}
                    total={paginationMeta.total}
                    limit={ITEMS_PER_PAGE}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <h2>Delete Event</h2>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>"{eventToDelete?.title}"</strong>?</p>
                            <p className="text-warning">This action cannot be undone. All ticket tiers and associated data will be permanently deleted.</p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setDeleteModalOpen(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complimentary Ticket Modal */}
            {complimentaryModalOpen && selectedEventForComp && (
                <div className="modal-overlay" onClick={() => setComplimentaryModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <Gift className="w-8 h-8 text-purple-600" />
                            <div>
                                <h2>Issue Complimentary Ticket</h2>
                                <p className="text-sm text-gray-500">{selectedEventForComp.title}</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmitComp}>
                            <div className="modal-body space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-2 border rounded-md"
                                        value={compForm.email}
                                        onChange={(e) => setCompForm({ ...compForm, email: e.target.value })}
                                        placeholder="user@example.com"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">User must be registered.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Tier</label>
                                    <select
                                        required
                                        className="w-full p-2 border rounded-md"
                                        value={compForm.tierId}
                                        onChange={(e) => setCompForm({ ...compForm, tierId: e.target.value })}
                                    >
                                        <option value="">Select Tier</option>
                                        {selectedEventForComp.ticket_tiers?.map(tier => (
                                            <option key={tier.id} value={tier.id}>
                                                {tier.name} ({tier.remaining_quantity} left)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        required
                                        className="w-full p-2 border rounded-md"
                                        value={compForm.quantity}
                                        onChange={(e) => setCompForm({ ...compForm, quantity: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setComplimentaryModalOpen(false)}
                                    disabled={submittingComp}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submittingComp}
                                >
                                    {submittingComp ? 'Issuing...' : 'Issue Tickets'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Waitlist Modal */}
            {waitlistModalOpen && selectedEventForWaitlist && (
                <div className="modal-overlay" onClick={() => setWaitlistModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <Bell className="w-8 h-8 text-blue-600" />
                            <div>
                                <h2>Waitlist Stats</h2>
                                <p className="text-sm text-gray-500">{selectedEventForWaitlist.title}</p>
                            </div>
                        </div>
                        <div className="modal-body">
                            {loadingWaitlist ? (
                                <div className="loading-spinner"></div>
                            ) : !waitlistStats || waitlistStats.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <p>No users in waitlist yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 mb-4">
                                        These users have requested to be notified when tickets become available.
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="pb-2 font-semibold text-gray-700">Ticket Tier</th>
                                                    <th className="pb-2 font-semibold text-gray-700 text-right">Waitlist Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {waitlistStats.map((stat, index) => {
                                                    // Find tier name from event tiers
                                                    const tier = selectedEventForWaitlist.ticket_tiers?.find(t => t.id === stat.tierId);
                                                    return (
                                                        <tr key={stat.tierId || index} className="border-b border-gray-100 last:border-0">
                                                            <td className="py-3 text-gray-800">
                                                                {tier ? tier.name : 'Unknown Tier'}
                                                            </td>
                                                            <td className="py-3 text-right font-bold text-blue-600">
                                                                {stat.count}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setWaitlistModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Gate Stats Modal */}
            {
                gateStatsModalOpen && selectedEventForGate && (
                    <div className="modal-overlay" onClick={() => setGateStatsModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <BarChart className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h2>Gate Ingress Stats</h2>
                                    <p className="text-sm text-gray-500">{selectedEventForGate.title}</p>
                                </div>
                            </div>
                            <div className="modal-body">
                                {loadingGateStats ? (
                                    <div className="loading-spinner"></div>
                                ) : !gateStats || gateStats.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500">
                                        <p>No ingress activity yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 mb-4">
                                            Real-time check-in counts by gate.
                                        </p>
                                        <div className="space-y-3">
                                            {gateStats.map((stat, index) => {
                                                const total = gateStats.reduce((acc, curr) => acc + parseInt(curr.count), 0);
                                                const percentage = total > 0 ? Math.round((parseInt(stat.count) / total) * 100) : 0;

                                                return (
                                                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-semibold text-gray-800">{stat.gate}</span>
                                                            <span className="font-bold text-indigo-600">{stat.count} check-ins</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-indigo-600 h-2.5 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 text-right mt-1">{percentage}% of total</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                                            <p className="font-bold text-gray-800">
                                                Total Check-ins: {gateStats.reduce((acc, curr) => acc + parseInt(curr.count), 0)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setGateStatsModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
