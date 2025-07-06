import { extractSkillsOnly, extractSkillsWithContext } from '@/lib/skills-extractor';

export async function POST(req) {
  try {
    const { text, withContext = false } = await req.json();

    if (!text) {
      return Response.json({
        success: false,
        error: 'Text content is required'
      }, { status: 400 });
    }

    console.log('Extract Skills - Texte reçu, longueur:', text.length);
    
    let result;
    if (withContext) {
      result = extractSkillsWithContext(text);
    } else {
      result = extractSkillsOnly(text);
    }
    
    console.log('Extract Skills - Compétences extraites:', result);
    
    return Response.json({
      success: true,
      skills: result,
      count: Array.isArray(result) ? result.length : result.length
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'extraction des compétences:', error);
    
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 