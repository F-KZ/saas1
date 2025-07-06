'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { instructions } from '@/lib/constants'
import useUploadStore from '@/store/UploadStore'
import Link from 'next/link'

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const {
    cvFile,
    setCvFile,
    setCvText,
    setCvStats,
    setLoading,
    setError,
    reset
  } = useUploadStore()

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setCvFile(file) // Stocke directement dans Zustand
    }
  }

  const handleUpload = async () => {
    if (!cvFile) return // Utilise cvFile du store

    setIsUploading(true)
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', cvFile)

      // 1. Upload du fichier
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) throw new Error('Upload failed')
      const { url, filename } = await res.json()

      // 2. Extraction du texte
      const extractRes = await fetch('/api/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })
      
             const extractData = await extractRes.json()
       
       // 3. Mise à jour du store
       setCvText(extractData.text)
       setCvStats({
         wordCount: extractData.wordCount,
         characterCount: extractData.characterCount,
         fileType: extractData.fileType
       })
       setLoading(false)

      // Redirection avec toutes les données
      router.push(`/Previsu?url=${encodeURIComponent(url)}`)
      
    } catch (error) {
      setError(error.message)
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
      setLoading(false)
    }
  }
  return (
    <div className='flex flex-col justify-center min-h-screen max-w-screen-lg mx-auto gap-12 p-6'>
        <div className='flex flex-col md:flex-row justify-between w-full gap-6'>
          <div className='flex flex-col gap-4'>
            <h1 className='text-4xl font-bold text-left'>UploadPage</h1>
            <p>Upload your CV</p> 
          </div>
                      <div className='flex flex-col items-center justify-center gap-4'>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              
              <button 
                onClick={() => document.getElementById('file-upload').click()}
                className='text-sm font-light shadow-lg rounded-lg border border-gray-200 p-3 relative hover:bg-gray-50 transition-colors'
              >
                {cvFile ? cvFile.name : 'Importez votre CV'}
                <div className='absolute -top-1 -right-1'>
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
                  </span>
                </div>
              </button>
              
              {cvFile && (
                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="text-sm font-light shadow-lg rounded-lg border border-blue-200 bg-blue-50 p-3 hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Upload en cours...' : 'Uploader le fichier'}
                </button>
              )}
              
              <Link href="/Previsu"> 
                <button className='text-sm font-light shadow-lg rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors'>
                  Lancer l'analyse
                </button>
              </Link>
            </div>
        </div>
      
      <div className='flex flex-col lg:flex-row justify-between container gap-6 mx-auto'>
        <div className='flex flex-col items-center justify-center w-full lg:w-1/2 gap-4 shadow-lg p-4 rounded-lg border border-gray-200'>
            <h2 className='text-2xl font-bold'>Instructions pour le CV</h2>
    
            <ul className='w-full space-y-2'>
                {instructions.map((instruction, index) => (
                    <li className='w-full p-4 border border-gray-200 text-left rounded' key={index}>{instruction.name}</li>
                ))}
            </ul>
        </div>
        <div className='flex flex-col items-center justify-center w-full lg:w-1/2 shadow-lg p-4 rounded-lg border border-gray-200'>
            <h2 className='text-2xl font-bold'>Exemple de CV</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
        </div>
      </div>
    </div>
  )
}
