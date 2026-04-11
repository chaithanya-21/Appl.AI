// -----------------------------
// FETCH JOBS — India Only
// Supports multiple search queries for broader coverage
// -----------------------------

const INDIA_INDICATORS = [
  "india", " in", "bangalore", "bengaluru", "hyderabad", "mumbai",
  "chennai", "pune", "delhi", "gurgaon", "noida", "kolkata",
  "ahmedabad", "visakhapatnam", "vijayawada", "kochi", "jaipur",
  "chandigarh", "coimbatore", "indore", "nagpur", "surat"
];

function isIndianJob(job) {
  const country = (job.job_country || "").toLowerCase().trim();
  const location = (job.job_location || "").toLowerCase();
  const city = (job.job_city || "").toLowerCase();
  const state = (job.job_state || "").toLowerCase();

  // Strict country code check
  if (country === "in" || country === "india") return true;

  // Location string contains India
  if (location.includes("india")) return true;

  // Known Indian city match
  const knownCity = INDIA_INDICATORS.some(c => city.includes(c) || location.includes(c) || state.includes(c));
  if (knownCity) return true;

  return false;
}

function detectWorkType(job) {
  const title = (job.job_title || "").toLowerCase();
  const desc = (job.job_description || "").toLowerCase();
  const isRemote = job.job_is_remote;

  if (isRemote) return "remote";

  // Check for hybrid keywords
  if (
    title.includes("hybrid") ||
    desc.includes("hybrid work") ||
    desc.includes("hybrid model") ||
    desc.includes("work from home 2") ||
    desc.includes("wfh 2") ||
    desc.includes("2 days remote") ||
    desc.includes("3 days remote")
  ) return "hybrid";

  return "onsite";
}

function extractExperience(job) {
  const desc = (job.job_description || "").toLowerCase();
  const title = (job.job_title || "").toLowerCase();

  if (title.includes("senior") || title.includes("sr.") || desc.includes("5+ years") || desc.includes("7+ years")) return "senior";
  if (title.includes("junior") || title.includes("jr.") || title.includes("associate") || desc.includes("0-2 years") || desc.includes("fresher")) return "junior";
  if (title.includes("lead") || title.includes("manager") || title.includes("head of")) return "lead";
  if (desc.includes("2+ years") || desc.includes("3+ years") || desc.includes("mid-level") || title.includes("mid")) return "mid";

  return "any";
}

function extractSkillTags(job) {
  const text = ((job.job_title || "") + " " + (job.job_description || "")).toLowerCase();
  const ALL_SKILLS = [
    "react", "node", "python", "java", "javascript", "typescript", "sql", "aws",
    "azure", "gcp", "docker", "kubernetes", "terraform", "mongodb", "postgresql",
    "graphql", "rest", "spring", "django", "flask", "angular", "vue", "next.js",
    "machine learning", "deep learning", "nlp", "data science", "analytics",
    "power bi", "tableau", "excel", "salesforce", "sap", "figma", "ui/ux",
    "product management", "scrum", "agile", "devops", "ci/cd", "testing", "qa",
    "ios", "android", "flutter", "react native", "go", "rust", "c++", "c#"
  ];
  return ALL_SKILLS.filter(s => text.includes(s)).slice(0, 5);
}

function formatSalary(job) {
  if (job.job_min_salary && job.job_max_salary) {
    const currency = job.job_salary_currency || "INR";
    const period = job.job_salary_period || "YEAR";
    const min = Number(job.job_min_salary).toLocaleString("en-IN");
    const max = Number(job.job_max_salary).toLocaleString("en-IN");
    const periodLabel = period === "YEAR" ? "/yr" : period === "MONTH" ? "/mo" : "";
    return `${currency} ${min} – ${max}${periodLabel}`;
  }
  return "Salary not disclosed";
}

// Default search queries to pull a variety of Indian jobs
const DEFAULT_QUERIES = [
  "software engineer India",
  "product manager India",
  "data analyst India",
  "consulting India",
  "business analyst India",
  "implementation consultant".
  "solution consultant",
  "senior consultant",
  "project manager",
  "associate project manager",
  "consultant"
];

export async function fetchJobs(query = null, options = {}) {
  const {
    pages = 1,
    datePosted = "month" // all | today | 3days | week | month
  } = options;

  const queries = query
    ? [query]
    : DEFAULT_QUERIES;

  const key = import.meta.env.VITE_JOBS_KEY;
  if (!key) throw new Error("Missing VITE_JOBS_KEY env variable");

  const allJobs = [];
  const seenIds = new Set();

  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        query: q,
        num_pages: String(pages),
        date_posted: datePosted,
        country: "in"
      });

      const res = await fetch(
        `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
        {
          headers: {
            "X-RapidAPI-Key": key,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
          }
        }
      );

      if (!res.ok) continue;

      const data = await res.json();
      if (!data?.data) continue;

      const indianJobs = data.data.filter(isIndianJob);

      for (const job of indianJobs) {
        if (seenIds.has(job.job_id)) continue;
        seenIds.add(job.job_id);

        allJobs.push({
          id: job.job_id,
          role: job.job_title || "Unknown Role",
          company: job.employer_name || "Unknown Company",
          location: job.job_city
            ? `${job.job_city}${job.job_state ? ", " + job.job_state : ""}`
            : "India",
          description: job.job_description || "No description provided",
          posted: job.job_posted_at_datetime_utc || new Date().toISOString(),
          salary: formatSalary(job),
          link: job.job_apply_link || null,
          workType: detectWorkType(job),
          experienceLevel: extractExperience(job),
          skills: extractSkillTags(job),
          source: job.job_publisher || "Unknown",
          logo: job.employer_logo || null,
          highlights: job.job_highlights || {}
        });
      }
    } catch (err) {
      console.warn(`fetchJobs: query "${q}" failed —`, err.message);
    }
  }

  return allJobs;
}
