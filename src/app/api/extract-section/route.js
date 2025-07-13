import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist';

// Configuration optimisée du worker PDF.js
if (typeof window === 'undefined') {
  const pdfjs = require('pdfjs-dist/legacy/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
    'pdfjs-dist/legacy/build/pdf.worker.js'
  );
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

// Dictionnaire des sections avec pondération
const SECTION_CONFIG = [
  { 
    name: 'skills',
    keywords: ['compétences', 'skills', 'atouts', 'aptitudes', 'qualités'],
    weight: 3 
  },
  { 
    name: 'experience', 
    keywords: ['expérience', 'experience', 'emploi', 'employment', 'work'],
    weight: 2 
  },
  // ... autres sections
];

export async function POST(request) {
  try {
    // 1. Validation du payload
    const { fileBuffer } = await request.json();
    if (!fileBuffer?.length) {
      return NextResponse.json(
        { error: 'Buffer de fichier PDF requis' },
        { status: 400 }
      );
    }

    // 2. Conversion et vérification du PDF
    const uint8Array = new Uint8Array(fileBuffer);
    if (uint8Array.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Le fichier dépasse 5MB' },
        { status: 413 }
      );
    }

    // 3. Extraction du texte
    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    }

    // 4. Analyse intelligente
    const { items, sectionName, confidence } = analyzeCVContent(fullText);
    
    if (confidence < 0.3) {
      return NextResponse.json(
        { warning: 'Section peu certaine', items, sectionName },
        { status: 200 }
      );
    }

    return NextResponse.json({ items, sectionName });

  } catch (error) {
    console.error('Erreur extraction:', error);
    return NextResponse.json(
      { error: 'Échec du traitement', details: process.env.NODE_ENV === 'development' ? error.message : null },
      { status: 500 }
    );
  }
}

// Analyse avancée du contenu
function analyzeCVContent(text) {
  let bestMatch = { score: 0 };
  const normalizedText = text.toLowerCase();

  SECTION_CONFIG.forEach(section => {
    section.keywords.forEach(keyword => {
      // Recherche avec contexte
      const pattern = new RegExp(
        `(\\n|^)\\s*(${keyword}[\\s:]*\\n)([\\s\\S]*?)(?=\\n\\s*[\\w-]+:|$)`,
        'i'
      );
      const match = pattern.exec(normalizedText);
      
      if (match) {
        const score = calculateMatchScore(match[0], section.weight);
        if (score > bestMatch.score) {
          bestMatch = {
            items: extractItemsFromMatch(match[0]),
            sectionName: match[2].trim(),
            score,
            confidence: score / 5 // 0-1 scale
          };
        }
      }
    });
  });

  return bestMatch.score > 0 ? bestMatch : { 
    items: [], 
    sectionName: 'Autres informations',
    confidence: 0 
  };
}

// Score de pertinence
function calculateMatchScore(text, baseWeight) {
  let score = baseWeight;
  // Bonus pour les listes
  if (text.match(/(•|-|\d\.)/)) score += 1;
  // Bonus pour la longueur
  score += Math.min(text.length / 100, 2);
  return score;
}

// Extraction des items avec nettoyage
function extractItemsFromMatch(text) {
  return text
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed && 
             !trimmed.match(/^[A-Z][A-Z\s]+:$/) &&
             trimmed.length > 3;
    })
    .map(line => 
      line.replace(/^[\s•\-\*]\s*|\d+\.\s*|\s*:$/g, '')
         .trim()
    )
    .filter(item => item.length > 0);
}