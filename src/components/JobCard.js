import React from 'react'

export default function JobCard({ job, matchScore }) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h3 className='text-xl font-semibold text-gray-900 mb-1'>{job.title}</h3>
          <p className='text-gray-600 font-medium'>{job.company}</p>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <div className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'>
            {job.location}
          </div>
          {matchScore && matchScore.score !== '0%' && (
            <div className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'>
              {matchScore.score} match
            </div>
          )}
        </div>
      </div>
      
      <p className='text-gray-700 mb-4 line-clamp-3'>{job.description}</p>
      
      <div className='mb-4'>
        <h4 className='text-sm font-semibold text-gray-900 mb-2'>Compétences requises:</h4>
        <div className='flex flex-wrap gap-2'>
          {job.skills.map((skill, index) => (
            <span 
              key={index}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                matchScore?.matchingSkills?.includes(skill)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className='flex justify-between items-center'>
        <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200'>
          Postuler
        </button>
        <button className='text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200'>
          Voir détails
        </button>
      </div>
    </div>
  )
}
