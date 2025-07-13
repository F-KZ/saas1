
// lib/skillsExtractor.js
import { matchSorter } from 'match-sorter';
import natural from 'natural';

const { WordTokenizer } = natural;
const tokenizer = new WordTokenizer();

// Configuration centrale
const CONFIG = {
  MIN_SKILL_LENGTH: 3,
  MAX_SKILL_LENGTH: 50,
  SKILL_SECTION_PATTERNS: [
    'compétences', 'skills', 'technologies', 'outils', 
    'atouts', 'langages', 'frameworks', 'expertise',
    'savoirs', 'connaissances', 'maîtrise', 'technologies maîtrisées',
    'stack technique', 'environnement technique', 'outils de développement'
  ],
  SECTION_END_PATTERNS: [
    'expérience', 'formation', 'projets', 'langues',
    'références', 'certifications', 'publications',
    'objectif', 'profil', 'éducation', 'diplômes',
    'parcours', 'historique', 'emplois'
  ],
  COMMON_SKILLS: [
    // Langages de programmation
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
    
    // Frameworks Frontend
    'React', 'Angular', 'Vue.js', 'Vue', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby', 'Ember.js',
    
    // Frameworks Backend
    'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'Symfony', 'ASP.NET', 'Ruby on Rails',
    
    // Bases de données
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'MariaDB',
    
    // Cloud & DevOps
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'GCP', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean',
    
    // Outils de développement
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jenkins', 'CircleCI', 'Travis CI', 'GitHub Actions',
    
    // Tests
    'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'Puppeteer', 'Vitest',
    
    // CSS & Styling
    'CSS', 'Sass', 'SCSS', 'Less', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Ant Design', 'Styled Components',
    
    // Outils de build
    'Webpack', 'Vite', 'Rollup', 'Parcel', 'Babel', 'ESLint', 'Prettier',
    
    // Méthodologies
    'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'TDD', 'BDD',
    
    // APIs & Services
    'REST API', 'GraphQL', 'gRPC', 'WebSocket', 'Microservices', 'Serverless',
    
    // Monitoring & Analytics
    'Prometheus', 'Grafana', 'ELK Stack', 'Sentry', 'Google Analytics', 'Mixpanel',
    
    // Mobile
    'React Native', 'Flutter', 'Ionic', 'Cordova', 'Xamarin',
    
    // IA & ML
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib',
    
    // Autres
    'Linux', 'Ubuntu', 'CentOS', 'Apache', 'Nginx', 'WordPress', 'Shopify'
  ],
  STOP_WORDS: new Set([
    'et', 'avec', 'pour', 'dans', 'sur', 'par', 'de', 'du', 'des',
    'la', 'le', 'les', 'un', 'une', 'au', 'aux', 'à', 'en', 'se',
    'ce', 'ces', 'sa', 'ses', 'son', 'sont', 'être', 'avoir', 'faire',
    'plus', 'moins', 'très', 'bien', 'bon', 'bonne', 'grand', 'petit',
    'nouveau', 'nouvelle', 'ancien', 'ancienne', 'autre', 'autres'
  ])
};

export function extractSkills(rawText) {
  // Normalisation du texte
  const normalizedText = normalizeText(rawText);
  
  // Stratégies d'extraction par ordre de priorité
  const extractionStrategies = [
    extractFromExplicitSkillSection,
    extractFromBulletLists,
    extractFromInlineLists,
    extractFromContextualMentions,
    extractFromSkillPatterns
  ];

  const skills = new Set();

  for (const strategy of extractionStrategies) {
    const foundSkills = strategy(normalizedText);
    foundSkills.forEach(skill => skills.add(skill));
    
    // Si on a trouvé des compétences via une stratégie prioritaire, on s'arrête
    if (skills.size >= 10) break;
  }

  return Array.from(skills)
    .filter(isValidSkill)
    .map(normalizeSkill)
    .sort();
}

// Fonctions utilitaires
function normalizeText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();
}

function normalizeSkill(skill) {
  const commonVariations = {
    'js': 'JavaScript',
    'reactjs': 'React',
    'nodejs': 'Node.js',
    'texts unitaires': 'Tests unitaires',
    'react native': 'React Native',
    'tailwind': 'Tailwind CSS',
    'bootstrap': 'Bootstrap',
    'material ui': 'Material-UI',
    'styled components': 'Styled Components',
    'webpack': 'Webpack',
    'vite': 'Vite',
    'eslint': 'ESLint',
    'prettier': 'Prettier',
    'git': 'Git',
    'github': 'GitHub',
    'gitlab': 'GitLab',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'Google Cloud',
    'postgresql': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'redis': 'Redis',
    'mysql': 'MySQL',
    'sql': 'SQL',
    'graphql': 'GraphQL',
    'rest api': 'REST API',
    'microservices': 'Microservices',
    'serverless': 'Serverless',
    'ci/cd': 'CI/CD',
    'tdd': 'TDD',
    'bdd': 'BDD',
    'agile': 'Agile',
    'scrum': 'Scrum',
    'kanban': 'Kanban',
    'devops': 'DevOps'
  };
  
  const normalized = skill.toLowerCase().trim();
  return commonVariations[normalized] || 
    skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
}

function isValidSkill(skill) {
  return (
    skill.length >= CONFIG.MIN_SKILL_LENGTH &&
    skill.length <= CONFIG.MAX_SKILL_LENGTH &&
    !CONFIG.STOP_WORDS.has(skill.toLowerCase()) &&
    !isSectionHeader(skill) &&
    !isCommonWord(skill)
  );
}

function isSectionHeader(text) {
  return CONFIG.SECTION_END_PATTERNS.some(section => 
    text.toLowerCase().includes(section.toLowerCase())
  );
}

function isCommonWord(text) {
  const commonWords = ['année', 'années', 'mois', 'mois', 'jour', 'jours', 'fois', 'fois', 'fois'];
  return commonWords.includes(text.toLowerCase());
}

// Stratégies d'extraction
function extractFromExplicitSkillSection(text) {
  for (const pattern of CONFIG.SKILL_SECTION_PATTERNS) {
    const regex = new RegExp(
      `(?:^|\\n)\\s*${pattern}[\\s:]*\\n([\\s\\S]+?)(?:\\n\\s*(?:${CONFIG.SECTION_END_PATTERNS.join('|')})[\\s:]|$)`, 
      'i'
    );
    
    const match = text.match(regex);
    if (match) {
      const sectionContent = match[1];
      return extractItemsFromSection(sectionContent);
    }
  }
  return [];
}

function extractFromBulletLists(text) {
  const bulletPattern = /(?:^|\n)\s*[-•·*]\s*([^\n]+)/g;
  const matches = [...text.matchAll(bulletPattern)];
  return matches.map(m => m[1].trim());
}

function extractFromInlineLists(text) {
  const inlinePattern = /(?:^|\n)\s*(?:[A-Za-zÀ-ÿ]+[,\s]*)+/g;
  const matches = [...text.matchAll(inlinePattern)];
  return matches.flatMap(m => 
    m[0].split(/[,;]/)
      .map(item => item.trim())
      .filter(item => item)
  );
}

function extractFromContextualMentions(text) {
  // Utilisation de la base de compétences connues
  return CONFIG.COMMON_SKILLS.filter(skill => 
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );
}

function extractFromSkillPatterns(text) {
  const skills = [];
  
  // Pattern pour les compétences avec niveau (ex: "JavaScript (avancé)")
  const levelPattern = /([A-Za-zÀ-ÿ\s]+)\s*\(?(débutant|intermédiaire|avancé|expert|maîtrisé|connais|utilise)\)?/gi;
  const levelMatches = [...text.matchAll(levelPattern)];
  levelMatches.forEach(match => {
    const skill = match[1].trim();
    if (skill.length > 2) {
      skills.push(skill);
    }
  });
  
  // Pattern pour les années d'expérience (ex: "5 ans JavaScript")
  const yearsPattern = /(\d+)\s*(?:ans?|années?)\s+([A-Za-zÀ-ÿ\s]+)/gi;
  const yearsMatches = [...text.matchAll(yearsPattern)];
  yearsMatches.forEach(match => {
    const skill = match[2].trim();
    if (skill.length > 2) {
      skills.push(skill);
    }
  });
  
  return skills;
}

function extractItemsFromSection(sectionText) {
  return [
    ...extractFromBulletLists(sectionText),
    ...extractFromInlineLists(sectionText),
    ...extractFromContextualMentions(sectionText),
    ...extractFromSkillPatterns(sectionText)
  ].filter(isValidSkill);
}