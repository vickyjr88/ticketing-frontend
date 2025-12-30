import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Ticket, LogOut, User } from 'lucide-react';

// Pages
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Checkout from './pages/Checkout';
import MyTickets from './pages/MyTickets';
import PaystackCallback from './pages/PaystackCallback';
import Login from './pages/Login';
import Register from './pages/Register';
import Adopt from './pages/Adopt';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventForm from './pages/admin/AdminEventForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminScanner from './pages/admin/AdminScanner';
import AdminLottery from './pages/admin/AdminLottery';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminMediaLibrary from './pages/admin/AdminMediaLibrary';

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/events" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
              <Ticket className="w-8 h-8" />
              Home Run with Pipita
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/events" className="text-gray-700 hover:text-blue-600 font-medium">
                Events
              </Link>

              {(isAdmin || user?.role === 'USER') && (
                <Link to={isAdmin ? "/admin" : "/dashboard/events"} className="text-blue-600 hover:text-blue-800 font-medium">
                  {isAdmin ? 'Admin Dashboard' : 'Manage Events'}
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link to="/my-tickets" className="text-gray-700 hover:text-blue-600 font-medium">
                    My Tickets
                  </Link>
                  <div className="flex items-center gap-2">
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {user?.first_name || user?.email}
                      </span>
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 font-medium"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">&copy; 2024 Home Run with Pipita. All rights reserved.</p>
            <p className="text-sm">
              Powered by <span className="font-semibold text-blue-600">VDM Digital Agency</span>
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
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="events/new" element={<AdminEventForm />} />
            <Route path="events/:id/edit" element={<AdminEventForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="scanner" element={<AdminScanner />} />
            <Route path="lottery" element={<AdminLottery />} />
            <Route path="promo-codes" element={<AdminPromoCodes />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="media" element={<AdminMediaLibrary />} />
          </Route>

          {/* User Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/events" replace />} />
            <Route path="events" element={<UserEvents />} />
            <Route path="events/new" element={<UserEventForm />} />
            <Route path="events/:id/edit" element={<UserEventForm />} />
          </Route>

          {/* Public & User Routes */}
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/events" />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

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
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
