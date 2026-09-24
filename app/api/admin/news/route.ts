import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

async function admin() {
  const user = await getCurrentUser()
  return user?.role === 'admin' ? user : null
}

function data(body:any){
  const title=typeof body.title==='string'?body.title.trim().slice(0,200):''
  const slug=typeof body.slug==='string'?body.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,160):''
  const excerpt=typeof body.excerpt==='string'?body.excerpt.trim().slice(0,500):''
  const category=typeof body.category==='string'?body.category.trim().slice(0,64):'NEWS'
  const content=typeof body.content==='string'?body.content.trim():''
  const pinned=Boolean(body.pinned)
  return {title,slug,excerpt,category,content,pinned}
}

export async function GET(){
  const user=await admin(); if(!user)return NextResponse.json({error:'دسترسی غیرمجاز.'},{status:403})
  const [rows]=await db.execute<any[]>('SELECT id, slug, title, excerpt, category, content, pinned, published_at FROM news ORDER BY pinned DESC, published_at DESC')
  return NextResponse.json({news:rows})
}

export async function POST(request:Request){
  const user=await admin(); if(!user)return NextResponse.json({error:'دسترسی غیرمجاز.'},{status:403})
  const body=await request.json(); const n=data(body)
  if(n.title.length<3||n.slug.length<3||n.excerpt.length<3||n.content.length<3)return NextResponse.json({error:'همه فیلدها را کامل کن.'},{status:400})
  const [dupe]=await db.execute<any[]>('SELECT id FROM news WHERE slug=? LIMIT 1',[n.slug])
  if(dupe[0])return NextResponse.json({error:'این Slug قبلاً استفاده شده.'},{status:409})
  await db.execute('INSERT INTO news (slug,title,excerpt,category,content,pinned,published_at) VALUES (?,?,?,?,?,?,NOW())',[n.slug,n.title,n.excerpt,n.category,n.content,n.pinned])
  return NextResponse.json({ok:true})
}

export async function PATCH(request:Request){
  const user=await admin(); if(!user)return NextResponse.json({error:'دسترسی غیرمجاز.'},{status:403})
  const body=await request.json(); const id=Number(body.id)
  if(!Number.isInteger(id)||id<1)return NextResponse.json({error:'شناسه نامعتبر.'},{status:400})
  if(Object.prototype.hasOwnProperty.call(body,'pinned')&&!Object.prototype.hasOwnProperty.call(body,'title')){
    await db.execute('UPDATE news SET pinned=? WHERE id=?',[Boolean(body.pinned),id]); return NextResponse.json({ok:true})
  }
  const n=data(body)
  if(n.title.length<3||n.slug.length<3||n.excerpt.length<3||n.content.length<3)return NextResponse.json({error:'همه فیلدها را کامل کن.'},{status:400})
  const [dupe]=await db.execute<any[]>('SELECT id FROM news WHERE slug=? AND id<>? LIMIT 1',[n.slug,id])
  if(dupe[0])return NextResponse.json({error:'این Slug قبلاً استفاده شده.'},{status:409})
  const [result]=await db.execute<any>('UPDATE news SET slug=?,title=?,excerpt=?,category=?,content=?,pinned=? WHERE id=?',[n.slug,n.title,n.excerpt,n.category,n.content,n.pinned,id])
  if(!result.affectedRows)return NextResponse.json({error:'خبر پیدا نشد.'},{status:404})
  return NextResponse.json({ok:true})
}

export async function DELETE(request:Request){
  const user=await admin(); if(!user)return NextResponse.json({error:'دسترسی غیرمجاز.'},{status:403})
  const body=await request.json(); const id=Number(body.id)
  if(!Number.isInteger(id)||id<1)return NextResponse.json({error:'شناسه نامعتبر.'},{status:400})
  const [result]=await db.execute<any>('DELETE FROM news WHERE id=?',[id])
  if(!result.affectedRows)return NextResponse.json({error:'خبر پیدا نشد.'},{status:404})
  return NextResponse.json({ok:true})
}
