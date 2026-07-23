import { useEffect, useState } from 'react'
import { Mail, MailOpen } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/contact')
      .then(({ data }) => { setMessages(data); setIsLive(true) })
      .catch(() => setIsLive(false))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    setMessages((prev) => prev.map((m) => m._id === id ? { ...m, read: true } : m))
    try { await api.put(`/contact/${id}/read`) } catch { /* best effort */ }
  }

  return (
    <AdminLayout title="Messages">
      {!isLive && !loading && (
        <p className="text-xs text-black/40 mb-4">Connect the backend (see README) to see contact form submissions here.</p>
      )}
      <div className="space-y-3 max-w-2xl">
        {messages.map((m) => (
          <button
            key={m._id}
            onClick={() => !m.read && markRead(m._id)}
            className="w-full text-left bg-white rounded-xl2 shadow-soft p-5 flex gap-4"
          >
            <div className="w-9 h-9 rounded-full bg-brand-yellow/15 flex items-center justify-center shrink-0 mt-0.5">
              {m.read ? <MailOpen size={16} className="text-brand-gold" /> : <Mail size={16} className="text-brand-gold" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">{m.name} <span className="text-black/40 font-normal">· {m.email}</span></p>
                {!m.read && <span className="text-[10px] font-bold bg-brand-yellow px-2 py-0.5 rounded-full">New</span>}
              </div>
              <p className="text-sm text-black/60 leading-relaxed">{m.message}</p>
              <p className="text-xs text-black/35 mt-2">{new Date(m.createdAt).toLocaleString('en-IN')}</p>
            </div>
          </button>
        ))}
        {!loading && messages.length === 0 && <p className="text-center text-black/40 py-16 text-sm">No messages yet.</p>}
      </div>
    </AdminLayout>
  )
}
