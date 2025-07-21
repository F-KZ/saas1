export async function GET(request) {
  try {
    // 1. Configuration
    const API_URL = 'https://api.francetravail.io';
    const params = new URL(request.url).searchParams;
    const location = params.get('lieu') || 'Paris';
    const metier = params.get('metier') || 'développeur';

    // 2. Récupération du token (avec cache)
    const token = await getFranceTravailToken();
    if (!token) {
      return Response.json(
        { error: "Échec d'authentification" },
        { status: 401 }
      );
    }

    // 3. Requête vers l'API des offres
    const jobsResponse = await fetch(`${API_URL}/partenaire/offresdemploi/v2/offres/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lieu: location,
        metier: metier,
        contrat: 'CDI',
        range: '0-20' // Limiter les résultats
      }),
      next: { revalidate: 3600 } // Cache pendant 1h (ISR)
    });

    // 4. Gestion des erreurs
    if (!jobsResponse.ok) {
      const errorData = await jobsResponse.json().catch(() => ({}));
      return Response.json(
        { 
          error: "Erreur API France Travail",
          details: errorData || await jobsResponse.text()
        },
        { status: jobsResponse.status }
      );
    }

    // 5. Retour des données
    const jobsData = await jobsResponse.json();
    return Response.json({
      metadata: {
        count: jobsData.resultats?.length || 0,
        source: "France Travail"
      },
      results: jobsData.resultats || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction séparée pour gérer le token (avec cache)
async function getFranceTravailToken() {
  const cacheKey = 'france-travail-token';
  const cachedToken = await getFromCache(cacheKey);

  if (cachedToken) return cachedToken;

  try {
    const response = await fetch('https://api.francetravail.io/partenaire/oauth2/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.NEXT_PUBLIC_FRANCE_TRAVAIL_ID,
        client_secret: process.env.FRANCE_TRAVAIL_CLIENT_SECRET,
        scope: 'api_offresdemploiv2'
      })
    });

    if (!response.ok) return null;

    const { access_token, expires_in } = await response.json();
    await setCache(cacheKey, access_token, expires_in - 60); // Cache avec marge
    return access_token;

  } catch (error) {
    console.error('Token Error:', error);
    return null;
  }
}

// Helpers simplifiés (à implémenter avec Redis ou autre)
async function getFromCache(key) { /* ... */ }
async function setCache(key, value, ttl) { /* ... */ }