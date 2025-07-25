// app/api/jobs/route.ts
import axios from 'axios';
import { NextResponse } from 'next/server';


// TypeScript interfaces
interface JobOffer {
  id: string;
  intitule: string;
  entreprise: { nom: string };
  lieu: { ville: string };
  typeContrat: string;
}

interface APIResponse {
  metadata: {
    count: number;
    source: string;
    query: {
      metier: string;
      lieu: string;
    };
  };
  results: JobOffer[];
}

export async function GET(request: Request) {
  try {
    // 1. Configuration sécurisée
    const API_BASE_URL = 'https://api.francetravail.io/partenaire';
    const { searchParams } = new URL(request.url);
    
    // 2. Validation des paramètres
    const metier = searchParams.get('metier')?.trim() || 'développeur';
    const lieu = searchParams.get('lieu')?.trim() || 'Paris';
    const contrat = searchParams.get('contrat') || 'CDI';

    // 3. Authentification (pas de cache)
    const token = await getFranceTravailToken();
    if (!token) {
      return NextResponse.json(
        { error: "Échec d'authentification avec France Travail" },
        { status: 401 }
      );
    } else {
      console.log('voici le token:', token);
    }

    // 4. Requête vers l'API (avec timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const jobsResponse = await fetch(`${API_BASE_URL}/offresdemploi/v2/offres/search`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      next: { revalidate: 3600 } // ISR
    });

    clearTimeout(timeout);

    // 5. Gestion des erreurs HTTP
    if (!jobsResponse.ok) {
      const errorText = await jobsResponse.text();
      console.error(`API Error ${jobsResponse.status}:`, errorText);
      return NextResponse.json(
        { 
          error: "Erreur API France Travail",
          status: jobsResponse.status,
          details: safeParseJSON(errorText) || errorText
        },
        { status: jobsResponse.status > 500 ? 502 : jobsResponse.status }
      );
    } 

    // 6. Transformation des données
    const rawData = await jobsResponse.json();
    const results = (rawData.resultats || []).map(formatJobOffer);

    // 7. Réponse standardisée
    const response: APIResponse = {
      metadata: {
        count: results.length,
        source: "France Travail API",
        query: { metier, lieu }
      },
      results
    };

    return NextResponse.json(response);

  } catch (error) {
    // 8. Gestion centralisée des erreurs
    console.error('Server Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Erreur inconnue",
        type: (error as Error)?.name || "UnknownError"
      },
      { status: 500 }
    );
  }
}

// Helper: Formatage des offres
function formatJobOffer(offer: any): JobOffer {
  return {
    id: offer.id,
    intitule: offer.intitule,
    entreprise: { nom: offer.entreprise?.nom || 'Non précisé' },
    lieu: { ville: offer.lieuTravail?.libelle || offer.lieu?.ville || 'Non précisé' },
    typeContrat: offer.typeContrat || 'Non précisé'
  };
}

// Helper: Parse JSON safely
function safeParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
  

// Gestion du token (pas de cache)
async function getFranceTravailToken(): Promise<string | null> {
  try {
    console.log('URL:', 'https://francetravail.io/connexion/oauth2/access_token?realm=%2Fpartenaire');
    console.log('ID:', process.env.NEXT_PUBLIC_FRANCE_TRAVAIL_ID);
    console.log('SECRET:', process.env.NEXT_PUBLIC_FRANCE_TRAVAIL_SECRET);
    console.log('Body:', new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.NEXT_PUBLIC_FRANCE_TRAVAIL_ID!,
      client_secret: process.env.NEXT_PUBLIC_FRANCE_TRAVAIL_SECRET!,
      scope: 'api_offresdemploiv2 o2dsoffre'
    }).toString());

    const authResponse = await axios('https://francetravail.io/connexion/oauth2/access_token?realm=%2Fpartenaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.NEXT_PUBLIC_FRANCE_TRAVAIL_ID!,
        client_secret: process.env.NEXT_PUBLIC_FRANCE_TRAVAIL_SECRET!,
        scope: 'api_offresdemploiv2 o2dsoffre'
      }),
      timeout: 5000
    });

    if (authResponse.status !== 200) throw new Error(`Auth failed: ${authResponse.status}`);

    const { access_token } = await authResponse.data;
    return access_token;

  } catch (error) {
    console.error('Token Error:', error);
    return null;
  }
}
