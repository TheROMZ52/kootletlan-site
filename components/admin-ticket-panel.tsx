'use client'

import { useEffect, useState } from 'react'

type Ticket = { id:number; subject:string; status:string; username:string; email?:string; created_at:string; updated_at:string }
type Message = { id:number; message:string; created_at:string; username:string; role:string }

export function AdminTicketPanel() {
  const [tickets,setTickets]=useState<Ticket[]>([])
  const [selected,setSelected]=useState<Ticket|null>(null)
  const [messages,setMessages]=useState<Message[]>([])
  const [reply,setReply]=useState('')
  const [filter,setFilter]=useState('all')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')

  async function loadTickets() {
    const r=await fetch('/api/admin/tickets',{cache:'no-store'})
    const d=await r.json()
    if(!r.ok) throw new Error(d.error||'تیکت‌ها دریافت نشدند.')
    setTickets(d.tickets||[])
  }

  async function openTicket(t:Ticket) {
    setError('')
    setSelected(t)
    const r=await fetch('/api/admin/tickets?id='+t.id,{cache:'no-store'})
    const d=await r.json()
    if(!r.ok) return setError(d.error||'تیکت دریافت نشد.')
    setMessages(d.messages||[])
  }

  async function setStatus(status:string) {
    if(!selected) return
    setBusy(true); setError('')
    try {
      const r=await fetch('/api/admin/tickets',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({id:selected.id,status})})
      const d=await r.json()
      if(!r.ok) throw new Error(d.error||'وضعیت تغییر نکرد.')
      const next={...selected,status}
      setSelected(next)
      setTickets(v=>v.map(t=>t.id===selected.id?next:t))
    } catch(e) { setError(e instanceof Error?e.message:'خطا') } finally { setBusy(false) }
  }

  async function sendReply(e:React.FormEvent) {
    e.preventDefault()
    if(!selected || !reply.trim()) return
    setBusy(true); setError('')
    try {
      const r=await fetch('/api/admin/tickets/reply',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ticketId:selected.id,message:reply})})
      const d=await r.json()
      if(!r.ok) throw new Error(d.error||'پاسخ ارسال نشد.')
      setReply('')
      await openTicket(selected)
      await loadTickets()
    } catch(e) { setError(e instanceof Error?e.message:'خطا') } finally { setBusy(false) }
  }

  useEffect(()=>{ loadTickets().catch(e=>setError(e instanceof Error?e.message:'خطا')) },[])

  const visible=tickets.filter(t=>filter==='all'||t.status===filter)

  return <div className="admin-ticket-grid">
    <div className="admin-ticket-list">
      <div className="admin-actions">
        {['all','open','pending','closed'].map(s=><button key={s} className={filter===s?'btn btn-primary btn-small':'btn btn-quiet btn-small'} onClick={()=>setFilter(s)}>{s==='all'?'همه':s==='open'?'باز':s==='pending'?'در انتظار':'بسته'}</button>)}
      </div>
      {visible.map(t=><button key={t.id} className={selected?.id===t.id?'admin-ticket-item active':'admin-ticket-item'} onClick={()=>openTicket(t)}><strong>#{t.id} — {t.subject}</strong><span>{t.username} · {t.status}</span></button>)}
      {!visible.length&&<p className="empty">تیکتی در این فیلتر نیست.</p>}
    </div>
    <div className="admin-ticket-detail">
      {selected ? <><div className="admin-ticket-head"><div><h3>#{selected.id} — {selected.subject}</h3><p className="muted">{selected.username}{selected.email?' · '+selected.email:''}</p></div><div className="admin-actions">{['open','pending','closed'].map(s=><button key={s} disabled={busy||selected.status===s} className="btn btn-quiet btn-small" onClick={()=>setStatus(s)}>{s==='open'?'باز':s==='pending'?'در انتظار':'بستن'}</button>)}</div></div><div className="ticket-messages">{messages.map(m=><div key={m.id} className={m.role==='admin'?'ticket-message staff':'ticket-message'}><div><strong>{m.username}</strong><span className="muted"> · {new Date(m.created_at).toLocaleString('fa-IR')}</span></div><p>{m.message}</p></div>)}</div><form className="form" onSubmit={sendReply}><div className="field"><label htmlFor="admin-reply">پاسخ</label><textarea id="admin-reply" value={reply} onChange={e=>setReply(e.target.value)} maxLength={4000} rows={5} placeholder="پاسخ خودت را بنویس..." /></div><button className="btn btn-primary" disabled={busy||!reply.trim()} type="submit">{busy?'در حال ارسال…':'ارسال پاسخ'}</button></form>{error&&<div className="notice notice-err">{error}</div>}</> : <div className="empty">یک تیکت را انتخاب کن.</div>}
    </div>
  </div>
}
