import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Layout } from '@/components/layout/Layout';
import { AdminRoute } from '@/components/common/AdminRoute';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Home } from '@/pages/shop/Home';
import { Products } from '@/pages/shop/Products';
import { Cart } from '@/pages/shop/Cart';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Profile } from '@/pages/auth/Profile';
import { AdminPage } from '@/pages/admin/AdminPage';
import '@/styles/main.scss';
import { ProductDetail } from './pages/shop/ProductDetail';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import { PWAUpdateModal } from './components/ui/PWAUpdateModal';

function App() {
  const { 
    showUpdateModal, 
    isUpdating, 
    handleUpdate, 
    handleCloseModal,
    offlineReady 
  } = usePWAUpdate();
  return (
      <CartProvider>
    <AuthProvider>
        <Router>
          <div className="App">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                {/* Protected Profile Route */}
                <Route 
                  path="profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin/Staff Route - Allow both admin and staff access */}
                <Route 
                  path="admin" 
                  element={
                    <AdminRoute requireStaffOnly={true}>
                      <AdminPage />
                    </AdminRoute>
                  } 
                />
              </Route>
              
              <Route path="auth/login" element={<Login />} />
              <Route path="auth/register" element={<Register />} />
            </Routes>
            {/* PWA Update Modal */}
            <PWAUpdateModal
              isOpen={showUpdateModal}
              onUpdate={handleUpdate}
              onClose={handleCloseModal}
              isUpdating={isUpdating}
            />
            <Toaster 
              position="bottom-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#3d2317',
                  color: '#e8e3d8',
                  border: '1px solid #e8e3d8'
                },
                success: {
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#1a1612'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#f87171',
                    secondary: '#1a1612'
                  }
                }
              }}
            />
          </div>
          {/* Optional: Offline indicator */}
          {offlineReady && (
            <div className="offline-ready-toast">
              🕯️ LavyaGlow is ready to work offline!
            </div>
          )}
        </Router>
    </AuthProvider>
      </CartProvider>
  );
}

export default App;
