export const fetchJobs = async () => {
  const response = await fetch('/api/jobs');
  return await response.json();
};

  