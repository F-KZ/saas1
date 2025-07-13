import { NextApiRequest, NextApiResponse } from 'next';
import pdfParse from 'pdf-parse';

// Dictionnaire des sections et leurs synonymes
const SECTION_SYNONYMS = {
  strengths: {
    keywords: ['atouts', 'qualités', 'aptitudes', 'compétences clés', 'points forts', 'soft skills', 'forces'],
    normalizedTitle: 'Atouts'
  },
  experience: {
    keywords: ['expérience', 'expériences', 'parcours professionnel', 'historique', 'emplois'],
    normalizedTitle: 'Expériences'
  },
  education: {
    keywords: ['formation', 'études', 'diplômes', 'éducation', 'académique'],
    normalizedTitle: 'Formation'
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Vérification méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // 2. Validation du payload
    if (!req.body.fileBuffer || !Array.isArray(req.body.fileBuffer)) {
      return res.status(400).json({ error: 'Fichier PDF requis (fileBuffer)' });
    }

    // 3. Limite de taille (5MB)
    if (req.body.fileBuffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({ error: 'Fichier trop volumineux (>5MB)' });
    }

    // 4. Conversion du buffer
    const pdfBuffer = Buffer.from(new Uint8Array(req.body.fileBuffer));

    // 5. Extraction du texte
    const { text } = await pdfParse(pdfBuffer);

    // 6. Détection automatique des sections
    const sections = {};
    for (const [sectionType, { keywords, normalizedTitle }] of Object.entries(SECTION_SYNONYMS)) {
      const detectedSection = detectSection(text, keywords);
      if (detectedSection) {
        sections[sectionType] = {
          title: normalizedTitle,
          content: extractSectionContent(text, detectedSection)
        };
      }
    }

    // 7. Réponse réussie
    return res.status(200).json({
      success: true,
      metadata: {
        textLength: text.length,
        sectionsDetected: Object.keys(sections).length
      },
      sections
    });

  } catch (error) {
    // 8. Gestion des erreurs
    console.error('[API Error]', error);
    return res.status(500).json({
      error: 'Erreur de traitement du PDF',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Détecte une section par ses synonymes
function detectSection(text: string, keywords: string[]) {
  for (const keyword of keywords) {
    const regex = new RegExp(`(^|\n)##?\\s*${keyword}[\\s:]*\n`, 'i');
    const match = text.match(regex);
    if (match) {
      return {
        keyword,
        startIndex: match.index
      };
    }
  }
  return null;
}

// Extrait le contenu d'une section
function extractSectionContent(text: string, { keyword, startIndex }: { keyword: any; startIndex: any; }) {
  // Trouve la fin de la section
  const nextSectionRegex = /(^|\n)##?\s*.+/g;
  nextSectionRegex.lastIndex = startIndex;
  const nextSection = nextSectionRegex.exec(text);
  const endIndex = nextSection ? nextSection.index : text.length;

  // Extrait le contenu
  const sectionText = text.slice(startIndex, endIndex)
    .replace(new RegExp(`##?\\s*${keyword}[\\s:]*\n`, 'i'), '')
    .trim();

  // Formate en liste
  return sectionText
    .split('\n')
    .filter((line: string) => {
      // Filtre les lignes pertinentes
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             (trimmed.startsWith('-') || 
              trimmed.startsWith('•') || 
              /[a-z]/i.test(trimmed));
    })
    .map((line: string) => line.replace(/^[-\s•●*]+/, '').trim());
}