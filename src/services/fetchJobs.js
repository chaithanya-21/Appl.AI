// ─────────────────────────────────────────────
// FETCH JOBS  —  India Only
// ─────────────────────────────────────────────

const INDIA_SIGNALS = [
  "india","bangalore","bengaluru","hyderabad","mumbai","chennai",
  "pune","delhi","gurgaon","gurugram","noida","kolkata","ahmedabad",
  "visakhapatnam","vijayawada","kochi","jaipur","chandigarh",
  "coimbatore","indore","nagpur","surat","lucknow","bhopal"
];

function isIndianJob(job) {
  const country  = (job.job_country  || "").toLowerCase().trim();
  const location = (job.job_location || "").toLowerCase();
  const city     = (job.job_city     || "").toLowerCase();
  const state    = (job.job_state    || "").toLowerCase();

  if (country === "in" || country === "india") return true;
  if (location.includes("india")) return true;

  const combined = city + " " + state + " " + location;
  return INDIA_SIGNALS.some(function(s) { return combined.includes(s); });
}

function detectWorkType(job) {
  const title = (job.job_title       || "").toLowerCase();
  const desc  = (job.job_description || "").toLowerCase();

  if (job.job_is_remote) return "remote";

  if (
    title.includes("hybrid") ||
    desc.includes("hybrid work")   ||
    desc.includes("hybrid model")  ||
    desc.includes("wfh 2")         ||
    desc.includes("2 days remote") ||
    desc.includes("3 days remote")
  ) return "hybrid";

  return "onsite";
}

function extractExperience(job) {
  const title = (job.job_title       || "").toLowerCase();
  const desc  = (job.job_description || "").toLowerCase();

  if (title.includes("senior") || title.includes("sr.") || desc.includes("5+ years") || desc.includes("7+ years")) return "senior";
  if (title.includes("lead")   || title.includes("manager") || title.includes("head of")) return "lead";
  if (title.includes("junior") || title.includes("jr.")   || desc.includes("0-2 years") || desc.includes("fresher")) return "junior";
  if (desc.includes("2+ years") || desc.includes("3+ years") || title.includes("mid")) return "mid";

  return "any";
}

function extractSkillTags(job) {
  const text = ((job.job_title || "") + " " + (job.job_description || "")).toLowerCase();

  const SKILLS = [
    "react","node","python","java","javascript","typescript","sql","aws",
    "azure","gcp","docker","kubernetes","terraform","mongodb","postgresql",
    "graphql","django","flask","angular","vue","spring",
    "machine learning","deep learning","data science","analytics",
    "power bi","tableau","salesforce","figma","scrum","agile","devops",
    "ios","android","flutter","go","rust"
  ];

  const found = [];
  for (let i = 0; i < SKILLS.length && found.length < 5; i++) {
    if (text.includes(SKILLS[i])) found.push(SKILLS[i]);
  }
  return found;
}

function formatSalary(job) {
  if (job.job_min_salary && job.job_max_salary) {
    const currency = job.job_salary_currency || "INR";
    const period   = job.job_salary_period   || "YEAR";
    const min = Number(job.job_min_salary).toLocaleString("en-IN");
    const max = Number(job.job_max_salary).toLocaleString("en-IN");
    const label = period === "YEAR" ? "/yr" : period === "MONTH" ? "/mo" : "";
    return currency + " " + min + " \u2013 " + max + label;
  }
  return "Salary not disclosed";
}

// Broad query set for Indian job market coverage — one string per line, no concatenation
const SEARCH_QUERIES = [
  "software engineer India",
  "product manager India",
  "data analyst India",
  "business analyst India",
  "consulting jobs India"
];

export async function fetchJobs(customQuery, options) {
  const pages      = (options && options.pages)      ? options.pages      : 1;
  const datePosted = (options && options.datePosted) ? options.datePosted : "month";

  // Assign env var to a plain const before use — avoids esbuild define edge-cases
  const apiKey = import.meta.env.VITE_JOBS_KEY;

  if (!apiKey) {
    throw new Error("Missing VITE_JOBS_KEY — add it to Render environment variables.");
  }

  const queries = customQuery ? [customQuery] : SEARCH_QUERIES;
  const allJobs = [];
  const seenIds = new Set();

  for (const q of queries) {
    try {
      const params = [
        "query="      + encodeURIComponent(q),
        "num_pages="  + String(pages),
        "date_posted=" + datePosted,
        "country=in"
      ].join("&");

      const res = await fetch(
        "https://jsearch.p.rapidapi.com/search?" + params,
        {
          headers: {
            "X-RapidAPI-Key":  apiKey,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
          }
        }
      );

      if (!res.ok) continue;

      const data = await res.json();
      if (!data || !data.data) continue;

      for (const job of data.data.filter(isIndianJob)) {
        if (seenIds.has(job.job_id)) continue;
        seenIds.add(job.job_id);

        const city  = job.job_city  || "";
        const state = job.job_state || "";
        const locationStr = city
          ? (state ? city + ", " + state : city)
          : "India";

        allJobs.push({
          id:              job.job_id,
          role:            job.job_title         || "Unknown Role",
          company:         job.employer_name     || "Unknown Company",
          location:        locationStr,
          description:     job.job_description  || "No description provided",
          posted:          job.job_posted_at_datetime_utc || new Date().toISOString(),
          salary:          formatSalary(job),
          link:            job.job_apply_link    || null,
          workType:        detectWorkType(job),
          experienceLevel: extractExperience(job),
          skills:          extractSkillTags(job),
          source:          job.job_publisher     || "Unknown",
          logo:            job.employer_logo     || null
        });
      }
    } catch (err) {
      console.warn("fetchJobs: query failed \u2014", q, err.message);
    }
  }

  return allJobs;
}
