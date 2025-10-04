// App.tsx - Add AuthModalProvider and AuthModal
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { CartProvider } from '@/contexts/CartContext';
import { Layout } from '@/components/layout/Layout';
import { AdminRoute } from '@/components/common/AdminRoute';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AuthModal } from '@/components/ui/AuthModal';
import { Home } from '@/pages/shop/Home';
import { Products } from '@/pages/shop/Products';
import { Cart } from '@/pages/shop/Cart';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Profile } from '@/pages/auth/Profile';
import { AdminPage } from '@/pages/admin/AdminPage';
import { ProductDetail } from './pages/shop/ProductDetail';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import { PWAUpdateModal } from './components/ui/PWAUpdateModal';
import { Checkout } from './pages/checkout/Checkout';
import { OrderDetails } from './pages/order/OrderDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import '@/styles/main.scss';

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
        <AuthModalProvider>
          <Router>
            <div className="App">
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/:id" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route 
                    path="profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/orders/:orderId" element={<OrderDetails />} />
                  <Route 
                    path="admin" 
                    element={
                      <AdminRoute requireStaffOnly={true}>
                        <AdminPage />
                      </AdminRoute>
                    } 
                  />
                </Route>
                
                {/* Keep existing routes for direct access/SEO */}
                {/* <Route path="auth/login" element={<Login />} />
                <Route path="auth/register" element={<Register />} /> */}
                {/* Catch-all: redirect unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Universal Auth Modal */}
              <AuthModal />

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
            
            {offlineReady && (
              <div className="offline-ready-toast">
                🕯️ LavyaGlow is ready to work offline!
              </div>
            )}
          </Router>
        </AuthModalProvider>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
