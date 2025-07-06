// Base de données de compétences
const SKILLS_DB = [
  'React', 'TypeScript', 'Node.js', 'Next.js', 'JavaScript', 'Python',
  'Tests unitaires', 'Scrum', 'API REST', 'React Native', 'SEO',
  'HTML', 'CSS', 'Git', 'MongoDB', 'PostgreSQL', 'Prisma', 'Express',
  'Docker', 'AWS', 'Vercel', 'Tailwind CSS', 'Bootstrap', 'Redux',
  'GraphQL', 'Jest', 'Cypress', 'Agile', 'Kanban', 'CI/CD', 'PHP',
  'Laravel', 'Vue.js', 'Angular', 'Sass', 'Less', 'Webpack', 'Babel',
  'NPM', 'Yarn', 'Linux', 'MacOS', 'Windows', 'Figma', 'Adobe XD',
  'Photoshop', 'Illustrator', 'WordPress', 'Drupal', 'Joomla'
];

// Titres de sections majeures pour détecter les limites
const MAJOR_SECTIONS = [
  'expérience', 'expériences', 'experience', 'experiences',
  'formation', 'éducation', 'education', 'diplômes', 'diplomes',
  'projets', 'projet', 'projects', 'project',
  'langues', 'languages', 'langue', 'language',
  'références', 'references', 'référence', 'reference',
  'certifications', 'certification', 'certificats', 'certificat',
  'publications', 'publication', 'recherche', 'research',
  'objectif', 'objectifs', 'objective', 'objectives',
  'profil', 'profile', 'résumé', 'resume', 'summary'
];

export function extractSkillsOnly(rawText) {
  console.log('Extraction compétences - Début analyse');
  
  // Nettoyage du texte
  const cleanedText = rawText
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  // 1. Chercher la section skills/compétences complète
  const skillsSection = extractSkillsSection(cleanedText);
  
  if (skillsSection) {
    console.log('Section compétences trouvée:', skillsSection);
    return extractSkillsFromSection(skillsSection);
  }

  // 2. Fallback: chercher des compétences dans tout le texte
  console.log('Aucune section skills trouvée, recherche dans tout le texte');
  return extractSkillsFromText(cleanedText);
}

function extractSkillsSection(text) {
  // Patterns pour détecter le début de la section skills
  const skillSectionStartPatterns = [
    // Titres en majuscules
    /(?:^|\n)\s*(?:COMPÉTENCES?|SKILLS?|TECHNOLOGIES?|OUTILS?|ATOUTS?|LANGAGES?|FRAMEWORKS?)[:\s]*/gi,
    // Titres avec première lettre majuscule
    /(?:^|\n)\s*(?:Compétences?|Skills?|Technologies?|Outils?|Atouts?|Langages?|Frameworks?)[:\s]*/gi,
    // Titres en gras (simulés par des caractères spéciaux ou répétition)
    /(?:^|\n)\s*(?:compétences?|skills?|technologies?|technologies? maîtrisées?|outils?|atouts?|langages?|frameworks?)[:\s]*/gi,
    // Autres variations
    /(?:^|\n)\s*(?:maîtrise|connaissance|expérience)[:\s]*/gi
  ];

  // Patterns pour détecter les titres de sections majeures (plus robustes)
  const sectionPatterns = [
    // Titres en majuscules
    ...MAJOR_SECTIONS.map(section => 
      new RegExp(`(?:^|\n)\\s*${section.toUpperCase()}[:\s]*`, 'gi')
    ),
    // Titres avec première lettre majuscule
    ...MAJOR_SECTIONS.map(section => 
      new RegExp(`(?:^|\n)\\s*${section.charAt(0).toUpperCase() + section.slice(1)}[:\s]*`, 'gi')
    ),
    // Titres en gras (simulés)
    ...MAJOR_SECTIONS.map(section => 
      new RegExp(`(?:^|\n)\\s*${section}[:\s]*`, 'gi')
    ),
    // Patterns pour les titres structurés (numérotés, avec tirets, etc.)
    /(?:^|\n)\s*(?:\d+\.?\s*)?(?:expérience|formation|projets?|langues?|références?|certifications?)[:\s]*/gi,
    // Titres avec séparateurs
    /(?:^|\n)\s*[-=*_]{3,}\s*(?:expérience|formation|projets?|langues?|références?|certifications?)[:\s]*/gi
  ];

  for (const startPattern of skillSectionStartPatterns) {
    const startMatch = startPattern.exec(text);
    if (startMatch) {
      const startIndex = startMatch.index + startMatch[0].length;
      const remainingText = text.substring(startIndex);
      
      // Chercher la prochaine section majeure
      let endIndex = remainingText.length;
      for (const sectionPattern of sectionPatterns) {
        const sectionMatch = sectionPattern.exec(remainingText);
        if (sectionMatch && sectionMatch.index < endIndex) {
          endIndex = sectionMatch.index;
        }
      }
      
      // Extraire la section skills
      const skillsSection = remainingText.substring(0, endIndex).trim();
      if (skillsSection.length > 10) { // Au moins 10 caractères pour être valide
        return skillsSection;
      }
    }
  }

  return null;
}

function extractSkillsFromSection(skillsSection) {
  const foundSkills = [];
  
  // Extraire tous les éléments de la section (séparés par virgules, tirets, etc.)
  const skillItems = skillsSection
    .split(/[,•·\n;]/)
    .map(item => item.trim())
    .filter(item => item.length > 2)
    .map(item => {
      // Nettoyer et normaliser
      let cleaned = item.replace(/^[-•·\s]+/, '').replace(/[\s-]+$/, '');
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    })
    .filter(item => item.length > 2);

  // Ajouter tous les éléments qui ne sont pas des titres de sections
  skillItems.forEach(item => {
    if (!MAJOR_SECTIONS.some(section => 
      item.toLowerCase().includes(section.toLowerCase())
    )) {
      // Vérifier si c'est une compétence valide (pas un mot générique)
      const genericWords = ['et', 'avec', 'pour', 'dans', 'sur', 'par', 'de', 'la', 'le', 'les', 'un', 'une', 'des', 'du', 'au', 'aux'];
      if (!genericWords.includes(item.toLowerCase()) && item.length > 2) {
        foundSkills.push(item);
      }
    }
  });

  // Chercher des listes avec tirets ou puces
  const listPatterns = [
    /[-•·]\s*([A-Za-zÀ-ÿ\s]+)/g,
    /^\s*[-•·]\s*([A-Za-zÀ-ÿ\s]+)/gm
  ];

  listPatterns.forEach(pattern => {
    const matches = skillsSection.matchAll(pattern);
    for (const match of matches) {
      const skill = match[1]?.trim();
      if (skill && skill.length > 2 && !foundSkills.includes(skill)) {
        const normalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
        foundSkills.push(normalizedSkill);
      }
    }
  });

  // Supprimer les doublons et trier
  const uniqueSkills = [...new Set(foundSkills)].sort();
  
  console.log('Compétences extraites de la section:', uniqueSkills);
  return uniqueSkills;
}

function extractSkillsFromText(text) {
  const foundSkills = [];
  
  // Chercher des listes de compétences dans tout le texte
  const listPatterns = [
    /[-•·]\s*([A-Za-zÀ-ÿ\s]+)/g,
    /^\s*[-•·]\s*([A-Za-zÀ-ÿ\s]+)/gm
  ];

  listPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const skill = match[1]?.trim();
      if (skill && skill.length > 2 && !foundSkills.includes(skill)) {
        const normalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
        foundSkills.push(normalizedSkill);
      }
    }
  });

  // Supprimer les doublons et trier
  const uniqueSkills = [...new Set(foundSkills)].sort();
  
  console.log('Compétences extraites du texte complet:', uniqueSkills);
  return uniqueSkills;
}

// Fonction pour extraire les compétences avec contexte
export function extractSkillsWithContext(rawText) {
  const skills = extractSkillsOnly(rawText);
  
  // Chercher le contexte autour des compétences
  const skillsWithContext = skills.map(skill => {
    const regex = new RegExp(`([^.]*${skill}[^.]*)`, 'gi');
    const matches = rawText.match(regex);
    const context = matches ? matches[0].trim() : '';
    
    return {
      skill,
      context: context.length > 0 ? context : null
    };
  });

  return skillsWithContext;
} 