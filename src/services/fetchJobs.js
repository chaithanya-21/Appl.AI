// -----------------------------
// FETCH JOBS (India Only)
// -----------------------------
export async function fetchJobs(query = "consulting") {
  const res = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${query}&num_pages=1`,
    {
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_JOBS_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    }
  );

  const data = await res.json();

  // ✅ Strict India filtering
  const indiaJobs = data.data.filter(job => {
    const country = (job.job_country || "").toLowerCase();
    const location = (job.job_location || "").toLowerCase();
    const city = (job.job_city || "").toLowerCase();

    return (
      country === "in" ||
      country.includes("india") ||
      location.includes("india") ||
      city.length > 0
    );
  });

  return indiaJobs.map(job => ({
    id: job.job_id,
    role: job.job_title || "Unknown Role",
    company: job.employer_name || "Unknown Company",
    location: job.job_city
      ? `${job.job_city}, India`
      : "India",
    description: job.job_description || "No description provided",
    posted: job.job_posted_at_datetime_utc || Date.now(),
    salary:
      job.job_min_salary && job.job_max_salary
        ? `${job.job_min_salary} - ${job.job_max_salary} ${job.job_salary_currency || ""}`
        : "Salary not disclosed",
    link: job.job_apply_link,
    workType: job.job_is_remote ? "remote" : "onsite",
    source: job.job_publisher || "Unknown"
  }));
}
