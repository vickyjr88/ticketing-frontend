import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Shield,
    ShieldCheck,
    ShieldAlert,
    User,
    Mail,
    Phone,
    Calendar,
    MoreVertical,
    Edit,
    Ban,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [currentPage, roleFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 15
            };

            if (roleFilter !== 'all') {
                params.role = roleFilter.toUpperCase();
            }
            const data = await api.getAdminUsers(params);
            setUsers(data?.users || data || []);
            setTotalPages(data?.totalPages || 1);
        } catch (err) {
            console.error('Failed to load users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
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

    const handleUpdateRole = async (newRole) => {
        if (!selectedUser) return;

        try {
            setSaving(true);
            await api.updateUserRole(selectedUser.id, newRole);
            setUsers(users.map(u =>
                u.id === selectedUser.id ? { ...u, role: newRole } : u
            ));
            setEditModalOpen(false);
            setSelectedUser(null);
        } catch (err) {
            console.error('Failed to update user:', err);
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

    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.email?.toLowerCase().includes(searchLower) ||
            user.first_name?.toLowerCase().includes(searchLower) ||
            user.last_name?.toLowerCase().includes(searchLower) ||
            user.phone_number?.includes(searchQuery)
        );
    });

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
            </div>

            {error && (
                <div className="admin-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Stats Cards */}
            <div className="user-stats-grid">
                <div className="user-stat-card">
                    <User className="w-8 h-8 text-blue-500" />
                    <div>
                        <span className="stat-number">{users.filter(u => u.role === 'USER').length}</span>
                        <span className="stat-label">Regular Users</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <ShieldAlert className="w-8 h-8 text-purple-500" />
                    <div>
                        <span className="stat-number">{users.filter(u => u.role === 'ADMIN').length}</span>
                        <span className="stat-label">Admins</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <ShieldCheck className="w-8 h-8 text-green-500" />
                    <div>
                        <span className="stat-number">{users.filter(u => u.role === 'SCANNER').length}</span>
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
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-cell">
                                    <div className="empty-state">
                                        <Users className="w-12 h-12" />
                                        <p>No users found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className={!user.is_active ? 'inactive-row' : ''}>
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
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn edit"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setEditModalOpen(true);
                                            }}
                                            title="Edit Role"
                                        >
                                            <Edit className="w-4 h-4" />
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

            {/* Edit Role Modal */}
            {editModalOpen && selectedUser && (
                <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <Shield className="w-8 h-8 text-purple-500" />
                            <h2>Edit User Role</h2>
                        </div>
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

                            <div className="role-selector">
                                <label>Select Role:</label>
                                <div className="role-options">
                                    <button
                                        className={`role-option ${selectedUser.role === 'USER' ? 'selected' : ''}`}
                                        onClick={() => handleUpdateRole('USER')}
                                        disabled={saving}
                                    >
                                        <User className="w-5 h-5" />
                                        <span>User</span>
                                        <p>Regular user with ticket purchasing abilities</p>
                                    </button>
                                    <button
                                        className={`role-option ${selectedUser.role === 'SCANNER' ? 'selected' : ''}`}
                                        onClick={() => handleUpdateRole('SCANNER')}
                                        disabled={saving}
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        <span>Scanner</span>
                                        <p>Can scan and validate tickets at events</p>
                                    </button>
                                    <button
                                        className={`role-option ${selectedUser.role === 'ADMIN' ? 'selected' : ''}`}
                                        onClick={() => handleUpdateRole('ADMIN')}
                                        disabled={saving}
                                    >
                                        <ShieldAlert className="w-5 h-5" />
                                        <span>Admin</span>
                                        <p>Full access to all admin features</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setEditModalOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
