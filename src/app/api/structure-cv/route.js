import { structureCV } from '@/lib/cv-structurer';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({
        success: false,
        error: 'Text content is required'
      }, { status: 400 });
    }

    console.log('Structure CV - Texte reçu, longueur:', text.length);
    
    const structuredData = structureCV(text);
    
    console.log('Structure CV - Données structurées:', structuredData);
    
    return Response.json({
      success: true,
      data: structuredData
    });
    
  } catch (error) {
    console.error('Erreur lors de la structuration CV:', error);
    
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 