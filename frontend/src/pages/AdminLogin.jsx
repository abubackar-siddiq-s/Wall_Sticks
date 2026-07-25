import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials, or backend not connected yet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-white rounded-xl3 p-8">
        <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center mx-auto mb-6">
          <Lock size={20} className="text-brand-black" />
        </div>
        <h1 className="text-2xl font-extrabold text-center mb-1">Admin Login</h1>
        <p className="text-center text-black/45 text-sm mb-8">WallSticks admin dashboard</p>
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm" />
          <button disabled={loading} className="w-full bg-brand-black text-brand-yellow font-bold py-4 rounded-full disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
