import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUploadStore = create(
  persist(
    (set, get) => ({
      // State
      cvFile: null,          // Fichier CV brut (File object)
      cvText: '',            // Texte extrait du CV
      cvStats: null,
      extractedSkills: [],   // Compétences extraites du CV
      loading: false,         // Pour le statut d'extraction
      error: null,            // Gestion des erreurs
      uploadUrl: null,

      // Actions
      setCvFile: (file) => set({ cvFile: file, error: null }),
      setCvText: (text) => set({ cvText: text }),
      setCvStats: (stats) => set({ cvStats: stats }),
      setExtractedSkills: (skills) => set({ extractedSkills: skills }),
      addSkill: (skill) => set((state) => ({
        extractedSkills: [...new Set([...state.extractedSkills, skill])]
      })),
      removeSkill: (skill) => set((state) => ({
        extractedSkills: state.extractedSkills.filter(s => s !== skill)
      })),
      clearSkills: () => set({ extractedSkills: [] }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      setUploadUrl: (url) => set({ uploadUrl: url }),
      reset: () => set({
        cvFile: null,
        cvText: '',
        cvStats: null,
        extractedSkills: [],
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
      },

      getSkillsCount: () => {
        const { extractedSkills } = get()
        return extractedSkills.length
      }
    }),
    {
      name: 'upload-storage', // Nom du localStorage
      partialize: (state) => ({ 
        cvText: state.cvText, // Seul le texte est persisté
        cvStats: state.cvStats,
        extractedSkills: state.extractedSkills // Persister les compétences
      })
    }
  )
);

export default useUploadStore;