import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Shop from './pages/Shop.tsx';
import ProductDetail from './pages/ProductDetail.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import Login from './pages/Login.tsx';
import Profile from './pages/Profile.tsx';
import TrackOrder from './pages/TrackOrder.tsx';
import Support from './pages/Support.tsx';
import ImportRequest from './pages/ImportRequest.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboard from './pages/admin/Dashboard.tsx';
import AdminInvoices from './pages/admin/Invoices.tsx';
import AdminPartners from './pages/admin/Partners.tsx';
import AdminProducts from './pages/admin/Products.tsx';
import AdminOrders from './pages/admin/Orders.tsx';
import AdminUsers from './pages/admin/Users.tsx';
import AdminImportRequests from './pages/admin/AdminImportRequests.tsx';
import AdminSettings from './pages/admin/Settings.tsx';
import AdminAnalytics from './pages/admin/Analytics.tsx';
import AdminPromos from './pages/admin/Promos.tsx';
import FirebaseProvider from './lib/FirebaseProvider.tsx';

function App() {
  return (
    <Router>
      <FirebaseProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="login" element={<Login />} />
            <Route path="profile" element={<Profile />} />
            <Route path="track" element={<TrackOrder />} />
            <Route path="support" element={<Support />} />
            <Route path="import-request" element={<ImportRequest />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="promos" element={<AdminPromos />} />
            <Route path="import-requests" element={<AdminImportRequests />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </FirebaseProvider>
    </Router>
  );
}

export default App;
