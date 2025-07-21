'use client'

import React, { useState, useEffect } from 'react'
import JobCard from '@/components/JobCard'
import fakeJobs from '../../../prisma/lib/jobsFiller'
import useUploadStore from '@/store/UploadStore'

export default function JobSearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const { extractedSkills } = useUploadStore()
  
  //console.log("extractedSkills", extractedSkills)
  
  function calculateMatchingScore(jobSkills, extractedSkills) {
    if (!extractedSkills.length) return { matchingSkills: [], score: '0%' }
    
    const extractedSkillsSet = new Set(extractedSkills);
    const matchingSkills = jobSkills.filter(skill => extractedSkillsSet.has(skill));
    
    return {
      matchingSkills,
      score: (matchingSkills.length / jobSkills.length * 100).toFixed(1) + '%'
    };
  }

  // Get unique locations for filters
  const locations = [...new Set(fakeJobs.map(job => job.location))]

  // Calculer le score pour chaque job et filtrer
  const jobsWithScores = fakeJobs.map(job => ({
    ...job,
    matchScore: calculateMatchingScore(job.skills, extractedSkills)
  }))

  const filteredJobs = jobsWithScores.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = !selectedLocation || job.location === selectedLocation
    
    return matchesSearch && matchesLocation
  })

  // Trier par score de correspondance (si des compétences sont extraites)
  const sortedJobs = extractedSkills.length > 0 
    ? filteredJobs.sort((a, b) => parseFloat(b.matchScore.score) - parseFloat(a.matchScore.score))
    : filteredJobs
  
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Recherche d'emploi
          </h1>
          <p className='text-gray-600'>
            {sortedJobs.length} offre{sortedJobs.length > 1 ? 's' : ''} trouvée{sortedJobs.length > 1 ? 's' : ''}
            {extractedSkills.length > 0 && ` - Triées par correspondance avec vos compétences`}
          </p>
          {extractedSkills.length > 0 && (
            <div className='mt-2'>
              <span className='text-sm text-gray-600'>Vos compétences : </span>
              <div className='flex flex-wrap gap-1 mt-1'>
                {extractedSkills.map((skill, index) => (
                  <span key={index} className='bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs'>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Search Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Rechercher
              </label>
              <input
                type='text'
                placeholder='Titre, entreprise, description...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Location Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Localisation
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Toutes les localisations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedLocation) && (
            <div className='mt-4'>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedLocation('')
                }}
                className='text-blue-600 hover:text-blue-800 font-medium text-sm'
              >
                Effacer tous les filtres
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {sortedJobs.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {sortedJobs.map((job, index) => (
              <JobCard key={index} job={job} matchScore={job.matchScore} />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <div className='text-gray-400 text-6xl mb-4'>🔍</div>
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              Aucun résultat trouvé
            </h3>
            <p className='text-gray-600'>
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
