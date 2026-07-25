import { useEffect, useState } from 'react'
import { Mail, MailOpen, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/contact')
      .then(({ data }) => {
        if (Array.isArray(data)) setMessages(data)
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    setMessages((prev) => prev.map((m) => m._id === id ? { ...m, read: true } : m))
    try { await api.put(`/contact/${id}/read`) } catch { /* best effort */ }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/contact/${id}`)
      setMessages((prev) => prev.filter((m) => m._id !== id))
      toast.success('Message deleted')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete message')
    }
  }

  return (
    <AdminLayout title="Customer Messages">
      <div className="space-y-3 max-w-3xl">
        {messages.map((m) => (
          <div
            key={m._id}
            onClick={() => !m.read && markRead(m._id)}
            className={`w-full text-left bg-white rounded-2xl shadow-soft p-5 flex gap-4 border transition-all cursor-pointer ${
              m.read ? 'border-black/5' : 'border-brand-yellow bg-yellow-50/20'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/15 flex items-center justify-center shrink-0 mt-0.5">
              {m.read ? <MailOpen size={18} className="text-black/40" /> : <Mail size={18} className="text-brand-gold" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-sm text-brand-black">{m.name}</p>
                  <span className="text-xs text-black/40 font-medium">· {m.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!m.read && (
                    <span className="text-[10px] font-extrabold bg-brand-yellow text-brand-black px-2.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDelete(m._id, e)}
                    className="p-1.5 rounded-lg text-black/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-black/75 leading-relaxed font-medium mb-2">{m.message}</p>
              <p className="text-[11px] text-black/40 font-semibold">
                {new Date(m.createdAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}

        {!loading && messages.length === 0 && (
          <div className="text-center bg-white rounded-2xl p-16 border border-black/5">
            <p className="text-sm font-bold text-black/40">No messages yet.</p>
            <p className="text-xs text-black/30 mt-1">Customer inquiries submitted through the contact page will appear here.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
