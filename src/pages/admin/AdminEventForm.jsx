import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Save,
    Image,
    Clock,
    MapPin,
    FileText,
    Gift,
    Ticket,
    Plus,
    Trash2,
    Edit,
    AlertCircle,
    Check,
    Loader,
    ShoppingBag,
    Users,
    TrendingUp,
    BarChart3,
    X,
    UserMinus
} from 'lucide-react';

import { api } from '../../services/api';
import ImagePicker from '../../components/ImagePicker';
import { useAuth } from '../../context/AuthContext';

export default function AdminEventForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        venue: '',
        start_date: '',
        end_date: '',
        status: 'DRAFT',
        banner_image_url: '',
        lottery_enabled: false,
        lottery_draw_date: ''
    });

    const [editingTierId, setEditingTierId] = useState(null);
    const [tierToDelete, setTierToDelete] = useState(null);

    // Products State
    const [products, setProducts] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        type: 'OTHER',
        active: true
    });

    const [ticketTiers, setTicketTiers] = useState([]);
    const [showTierForm, setShowTierForm] = useState(false);
    const [newTier, setNewTier] = useState({
        name: '',
        category: 'REGULAR',
        price: '',
        tickets_per_unit: 1,
        initial_quantity: '',
        max_qty_per_order: 10,
        sales_start: '',
        sales_end: ''
    });
    // Tabs State
    const [activeTab, setActiveTab] = useState('details');
    const [lotteryEntries, setLotteryEntries] = useState([]);
    const [loadingLottery, setLoadingLottery] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    useEffect(() => {
        if (activeTab === 'lottery' && id) fetchLottery();
        if (activeTab === 'analytics' && id) fetchAnalytics();
    }, [activeTab, id]);

    const fetchLottery = async () => {
        setLoadingLottery(true);
        try {
            const data = await api.getEventLotteryEntries(id);
            setLotteryEntries(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLottery(false);
        }
    };

    const handleRemoveLotteryEntry = async (entryId) => {
        if (!confirm('Are you sure you want to remove this user from the lottery?')) return;
        try {
            await api.removeLotteryEntry(entryId);
            fetchLottery();
        } catch (err) {
            alert('Failed to remove entry');
        }
    };

    const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
            const [sales, checkins] = await Promise.all([
                api.getSalesTimeSeries(30, id),
                api.getCheckInDistribution(id)
            ]);
            setAnalyticsData({ sales, checkins });
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    // Handle image upload
    // Handle image upload
    const handleImageUpload = async (file, eventId) => {
        try {
            const imageUrl = await api.uploadEventImage(eventId, file);
            setFormData(prev => ({ ...prev, banner_image_url: imageUrl }));
            setSuccess('Image uploaded successfully!');
            return imageUrl;
        } catch (err) {
            throw new Error(err.message || 'Failed to upload image');
        }
    };

    useEffect(() => {
        if (isEditing) {
            loadEvent();
        }
    }, [id]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const event = await api.getEvent(id);

            // Format dates for input fields
            const formatDateTime = (date) => {
                if (!date) return '';
                return new Date(date).toISOString().slice(0, 16);
            };

            setFormData({
                title: event.title || '',
                description: event.description || '',
                venue: event.venue || '',
                start_date: formatDateTime(event.start_date),
                end_date: formatDateTime(event.end_date),
                status: event.status || 'DRAFT',
                banner_image_url: event.banner_image_url || '',
                lottery_enabled: event.lottery_enabled || false,
                lottery_draw_date: formatDateTime(event.lottery_draw_date)
            });

            if (event.ticket_tiers) {
                setTicketTiers(event.ticket_tiers);
            }

            if (event.products) {
                setProducts(event.products);
            }
        } catch (err) {
            console.error('Failed to load event:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTierChange = (e) => {
        const { name, value, type } = e.target;
        setNewTier(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || '' : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            setSaving(true);

            const eventData = {
                ...formData,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: new Date(formData.end_date).toISOString(),
                lottery_draw_date: formData.lottery_enabled && formData.lottery_draw_date
                    ? new Date(formData.lottery_draw_date).toISOString()
                    : null
            };

            if (isEditing) {
                await api.updateEvent(id, eventData);
                setSuccess('Event updated successfully!');
            } else {
                const newEvent = await api.createEvent(eventData);
                setSuccess('Event created successfully!');
                setTimeout(() => {
                    navigate(`/admin/events/${newEvent.id}/edit`);
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to save event:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const formatDateTimeForInput = (isoString) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toISOString().slice(0, 16);
        } catch (e) {
            return '';
        }
    };

    const handleEditTier = (tier) => {
        setNewTier({
            name: tier.name,
            category: tier.category,
            price: tier.price,
            tickets_per_unit: tier.tickets_per_unit,
            initial_quantity: tier.initial_quantity,
            max_qty_per_order: tier.max_qty_per_order,
            sales_start: formatDateTimeForInput(tier.sales_start),
            sales_end: formatDateTimeForInput(tier.sales_end)
        });
        setEditingTierId(tier.id);
        setShowTierForm(true);
        // Scroll to form
        const formElement = document.querySelector('.tier-form');
        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSaveTier = async () => {
        if (!id) {
            setError('Please save the event first before adding ticket tiers.');
            return;
        }

        try {
            setSaving(true);
            const tierData = {
                ...newTier,
                price: parseFloat(newTier.price),
                initial_quantity: parseInt(newTier.initial_quantity),
                tickets_per_unit: parseInt(newTier.tickets_per_unit),
                max_qty_per_order: parseInt(newTier.max_qty_per_order),
                sales_start: new Date(newTier.sales_start).toISOString(),
                sales_end: new Date(newTier.sales_end).toISOString(),
                is_active: true
            };

            if (editingTierId) {
                // For updates, we might not want to reset remaining_quantity if it's calculated from sales. 
                // The backend likely ignores remaining_quantity on update or handles it.
                // Let's remove remaining_quantity from update payload to be safe unless we want to reset it.
                const { remaining_quantity, ...updateData } = tierData;

                const updatedTier = await api.updateTier(id, editingTierId, updateData);
                setTicketTiers(prev => prev.map(t => t.id === editingTierId ? updatedTier : t));
                setSuccess('Ticket tier updated successfully!');
            } else {
                const createdTier = await api.createTier(id, tierData);
                setTicketTiers([...ticketTiers, createdTier]);
                setSuccess('Ticket tier added successfully!');
            }

            setShowTierForm(false);
            setEditingTierId(null);
            setNewTier({
                name: '',
                category: 'REGULAR',
                price: '',
                tickets_per_unit: 1,
                initial_quantity: '',
                max_qty_per_order: 10,
                sales_start: '',
                sales_end: ''
            });
        } catch (err) {
            console.error('Failed to save tier:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTier = async (tierId) => {
        if (!window.confirm('Are you sure you want to delete this ticket tier?')) return;

        try {
            // Optimistic update
            const originalTiers = [...ticketTiers];
            setTicketTiers(prev => prev.filter(t => t.id !== tierId));

            await api.deleteTier(id, tierId);
            setSuccess('Ticket tier deleted successfully!');
        } catch (err) {
            console.error('Failed to delete tier:', err);
            setError('Failed to delete tier. Please try again.');
            // Revert
            loadEvent();
        }
    };

    const handleCancelTierForm = () => {
        setShowTierForm(false);
        setEditingTierId(null);
        setNewTier({
            name: '',
            category: 'REGULAR',
            price: '',
            tickets_per_unit: 1,
            initial_quantity: '',
            max_qty_per_order: 10,
            sales_start: '',
            sales_end: ''
        });
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    // Product Handlers
    const handleProductChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditProduct = (product) => {
        setNewProduct({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            imageUrl: product.image_url || '',
            type: product.type,
            active: product.active
        });
        setEditingProductId(product.id);
        setShowProductForm(true);
    };

    const handleSaveProduct = async () => {
        if (!id) {
            setError('Please save the event first before adding products.');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                eventId: id,
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock)
            };

            if (editingProductId) {
                await api.updateProduct(editingProductId, payload);
                setSuccess('Product updated successfully');
            } else {
                await api.createProduct(payload);
                setSuccess('Product added successfully');
            }

            // Reload products
            const updatedEvent = await api.getEvent(id);
            setProducts(updatedEvent.products || []);
            setShowProductForm(false);
            setEditingProductId(null);
            setNewProduct({
                name: '', description: '', price: '', stock: '', imageUrl: '', type: 'OTHER', active: true
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.deleteProduct(productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
            setSuccess('Product deleted successfully');
        } catch (err) {
            setError(err.message);
        }
    };

    // ... existing formatCurrency ...

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading event...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="page-title">
                    <button onClick={() => navigate('/admin/events')} className="back-btn">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Calendar className="w-8 h-8" />
                    <div>
                        <h1>{isEditing ? 'Edit Event' : 'Create New Event'}</h1>
                        <p>{isEditing ? 'Update event details' : 'Fill in the event details'}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="admin-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="admin-success">
                    <Check className="w-5 h-5" />
                    <span>{success}</span>
                </div>
            )}

            {/* Tabs Navigation */}
            {isEditing && (
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        className={`pb-2 px-4 font-medium ${activeTab === 'details' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Event Details
                    </button>
                    {formData.lottery_enabled && (
                        <button
                            className={`pb-2 px-4 font-medium ${activeTab === 'lottery' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('lottery')}
                        >
                            Lottery Participants
                        </button>
                    )}
                    <button
                        className={`pb-2 px-4 font-medium ${activeTab === 'analytics' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Analytics & Check-in
                    </button>
                </div>
            )}

            {activeTab === 'details' && (
                <div className="form-layout">
                    {/* Main Form */}
                    <form onSubmit={handleSubmit} className="admin-form">
                        {/* ... existing form fields ... */}
                        <div className="form-section">
                            <h2 className="section-title">
                                <FileText className="w-5 h-5" />
                                Basic Information
                            </h2>

                            <div className="form-group">
                                <label htmlFor="title">Event Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter event title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter event description"
                                    rows={5}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="venue">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Venue
                                </label>
                                <input
                                    type="text"
                                    id="venue"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    placeholder="Enter venue location"
                                />
                            </div>

                            {/* Replace URL input with ImagePicker */}
                            <ImagePicker
                                label="Event Banner Image"
                                currentImage={formData.banner_image_url}
                                onImageSelect={(file) => {
                                    // File selected, will be uploaded if eventId exists
                                }}
                                onImageUpload={handleImageUpload}
                                eventId={id}
                            />
                        </div>

                        <div className="form-section">
                            <h2 className="section-title">
                                <Clock className="w-5 h-5" />
                                Date & Time
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="start_date">Start Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        id="start_date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="end_date">End Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        id="end_date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Event Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="CANCELLED">Cancelled</option>
                                    <option value="COMPLETED">Completed</option>
                                    {user?.role === 'ADMIN' && (
                                        <option value="ARCHIVED">Archived (Admin Only)</option>
                                    )}
                                </select>
                                {formData.status === 'ARCHIVED' && (
                                    <p className="form-hint" style={{ color: '#ff9800', marginTop: '0.5rem' }}>
                                        ⚠️ Only admins can set or modify archived events
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h2 className="section-title">
                                <Gift className="w-5 h-5" />
                                Lottery Settings
                            </h2>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="lottery_enabled"
                                        checked={formData.lottery_enabled}
                                        onChange={handleChange}
                                    />
                                    <span className="checkmark"></span>
                                    Enable Lottery for this event
                                </label>
                                <p className="form-hint">Users can enter a lottery to win free tickets</p>
                            </div>

                            {formData.lottery_enabled && (
                                <div className="form-group">
                                    <label htmlFor="lottery_draw_date">Lottery Draw Date</label>
                                    <input
                                        type="datetime-local"
                                        id="lottery_draw_date"
                                        name="lottery_draw_date"
                                        value={formData.lottery_draw_date}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/events')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {isEditing ? 'Update Event' : 'Create Event'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Ticket Tiers Section (only for editing) */}
                    {isEditing && (
                        <div className="admin-card tiers-section">
                            <div className="card-header">
                                <h2>
                                    <Ticket className="w-5 h-5" />
                                    Ticket Tiers
                                </h2>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setEditingTierId(null);
                                        setNewTier({
                                            name: '',
                                            category: 'REGULAR',
                                            price: '',
                                            tickets_per_unit: 1,
                                            initial_quantity: '',
                                            max_qty_per_order: 10,
                                            sales_start: '',
                                            sales_end: ''
                                        });
                                        setShowTierForm(!showTierForm);
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Tier
                                </button>
                            </div>

                            {showTierForm && (
                                <div className="tier-form">
                                    <h3>{editingTierId ? 'Edit Ticket Tier' : 'New Ticket Tier'}</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Tier Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={newTier.name}
                                                onChange={handleTierChange}
                                                placeholder="e.g., VIP Table"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Category *</label>
                                            <select
                                                name="category"
                                                value={newTier.category}
                                                onChange={handleTierChange}
                                            >
                                                <option value="REGULAR">Regular</option>
                                                <option value="VIP">VIP</option>
                                                <option value="VVIP">VVIP</option>
                                                <option value="STUDENT">Student</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price (KES) *</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={newTier.price}
                                                onChange={handleTierChange}
                                                placeholder="2000"
                                                min="0"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tickets Per Unit</label>
                                            <input
                                                type="number"
                                                name="tickets_per_unit"
                                                value={newTier.tickets_per_unit}
                                                onChange={handleTierChange}
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Total Quantity *</label>
                                            <input
                                                type="number"
                                                name="initial_quantity"
                                                value={newTier.initial_quantity}
                                                onChange={handleTierChange}
                                                placeholder="100"
                                                min="1"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Max Per Order</label>
                                            <input
                                                type="number"
                                                name="max_qty_per_order"
                                                value={newTier.max_qty_per_order}
                                                onChange={handleTierChange}
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Sales Start *</label>
                                            <input
                                                type="datetime-local"
                                                name="sales_start"
                                                value={newTier.sales_start}
                                                onChange={handleTierChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Sales End *</label>
                                            <input
                                                type="datetime-local"
                                                name="sales_end"
                                                value={newTier.sales_end}
                                                onChange={handleTierChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="tier-form-actions">
                                        <button type="button" className="btn-secondary" onClick={handleCancelTierForm}>
                                            Cancel
                                        </button>
                                        <button type="button" className="btn-primary" onClick={handleSaveTier} disabled={saving}>
                                            {saving ? (editingTierId ? 'Updating...' : 'Adding...') : (editingTierId ? 'Update Tier' : 'Add Tier')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="tiers-list">
                                {ticketTiers.length === 0 ? (
                                    <div className="empty-state">
                                        <Ticket className="w-10 h-10" />
                                        <p>No ticket tiers yet</p>
                                    </div>
                                ) : (
                                    ticketTiers.map((tier) => (
                                        <div key={tier.id} className="tier-item">
                                            <div className="tier-info">
                                                <span className={`tier-category cat-${tier.category?.toLowerCase()}`}>
                                                    {tier.category}
                                                </span>
                                                <h4>{tier.name}</h4>
                                                <p>{formatCurrency(tier.price)} × {tier.tickets_per_unit} ticket(s)</p>
                                            </div>
                                            <div className="tier-stats-actions">
                                                <span className="tier-availability">
                                                    {tier.remaining_quantity} / {tier.initial_quantity} available
                                                </span>
                                                <div className="row-actions">
                                                    <button
                                                        onClick={() => handleEditTier(tier)}
                                                        className="action-btn edit"
                                                        title="Edit Tier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTier(tier.id)}
                                                        className="action-btn delete"
                                                        title="Delete Tier"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {/* ADD-ONS SECTION */}
                    {isEditing && (
                        <div className="admin-card products-section" style={{ marginTop: '20px' }}>
                            <div className="card-header">
                                <h2>
                                    <ShoppingBag className="w-5 h-5" />
                                    Products & Add-Ons
                                </h2>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setEditingProductId(null);
                                        setNewProduct({
                                            name: '', description: '', price: '', stock: '', imageUrl: '', type: 'OTHER', active: true
                                        });
                                        setShowProductForm(!showProductForm);
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Product
                                </button>
                            </div>

                            {showProductForm && (
                                <div className="tier-form">
                                    <h3>{editingProductId ? 'Edit Product' : 'New Product'}</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Name *</label>
                                            <input type="text" name="name" value={newProduct.name} onChange={handleProductChange} placeholder="e.g. T-Shirt" />
                                        </div>
                                        <div className="form-group">
                                            <label>Type</label>
                                            <select name="type" value={newProduct.type} onChange={handleProductChange}>
                                                <option value="MERCH">Merch</option>
                                                <option value="PARKING">Parking</option>
                                                <option value="BEVERAGE">Beverage</option>
                                                <option value="SNACK">Snack</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea name="description" value={newProduct.description} onChange={handleProductChange} rows="2" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price (KES) *</label>
                                            <input type="number" name="price" value={newProduct.price} onChange={handleProductChange} min="0" />
                                        </div>
                                        <div className="form-group">
                                            <label>Stock *</label>
                                            <input type="number" name="stock" value={newProduct.stock} onChange={handleProductChange} min="0" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Image URL</label>
                                        <input type="text" name="imageUrl" value={newProduct.imageUrl} onChange={handleProductChange} placeholder="http://..." />
                                    </div>
                                    <div className="tier-form-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setShowProductForm(false)}>Cancel</button>
                                        <button type="button" className="btn-primary" onClick={handleSaveProduct} disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Product'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="tiers-list">
                                {products.length === 0 ? (
                                    <div className="empty-state">
                                        <ShoppingBag className="w-10 h-10" />
                                        <p>No products yet</p>
                                    </div>
                                ) : (
                                    products.map((product) => (
                                        <div key={product.id} className="tier-item">
                                            {product.image_url && (
                                                <div style={{ marginRight: '15px' }}>
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                            <div className="tier-info">
                                                <span className="tier-category" style={{ background: '#f3f4f6', color: '#374151' }}>{product.type}</span>
                                                <h4>{product.name}</h4>
                                                <p>{formatCurrency(product.price)} | Stock: {product.stock}</p>
                                            </div>
                                            <div className="tier-stats-actions">
                                                <div className="row-actions">
                                                    <button onClick={() => handleEditProduct(product)} className="action-btn edit"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteProduct(product.id)} className="action-btn delete"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'lottery' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Lottery Participants ({lotteryEntries.length})
                    </h2>
                    {loadingLottery ? (
                        <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>
                    ) : lotteryEntries.length === 0 ? (
                        <p className="text-gray-500">No participants yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="p-3">User</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Date Entered</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lotteryEntries.map(entry => (
                                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">
                                                {entry.user ? `${entry.user.first_name} ${entry.user.last_name}` : 'Unknown'}
                                            </td>
                                            <td className="p-3">{entry.user?.email}</td>
                                            <td className="p-3">{new Date(entry.created_at).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${entry.is_winner ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {entry.is_winner ? 'Winner' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleRemoveLotteryEntry(entry.id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    title="Remove from lottery"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Sales Overview
                        </h2>
                        {loadingAnalytics ? (
                            <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>
                        ) : (
                            <div>
                                <div className="h-64 flex items-end space-x-2 border-b border-gray-200 pb-2">
                                    {analyticsData?.sales?.map((point, i) => {
                                        const max = Math.max(...(analyticsData.sales.map(p => Number(p.amount)) || [0]));
                                        const height = max ? (Number(point.amount) / max) * 100 : 0;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col justify-end group relative">
                                                <div
                                                    className="bg-blue-500 hover:bg-blue-600 rounded-t w-full transition-all"
                                                    style={{ height: `${height}%` }}
                                                ></div>
                                                <span className="text-xs text-gray-500 mt-1 truncate">{new Date(point.date).getDate()}</span>
                                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                                    {point.amount} Sales <br />
                                                    {new Date(point.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!analyticsData?.sales || analyticsData.sales.length === 0) && <p>No sales data.</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <Check className="w-5 h-5 mr-2" />
                            Check-in Distribution
                        </h2>
                        {loadingAnalytics ? (
                            <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analyticsData?.checkins?.map((gate, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded border">
                                        <h3 className="font-bold text-lg">{gate.gate || 'Main Gate'}</h3>
                                        <div className="text-2xl text-indigo-600 font-bold">{gate.count}</div>
                                        <p className="text-sm text-gray-500">Check-ins</p>
                                    </div>
                                ))}
                                {(!analyticsData?.checkins || analyticsData.checkins.length === 0) && <p>No check-in data.</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
