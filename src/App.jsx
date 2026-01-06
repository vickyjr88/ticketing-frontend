import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Ticket, LogOut, User } from 'lucide-react';
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
              <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium">
                Shop
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
                  <Link to="/my-orders" className="text-gray-700 hover:text-blue-600 font-medium">
                    My Orders
                  </Link>
                  <Link to="/layaway" className="text-green-600 hover:text-green-700 font-medium">
                    Lipa Pole Pole
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
      <footer className="bg-gray-900 text-gray-400 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex gap-6">
              <Link to="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link>
              <Link to="/products" className="text-gray-400 hover:text-white transition-colors">Shop</Link>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Partners Section */}
          <Partners />

          <div className="text-center text-gray-400 border-t border-gray-800 pt-8">
            <p className="mb-2">&copy; 2024 Home Run with Pipita. All rights reserved.</p>
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
