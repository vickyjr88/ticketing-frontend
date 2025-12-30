import { useState, useEffect, useRef } from 'react';
import {
    Tag,
    Plus,
    Edit,
    Trash2,
    Search,
    AlertCircle,
    CheckCircle,
    XCircle,
    Percent,
    DollarSign,
    Calendar,
    Users,
    BarChart,
    Copy,
    ChevronDown,
    X,
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminPromoCodes() {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [promoStats, setPromoStats] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        event_id: '',
        usage_limit: '',
        per_user_limit: '1',
        min_order_amount: '',
        max_discount_amount: '',
        valid_from: '',
        valid_until: '',
        is_active: true,
        product_ids: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    // Events and Products for autocomplete
    const [events, setEvents] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]); // Array of product objects
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProductDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        loadPromoCodes();
        loadEventsAndProducts();
    }, [showInactive]);

    const loadEventsAndProducts = async () => {
        try {
            const [eventsData, productsData] = await Promise.all([
                api.getAllEventsAdmin(),
                api.getProducts(), // Fetch all products
            ]);
            setEvents(eventsData || []);
            setProducts(productsData || []);
        } catch (err) {
            console.error('Failed to load events/products:', err);
        }
    };

    const loadPromoCodes = async () => {
        try {
            setLoading(true);
            const data = await api.getPromoCodes(showInactive);
            setPromoCodes(data);
        } catch (err) {
            console.error('Failed to load promo codes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = {
                ...formData,
                discount_value: Number(formData.discount_value),
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
                per_user_limit: formData.per_user_limit ? Number(formData.per_user_limit) : null,
                min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : null,
                max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
                event_id: formData.event_id || null,
                valid_from: formData.valid_from || null,
                valid_until: formData.valid_until || null,
                product_ids: typeof formData.product_ids === 'string' ? formData.product_ids.split(',').map(s => s.trim()).filter(Boolean) : [],
            };
            await api.createPromoCode(payload);
            setShowCreateModal(false);
            resetForm();
            loadPromoCodes();
        } catch (err) {
            alert(err.message || 'Failed to create promo code');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = {
                ...formData,
                discount_value: Number(formData.discount_value),
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
                per_user_limit: formData.per_user_limit ? Number(formData.per_user_limit) : null,
                min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : null,
                max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
                event_id: formData.event_id || null,
                valid_from: formData.valid_from || null,
                valid_until: formData.valid_until || null,
                product_ids: typeof formData.product_ids === 'string' ? formData.product_ids.split(',').map(s => s.trim()).filter(Boolean) : [],
            };
            await api.updatePromoCode(selectedPromo.id, payload);
            setShowEditModal(false);
            resetForm();
            loadPromoCodes();
        } catch (err) {
            alert(err.message || 'Failed to update promo code');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            await api.deletePromoCode(selectedPromo.id);
            setShowDeleteModal(false);
            setSelectedPromo(null);
            loadPromoCodes();
        } catch (err) {
            alert(err.message || 'Failed to delete promo code');
        } finally {
            setFormLoading(false);
        }
    };

    const handleViewStats = async (promo) => {
        setSelectedPromo(promo);
        setShowStatsModal(true);
        try {
            const stats = await api.getPromoCodeStats(promo.id);
            setPromoStats(stats);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const openEditModal = (promo) => {
        setSelectedPromo(promo);
        // Find product objects from IDs
        const promoProductIds = promo.product_ids || [];
        const matchedProducts = products.filter(p => promoProductIds.includes(p.id));
        setSelectedProducts(matchedProducts);
        setFormData({
            code: promo.code,
            description: promo.description || '',
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            event_id: promo.event_id || '',
            usage_limit: promo.usage_limit || '',
            per_user_limit: promo.per_user_limit || '',
            min_order_amount: promo.min_order_amount || '',
            max_discount_amount: promo.max_discount_amount || '',
            valid_from: promo.valid_from ? promo.valid_from.slice(0, 16) : '',
            valid_until: promo.valid_until ? promo.valid_until.slice(0, 16) : '',
            is_active: promo.is_active,
            product_ids: (promo.product_ids || []).join(', '),
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setSelectedProducts([]);
        setProductSearchQuery('');
        setShowProductDropdown(false);
        setFormData({
            code: '',
            description: '',
            discount_type: 'PERCENTAGE',
            discount_value: '',
            event_id: '',
            usage_limit: '',
            per_user_limit: '1',
            min_order_amount: '',
            max_discount_amount: '',
            valid_from: '',
            valid_until: '',
            is_active: true,
            product_ids: '',
        });
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        // Could add a toast notification here
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (promo) => {
        if (!promo.is_active) {
            return <span className="status-badge inactive"><XCircle className="w-3 h-3" /> Inactive</span>;
        }
        const now = new Date();
        if (promo.valid_until && new Date(promo.valid_until) < now) {
            return <span className="status-badge expired"><AlertCircle className="w-3 h-3" /> Expired</span>;
        }
        if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
            return <span className="status-badge exhausted"><XCircle className="w-3 h-3" /> Exhausted</span>;
        }
        return <span className="status-badge active"><CheckCircle className="w-3 h-3" /> Active</span>;
    };

    const filteredPromoCodes = promoCodes.filter(promo =>
        promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading promo codes...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="page-title">
                    <Tag className="w-8 h-8" />
                    <div>
                        <h1>Promo Codes</h1>
                        <p>Create and manage promotional discounts</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                    <Plus className="w-4 h-4" />
                    Create Promo Code
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
                        placeholder="Search promo codes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                    />
                    Show inactive codes
                </label>
            </div>

            {/* Promo Codes Table */}
            <div className="admin-card">
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Usage</th>
                                <th>Validity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPromoCodes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        No promo codes found
                                    </td>
                                </tr>
                            ) : (
                                filteredPromoCodes.map((promo) => (
                                    <tr key={promo.id}>
                                        <td>
                                            <div className="promo-code-cell">
                                                <code className="promo-code">{promo.code}</code>
                                                <button
                                                    className="copy-btn"
                                                    onClick={() => copyToClipboard(promo.code)}
                                                    title="Copy code"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {promo.description && (
                                                <span className="promo-description">{promo.description}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="discount-cell">
                                                {promo.discount_type === 'PERCENTAGE' ? (
                                                    <>
                                                        <Percent className="w-4 h-4 text-green-600" />
                                                        <span>{promo.discount_value}% off</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                                        <span>KES {promo.discount_value} off</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="usage-cell">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    {promo.usage_count} / {promo.usage_limit || '∞'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="validity-cell">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {promo.valid_until
                                                        ? `Until ${formatDate(promo.valid_until)}`
                                                        : 'No expiry'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(promo)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn view"
                                                    title="View Stats"
                                                    onClick={() => handleViewStats(promo)}
                                                >
                                                    <BarChart className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="action-btn edit"
                                                    title="Edit"
                                                    onClick={() => openEditModal(promo)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    title="Delete"
                                                    onClick={() => { setSelectedPromo(promo); setShowDeleteModal(true); }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <Tag className="w-6 h-6 text-blue-600" />
                            <h2>{showCreateModal ? 'Create Promo Code' : 'Edit Promo Code'}</h2>
                        </div>
                        <form onSubmit={showCreateModal ? handleCreate : handleUpdate}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Promo Code *</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="e.g., EARLY10"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="e.g., Early bird 10% discount"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount Type *</label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                            required
                                        >
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FIXED_AMOUNT">Fixed Amount (KES)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Discount Value *</label>
                                        <input
                                            type="number"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                            placeholder={formData.discount_type === 'PERCENTAGE' ? '10' : '500'}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Event</label>
                                        <select
                                            value={formData.event_id}
                                            onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                                            className="form-select"
                                        >
                                            <option value="">All Events (No Restriction)</option>
                                            {events.map(event => (
                                                <option key={event.id} value={event.id}>
                                                    {event.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Products</label>
                                        <div className="multi-select-container" ref={dropdownRef}>
                                            <div
                                                className="multi-select-trigger"
                                                onClick={() => setShowProductDropdown(!showProductDropdown)}
                                            >
                                                {selectedProducts.length === 0 ? (
                                                    <span className="placeholder">Select products (optional)</span>
                                                ) : (
                                                    <div className="selected-tags">
                                                        {selectedProducts.map(product => (
                                                            <span key={product.id} className="selected-tag">
                                                                {product.name}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newSelected = selectedProducts.filter(p => p.id !== product.id);
                                                                        setSelectedProducts(newSelected);
                                                                        setFormData({ ...formData, product_ids: newSelected.map(p => p.id).join(', ') });
                                                                    }}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <ChevronDown className="w-4 h-4 chevron" />
                                            </div>
                                            {showProductDropdown && (
                                                <div className="multi-select-dropdown">
                                                    <input
                                                        type="text"
                                                        placeholder="Search products..."
                                                        value={productSearchQuery}
                                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                                        className="dropdown-search"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="dropdown-options">
                                                        {products
                                                            .filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                                                            .map(product => (
                                                                <label key={product.id} className="dropdown-option">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedProducts.some(p => p.id === product.id)}
                                                                        onChange={(e) => {
                                                                            let newSelected;
                                                                            if (e.target.checked) {
                                                                                newSelected = [...selectedProducts, product];
                                                                            } else {
                                                                                newSelected = selectedProducts.filter(p => p.id !== product.id);
                                                                            }
                                                                            setSelectedProducts(newSelected);
                                                                            setFormData({ ...formData, product_ids: newSelected.map(p => p.id).join(', ') });
                                                                        }}
                                                                    />
                                                                    <span>{product.name}</span>
                                                                    <span className="product-price">KES {Number(product.price).toLocaleString()}</span>
                                                                </label>
                                                            ))}
                                                        {products.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase())).length === 0 && (
                                                            <div className="no-results">No products found</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Usage Limit</label>
                                        <input
                                            type="number"
                                            value={formData.usage_limit}
                                            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                            placeholder="e.g., 50 (first 50 users)"
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Per-User Limit</label>
                                        <input
                                            type="number"
                                            value={formData.per_user_limit}
                                            onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
                                            placeholder="1"
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Minimum Order Amount (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.min_order_amount}
                                            onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                            placeholder="e.g., 1000"
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Max Discount Cap (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.max_discount_amount}
                                            onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                            placeholder="e.g., 5000 (for % types)"
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Valid From</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.valid_from}
                                            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Valid Until (Expiry)</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.valid_until}
                                            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            />
                                            Code is active
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={formLoading}>
                                    {formLoading ? 'Saving...' : (showCreateModal ? 'Create Code' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }

            {/* Stats Modal */}
            {
                showStatsModal && selectedPromo && (
                    <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <BarChart className="w-6 h-6 text-indigo-600" />
                                <div>
                                    <h2>Promo Code Stats</h2>
                                    <code className="promo-code">{selectedPromo.code}</code>
                                </div>
                            </div>
                            <div className="modal-body">
                                {promoStats ? (
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <span className="stat-label">Total Uses</span>
                                            <span className="stat-value">{promoStats.total_usages}</span>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-label">Remaining Uses</span>
                                            <span className="stat-value">{promoStats.remaining_uses}</span>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-label">Total Discount Given</span>
                                            <span className="stat-value">KES {promoStats.total_discount_given?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="loading-spinner"></div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowStatsModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && selectedPromo && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <AlertCircle className="w-12 h-12 text-red-500" />
                                <h2>Delete Promo Code</h2>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>{selectedPromo.code}</strong>?</p>
                                <p className="text-warning">This action cannot be undone.</p>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={formLoading}>
                                    Cancel
                                </button>
                                <button className="btn-danger" onClick={handleDelete} disabled={formLoading}>
                                    {formLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .promo-code-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .promo-code {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 14px;
                }
                .promo-description {
                    display: block;
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }
                .copy-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #9ca3af;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .copy-btn:hover {
                    background: #f3f4f6;
                    color: #374151;
                }
                .discount-cell, .usage-cell, .validity-cell {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #4b5563;
                }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .status-badge.active {
                    background: #d1fae5;
                    color: #059669;
                }
                .status-badge.inactive {
                    background: #f3f4f6;
                    color: #6b7280;
                }
                .status-badge.expired {
                    background: #fef3c7;
                    color: #d97706;
                }
                .status-badge.exhausted {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }
                .form-group.full-width {
                    grid-column: span 2;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }
                .stat-card {
                    background: #f9fafb;
                    padding: 16px;
                    border-radius: 8px;
                    text-align: center;
                }
                .stat-label {
                    display: block;
                    font-size: 12px;
                    color: #6b7280;
                    margin-bottom: 4px;
                }
                .stat-value {
                    display: block;
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                }
                .modal-large {
                    max-width: 600px;
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                .checkbox-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                }
                
                /* Multi-select styles */
                .multi-select-container {
                    position: relative;
                }
                .multi-select-trigger {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-height: 42px;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .multi-select-trigger:hover {
                    border-color: #9ca3af;
                }
                .multi-select-trigger .placeholder {
                    color: #9ca3af;
                }
                .multi-select-trigger .chevron {
                    flex-shrink: 0;
                    color: #6b7280;
                }
                .selected-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    flex: 1;
                }
                .selected-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .selected-tag button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    border-radius: 50%;
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    color: white;
                    transition: background 0.2s;
                }
                .selected-tag button:hover {
                    background: rgba(255,255,255,0.4);
                }
                .multi-select-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    margin-top: 4px;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    z-index: 1000;
                    max-height: 300px;
                    overflow: hidden;
                }
                .dropdown-search {
                    width: 100%;
                    padding: 10px 12px;
                    border: none;
                    border-bottom: 1px solid #e5e7eb;
                    outline: none;
                    font-size: 14px;
                }
                .dropdown-search:focus {
                    background: #f9fafb;
                }
                .dropdown-options {
                    max-height: 220px;
                    overflow-y: auto;
                }
                .dropdown-option {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .dropdown-option:hover {
                    background: #f3f4f6;
                }
                .dropdown-option input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }
                .dropdown-option span:first-of-type {
                    flex: 1;
                }
                .dropdown-option .product-price {
                    font-size: 12px;
                    color: #6b7280;
                }
                .no-results {
                    padding: 16px;
                    text-align: center;
                    color: #9ca3af;
                    font-size: 14px;
                }
                .form-select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: white;
                    font-size: 14px;
                    cursor: pointer;
                }
                .form-select:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
            `}</style>
        </div >
    );
}
