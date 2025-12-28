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
    MoreVertical,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminEvents() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadEvents();
    }, [statusFilter]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const status = statusFilter === 'all' ? undefined : statusFilter.toUpperCase();

            let data;
            if (user?.role === 'ADMIN') {
                // Admin sees ALL events regardless of creator or status
                data = await api.getAllEventsAdmin();
                // Client-side filter by status if needed
                if (status) {
                    data = data.filter(e => e.status === status);
                }
            } else {
                // Regular users see only their own events
                data = await api.getMyEvents();
                // Client-side filter for my-events
                if (status) {
                    data = data.filter(e => e.status === status);
                }
            }
            setEvents(data);
        } catch (err) {
            console.error('Failed to load events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                            </div>
                        </div>
                    ))
                )}
            </div>

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
        </div>
    );
}
