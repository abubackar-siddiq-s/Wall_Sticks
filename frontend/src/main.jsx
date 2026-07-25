import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CustomerAuthProvider } from './context/CustomerAuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#0A0A0A',
                    color: '#FFD000',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    borderRadius: '14px',
                    padding: '12px 18px'
                  }
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
