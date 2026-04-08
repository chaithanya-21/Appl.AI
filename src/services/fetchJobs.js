export async function fetchJobs(query = "consulting") {

  const res = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${query}&country=in&num_pages=1`,
    {
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_JOBS_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    }
  );

  const data = await res.json();

  // 🔹 Filter strictly for India (extra safety)
  const filteredJobs = data.data.filter(job =>
    job.job_country === "IN" || 
    (job.job_country || "").toLowerCase().includes("india") ||
    (job.job_city || "").length > 0 // most Indian listings have city
  );

  return filteredJobs.map(job => ({
    id: job.job_id,

    role: job.job_title || "Unknown Role",

    company: job.employer_name || "Unknown Company",

    location:
      job.job_city
        ? `${job.job_city}, India`
        : "India",

    description: job.job_description || "No description provided",

    posted: job.job_posted_at_datetime_utc || Date.now(),

    salary:
      job.job_min_salary && job.job_max_salary
        ? `${job.job_min_salary} - ${job.job_max_salary} ${job.job_salary_currency || ""}`
        : "Salary not disclosed",

    link: job.job_apply_link,

    workType:
      (job.job_is_remote || false)
        ? "remote"
        : "onsite",

    // 🔥 BONUS: Source (if available)
    source: job.job_publisher || "Unknown"
  }));
}
