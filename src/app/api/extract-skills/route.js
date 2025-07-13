// Base de données de compétences de développeur
const SKILLS_DB = [
  'React', 'TypeScript', 'Node.js', 'Next.js', 'JavaScript', 'Python',
  'Tests unitaires', 'Scrum', 'API REST', 'React Native', 'SEO',
  'HTML', 'CSS', 'Git', 'MongoDB', 'PostgreSQL', 'Prisma', 'Express',
  'Docker', 'AWS', 'Vercel', 'Tailwind CSS', 'Bootstrap', 'Redux',
  'GraphQL', 'Jest', 'Cypress', 'Agile', 'Kanban', 'CI/CD',
  'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
  'Angular', 'Vue.js', 'Svelte', 'Django', 'Flask', 'FastAPI',
  'Spring Boot', 'Laravel', 'Symfony', 'ASP.NET', 'Ruby on Rails',
  'MySQL', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'MariaDB',
  'Kubernetes', 'Azure', 'Google Cloud', 'GCP', 'Heroku', 'Netlify',
  'DigitalOcean', 'GitHub', 'GitLab', 'Bitbucket', 'Jenkins',
  'CircleCI', 'Travis CI', 'GitHub Actions', 'Mocha', 'Chai',
  'Selenium', 'Playwright', 'Puppeteer', 'Vitest', 'Sass', 'SCSS',
  'Less', 'Material-UI', 'Ant Design', 'Styled Components',
  'Webpack', 'Vite', 'Rollup', 'Parcel', 'Babel', 'ESLint',
  'Prettier', 'DevOps', 'TDD', 'BDD', 'gRPC', 'WebSocket',
  'Microservices', 'Serverless', 'Prometheus', 'Grafana',
  'ELK Stack', 'Sentry', 'Google Analytics', 'Mixpanel',
  'Flutter', 'Ionic', 'Cordova', 'Xamarin', 'TensorFlow',
  'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib',
  'Linux', 'Ubuntu', 'CentOS', 'Apache', 'Nginx', 'WordPress', 'Shopify'
];

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json(
        { error: 'Texte requis' },
        { status: 400 }
      );
    }

    // Extraction des compétences avec l'ancien système
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

    const skills = [...new Set(foundSkills)]; // Supprimer les doublons

    return Response.json({
      success: true,
      skills,
      count: skills.length
    });

  } catch (error) {
    console.error('[API Error]', error);
    return Response.json(
      {
        error: 'Erreur lors de l\'extraction des compétences',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 