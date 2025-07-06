import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req) {
  const data = await req.formData()
  const file = data.get('file')
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // Only allow certain file types
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
  }

  // Save file to /public/uploads
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })


  // Prevent filename collisions
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const filename = `${timestamp}_${safeName}`
  const uploadPath = path.join(uploadDir, filename)
  fs.writeFileSync(uploadPath, buffer)

  
  // Return the public URL
  const url = `/uploads/${filename}`
  return NextResponse.json({ url, filename })
}
