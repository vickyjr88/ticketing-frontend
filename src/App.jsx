import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Ticket, LogOut, User, Menu, X } from 'lucide-react';
import Partners from './components/layout/Partners';

// Pages
import Events from './pages/Events';
import LandingPage from './pages/LandingPage';
import Products from './pages/Products';
import EventDetails from './pages/EventDetails';
import Checkout from './pages/Checkout';
import MyTickets from './pages/MyTickets';
import MyOrders from './pages/MyOrders';
import PaystackCallback from './pages/PaystackCallback';
import Login from './pages/Login';
import Register from './pages/Register';
import Adopt from './pages/Adopt';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import DeleteAccount from './pages/DeleteAccount';
import LayawayOrders from './pages/LayawayOrders';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventForm from './pages/admin/AdminEventForm';
import EventLiveDashboard from './pages/admin/EventLiveDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminScanner from './pages/admin/AdminScanner';
import AdminLottery from './pages/admin/AdminLottery';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminMediaLibrary from './pages/admin/AdminMediaLibrary';
import AdminPaymentSettings from './pages/admin/AdminPaymentSettings';
import AdminGates from './pages/admin/AdminGates';
import AdminContacts from './pages/admin/AdminContacts';

// User Dashboard Pages
import UserLayout from './pages/admin/UserLayout';
import UserEvents from './pages/admin/UserEvents';
import UserEventForm from './pages/admin/UserEventForm';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;

  // Check for Admin, Scanner, or User role
  if (user?.role !== 'ADMIN' && user?.role !== 'SCANNER' && user?.role !== 'USER') {
    return <Navigate to="/" />;
  }

  return children;
}

// Layout Component (Public & User)
function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SCANNER';
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('nav-lock', menuOpen);
    return () => document.body.classList.remove('nav-lock');
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {menuOpen && (
        <div className="site-nav-backdrop" onClick={() => setMenuOpen(false)} />
      )}
      <nav className="site-nav">
        <div className="site-nav-bar">
          <Link to="/events" className="site-logo">
            <Ticket className="w-7 h-7 shrink-0" />
            <span className="site-logo-full">Home Run with Pipita</span>
            <span className="site-logo-short">Pipita</span>
          </Link>

          <button
            type="button"
            className="site-nav-toggle lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className={`site-nav-menu ${menuOpen ? 'is-open' : ''}`}>
            <Link to="/events" className="site-nav-link">Events</Link>
            <Link to="/products" className="site-nav-link">Shop</Link>

            {(isAdmin || user?.role === 'USER') && (
              <Link
                to={isAdmin ? '/admin' : '/dashboard/events'}
                className="site-nav-link site-nav-link-accent"
              >
                {isAdmin ? 'Admin Dashboard' : 'Manage Events'}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link to="/my-tickets" className="site-nav-link">My Tickets</Link>
                <Link to="/my-orders" className="site-nav-link">My Orders</Link>
                <Link to="/layaway" className="site-nav-link site-nav-link-green">Lipa Pole Pole</Link>
                <div className="site-nav-user">
                  <Link to="/profile" className="site-nav-profile">
                    <User className="w-4 h-4" />
                    <span>{user?.first_name || user?.email}</span>
                  </Link>
                  <button type="button" onClick={logout} className="site-nav-logout" title="Logout">
                    <LogOut className="w-4 h-4" />
                    <span className="site-nav-logout-label">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="site-nav-auth">
                <Link to="/login" className="site-nav-link">Login</Link>
                <Link to="/register" className="site-nav-cta">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link to="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link>
              <Link to="/products" className="text-gray-400 hover:text-white transition-colors">Shop</Link>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
              <Link to="/delete-account" className="text-gray-400 hover:text-white transition-colors">Delete Account</Link>
            </div>
          </div>

          {/* Partners Section */}
          <Partners />

          <div className="text-center text-gray-400 border-t border-gray-800 pt-8">
            <p className="mb-2">&copy; {new Date().getFullYear()} Home Run with Pipita. All rights reserved.</p>
            <p className="text-sm">
              Powered by <a href="https://vitaldigitalmedia.net/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">Vital Digital Media</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Admin Routes */}
            < Route
              path="/admin"
              element={
                < AdminRoute >
                  <AdminLayout />
                </AdminRoute >
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="events/new" element={<AdminEventForm />} />
              <Route path="events/:id/edit" element={<AdminEventForm />} />
              <Route path="events/:id/live" element={<EventLiveDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="scanner" element={<AdminScanner />} />
              <Route path="lottery" element={<AdminLottery />} />
              <Route path="promo-codes" element={<AdminPromoCodes />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="media" element={<AdminMediaLibrary />} />
              <Route path="payments" element={<AdminPaymentSettings />} />
              <Route path="gates" element={<AdminGates />} />
              <Route path="contacts" element={<AdminContacts />} />
            </Route >

            {/* User Dashboard Routes */}
            < Route
              path="/dashboard"
              element={
                < ProtectedRoute >
                  <UserLayout />
                </ProtectedRoute >
              }
            >
              <Route index element={<Navigate to="/dashboard/events" replace />} />
              <Route path="events" element={<UserEvents />} />
              <Route path="events/new" element={<UserEventForm />} />
              <Route path="events/:id/edit" element={<UserEventForm />} />
            </Route >

            {/* Public & User Routes */}
            < Route path="/" element={< LandingPage />} />
            < Route element={< Layout > <Outlet /></Layout >}>
              {/* Redirect /events/ to /events? moved root to LandingPage */}
              {/* <Route path="/" element={<Navigate to="/events" replace />} /> */}
              <Route path="/events" element={<Events />} />
              <Route path="/products" element={<Products />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/delete-account" element={<DeleteAccount />} />

              {/* Protected Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/adopt"
                element={
                  <ProtectedRoute>
                    <Adopt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/paystack/callback"
                element={
                  <ProtectedRoute>
                    <PaystackCallback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute>
                    <MyTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/layaway"
                element={
                  <ProtectedRoute>
                    <LayawayOrders />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to events */}
              <Route path="*" element={<Navigate to="/events" replace />} />
            </Route >
          </Routes >
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
