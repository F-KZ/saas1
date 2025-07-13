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

export async function POST(request) {
  try {
    const { fileBuffer } = await request.json();
    
    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'File buffer is required' },
        { status: 400 }
      );
    }

    // Convert buffer back to Uint8Array
    const uint8Array = new Uint8Array(fileBuffer);
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    // Extract all sections from the CV
    const sections = extractAllSections(fullText);
    
    return NextResponse.json({ sections });
    
  } catch (error) {
    console.error('Error extracting CV sections:', error);
    return NextResponse.json(
      { error: 'Failed to extract CV sections' },
      { status: 500 }
    );
  }
}

function extractAllSections(text) {
  const sections = {};
  
  // Define section patterns with their French and English names
  const sectionDefinitions = [
    {
      type: 'skills',
      patterns: ['compétences', 'skills', 'compétences techniques', 'technical skills'],
      title: 'Compétences'
    },
    {
      type: 'experience',
      patterns: ['expérience', 'experience', 'expérience professionnelle', 'professional experience'],
      title: 'Expérience'
    },
    {
      type: 'education',
      patterns: ['formation', 'éducation', 'education', 'formation et diplômes'],
      title: 'Formation'
    },
    {
      type: 'languages',
      patterns: ['langues', 'languages', 'langues étrangères'],
      title: 'Langues'
    },
    {
      type: 'projects',
      patterns: ['projets', 'projects', 'réalisations', 'achievements'],
      title: 'Projets'
    },
    {
      type: 'certifications',
      patterns: ['certifications', 'certificats', 'certificates'],
      title: 'Certifications'
    },
    {
      type: 'interests',
      patterns: ['centres d\'intérêt', 'intérêts', 'interests', 'hobbies'],
      title: 'Centres d\'intérêt'
    }
  ];

  // Extract each section
  sectionDefinitions.forEach(({ type, patterns, title }) => {
    const content = extractSectionContent(text, patterns);
    if (content.length > 0) {
      sections[type] = {
        title,
        content
      };
    }
  });

  return sections;
}

function extractSectionContent(text, patterns) {
  // Create regex patterns for section detection
  const sectionPatterns = patterns.map(pattern => [
    // Standard section titles
    new RegExp(`\\b${pattern}\\b\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Z\\s]+:|$)`, 'gi'),
    // Uppercase section titles
    new RegExp(`\\b${pattern.toUpperCase()}\\b\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Z\\s]+:|$)`, 'gi'),
    // Numbered sections
    new RegExp(`\\d+\\.?\\s*\\b${pattern}\\b\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\s*\\d+\\.?\\s*[A-Z][A-Z\\s]+:|$)`, 'gi'),
    // Decorated sections
    new RegExp(`[\\-\\=\\*]\\s*\\b${pattern}\\b\\s*[\\-\\=\\*]\\s*\\n([\\s\\S]*?)(?=\\n\\s*[\\-\\=\\*]\\s*[A-Z][A-Z\\s]+:|$)`, 'gi'),
  ]).flat();

  // Try to find content for this section
  for (const pattern of sectionPatterns) {
    const match = pattern.exec(text);
    if (match) {
      const sectionContent = match[1];
      const items = parseSectionItems(sectionContent);
      if (items.length > 0) {
        return items;
      }
    }
  }

  return [];
}

function parseSectionItems(content) {
  if (!content) return [];
  
  // Split by common delimiters
  const items = content
    .split(/[•\-\*\+]/) // Bullet points
    .map(item => item.trim())
    .filter(item => item.length > 0 && !item.match(/^[A-Z\s]+:$/)) // Remove section headers
    .map(item => item.replace(/^\d+\.?\s*/, '')) // Remove numbering
    .map(item => item.replace(/,$/, '')) // Remove trailing commas
    .filter(item => item.length > 2); // Filter out very short items

  return items;
} 