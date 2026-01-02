import { useState, useEffect } from 'react';
import {
    Mail,
    Phone,
    Calendar,
    User,
    Tag,
    MessageSquare,
    CheckCircle,
    Archive,
    Trash2,
    Send,
    Filter,
    RefreshCw,
    Eye,
    X,
    Clock,
    AlertCircle,
    Inbox,
    ChevronDown,
    Search
} from 'lucide-react';
import api from '../../services/api';

const STATUS_COLORS = {
    NEW: { bg: '#fef3c7', color: '#92400e', label: 'New' },
    READ: { bg: '#dbeafe', color: '#1e40af', label: 'Read' },
    REPLIED: { bg: '#dcfce7', color: '#166534', label: 'Replied' },
    ARCHIVED: { bg: '#f3f4f6', color: '#4b5563', label: 'Archived' },
};

const SUBJECT_LABELS = {
    GENERAL: 'General Inquiry',
    SUPPORT: 'Technical Support',
    TICKETING: 'Ticketing Issues',
    EVENTS: 'Event Information',
    PARTNERSHIP: 'Partnership',
    REFUND: 'Refund Request',
    OTHER: 'Other',
};

function AdminContacts() {
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [filter, setFilter] = useState({ status: '', subject: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    useEffect(() => {
        loadMessages();
        loadStats();
    }, [filter, pagination.page]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const result = await api.getContactMessages({
                ...filter,
                page: pagination.page,
                limit: 20,
            });
            setMessages(result.messages || []);
            if (result.meta) {
                setPagination(prev => ({
                    ...prev,
                    totalPages: result.meta.totalPages || 1,
                }));
            }
        } catch (err) {
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await api.getContactStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const handleViewMessage = async (message) => {
        setSelectedMessage(message);
        if (message.status === 'NEW') {
            try {
                await api.getContactMessage(message.id); // This marks as read
                loadMessages();
                loadStats();
            } catch (err) {
                console.error('Error marking as read:', err);
            }
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || replyText.length < 10) {
            setError('Reply must be at least 10 characters');
            return;
        }

        setReplying(true);
        try {
            await api.replyToContactMessage(selectedMessage.id, replyText);
            setSuccess('Reply sent successfully!');
            setShowReplyModal(false);
            setReplyText('');
            setSelectedMessage(null);
            loadMessages();
            loadStats();
        } catch (err) {
            setError('Failed to send reply');
        } finally {
            setReplying(false);
        }
    };

    const handleArchive = async (id) => {
        try {
            await api.archiveContactMessage(id);
            setSuccess('Message archived');
            setSelectedMessage(null);
            loadMessages();
            loadStats();
        } catch (err) {
            setError('Failed to archive message');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this message? This cannot be undone.')) {
            return;
        }
        try {
            await api.deleteContactMessage(id);
            setSuccess('Message deleted');
            setSelectedMessage(null);
            loadMessages();
            loadStats();
        } catch (err) {
            setError('Failed to delete message');
        }
    };

    const filteredMessages = messages.filter(msg => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            msg.name.toLowerCase().includes(query) ||
            msg.email.toLowerCase().includes(query) ||
            msg.message.toLowerCase().includes(query)
        );
    });

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    return (
        <div className="admin-content">
            <div className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-welcome">
                        <h1>Contact Messages</h1>
                        <p>Manage customer inquiries and respond to messages</p>
                    </div>
                    <button onClick={() => { loadMessages(); loadStats(); }} className="btn-secondary">
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {success && (
                <div className="admin-success">
                    <CheckCircle size={20} />
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)}><X size={16} /></button>
                </div>
            )}
            {error && (
                <div className="admin-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={16} /></button>
                </div>
            )}

            {/* Stats */}
            {stats && (
                <div className="contact-stats-grid">
                    <div className="contact-stat-card total">
                        <Inbox size={24} />
                        <div>
                            <span className="stat-number">{stats.total || 0}</span>
                            <span className="stat-label">Total Messages</span>
                        </div>
                    </div>
                    <div className="contact-stat-card new">
                        <Mail size={24} />
                        <div>
                            <span className="stat-number">{stats.new || 0}</span>
                            <span className="stat-label">New Messages</span>
                        </div>
                    </div>
                    <div className="contact-stat-card read">
                        <Eye size={24} />
                        <div>
                            <span className="stat-number">{stats.byStatus?.READ || 0}</span>
                            <span className="stat-label">Read</span>
                        </div>
                    </div>
                    <div className="contact-stat-card replied">
                        <CheckCircle size={24} />
                        <div>
                            <span className="stat-number">{stats.byStatus?.REPLIED || 0}</span>
                            <span className="stat-label">Replied</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="contact-filters">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={18} />
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="">All Status</option>
                        <option value="NEW">New</option>
                        <option value="READ">Read</option>
                        <option value="REPLIED">Replied</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                    <select
                        value={filter.subject}
                        onChange={(e) => setFilter(prev => ({ ...prev, subject: e.target.value }))}
                    >
                        <option value="">All Subjects</option>
                        {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Messages List */}
            <div className="contact-messages-container">
                {loading ? (
                    <div className="admin-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading messages...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="empty-state-centered">
                        <Inbox size={48} />
                        <h3>No Messages</h3>
                        <p>There are no messages matching your filters.</p>
                    </div>
                ) : (
                    <div className="messages-list">
                        {filteredMessages.map(msg => (
                            <div
                                key={msg.id}
                                className={`message-card ${msg.status === 'NEW' ? 'unread' : ''} ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
                                onClick={() => handleViewMessage(msg)}
                            >
                                <div className="message-avatar">
                                    <User size={20} />
                                </div>
                                <div className="message-content">
                                    <div className="message-header">
                                        <span className="message-name">{msg.name}</span>
                                        <span
                                            className="status-badge"
                                            style={{
                                                backgroundColor: STATUS_COLORS[msg.status].bg,
                                                color: STATUS_COLORS[msg.status].color,
                                            }}
                                        >
                                            {STATUS_COLORS[msg.status].label}
                                        </span>
                                    </div>
                                    <div className="message-email">{msg.email}</div>
                                    <div className="message-subject">
                                        <Tag size={14} />
                                        {SUBJECT_LABELS[msg.subject] || msg.subject}
                                    </div>
                                    <div className="message-preview">{msg.message.substring(0, 100)}...</div>
                                    <div className="message-date">
                                        <Clock size={14} />
                                        {formatDate(msg.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Message Detail Panel */}
                {selectedMessage && (
                    <div className="message-detail-panel">
                        <div className="detail-header">
                            <h3>Message Details</h3>
                            <button className="close-btn" onClick={() => setSelectedMessage(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="detail-content">
                            <div className="detail-row">
                                <User size={18} />
                                <div>
                                    <label>From</label>
                                    <p>{selectedMessage.name}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <Mail size={18} />
                                <div>
                                    <label>Email</label>
                                    <p><a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></p>
                                </div>
                            </div>

                            {selectedMessage.phone && (
                                <div className="detail-row">
                                    <Phone size={18} />
                                    <div>
                                        <label>Phone</label>
                                        <p>{selectedMessage.phone}</p>
                                    </div>
                                </div>
                            )}

                            <div className="detail-row">
                                <Tag size={18} />
                                <div>
                                    <label>Subject</label>
                                    <p>{SUBJECT_LABELS[selectedMessage.subject] || selectedMessage.subject}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <Calendar size={18} />
                                <div>
                                    <label>Received</label>
                                    <p>{formatDate(selectedMessage.created_at)}</p>
                                </div>
                            </div>

                            <div className="message-body">
                                <label>Message</label>
                                <div className="message-text">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {selectedMessage.replied_at && (
                                <div className="replied-info">
                                    <CheckCircle size={16} />
                                    <span>Replied on {formatDate(selectedMessage.replied_at)}</span>
                                </div>
                            )}
                        </div>

                        <div className="detail-actions">
                            {selectedMessage.status !== 'REPLIED' && (
                                <button
                                    className="btn-primary"
                                    onClick={() => setShowReplyModal(true)}
                                >
                                    <Send size={18} />
                                    Reply
                                </button>
                            )}
                            {selectedMessage.status !== 'ARCHIVED' && (
                                <button
                                    className="btn-secondary"
                                    onClick={() => handleArchive(selectedMessage.id)}
                                >
                                    <Archive size={18} />
                                    Archive
                                </button>
                            )}
                            <button
                                className="btn-danger"
                                onClick={() => handleDelete(selectedMessage.id)}
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reply Modal */}
            {showReplyModal && (
                <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reply to {selectedMessage?.name}</h2>
                            <button className="close-btn" onClick={() => setShowReplyModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="original-message">
                                <label>Original Message:</label>
                                <p>{selectedMessage?.message}</p>
                            </div>
                            <div className="form-group">
                                <label>Your Reply *</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply here..."
                                    rows={8}
                                />
                                <span className="form-hint">
                                    This will be sent to {selectedMessage?.email}
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowReplyModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleReply}
                                disabled={replying || replyText.length < 10}
                            >
                                {replying ? 'Sending...' : 'Send Reply'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminContacts;
