import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    ShieldCheck,
    ShieldAlert,
    User,
    Mail,
    Phone,
    Calendar,
    Edit,
    Ban,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Plus,
    KeyRound,
    RefreshCw,
    Eye
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [counts, setCounts] = useState({ total: 0, USER: 0, ADMIN: 0, SCANNER: 0 });
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(null);
    const [editForm, setEditForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: 'USER',
        assigned_gate: '',
        is_active: true,
    });
    const PAGE_SIZE = 15;
    const emptyCreateForm = {
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role: 'SCANNER',
        assigned_gate: '',
    };
    const [createForm, setCreateForm] = useState(emptyCreateForm);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const generatePassword = () => {
        const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const flashSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(null), 4000);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        loadUsers();
    }, [currentPage, roleFilter, debouncedSearch]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: PAGE_SIZE,
            };

            if (roleFilter !== 'all') {
                params.role = roleFilter.toUpperCase();
            }
            if (debouncedSearch) {
                params.search = debouncedSearch;
            }
            const data = await api.getAdminUsers(params);
            setUsers(data?.users || []);
            setTotalPages(data?.totalPages || 1);
            setTotal(data?.total || 0);
            setCounts({
                total: data?.counts?.total || 0,
                USER: data?.counts?.USER || 0,
                ADMIN: data?.counts?.ADMIN || 0,
                SCANNER: data?.counts?.SCANNER || 0,
            });
        } catch (err) {
            console.error('Failed to load users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openUserView = (user, edit = false) => {
        setSelectedUser(user);
        setEditForm({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            role: user.role || 'USER',
            assigned_gate: user.assigned_gate || '',
            is_active: user.is_active !== false,
        });
        setIsEditing(edit);
        setError(null);
        setViewModalOpen(true);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRoleBadge = (role) => {
        const roles = {
            ADMIN: { class: 'role-admin', icon: ShieldAlert, label: 'Admin' },
            USER: { class: 'role-user', icon: User, label: 'User' },
            SCANNER: { class: 'role-scanner', icon: ShieldCheck, label: 'Scanner' }
        };
        const roleData = roles[role] || roles.USER;
        const Icon = roleData.icon;
        return (
            <span className={`role-badge ${roleData.class}`}>
                <Icon className="w-3 h-3" />
                {roleData.label}
            </span>
        );
    };

    const handleSaveUser = async (e) => {
        e?.preventDefault();
        if (!selectedUser) return;
        try {
            setSaving(true);
            setError(null);
            const updated = await api.updateAdminUser(selectedUser.id, {
                first_name: editForm.first_name,
                last_name: editForm.last_name,
                email: editForm.email.trim().toLowerCase(),
                phone_number: editForm.phone_number,
                role: editForm.role,
                assigned_gate: editForm.role === 'SCANNER' ? editForm.assigned_gate : '',
                is_active: editForm.is_active,
            });
            setSelectedUser(updated);
            setUsers(users.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
            setIsEditing(false);
            flashSuccess('User updated');
            await loadUsers();
        } catch (err) {
            console.error('Failed to update user:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (createForm.password !== createForm.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (createForm.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await api.createAdminUser({
                email: createForm.email.trim(),
                password: createForm.password,
                first_name: createForm.first_name.trim() || undefined,
                last_name: createForm.last_name.trim() || undefined,
                phone_number: createForm.phone_number.trim() || undefined,
                role: createForm.role,
                assigned_gate: createForm.role === 'SCANNER' ? createForm.assigned_gate || undefined : undefined,
            });
            setCreateModalOpen(false);
            setCreateForm(emptyCreateForm);
            flashSuccess(`Created ${createForm.role.toLowerCase()} ${createForm.email}`);
            await loadUsers();
        } catch (err) {
            console.error('Failed to create user:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await api.setUserPassword(selectedUser.id, newPassword);
            setPasswordModalOpen(false);
            setSelectedUser(null);
            setNewPassword('');
            setConfirmNewPassword('');
            flashSuccess(`Password updated for ${selectedUser.email}`);
        } catch (err) {
            console.error('Failed to set password:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await api.updateUserStatus(userId, !currentStatus);
            setUsers(users.map(u =>
                u.id === userId ? { ...u, is_active: !currentStatus } : u
            ));
        } catch (err) {
            console.error('Failed to update user status:', err);
            setError(err.message);
        }
    };

    const rangeFrom = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const rangeTo = Math.min(currentPage * PAGE_SIZE, total);

    if (loading && users.length === 0) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="page-title">
                    <Users className="w-8 h-8" />
                    <div>
                        <h1>User Management</h1>
                        <p>Manage user accounts and roles</p>
                    </div>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setCreateForm(emptyCreateForm);
                        setError(null);
                        setCreateModalOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {success && (
                <div className="admin-success">
                    <CheckCircle className="w-5 h-5" />
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="admin-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Stats Cards */}
            <div className="user-stats-grid">
                <div className="user-stat-card">
                    <Users className="w-8 h-8 text-indigo-500" />
                    <div>
                        <span className="stat-number">{counts.total}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <User className="w-8 h-8 text-blue-500" />
                    <div>
                        <span className="stat-number">{counts.USER}</span>
                        <span className="stat-label">Regular Users</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <ShieldAlert className="w-8 h-8 text-purple-500" />
                    <div>
                        <span className="stat-number">{counts.ADMIN}</span>
                        <span className="stat-label">Admins</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <ShieldCheck className="w-8 h-8 text-green-500" />
                    <div>
                        <span className="stat-number">{counts.SCANNER}</span>
                        <span className="stat-label">Scanners</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <div className="search-box">
                    <Search className="w-5 h-5 search-icon" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="admin">Admins</option>
                        <option value="scanner">Scanners</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-cell">
                                    <div className="empty-state">
                                        <Users className="w-12 h-12" />
                                        <p>No users found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className={!user.is_active ? 'inactive-row' : 'cursor-pointer'}
                                    onClick={() => openUserView(user)}
                                >
                                    <td className="user-cell">
                                        <div className="user-avatar">
                                            <span>{(user.first_name?.[0] || user.email[0]).toUpperCase()}</span>
                                        </div>
                                        <div className="user-info">
                                            <span className="user-name">
                                                {user.first_name} {user.last_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="email-cell">
                                        <Mail className="w-4 h-4" />
                                        <span>{user.email}</span>
                                    </td>
                                    <td className="phone-cell">
                                        <Phone className="w-4 h-4" />
                                        <span>{user.phone_number || 'N/A'}</span>
                                    </td>
                                    <td className="role-cell">
                                        {getRoleBadge(user.role)}
                                        {user.role === 'SCANNER' && user.assigned_gate && (
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {user.assigned_gate}
                                            </div>
                                        )}
                                    </td>
                                    <td className="status-cell">
                                        <span className={`user-status ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3" />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <Ban className="w-3 h-3" />
                                                    Inactive
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(user.created_at)}</span>
                                    </td>
                                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="action-btn view"
                                            onClick={() => openUserView(user)}
                                            title="View user"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="action-btn edit"
                                            onClick={() => openUserView(user, true)}
                                            title="Edit user"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="action-btn edit"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setNewPassword('');
                                                setConfirmNewPassword('');
                                                setError(null);
                                                setPasswordModalOpen(true);
                                            }}
                                            title="Set password"
                                        >
                                            <KeyRound className="w-4 h-4" />
                                        </button>
                                        <button
                                            className={`action-btn ${user.is_active ? 'disable' : 'enable'}`}
                                            onClick={() => handleToggleActive(user.id, user.is_active)}
                                            title={user.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
                    {rangeFrom}–{rangeTo} of {total} · Page {currentPage} of {totalPages}
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

            {/* Create User Modal */}
            {createModalOpen && (
                <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <User className="w-8 h-8 text-blue-500" />
                            <h2>Add User</h2>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>First name</label>
                                    <input
                                        type="text"
                                        value={createForm.first_name}
                                        onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last name</label>
                                    <input
                                        type="text"
                                        value={createForm.last_name}
                                        onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        placeholder="scanner@example.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={createForm.phone_number}
                                        onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
                                        placeholder="+2547..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role *</label>
                                    <select
                                        value={createForm.role}
                                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                        required
                                    >
                                        <option value="SCANNER">Scanner</option>
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                {createForm.role === 'SCANNER' && (
                                    <div className="form-group">
                                        <label>Assigned gate</label>
                                        <select
                                            value={createForm.assigned_gate}
                                            onChange={(e) => setCreateForm({ ...createForm, assigned_gate: e.target.value })}
                                        >
                                            <option value="">-- Select Gate --</option>
                                            <option value="Main Entrance">Main Entrance</option>
                                            <option value="VIP Gate">VIP Gate</option>
                                            <option value="Backstage">Backstage</option>
                                            <option value="Parking Entry">Parking Entry</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Password *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={createForm.password}
                                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                            placeholder="Min 6 characters"
                                            required
                                            minLength={6}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            title="Generate password"
                                            onClick={() => {
                                                const password = generatePassword();
                                                setCreateForm({ ...createForm, password, confirmPassword: password });
                                            }}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Confirm password *</label>
                                    <input
                                        type="text"
                                        value={createForm.confirmPassword}
                                        onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                                        placeholder="Repeat password"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Share this password with the user. It is not emailed.
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setCreateModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Set Password Modal */}
            {passwordModalOpen && selectedUser && (
                <div className="modal-overlay" onClick={() => setPasswordModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <KeyRound className="w-8 h-8 text-amber-500" />
                            <h2>Set Password</h2>
                        </div>
                        <form onSubmit={handleSetPassword}>
                            <div className="modal-body">
                                <div className="user-preview">
                                    <div className="user-avatar large">
                                        <span>{(selectedUser.first_name?.[0] || selectedUser.email[0]).toUpperCase()}</span>
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">
                                            {selectedUser.first_name} {selectedUser.last_name}
                                        </span>
                                        <span className="user-email">{selectedUser.email}</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>New password *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            required
                                            minLength={6}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            title="Generate password"
                                            onClick={() => {
                                                const password = generatePassword();
                                                setNewPassword(password);
                                                setConfirmNewPassword(password);
                                            }}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Confirm password *</label>
                                    <input
                                        type="text"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Share the new password with the user. It is not emailed.
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setPasswordModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View / Edit User Modal */}
            {viewModalOpen && selectedUser && (
                <div className="modal-overlay" onClick={() => setViewModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <User className="w-8 h-8 text-blue-500" />
                            <h2>{isEditing ? 'Edit User' : 'User Details'}</h2>
                        </div>
                        <form onSubmit={handleSaveUser}>
                            <div className="modal-body">
                                <div className="user-preview">
                                    <div className="user-avatar large">
                                        <span>{(selectedUser.first_name?.[0] || selectedUser.email[0]).toUpperCase()}</span>
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">
                                            {selectedUser.first_name} {selectedUser.last_name}
                                        </span>
                                        <span className="user-email">{selectedUser.email}</span>
                                        {getRoleBadge(selectedUser.role)}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <>
                                        <div className="form-group">
                                            <label>First name</label>
                                            <input
                                                type="text"
                                                value={editForm.first_name}
                                                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Last name</label>
                                            <input
                                                type="text"
                                                value={editForm.last_name}
                                                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input
                                                type="tel"
                                                value={editForm.phone_number}
                                                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Role</label>
                                            <select
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            >
                                                <option value="USER">User</option>
                                                <option value="SCANNER">Scanner</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </div>
                                        {editForm.role === 'SCANNER' && (
                                            <div className="form-group">
                                                <label>Assigned gate</label>
                                                <select
                                                    value={editForm.assigned_gate}
                                                    onChange={(e) => setEditForm({ ...editForm, assigned_gate: e.target.value })}
                                                >
                                                    <option value="">-- Select Gate --</option>
                                                    <option value="Main Entrance">Main Entrance</option>
                                                    <option value="VIP Gate">VIP Gate</option>
                                                    <option value="Backstage">Backstage</option>
                                                    <option value="Parking Entry">Parking Entry</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.is_active}
                                                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                                />
                                                Active account
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <dl className="user-detail-list">
                                        <div>
                                            <dt>Name</dt>
                                            <dd>{[selectedUser.first_name, selectedUser.last_name].filter(Boolean).join(' ') || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Email</dt>
                                            <dd>{selectedUser.email}</dd>
                                        </div>
                                        <div>
                                            <dt>Phone</dt>
                                            <dd>{selectedUser.phone_number || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Role</dt>
                                            <dd>{getRoleBadge(selectedUser.role)}</dd>
                                        </div>
                                        {selectedUser.role === 'SCANNER' && (
                                            <div>
                                                <dt>Gate</dt>
                                                <dd>{selectedUser.assigned_gate || 'Unassigned'}</dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt>Status</dt>
                                            <dd>
                                                <span className={`user-status ${selectedUser.is_active ? 'active' : 'inactive'}`}>
                                                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Joined</dt>
                                            <dd>{formatDate(selectedUser.created_at)}</dd>
                                        </div>
                                    </dl>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setViewModalOpen(false)}>
                                    Close
                                </button>
                                {!isEditing && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => {
                                                setViewModalOpen(false);
                                                setNewPassword('');
                                                setConfirmNewPassword('');
                                                setPasswordModalOpen(true);
                                            }}
                                        >
                                            <KeyRound className="w-4 h-4" />
                                            Password
                                        </button>
                                        <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                    </>
                                )}
                                {isEditing && (
                                    <>
                                        <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary" disabled={saving}>
                                            {saving ? 'Saving...' : 'Save changes'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
