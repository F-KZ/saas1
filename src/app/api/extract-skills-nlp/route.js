import { extractSkillsOnly } from '../../../lib/nlp-skills-extractor';

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return Response.json({ error: 'Texte requis' }, { status: 400 });
    }

    console.log('Extraction NLP - Texte reçu:', text.substring(0, 200) + '...');

    const skills = extractSkillsOnly(text);

    return Response.json({
      success: true,
      skills,
      count: skills.length,
      method: 'nlp'
    });

  } catch (error) {
    console.error('Erreur extraction NLP:', error);
    return Response.json({ 
      error: 'Erreur lors de l\'extraction des compétences',
      details: error.message 
    }, { status: 500 });
  }
} 