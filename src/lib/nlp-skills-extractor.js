import natural from 'natural';
import nlp from 'compromise';

// Configuration NLP
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Entraîner le classifieur pour détecter les sections
function trainSectionClassifier() {
  // Sections de compétences
  classifier.addDocument('compétences', 'skills');
  classifier.addDocument('skills', 'skills');
  classifier.addDocument('technologies', 'skills');
  classifier.addDocument('outils', 'skills');
  classifier.addDocument('langages', 'skills');
  classifier.addDocument('frameworks', 'skills');
  classifier.addDocument('maîtrise', 'skills');
  classifier.addDocument('connaissance', 'skills');
  classifier.addDocument('expertise', 'skills');
  classifier.addDocument('aptitudes', 'skills');
  classifier.addDocument('capacités', 'skills');

  // Sections d'expérience
  classifier.addDocument('expérience', 'experience');
  classifier.addDocument('expériences', 'experience');
  classifier.addDocument('parcours', 'experience');
  classifier.addDocument('carrière', 'experience');
  classifier.addDocument('emploi', 'experience');
  classifier.addDocument('travail', 'experience');

  // Sections de formation
  classifier.addDocument('formation', 'education');
  classifier.addDocument('éducation', 'education');
  classifier.addDocument('diplômes', 'education');
  classifier.addDocument('études', 'education');
  classifier.addDocument('académique', 'education');
  classifier.addDocument('université', 'education');

  // Sections de projets
  classifier.addDocument('projets', 'projects');
  classifier.addDocument('réalisations', 'projects');
  classifier.addDocument('portfolio', 'projects');
  classifier.addDocument('travaux', 'projects');

  classifier.train();
}

// Détecter les entités nommées (postes, entreprises, technologies)
function extractNamedEntities(text) {
  const doc = nlp(text);
  
  // Extraire les organisations (entreprises)
  const organizations = doc.organizations().out('array');
  
  // Extraire les personnes (noms)
  const people = doc.people().out('array');
  
  // Extraire les lieux
  const places = doc.places().out('array');
  
  // Détecter les technologies et outils (patterns spécifiques)
  const techPatterns = [
    /(?:React|Angular|Vue|Node\.js|Python|Java|C\+\+|JavaScript|TypeScript|PHP|Ruby|Go|Rust|Swift|Kotlin)/gi,
    /(?:HTML|CSS|Sass|Less|Bootstrap|Tailwind|Material-UI)/gi,
    /(?:Git|Docker|Kubernetes|AWS|Azure|GCP|Heroku|Vercel)/gi,
    /(?:MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch)/gi,
    /(?:Jest|Cypress|Selenium|Mocha|Chai)/gi,
    /(?:Agile|Scrum|Kanban|Waterfall|DevOps|CI\/CD)/gi
  ];
  
  const technologies = [];
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      technologies.push(...matches);
    }
  });

  return {
    organizations,
    people,
    places,
    technologies: [...new Set(technologies)]
  };
}

// Analyser la structure du document pour détecter les sections
function analyzeDocumentStructure(text) {
  const lines = text.split('\n');
  const sections = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Détecter les titres de sections
    if (isSectionTitle(trimmedLine)) {
      const sectionType = classifier.classify(trimmedLine.toLowerCase());
      sections.push({
        title: trimmedLine,
        type: sectionType,
        lineIndex: index,
        confidence: classifier.getClassifications(trimmedLine.toLowerCase())[0]?.value || 0
      });
    }
  });
  
  return sections;
}

// Détecter si une ligne est un titre de section
function isSectionTitle(line) {
  if (!line || line.length < 3) return false;
  
  // Patterns pour les titres
  const titlePatterns = [
    // Titres en majuscules
    /^[A-ZÀ-ÿ\s]{3,}$/,
    // Titres avec première lettre majuscule
    /^[A-ZÀ-ÿ][a-zà-ÿ\s]{2,}$/,
    // Titres numérotés
    /^\d+\.?\s*[A-ZÀ-ÿ]/,
    // Titres avec séparateurs
    /^[-=*_]{2,}\s*[A-ZÀ-ÿ]/,
    // Titres courts mais significatifs
    /^(?:compétences?|skills?|expérience|formation|projets?|langues?)$/i
  ];
  
  return titlePatterns.some(pattern => pattern.test(line));
}

// Extraire les compétences avec analyse NLP
export function extractSkillsWithNLP(rawText) {
  console.log('Extraction NLP - Début analyse');
  
  // Entraîner le classifieur
  trainSectionClassifier();
  
  // Analyser la structure du document
  const sections = analyzeDocumentStructure(rawText);
  console.log('Sections détectées:', sections);
  
  // Trouver la section compétences
  const skillsSection = sections.find(section => 
    section.type === 'skills' && section.confidence > 0.6
  );
  
  if (skillsSection) {
    console.log('Section compétences trouvée:', skillsSection);
    return extractSkillsFromNLPDetectedSection(rawText, skillsSection, sections);
  }
  
  // Fallback: extraction traditionnelle
  console.log('Aucune section skills détectée par NLP, fallback');
  return extractSkillsFromText(rawText);
}

// Extraire les compétences d'une section détectée par NLP
function extractSkillsFromNLPDetectedSection(text, skillsSection, allSections) {
  const lines = text.split('\n');
  const startIndex = skillsSection.lineIndex + 1;
  
  // Trouver la fin de la section (prochaine section)
  let endIndex = lines.length;
  const nextSection = allSections.find(section => 
    section.lineIndex > skillsSection.lineIndex
  );
  
  if (nextSection) {
    endIndex = nextSection.lineIndex;
  }
  
  // Extraire le contenu de la section
  const sectionContent = lines.slice(startIndex, endIndex).join('\n');
  console.log('Contenu de la section:', sectionContent);
  
  // Extraire les entités nommées
  const entities = extractNamedEntities(sectionContent);
  
  // Extraire les compétences du contenu
  const skills = extractSkillsFromContent(sectionContent);
  
  // Combiner les résultats
  const allSkills = [
    ...skills,
    ...entities.technologies
  ].filter((skill, index, arr) => arr.indexOf(skill) === index);
  
  console.log('Compétences extraites avec NLP:', allSkills);
  return allSkills;
}

// Extraire les compétences du contenu textuel
function extractSkillsFromContent(content) {
  const skills = [];
  
  // Tokeniser le contenu
  const tokens = tokenizer.tokenize(content);
  
  // Patterns pour les compétences
  const skillPatterns = [
    // Listes avec tirets/puces
    /[-•·]\s*([A-Za-zÀ-ÿ\s]+)/g,
    // Séparations par virgules
    /([A-Za-zÀ-ÿ\s]+)(?:,|;)/g,
    // Mots isolés significatifs
    /\b([A-Za-zÀ-ÿ]{3,})\b/g
  ];
  
  skillPatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const skill = match[1]?.trim();
      if (isValidSkill(skill)) {
        skills.push(normalizeSkill(skill));
      }
    }
  });
  
  return skills;
}

// Valider si un terme est une compétence valide
function isValidSkill(skill) {
  if (!skill || skill.length < 3) return false;
  
  // Mots génériques à exclure
  const genericWords = [
    'et', 'avec', 'pour', 'dans', 'sur', 'par', 'de', 'la', 'le', 'les', 
    'un', 'une', 'des', 'du', 'au', 'aux', 'ce', 'ces', 'cette', 'mon', 
    'ma', 'mes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'leurs'
  ];
  
  if (genericWords.includes(skill.toLowerCase())) return false;
  
  // Vérifier si c'est un verbe conjugué
  const doc = nlp(skill);
  const verbs = doc.verbs().out('array');
  if (verbs.length > 0 && verbs[0] === skill) return false;
  
  return true;
}

// Normaliser une compétence
function normalizeSkill(skill) {
  return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
}

// Extraction traditionnelle (fallback)
function extractSkillsFromText(text) {
  const skills = [];
  
  const listPatterns = [
    /[-•·]\s*([A-Za-zÀ-ÿ\s]+)/g,
    /^\s*[-•·]\s*([A-Za-zÀ-ÿ\s]+)/gm
  ];

  listPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const skill = match[1]?.trim();
      if (skill && skill.length > 2 && !skills.includes(skill)) {
        skills.push(normalizeSkill(skill));
      }
    }
  });

  return [...new Set(skills)].sort();
}

// Fonction principale d'export
export function extractSkillsOnly(rawText) {
  return extractSkillsWithNLP(rawText);
} 