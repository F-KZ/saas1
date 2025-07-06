import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUploadStore = create(
  persist(
    (set, get) => ({
      // State
      cvFile: null,          // Fichier CV brut (File object)
      cvText: '',            // Texte extrait du CV
      cvStats: null,
      loading: false,         // Pour le statut d'extraction
      error: null,            // Gestion des erreurs
      uploadUrl: null,

      // Actions
      setCvFile: (file) => set({ cvFile: file, error: null }),
      setCvText: (text) => set({ cvText: text }),
      setCvStats: (stats) => set({ cvStats: stats }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      setUploadUrl: (url) => set({ uploadUrl: url }),
      reset: () => set({
        cvFile: null,
        cvText: '',
        cvStats: null,
        loading: false,
        error: null,
        uploadUrl: null
      }),

      // Computed values
      getWordCount: () => {
        const { cvText } = get()
        return cvText ? cvText.split(/\s+/).filter(word => word.length > 0).length : 0
      },

      getCharacterCount: () => {
        const { cvText } = get()
        return cvText ? cvText.length : 0
      }
    }),
    {
      name: 'upload-storage', // Nom du localStorage
      partialize: (state) => ({ 
        cvText: state.cvText, // Seul le texte est persisté
        cvStats: state.cvStats
      })
    }
  )
);

export default useUploadStore;