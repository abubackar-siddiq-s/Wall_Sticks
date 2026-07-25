import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerProtectedRoute from './components/CustomerProtectedRoute'
import MobileLoginModal from './components/MobileLoginModal'
import PageLoader from './components/PageLoader'
import ScrollToTop from './components/ScrollToTop'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const CreatePoster = lazy(() => import('./pages/CreatePoster'))
const Cart = lazy(() => import('./pages/Cart'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Payment = lazy(() => import('./pages/Payment'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const ReceiptPage = lazy(() => import('./pages/ReceiptPage'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Reviews = lazy(() => import('./pages/Reviews'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminTrending = lazy(() => import('./pages/admin/AdminTrending'))
const AdminBestSellers = lazy(() => import('./pages/admin/AdminBestSellers'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminSizePricing = lazy(() => import('./pages/admin/AdminSizePricing'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ScrollToTop />
      <MobileLoginModal />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Printable Receipt route */}
          <Route path="/receipt/:orderNumber" element={<ReceiptPage />} />

          {/* Admin routes render their own chrome (sidebar), so keep them outside Navbar/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/trending" element={<ProtectedRoute><AdminTrending /></ProtectedRoute>} />
          <Route path="/admin/best-sellers" element={<ProtectedRoute><AdminBestSellers /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/size-pricing" element={<ProtectedRoute><AdminSizePricing /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

          <Route path="*" element={
            <>
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/create-your-own" element={<CreatePoster />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/watchlist" element={<Wishlist />} />
                    <Route path="/checkout" element={<CustomerProtectedRoute><Checkout /></CustomerProtectedRoute>} />
                    <Route path="/payment" element={<CustomerProtectedRoute><Payment /></CustomerProtectedRoute>} />
                    <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                    <Route path="/my-orders" element={<CustomerProtectedRoute><MyOrders /></CustomerProtectedRoute>} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </Suspense>
    </div>
  )
}
