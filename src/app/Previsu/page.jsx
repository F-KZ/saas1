'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import useUploadStore from '@/store/UploadStore'
import Link from 'next/link'

export default function Previsu() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const { cvText, cvStats, loading, error, cvFile, setCvText, setCvStats } = useUploadStore()
  const [skills, setSkills] = useState([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [skillsError, setSkillsError] = useState(null)
  const { extractedSkills, setExtractedSkills, addSkill } = useUploadStore()

  console.log('URL reçue dans Previsu:', url)
  console.log('Fichier CV:', cvFile)
  console.log('Texte du CV:', cvText ? cvText.substring(0, 100) + '...' : 'Aucun texte')

  // Extraire le nom du fichier depuis l'URL
  const filename = url ? url.split('/').pop() : null
  console.log('Previsu - URL complète:', url)
  console.log('Previsu - filename extrait:', filename)

  useEffect(() => {
    if (filename && !cvText) {
      const extractText = async () => {
        try {
          const extractRes = await fetch('/api/extract-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename })
          });
          const extractData = await extractRes.json();
          setCvText(extractData.text);
          setCvStats({
            wordCount: extractData.wordCount,
            characterCount: extractData.characterCount,
            fileType: extractData.fileType
          });
          //console.log('Texte extrait:', extractData.text.substring(0, 200) + '...');
          console.log('Texte extrait complet:', extractData.text);
        } catch (error) {
          console.error('Erreur lors de l\'extraction du texte:', error)
        }
      };
      
      extractText();
    }
  }, [filename, cvText, setCvText, setCvStats]);

  // Fonction pour extraire les compétences
  const extractSkills = async () => {
    if (!cvText) {
      setSkillsError('Aucun texte de CV disponible')
      return
    }

    setSkillsLoading(true)
    setSkillsError(null)

    try {
      const response = await fetch('/api/extract-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cvText })
      })

      const data = await response.json()

      if (data.success) {
        setSkills(data.skills)
        setExtractedSkills(data.skills)
        console.log('Compétences extraites:', data.skills)
      } else {
        setSkillsError(data.error || 'Erreur lors de l\'extraction des compétences')
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction des compétences:', error)
      setSkillsError('Erreur lors de l\'extraction des compétences')
    } finally {
      setSkillsLoading(false)
    }
  }

  // Fonction pour extraire les compétences avec NLP
  const extractSkillsNLP = async () => {
    if (!cvText) {
      setSkillsError('Aucun texte de CV disponible')
      return
    }

    setSkillsLoading(true)
    setSkillsError(null)

    try {
      const response = await fetch('/api/extract-skills-nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cvText })
      })

      const data = await response.json()

      if (data.success) {
        setSkills(data.skills)
        console.log('Compétences extraites avec NLP:', data.skills)
      } else {
        setSkillsError(data.error || 'Erreur lors de l\'extraction NLP des compétences')
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction NLP des compétences:', error)
      setSkillsError('Erreur lors de l\'extraction NLP des compétences')
    } finally {
      setSkillsLoading(false)
    }
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Aucun fichier à prévisualiser</h1>
          <p>Veuillez d'abord uploader un fichier.</p>
        </div>
      </div>
    )
  }

  const ext = url.split('.').pop().toLowerCase()

  return (
    <div className="min-h-screen p-6">
      {/* Header avec stats */}
      {cvText && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Informations du CV</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold">Mots:</span> {cvStats?.wordCount || 0}
            </div>
            <div>
              <span className="font-semibold">Caractères:</span> {cvStats?.characterCount || 0}
            </div>
            <div>
              <span className="font-semibold">Type:</span> {cvStats?.fileType || ext}
            </div>
          </div>
          
          {/* Boutons pour extraire les compétences */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={extractSkills}
              disabled={skillsLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            >
              {skillsLoading ? 'Extraction...' : 'Extraire les compétences (Regex)'}
            </button>
            
            <button
              onClick={extractSkillsNLP}
              disabled={skillsLoading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400 transition-colors"
            >
              {skillsLoading ? 'Extraction...' : 'Extraire les compétences (NLP)'}
            </button>

            <button className='text-sm font-light shadow-lg rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors'>
              <Link href="/JobSearch">Lancer l'analyse</Link>
            </button>
          </div>

          {skillsError && (
            <div className="mt-2 text-red-600">
              Erreur: {skillsError}
            </div>
          )}

          {error && (
            <div className="mt-2 text-red-600">
              Erreur: {error}
            </div>
          )}
        </div>
      )}

      {/* Prévisualisation du fichier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PDF Viewer */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 border-b">
            <h3 className="font-semibold">Prévisualisation du fichier</h3>
          </div>
          {ext === 'pdf' ? (
            <iframe 
              src={url} 
              className="w-full h-96 border-0"
              title="Prévisualisation PDF"
            />
          ) : (
            <div className="p-6 text-center">
              <p className="mb-4">Type de fichier non supporté pour la prévisualisation directe.</p>
              <a 
                href={url} 
                download 
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Télécharger le fichier
              </a>
            </div>
          )}
        </div>

        {/* Texte extrait */}
        {cvText && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 border-b">
              <h3 className="font-semibold">Texte extrait du CV</h3>
            </div>
            <div className="p-4 h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{cvText}</pre>
            </div>
          </div>
        )}

        {/* Compétences extraites */}
        {skills.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 border-b">
              <h3 className="font-semibold">Compétences extraites ({skills.length})</h3>
            </div>
            <div className="p-4 h-96 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
