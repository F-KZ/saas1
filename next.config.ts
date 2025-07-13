/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Configuration de base
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Pour le déploiement Docker

  // 2. Optimisation des bundles
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['pdf-lib', 'pdfjs-dist'],
  },

  // 3. Gestion des fichiers statiques
  webpack: (config, { isServer }) => {
    // Configuration spéciale pour PDF.js
    config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/legacy/build/pdf'
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
        worker_threads: false,
      };
    }

    // 4. Règles pour les workers
    config.module.rules.push({
      test: /pdf\.worker\.js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext]'
      }
    });

    return config;
  },

  // 5. Headers de sécurité
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' }
        ]
      }
    ];
  },

  // 6. Limites d'upload
  api: {
    bodyParser: {
      sizeLimit: '5mb' // Correspond à la limite de votre API
    }
  }
};

export default nextConfig;