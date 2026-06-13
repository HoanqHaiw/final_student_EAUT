import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/routes/ProtectedRoute';
import ChatbotWidget from './components/ChatbotWidget';
import AdminLayout from './components/layout/AdminLayout';
import './styles/index.css';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const About = lazy(() => import('./pages/About'));
const Events = lazy(() => import('./pages/Events'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Returns = lazy(() => import('./pages/Returns'));
const Contact = lazy(() => import('./pages/Contact'));

// Lazy loading admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminChatbot = lazy(() => import('./pages/admin/AdminChatbot'));

function AdminLanding() {
  const { user } = useSelector((state) => state.adminAuth);

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'staff') {
    return <Navigate to="/admin/orders" replace />;
  }

  return <Navigate to="/admin/login" replace />;
}

const PageLoader = () => (
    <div className="flex h-[50vh] items-center justify-center">
        <div className="flex space-x-2">
            <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-.5s]"></div>
        </div>
    </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPath && <Header />}
      <main className={isAdminPath ? 'min-h-screen bg-slate-50' : 'min-h-[calc(100vh-200px)]'}>
        <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
                path="/profile"
                element={
                <ProtectedRoute requiredRole="user">
                    <Profile />
                </ProtectedRoute>
                }
            />
            <Route
                path="/orders"
                element={
                <ProtectedRoute requiredRole="user">
                    <Orders />
                </ProtectedRoute>
                }
            />
            <Route
                path="/orders/:id"
                element={
                <ProtectedRoute requiredRole="user">
                    <OrderDetail />
                </ProtectedRoute>
                }
            />
            <Route
                path="/checkout"
                element={
                <ProtectedRoute requiredRole="user">
                    <Checkout />
                </ProtectedRoute>
                }
            />
            <Route
                path="/wishlist"
                element={
                <ProtectedRoute requiredRole="user">
                    <Wishlist />
                </ProtectedRoute>
                }
            />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/return" element={<Returns />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
            <Route
                path="/admin"
                element={
                <ProtectedRoute requiredRole="staff">
                    <AdminLayout />
                </ProtectedRoute>
                }
            >
                <Route
                index
                element={
                    <ProtectedRoute requiredRole="staff">
                    <AdminLanding />
                    </ProtectedRoute>
                }
                />
                <Route
                path="orders"
                element={
                    <ProtectedRoute requiredRole="staff">
                    <AdminOrders />
                    </ProtectedRoute>
                }
                />
                <Route
                path="orders/:id"
                element={
                    <ProtectedRoute requiredRole="staff">
                    <AdminOrderDetail />
                    </ProtectedRoute>
                }
                />
                <Route
                path="inventory"
                element={
                    <ProtectedRoute requiredRole="staff">
                    <AdminInventory />
                    </ProtectedRoute>
                }
                />
                <Route
                path="products"
                element={
                    <ProtectedRoute requiredRole="admin">
                    <AdminProducts />
                    </ProtectedRoute>
                }
                />
                <Route
                path="users"
                element={
                    <ProtectedRoute requiredRole="admin">
                    <AdminUsers />
                    </ProtectedRoute>
                }
                />
                <Route
                path="events"
                element={
                    <ProtectedRoute requiredRole="admin">
                    <AdminEvents />
                    </ProtectedRoute>
                }
                />
                <Route
                path="coupons"
                element={
                    <ProtectedRoute requiredRole="admin">
                    <AdminCoupons />
                    </ProtectedRoute>
                }
                />
                <Route
                path="categories"
                element={
                    <ProtectedRoute requiredRole="admin">
                    <AdminCategories />
                    </ProtectedRoute>
                }
                />
                <Route
                path="chatbot"
                element={
                    <ProtectedRoute requiredRole="staff">
                    <AdminChatbot />
                    </ProtectedRoute>
                }
                />
            </Route>
            </Routes>
        </Suspense>
      </main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <ChatbotWidget />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
