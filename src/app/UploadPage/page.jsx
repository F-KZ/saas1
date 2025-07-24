'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useUploadStore from '@/store/UploadStore'
import Link from 'next/link'
import Image from 'next/image'
import { Instructions } from '@/components/Instructions'
import flyer from '../../../public/flyers.png'
import curriculum from '../../../public/cvScreen.png'
import { fetchJobs } from '@/app/api/ApiEmploi'
import getFranceTravailToken from '../api/jobs/route'


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

  
  useEffect(async () => {
   const getJobs = async () => {
      console.log(process.env.NEXT_PUBLIC_FRANCE_TRAVAIL_ID)
      console.log(process.env.NEXT_PUBLIC_FRANCE_TRAVAIL_SECRET)
      
      const jobs = await fetchJobs()
     
  
    }
    getJobs() 
  
  }, [])

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
            <h1 className='text-4xl font-bold text-left'>Comment ça marche ?</h1>
            <p>1. Importez votre CV</p> 
            <p>2. Lancer l'analyse</p> 
            <p>3. Analysez les résultats</p> 
            <p className='text-sm font-light text-gray-500'>*Attention, l'analyse peut prendre jusqu'à 2 minutes</p>
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
            <Instructions />
        </div>
        <div className='flex flex-col items-center justify-center w-full lg:w-1/2 shadow-lg p-4 rounded-lg border border-gray-200'>
            <Image src={curriculum} alt="CV Example" className='max-h-110 max-w-110 object-contain' />
        </div>
      </div>
    </div>
  )
}
