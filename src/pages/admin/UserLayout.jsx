import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    Ticket,
    Home
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function UserLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.classList.toggle('nav-lock', mobileMenuOpen);
        return () => document.body.classList.remove('nav-lock');
    }, [mobileMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard/events', icon: Calendar, label: 'My Events' },
    ];

    return (
        <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <Ticket className="w-8 h-8" />
                        <span>Organizer</span>
                    </div>
                    <button
                        className="sidebar-toggle desktop-only"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <ChevronLeft className={`w-5 h-5 ${!sidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        className="sidebar-toggle mobile-only"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <item.icon className="nav-icon w-5 h-5" />
                                    <span className="nav-label">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <NavLink
                        to="/events"
                        className="nav-link back-to-site"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Home className="nav-icon w-5 h-5" />
                        <span className="nav-label">Back to Site</span>
                    </NavLink>

                    <div className="user-info">
                        <div className="user-avatar">
                            <span>{(user?.first_name?.[0] || user?.email?.[0] || 'A').toUpperCase()}</span>
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.first_name} {user?.last_name}</span>
                            <span className="user-role">Organizer</span>
                        </div>
                    </div>

                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Mobile Header */}
                <header className="admin-mobile-header">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="mobile-logo">
                        <Ticket className="w-6 h-6" />
                        <span>Organizer</span>
                    </div>
                    <div className="mobile-user">
                        <span>{(user?.first_name?.[0] || 'A').toUpperCase()}</span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
