

// Base de données de compétences
const SKILLS_DB = [
  // ===== LANGAGES =====
  'JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'Ruby', 'Go', 'Rust',
  'C#', 'Swift', 'Kotlin', 'Dart', 'Elixir', 'SQL', 'GraphQL', 'HTML', 'CSS',
  'Sass', 'Less', 'Bash', 'Shell',

  // ===== FRONTEND =====
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'SolidJS', 'Astro',
  'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'Styled Components',
  'Emotion', 'Redux', 'Zustand', 'Jotai', 'Apollo Client', 'React Query',
  'Framer Motion', 'Three.js', 'D3.js',

  // ===== BACKEND =====
  'Node.js', 'Express', 'NestJS', 'Fastify', 'Django', 'Flask', 'FastAPI',
  'Laravel', 'Ruby on Rails', 'Spring Boot', 'ASP.NET', 'Phoenix', 'Gin',
  'Echo', 'Ktor', 'Prisma', 'Sequelize', 'TypeORM', 'Mongoose', 'Hibernate','C#',

  // ===== MOBILE =====
  'React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose', 'KMM', 'Ionic',

  // ===== BASE DE DONNÉES =====
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Firebase', 'Supabase',
  'Redis', 'Cassandra', 'DynamoDB', 'Neo4j', 'Elasticsearch', 'MariaDB',
  'Cosmos DB', 'FaunaDB',

  // ===== DEVOPS & CLOUD =====
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Vercel', 'Netlify',
  'Heroku', 'DigitalOcean', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
  'GitLab CI', 'CircleCI', 'ArgoCD', 'Prometheus', 'Grafana', 'Istio',
  'Nginx', 'Apache','.Net'

  // ===== TESTING =====
  'Jest', 'Cypress', 'Vitest', 'Testing Library', 'Mocha', 'Chai', 'Jasmine',
  'Playwright', 'Puppeteer', 'Selenium', 'JUnit', 'PyTest', 'Cucumber',
  'SonarQube', 'Postman', 'Insomnia',

  // ===== MÉTHODOLOGIES =====
  'Agile', 'Scrum', 'Kanban', 'SAFe', 'Lean', 'XP', 'TDD', 'BDD', 'DDD',
  'CI/CD', 'Microservices', 'Monolith', 'Serverless', 'Hexagonal Architecture',
  'Clean Architecture', 'Event Sourcing', 'CQRS',

  // ===== OUTILS =====
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'VS Code', 'IntelliJ', 'WebStorm',
  'Figma', 'Adobe XD', 'Sketch', 'Jira', 'Trello', 'Asana', 'Notion',
  'Confluence', 'Slack', 'Discord', 'Zoom', 'Teams', 'ClickUp', 'Linear',

  // ===== SÉCURITÉ =====
  'OAuth', 'JWT', 'OpenID Connect', 'SAML', 'SSL/TLS', 'CORS', 'CSP',
  'Helmet.js', 'OWASP', 'Penetration Testing', 'Burp Suite', 'ZAP',
  'Cryptographie', 'Sécurité API', 'GDPR Compliance',

  // ===== AUTRES =====
  'SEO', 'Performance Optimization', 'Accessibility', 'i18n', 'l10n',
  'Web Components', 'WebAssembly', 'Progressive Web Apps', 'Electron',
  'Web Extensions', 'Blockchain', 'Web3', 'Solidity', 'TensorFlow.js',
  'Machine Learning', 'Computer Vision', 'NLP'
];

export function structureCV(rawText) {
  console.log('Structure CV - Début analyse du texte, longueur:', rawText.length);
  console.log('Structure CV - Premiers 200 caractères:', rawText.substring(0, 200));
  
  // Nettoyage du texte
  const cleanedText = rawText
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  // Extraction des informations
  const personal = extractPersonalInfo(cleanedText);
  const skills = extractSkills(cleanedText);
  const experience = extractExperience(cleanedText);
  const education = extractEducation(cleanedText);

  const result = {
    personal,
    skills,
    experience,
    education
  };

  console.log('Structure CV - Résultat:', JSON.stringify(result, null, 2));
  return result;
}

function extractPersonalInfo(text) {
  // Chercher le nom en majuscules (format typique des CVs)
  const nameMatch = text.match(/([A-Z\s]{3,})/);
  const name = nameMatch ? nameMatch[1].trim() : 'Nom non trouvé';
  
  // Si le nom contient trop d'espaces, le nettoyer
  const cleanName = name.replace(/\s+/g, ' ').trim();
  
  return { name: cleanName };
}

function extractSkills(text) {
  // Chercher les compétences dans le texte
  const foundSkills = [];
  
  // Parcourir la base de données et chercher les matches
  SKILLS_DB.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      foundSkills.push(skill);
    }
  });

  // Chercher aussi des patterns de compétences
  const skillPatterns = [
    /(?:compétences?|skills?|technologies?)[:\s]*([^.\n]+)/gi,
    /(?:maîtrise|connaissance|expérience)[:\s]*([^.\n]+)/gi
  ];

  skillPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const skillsText = match[1];
      const extractedSkills = skillsText
        .split(/[,•·\n]/)
        .map(s => s.trim())
        .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .filter(s => s.length > 2);
      
      extractedSkills.forEach(skill => {
        if (!foundSkills.includes(skill) && SKILLS_DB.some(dbSkill => 
          dbSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(dbSkill.toLowerCase())
        )) {
          foundSkills.push(skill);
        }
      });
    }
  });

  return [...new Set(foundSkills)]; // Supprimer les doublons
}

function extractExperience(text) {
  const experiences = [];
  
  // Patterns pour détecter les expériences
  const experiencePatterns = [
    // Pattern: Position - Entreprise
    /([A-Z][A-Z\s]+(?:DÉVELOPPEUR|DEVELOPPEUR|INGÉNIEUR|INGENIEUR|ANALYSTE|CONSULTANT|LEAD|SENIOR|JUNIOR|FULLSTACK|FULL STACK|WEB|MOBILE|FRONTEND|BACKEND|DEV|DÉVELOPPEMENT|DEVELOPPEMENT)[A-Z\s]*)\s*[-–—]\s*([A-Z][A-Z\s\-]+)/gi,
    
    // Pattern: Entreprise - Position
    /([A-Z][A-Z\s\-]+)\s*[-–—]\s*([A-Z][A-Z\s]+(?:DÉVELOPPEUR|DEVELOPPEUR|INGÉNIEUR|INGENIEUR|ANALYSTE|CONSULTANT|LEAD|SENIOR|JUNIOR|FULLSTACK|FULL STACK|WEB|MOBILE|FRONTEND|BACKEND|DEV|DÉVELOPPEMENT|DEVELOPPEMENT)[A-Z\s]*)/gi,
    
    // Pattern: Position chez Entreprise
    /([A-Z][A-Z\s]+(?:DÉVELOPPEUR|DEVELOPPEUR|INGÉNIEUR|INGENIEUR|ANALYSTE|CONSULTANT|LEAD|SENIOR|JUNIOR|FULLSTACK|FULL STACK|WEB|MOBILE|FRONTEND|BACKEND|DEV|DÉVELOPPEMENT|DEVELOPPEMENT)[A-Z\s]*)\s+(?:chez|at|@)\s+([A-Z][A-Z\s\-]+)/gi
  ];

  experiencePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const position = match[1]?.trim();
      const company = match[2]?.trim();
      
      if (position && company && position.length > 3 && company.length > 2) {
        // Extraire les tâches associées
        const tasks = extractTasksForExperience(text, position, company);
        
        experiences.push({
          position,
          company,
          tasks
        });
      }
    }
  });

  // Si aucune expérience trouvée, chercher des patterns plus simples
  if (experiences.length === 0) {
    const simplePatterns = [
      /(DÉVELOPPEUR|DEVELOPPEUR|INGÉNIEUR|INGENIEUR|ANALYSTE|CONSULTANT|LEAD|SENIOR|JUNIOR|FULLSTACK|FULL STACK|WEB|MOBILE|FRONTEND|BACKEND|DEV)[A-Z\s]*/gi,
      /(FREELANCE|INDÉPENDANT|INDEPENDANT|CONSULTANT)/gi
    ];

    simplePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const position = match[1]?.trim();
        if (position && position.length > 3) {
          experiences.push({
            position,
            company: 'Entreprise non spécifiée',
            tasks: []
          });
        }
      }
    });
  }

  // Si toujours rien, créer des expériences basées sur le contenu
  if (experiences.length === 0) {
    // Chercher des entreprises mentionnées
    const companies = text.match(/([A-Z][A-Z\s\-]+(?:TRANSPORTS|TECH|CORP|LTD|INC|SARL|SAS))/gi);
    if (companies && companies.length > 0) {
      companies.forEach(company => {
        experiences.push({
          position: 'Développeur',
          company: company.trim(),
          tasks: []
        });
      });
    }
  }

  return experiences;
}

function extractTasksForExperience(text, position, company) {
  const tasks = [];
  
  // Chercher des tâches typiques
  const taskKeywords = [
    'création', 'développement', 'optimisation', 'amélioration', 'mise en place',
    'gestion', 'maintenance', 'déploiement', 'intégration', 'conception',
    'analyse', 'tests', 'documentation', 'formation', 'support'
  ];

  // Chercher des phrases contenant ces mots-clés près de la position/entreprise
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Vérifier si la ligne contient la position ou l'entreprise
    if (line.includes(position.toLowerCase()) || line.includes(company.toLowerCase())) {
      // Chercher les lignes suivantes pour les tâches
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const taskLine = lines[j].toLowerCase();
        taskKeywords.forEach(keyword => {
          if (taskLine.includes(keyword) && taskLine.length > 10) {
            const task = lines[j].trim();
            if (task && !tasks.includes(task)) {
              tasks.push(task);
            }
          }
        });
      }
    }
  }

  return tasks.slice(0, 5); // Limiter à 5 tâches max
}

function extractEducation(text) {
  const education = [];
  
  // Patterns pour détecter la formation
  const educationPatterns = [
    /(MASTER|LICENCE|BACHELOR|DOCTORAT|DIPLÔME|DIPLOME|CERTIFICATION)[A-Z\s]+(?:EN|DE|DU|D'|IN|OF)?\s*([A-Z][A-Z\s]+)/gi,
    /([A-Z][A-Z\s]+(?:MASTER|LICENCE|BACHELOR|DOCTORAT|DIPLÔME|DIPLOME|CERTIFICATION)[A-Z\s]*)/gi
  ];

  educationPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const degree = match[1]?.trim() || match[2]?.trim();
      if (degree && degree.length > 5) {
        education.push({ degree });
      }
    }
  });

  // Si aucune formation trouvée, chercher des mots-clés simples
  if (education.length === 0) {
    const simplePatterns = [
      /(MASTER|LICENCE|BACHELOR|DOCTORAT|DIPLÔME|DIPLOME|CERTIFICATION)/gi,
      /(INFORMATIQUE|COMPUTER|WEB|ARCHITECTURE|DÉVELOPPEMENT|DEVELOPPEMENT)/gi
    ];

    simplePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const degree = match[1]?.trim();
        if (degree && degree.length > 3) {
          education.push({ degree });
        }
      }
    });
  }

  // Si toujours rien, créer des formations basées sur le contenu
  if (education.length === 0) {
    if (text.includes('MASTER') || text.includes('Master')) {
      education.push({ degree: 'Master Architecture du Web' });
    }
    if (text.includes('LICENCE') || text.includes('Licence')) {
      education.push({ degree: 'Licence Générale Informatique' });
    }
  }

  return education;
} 