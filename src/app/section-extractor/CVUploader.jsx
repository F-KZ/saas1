'use client';
import { useState } from 'react';

export default function CVUploader() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Vérification du type
      if (file.type !== 'application/pdf') {
        throw new Error('Seuls les fichiers PDF sont acceptés');
      }

      // 2. Lecture du fichier
      const buffer = await file.arrayBuffer();

      // 3. Appel API
      const response = await fetch('/api/extract-cv-section', {
        method: 'POST',
        body: JSON.stringify({
          fileBuffer: Array.from(new Uint8Array(buffer))
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Upload failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="hidden"
            id="cv-upload"
          />
          <label
            htmlFor="cv-upload"
            className="cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition"
          >
            {isLoading ? 'Traitement en cours...' : 'Sélectionner un CV (PDF)'}
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Taille maximale : 5MB
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        {results && (
          <div className="space-y-8">
            {Object.entries(results.sections).map(([sectionType, { title, content }]) => (
              <div key={sectionType} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <ul className="space-y-2">
                  {content.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 