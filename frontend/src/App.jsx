import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerProtectedRoute from './components/CustomerProtectedRoute'
import MobileLoginModal from './components/MobileLoginModal'
import PageLoader from './components/PageLoader'

// Every route is its own chunk. This keeps the initial JS payload small — a first-time
// visitor to the homepage doesn't pay for the admin dashboard's chart code (or vice versa),
// and each page only downloads once, the moment it's actually navigated to.
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const CreatePoster = lazy(() => import('./pages/CreatePoster'))
const Cart = lazy(() => import('./pages/Cart'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Payment = lazy(() => import('./pages/Payment'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminTrending = lazy(() => import('./pages/admin/AdminTrending'))
const AdminBestSellers = lazy(() => import('./pages/admin/AdminBestSellers'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminSizePricing = lazy(() => import('./pages/admin/AdminSizePricing'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MobileLoginModal />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin routes render their own chrome (sidebar), so keep them outside Navbar/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/trending" element={<ProtectedRoute><AdminTrending /></ProtectedRoute>} />
          <Route path="/admin/best-sellers" element={<ProtectedRoute><AdminBestSellers /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/size-pricing" element={<ProtectedRoute><AdminSizePricing /></ProtectedRoute>} />
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
                    <Route path="/cart" element={<CustomerProtectedRoute><Cart /></CustomerProtectedRoute>} />
                    <Route path="/wishlist" element={<CustomerProtectedRoute><Wishlist /></CustomerProtectedRoute>} />
                    <Route path="/checkout" element={<CustomerProtectedRoute><Checkout /></CustomerProtectedRoute>} />
                    <Route path="/payment" element={<CustomerProtectedRoute><Payment /></CustomerProtectedRoute>} />
                    <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                    <Route path="/my-orders" element={<CustomerProtectedRoute><MyOrders /></CustomerProtectedRoute>} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
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
