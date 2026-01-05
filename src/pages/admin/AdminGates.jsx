import { useState, useEffect } from 'react';
import {
    DoorOpen,
    Plus,
    Edit,
    Trash2,
    Search,
    AlertCircle,
    CheckCircle,
    XCircle,
    Calendar,
    Users,
    UserPlus,
    UserMinus,
    ChevronDown,
    ChevronUp,
    Settings,
    Clock,
    MapPin
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminGates() {
    // Tab state
    const [activeTab, setActiveTab] = useState('gates'); // 'gates' | 'assignments'

    // Gates state
    const [gates, setGates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    // Modal state
    const [showGateModal, setShowGateModal] = useState(false);
    const [editingGate, setEditingGate] = useState(null);
    const [gateForm, setGateForm] = useState({ name: '', description: '', is_active: true });
    const [saving, setSaving] = useState(false);

    // Event assignment state
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventGates, setEventGates] = useState([]);
    const [scanners, setScanners] = useState([]);
    const [expandedAssignment, setExpandedAssignment] = useState(null);

    // Load initial data
    useEffect(() => {
        loadGates();
        loadEvents();
        loadScanners();
    }, [showInactive]);

    useEffect(() => {
        if (selectedEvent) {
            loadEventGates(selectedEvent);
        }
    }, [selectedEvent]);

    const loadGates = async () => {
        try {
            setLoading(true);
            const data = await api.getGatesWithStats();
            setGates(data || []);
        } catch (err) {
            console.error('Failed to load gates:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadEvents = async () => {
        try {
            const response = await api.getAllEventsAdmin(1, 100);
            // API returns paginated result { data: Event[], meta: {...} }
            const eventsList = response?.data || response?.events || response || [];
            setEvents(Array.isArray(eventsList) ? eventsList : []);
        } catch (err) {
            console.error('Failed to load events:', err);
        }
    };

    const loadScanners = async () => {
        try {
            const data = await api.getGateScanners();
            setScanners(data || []);
        } catch (err) {
            console.error('Failed to load scanners:', err);
        }
    };

    const loadEventGates = async (eventId) => {
        try {
            const data = await api.getEventGates(eventId);
            setEventGates(data || []);
        } catch (err) {
            console.error('Failed to load event gates:', err);
        }
    };

    // Gate CRUD
    const handleSaveGate = async () => {
        if (!gateForm.name.trim()) {
            setError('Gate name is required');
            return;
        }

        try {
            setSaving(true);
            if (editingGate) {
                await api.updateGate(editingGate.id, gateForm);
                setSuccess('Gate updated successfully');
            } else {
                await api.createGate(gateForm);
                setSuccess('Gate created successfully');
            }
            setShowGateModal(false);
            setEditingGate(null);
            setGateForm({ name: '', description: '', is_active: true });
            loadGates();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGate = async (gateId) => {
        if (!confirm('Are you sure you want to delete this gate? This will also remove all event assignments.')) {
            return;
        }
        try {
            await api.deleteGate(gateId);
            setSuccess('Gate deleted successfully');
            loadGates();
        } catch (err) {
            setError(err.message);
        }
    };

    const openEditModal = (gate) => {
        setEditingGate(gate);
        setGateForm({
            name: gate.name,
            description: gate.description || '',
            is_active: gate.is_active
        });
        setShowGateModal(true);
    };

    // Assignment methods
    const handleAssignGate = async (gateId) => {
        if (!selectedEvent) {
            setError('Please select an event first');
            return;
        }
        try {
            await api.assignGateToEvent(gateId, selectedEvent);
            setSuccess('Gate assigned to event');
            loadEventGates(selectedEvent);
            loadGates();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveAssignment = async (assignmentId) => {
        try {
            await api.removeGateFromEvent(assignmentId);
            setSuccess('Gate removed from event');
            loadEventGates(selectedEvent);
            loadGates();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAssignScanner = async (assignmentId, scannerId) => {
        try {
            if (scannerId) {
                await api.assignScannerToGate(assignmentId, scannerId);
                setSuccess('Scanner assigned to gate');
            } else {
                await api.removeScannerFromGate(assignmentId);
                setSuccess('Scanner removed from gate');
            }
            loadEventGates(selectedEvent);
            loadScanners();
        } catch (err) {
            setError(err.message);
        }
    };

    // Filter gates
    const filteredGates = gates.filter(gate => {
        const matchesSearch = gate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gate.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = showInactive || gate.is_active;
        return matchesSearch && matchesStatus;
    });

    // Get available gates (not yet assigned to selected event)
    const assignedGateIds = new Set(eventGates.map(eg => eg.gate?.id || eg.gate_id));
    const availableGates = gates.filter(g => g.is_active && !assignedGateIds.has(g.id));

    // Get selected event details
    const selectedEventDetails = events.find(e => e.id === selectedEvent);

    // Clear messages after timeout
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading && gates.length === 0) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading gates...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="page-title">
                    <DoorOpen className="w-8 h-8" />
                    <div>
                        <h1>Gate Management</h1>
                        <p>Create gates, assign to events, and allocate scanners</p>
                    </div>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditingGate(null);
                        setGateForm({ name: '', description: '', is_active: true });
                        setShowGateModal(true);
                    }}
                >
                    <Plus className="w-5 h-5" />
                    New Gate
                </button>
            </div>

            {/* Notifications */}
            {error && (
                <div className="admin-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}
            {success && (
                <div className="admin-success">
                    <CheckCircle className="w-5 h-5" />
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="ml-auto">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="user-stats-grid">
                <div className="user-stat-card">
                    <DoorOpen className="w-8 h-8 text-blue-500" />
                    <div>
                        <span className="stat-number">{gates.filter(g => g.is_active).length}</span>
                        <span className="stat-label">Active Gates</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <Calendar className="w-8 h-8 text-purple-500" />
                    <div>
                        <span className="stat-number">
                            {gates.reduce((sum, g) => sum + (g.active_events_count || 0), 0)}
                        </span>
                        <span className="stat-label">Active Assignments</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <Users className="w-8 h-8 text-green-500" />
                    <div>
                        <span className="stat-number">{scanners.length}</span>
                        <span className="stat-label">Available Scanners</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="gate-tabs">
                <button
                    className={`gate-tab ${activeTab === 'gates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gates')}
                >
                    <DoorOpen className="w-4 h-4" />
                    Gates
                </button>
                <button
                    className={`gate-tab ${activeTab === 'assignments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assignments')}
                >
                    <Calendar className="w-4 h-4" />
                    Event Assignments
                </button>
            </div>

            {/* Gates Tab */}
            {activeTab === 'gates' && (
                <>
                    {/* Filters */}
                    <div className="admin-filters">
                        <div className="search-box">
                            <Search className="w-5 h-5 search-icon" />
                            <input
                                type="text"
                                placeholder="Search gates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                            />
                            <span>Show Inactive</span>
                        </label>
                    </div>

                    {/* Gates Grid */}
                    <div className="gates-grid">
                        {filteredGates.length === 0 ? (
                            <div className="empty-state-centered">
                                <DoorOpen className="w-16 h-16" />
                                <h3>No Gates Found</h3>
                                <p>Create your first gate to get started</p>
                                <button className="btn-primary" onClick={() => setShowGateModal(true)}>
                                    <Plus className="w-4 h-4" /> Create Gate
                                </button>
                            </div>
                        ) : (
                            filteredGates.map((gate) => (
                                <div key={gate.id} className={`gate-card ${!gate.is_active ? 'inactive' : ''}`}>
                                    <div className="gate-card-header">
                                        <div className="gate-icon">
                                            <DoorOpen className="w-6 h-6" />
                                        </div>
                                        <div className="gate-status">
                                            {gate.is_active ? (
                                                <span className="status-badge active">Active</span>
                                            ) : (
                                                <span className="status-badge inactive">Inactive</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="gate-card-body">
                                        <h3>{gate.name}</h3>
                                        {gate.description && (
                                            <p className="gate-description">{gate.description}</p>
                                        )}
                                        <div className="gate-stats">
                                            <div className="gate-stat">
                                                <Calendar className="w-4 h-4" />
                                                <span>{gate.assignment_count || 0} events</span>
                                            </div>
                                            <div className="gate-stat">
                                                <Clock className="w-4 h-4" />
                                                <span>{gate.active_events_count || 0} active</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="gate-card-actions">
                                        <button
                                            className="btn-icon edit"
                                            onClick={() => openEditModal(gate)}
                                            title="Edit Gate"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => handleDeleteGate(gate.id)}
                                            title="Delete Gate"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
                <div className="assignments-container">
                    {/* Event Selector */}
                    <div className="event-selector-card">
                        <div className="event-selector-header">
                            <Calendar className="w-5 h-5" />
                            <h3>Select Event</h3>
                        </div>
                        <select
                            value={selectedEvent || ''}
                            onChange={(e) => setSelectedEvent(e.target.value || null)}
                            className="event-select"
                        >
                            <option value="">-- Select an Event --</option>
                            {events
                                .filter(e => e.status === 'PUBLISHED' || e.status === 'DRAFT')
                                .map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.title} ({formatDate(event.start_date)})
                                    </option>
                                ))}
                        </select>
                    </div>

                    {selectedEvent && selectedEventDetails && (
                        <>
                            {/* Event Info */}
                            <div className="event-info-card">
                                <div className="event-info-header">
                                    <h3>{selectedEventDetails.title}</h3>
                                    <span className={`status-badge ${selectedEventDetails.status.toLowerCase()}`}>
                                        {selectedEventDetails.status}
                                    </span>
                                </div>
                                <div className="event-info-meta">
                                    <span><Calendar className="w-4 h-4" /> {formatDate(selectedEventDetails.start_date)}</span>
                                    <span><MapPin className="w-4 h-4" /> {selectedEventDetails.venue}</span>
                                    <span><DoorOpen className="w-4 h-4" /> {eventGates.length} gates assigned</span>
                                </div>
                            </div>

                            {/* Add Gates */}
                            {availableGates.length > 0 && (
                                <div className="add-gates-card">
                                    <h4>Add Gates to Event</h4>
                                    <div className="available-gates">
                                        {availableGates.map((gate) => (
                                            <button
                                                key={gate.id}
                                                className="available-gate-btn"
                                                onClick={() => handleAssignGate(gate.id)}
                                            >
                                                <Plus className="w-4 h-4" />
                                                {gate.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Assigned Gates */}
                            <div className="assigned-gates-section">
                                <h4>Assigned Gates & Scanners</h4>
                                {eventGates.length === 0 ? (
                                    <div className="empty-state-small">
                                        <DoorOpen className="w-10 h-10" />
                                        <p>No gates assigned to this event yet</p>
                                    </div>
                                ) : (
                                    <div className="assigned-gates-list">
                                        {eventGates.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className={`assignment-card ${expandedAssignment === assignment.id ? 'expanded' : ''}`}
                                            >
                                                <div
                                                    className="assignment-header"
                                                    onClick={() => setExpandedAssignment(
                                                        expandedAssignment === assignment.id ? null : assignment.id
                                                    )}
                                                >
                                                    <div className="assignment-info">
                                                        <DoorOpen className="w-5 h-5 text-blue-500" />
                                                        <span className="gate-name">{assignment.gate?.name}</span>
                                                    </div>
                                                    <div className="assignment-scanner-preview">
                                                        {assignment.scanner ? (
                                                            <span className="scanner-badge assigned">
                                                                <Users className="w-3 h-3" />
                                                                {assignment.scanner.first_name} {assignment.scanner.last_name}
                                                            </span>
                                                        ) : (
                                                            <span className="scanner-badge unassigned">
                                                                No Scanner
                                                            </span>
                                                        )}
                                                        {expandedAssignment === assignment.id ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                </div>
                                                {expandedAssignment === assignment.id && (
                                                    <div className="assignment-details">
                                                        <div className="scanner-selector">
                                                            <label>Assign Scanner:</label>
                                                            <select
                                                                value={assignment.scanner?.id || ''}
                                                                onChange={(e) => handleAssignScanner(assignment.id, e.target.value || null)}
                                                            >
                                                                <option value="">-- No Scanner --</option>
                                                                {scanners.map((scanner) => (
                                                                    <option key={scanner.id} value={scanner.id}>
                                                                        {scanner.first_name} {scanner.last_name} ({scanner.email})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="assignment-actions">
                                                            <button
                                                                className="btn-danger-small"
                                                                onClick={() => handleRemoveAssignment(assignment.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Remove from Event
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {!selectedEvent && (
                        <div className="empty-state-centered">
                            <Calendar className="w-16 h-16" />
                            <h3>Select an Event</h3>
                            <p>Choose an event to manage its gate assignments and scanner allocations</p>
                        </div>
                    )}
                </div>
            )}

            {/* Gate Modal */}
            {showGateModal && (
                <div className="modal-overlay" onClick={() => setShowGateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <DoorOpen className="w-8 h-8 text-blue-500" />
                            <h2>{editingGate ? 'Edit Gate' : 'Create New Gate'}</h2>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Gate Name *</label>
                                <input
                                    type="text"
                                    value={gateForm.name}
                                    onChange={(e) => setGateForm({ ...gateForm, name: e.target.value })}
                                    placeholder="e.g., Main Entrance, VIP Gate, Gate A"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={gateForm.description}
                                    onChange={(e) => setGateForm({ ...gateForm, description: e.target.value })}
                                    placeholder="Optional description of this gate..."
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={gateForm.is_active}
                                        onChange={(e) => setGateForm({ ...gateForm, is_active: e.target.checked })}
                                    />
                                    <span>Active</span>
                                </label>
                                <p className="form-hint">Inactive gates cannot be assigned to events</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowGateModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSaveGate} disabled={saving}>
                                {saving ? 'Saving...' : (editingGate ? 'Update Gate' : 'Create Gate')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
