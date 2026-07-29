import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, ArrowRight, Lock, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCustomerAuth } from '../context/CustomerAuthContext'

export default function MobileLoginModal() {
  const { isLoginModalOpen, closeLoginModal, requestCustomerOtp, verifyCustomerOtp } = useCustomerAuth()
  const [step, setStep] = useState(1) // 1: Email & Phone, 2: OTP
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    let timer
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendCountdown])

  if (!isLoginModalOpen) return null

  const handleSendOtp = async (e) => {
    e.preventDefault()
    const cleaned = phone.replace(/\D/g, '')
    if (!email.trim() || !email.includes('@')) {
      return toast.error('Please enter a valid email address')
    }
    if (cleaned.length < 10) {
      return toast.error('Please enter a valid 10-digit mobile number')
    }
    setLoading(true)
    try {
      await requestCustomerOtp(email.trim(), cleaned)
      toast.success('Verification code sent to your email')
      setStep(2)
      setResendCountdown(30)
      setOtp('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return
    const cleaned = phone.replace(/\D/g, '')
    setLoading(true)
    try {
      await requestCustomerOtp(email.trim(), cleaned)
      toast.success('Verification code resent to your email!')
      setResendCountdown(30)
      setOtp('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim() || otp.length !== 4) {
      return toast.error('Please enter the 4-digit OTP')
    }
    setLoading(true)
    try {
      const user = await verifyCustomerOtp(email.trim(), phone, otp.trim())
      toast.success(`Logged in as ${user.name || 'Customer'}`)
      setStep(1)
      setPhone('')
      setEmail('')
      setOtp('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Please check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    closeLoginModal()
    setStep(1)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-yellow/30 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-brand-smoke transition-colors text-black/60"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-black text-brand-yellow flex items-center justify-center font-bold shadow-md">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-brand-black">Login to WallSticks</h2>
              <p className="text-xs text-black/50">Access your Wishlist, Orders & Cart</p>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="block text-xs font-semibold text-black/70 mb-1.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 rounded-2xl bg-brand-smoke border border-black/10 focus:border-brand-black text-sm font-semibold outline-none placeholder:font-normal placeholder:text-black/35"
                  autoFocus
                />
              </div>

              {/* MOBILE */}
              <div>
                <label className="block text-xs font-semibold text-black/70 mb-1.5 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <div className="flex rounded-2xl bg-brand-smoke border border-black/10 focus-within:border-brand-black overflow-hidden transition-all">
                  <span className="px-4 py-3.5 bg-black/5 text-sm font-bold text-black/70 flex items-center border-r border-black/10">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full px-4 py-3.5 bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-black/35"
                  />
                </div>
              </div>

              <div className="bg-brand-yellow/15 border border-brand-yellow/40 rounded-2xl p-3.5 text-xs text-brand-black flex items-start gap-2.5">
                <Lock size={15} className="mt-0.5 shrink-0 text-brand-black" />
                <span>Wishlist, cart, and orders require unique email & phone authentication. OTP is sent to your email.</span>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10 || !email.trim()}
                className="w-full bg-brand-black text-brand-yellow font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:shadow-glow transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Sending Code...' : 'Get Verification Code'}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider">
                    Enter 4-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-black/50 underline hover:text-black"
                  >
                    Change Details
                  </button>
                </div>
                <p className="text-xs text-black/50 mb-3">
                  Sent to <span className="font-bold text-black">{email}</span>
                </p>

                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                  className="w-full text-center text-2xl tracking-[0.5em] font-extrabold py-3.5 rounded-2xl bg-brand-smoke border border-black/10 focus:border-brand-black outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs text-black/60 px-1">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  disabled={resendCountdown > 0 || loading}
                  onClick={handleResendOtp}
                  className="font-bold text-brand-black hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                >
                  <RotateCcw size={12} className={resendCountdown > 0 ? 'animate-spin' : ''} />
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !otp.trim()}
                className="w-full bg-brand-black text-brand-yellow font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:shadow-glow transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
