import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingCart,
    Search,
    Filter,
    Eye,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Calendar,
    User,
    Ticket
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    useEffect(() => {
        loadOrders();
    }, [currentPage, statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 15,
                status: statusFilter === 'all' ? undefined : statusFilter.toUpperCase()
            };
            const data = await api.getAdminOrders(params);
            setOrders(data?.orders || data || []);
            setTotalPages(data?.totalPages || 1);
        } catch (err) {
            console.error('Failed to load orders:', err);
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { class: 'status-pending', icon: Clock, color: 'yellow' },
            PAID: { class: 'status-paid', icon: CheckCircle, color: 'green' },
            FAILED: { class: 'status-failed', icon: XCircle, color: 'red' },
            CANCELLED: { class: 'status-cancelled', icon: XCircle, color: 'gray' },
            REFUNDED: { class: 'status-refunded', icon: AlertCircle, color: 'orange' }
        };
        const badge = badges[status] || badges.PENDING;
        const Icon = badge.icon;
        return (
            <span className={`order-status-badge ${badge.class}`}>
                <Icon className="w-3 h-3" />
                {status}
            </span>
        );
    };

    const filteredOrders = orders.filter(order => {
        const searchLower = searchQuery.toLowerCase();
        return (
            order.id?.toLowerCase().includes(searchLower) ||
            order.user?.email?.toLowerCase().includes(searchLower) ||
            order.user?.first_name?.toLowerCase().includes(searchLower) ||
            order.event?.title?.toLowerCase().includes(searchLower)
        );
    });

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    if (loading && orders.length === 0) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="page-title">
                    <ShoppingCart className="w-8 h-8" />
                    <div>
                        <h1>Orders Management</h1>
                        <p>View and manage all orders</p>
                    </div>
                </div>
                <button className="btn-secondary">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
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
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Event</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-cell">
                                    <div className="empty-state">
                                        <ShoppingCart className="w-12 h-12" />
                                        <p>No orders found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="order-id">
                                        <code>#{order.id?.slice(0, 8)}</code>
                                    </td>
                                    <td className="customer-cell">
                                        <div className="customer-info">
                                            <span className="customer-name">
                                                {order.user?.first_name} {order.user?.last_name}
                                            </span>
                                            <span className="customer-email">{order.user?.email}</span>
                                        </div>
                                    </td>
                                    <td className="event-cell">
                                        <span className="event-name">{order.event?.title || 'N/A'}</span>
                                    </td>
                                    <td className="items-cell">
                                        <span className="items-count">
                                            <Ticket className="w-4 h-4" />
                                            {order.tickets?.length || order.quantity || 0}
                                        </span>
                                    </td>
                                    <td className="amount-cell">
                                        <span className="amount">{formatCurrency(order.total_amount)}</span>
                                    </td>
                                    <td className="status-cell">
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className="date-cell">
                                        <span className="date">{formatDate(order.created_at)}</span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn view"
                                            onClick={() => viewOrderDetails(order)}
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>
                <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Order Details Modal */}
            {detailsModalOpen && selectedOrder && (
                <div className="modal-overlay" onClick={() => setDetailsModalOpen(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details</h2>
                            <span className="order-id-display">#{selectedOrder.id?.slice(0, 8)}</span>
                        </div>
                        <div className="modal-body">
                            <div className="order-details-grid">
                                <div className="detail-section">
                                    <h3>
                                        <User className="w-4 h-4" />
                                        Customer Information
                                    </h3>
                                    <div className="detail-item">
                                        <span className="label">Name:</span>
                                        <span className="value">
                                            {selectedOrder.user?.first_name} {selectedOrder.user?.last_name}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Email:</span>
                                        <span className="value">{selectedOrder.user?.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Phone:</span>
                                        <span className="value">{selectedOrder.user?.phone_number || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>
                                        <Calendar className="w-4 h-4" />
                                        Event Details
                                    </h3>
                                    <div className="detail-item">
                                        <span className="label">Event:</span>
                                        <span className="value">{selectedOrder.event?.title}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Tier:</span>
                                        <span className="value">{selectedOrder.tier?.name || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Quantity:</span>
                                        <span className="value">{selectedOrder.quantity || selectedOrder.tickets?.length || 0}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>
                                        <ShoppingCart className="w-4 h-4" />
                                        Order Summary
                                    </h3>
                                    <div className="detail-item">
                                        <span className="label">Status:</span>
                                        {getStatusBadge(selectedOrder.status)}
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Total:</span>
                                        <span className="value amount-large">{formatCurrency(selectedOrder.total_amount)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Created:</span>
                                        <span className="value">{formatDate(selectedOrder.created_at)}</span>
                                    </div>
                                    {selectedOrder.payment_method && (
                                        <div className="detail-item">
                                            <span className="label">Payment:</span>
                                            <span className="value">{selectedOrder.payment_method}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedOrder.tickets && selectedOrder.tickets.length > 0 && (
                                <div className="tickets-section">
                                    <h3>
                                        <Ticket className="w-4 h-4" />
                                        Tickets ({selectedOrder.tickets.length})
                                    </h3>
                                    <div className="tickets-list-modal">
                                        {selectedOrder.tickets.map((ticket) => (
                                            <div key={ticket.id} className="ticket-item-modal">
                                                <span className="ticket-code">{ticket.ticket_code}</span>
                                                <span className={`ticket-status status-${ticket.status?.toLowerCase()}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setDetailsModalOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
