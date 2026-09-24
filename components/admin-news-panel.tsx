'use client'

import { useEffect, useState } from 'react'

type News={id:number;slug:string;title:string;excerpt:string;category:string;content:string;pinned:boolean;published_at:string}

export function AdminNewsPanel(){
  const [items,setItems]=useState<News[]>([])
  const [editing,setEditing]=useState<News|null>(null)
  const [form,setForm]=useState({title:'',slug:'',excerpt:'',category:'NEWS',content:'',pinned:false})
  const [busy,setBusy]=useState(false)
  const [notice,setNotice]=useState<{ok:boolean;text:string}|null>(null)

  async function load(){
    const r=await fetch('/api/admin/news',{cache:'no-store'})
    const d=await r.json()
    if(!r.ok) throw new Error(d.error||'خبرها دریافت نشدند.')
    setItems(d.news||[])
  }
  useEffect(()=>{load().catch(e=>setNotice({ok:false,text:e.message}))},[])

  function edit(n:News){setEditing(n);setForm({title:n.title,slug:n.slug,excerpt:n.excerpt,category:n.category,content:n.content||'',pinned:Boolean(n.pinned)});setNotice(null)}
  function reset(){setEditing(null);setForm({title:'',slug:'',excerpt:'',category:'NEWS',content:'',pinned:false})}
  function field(k:keyof typeof form,v:string|boolean){setForm(x=>({...x,[k]:v}))}

  async function save(e:React.FormEvent){
    e.preventDefault();setBusy(true);setNotice(null)
    try{
      const r=await fetch('/api/admin/news',{method:editing?'PATCH':'POST',headers:{'content-type':'application/json'},body:JSON.stringify(editing?{id:editing.id,...form}:form)})
      const d=await r.json();if(!r.ok)throw new Error(d.error||'ذخیره نشد.')
      setNotice({ok:true,text:editing?'خبر ویرایش شد.':'خبر منتشر شد.'});reset();await load()
    }catch(e){setNotice({ok:false,text:e instanceof Error?e.message:'خطا'})}finally{setBusy(false)}
  }

  async function remove(id:number){
    if(!window.confirm('این خبر حذف شود؟'))return
    setBusy(true);setNotice(null)
    try{const r=await fetch('/api/admin/news',{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({id})});const d=await r.json();if(!r.ok)throw new Error(d.error||'حذف نشد.');if(editing?.id===id)reset();setNotice({ok:true,text:'خبر حذف شد.'});await load()}catch(e){setNotice({ok:false,text:e instanceof Error?e.message:'خطا'})}finally{setBusy(false)}
  }

  async function togglePinned(n:News){
    const r=await fetch('/api/admin/news',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({id:n.id,pinned:!n.pinned})})
    const d=await r.json();if(!r.ok)return setNotice({ok:false,text:d.error||'تغییر انجام نشد.'});await load()
  }

  return <div className="admin-news-grid">
    <div className="admin-news-list">
      {items.map(n=><div className="admin-news-item" key={n.id}><div><strong>{n.title}</strong><span>{n.slug} · {n.category} {n.pinned?'· سنجاق‌شده':''}</span></div><div className="admin-actions"><button className="btn btn-quiet btn-small" onClick={()=>edit(n)}>ویرایش</button><button className="btn btn-quiet btn-small" onClick={()=>togglePinned(n)}>{n.pinned?'برداشتن سنجاق':'سنجاق'}</button><button className="btn btn-quiet btn-small" onClick={()=>remove(n.id)}>حذف</button></div></div>)}
      {!items.length&&<p className="empty">هنوز خبری ثبت نشده.</p>}
    </div>
    <form className="form" onSubmit={save}>
      <h3>{editing?'ویرایش خبر':'خبر جدید'}</h3>
      <div className="admin-form-grid">
        <div className="field"><label>عنوان</label><input value={form.title} onChange={e=>field('title',e.target.value)} required maxLength={200}/></div>
        <div className="field"><label>Slug انگلیسی</label><input dir="ltr" value={form.slug} onChange={e=>field('slug',e.target.value)} required maxLength={160}/></div>
        <div className="field wide"><label>خلاصه</label><input value={form.excerpt} onChange={e=>field('excerpt',e.target.value)} required maxLength={500}/></div>
        <div className="field"><label>دسته</label><select value={form.category} onChange={e=>field('category',e.target.value)}><option>NEWS</option><option>ANNOUNCEMENT</option><option>UPDATE</option><option>EVENT</option><option>GUIDE</option></select></div>
        <label className="field"><span>سنجاق کردن</span><input type="checkbox" checked={form.pinned} onChange={e=>field('pinned',e.target.checked)}/></label>
        <div className="field wide"><label>متن خبر</label><textarea rows={10} value={form.content} onChange={e=>field('content',e.target.value)} required/></div>
      </div>
      <div className="admin-actions"><button className="btn btn-primary" disabled={busy} type="submit">{busy?'در حال ذخیره…':editing?'ذخیره تغییرات':'انتشار خبر'}</button>{editing&&<button className="btn btn-quiet" type="button" onClick={reset}>لغو ویرایش</button>}</div>
      {notice&&<div className={notice.ok?'notice notice-ok':'notice notice-err'}>{notice.text}</div>}
    </form>
  </div>
}