import CVUploader from './CVUploader';

export default function SectionExtractorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Extracteur de Sections CV
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Téléchargez votre CV et extrayez le contenu de sections spécifiques comme "Atouts", 
            "Compétences", "Expérience", etc.
          </p>
        </div>
        
        <CVUploader />
      </div>
    </div>
  );
} 