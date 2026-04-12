// ─────────────────────────────────────────────────────────────────────────────
// FETCH JOBS  —  India · SaaS / Consulting focus
//
// Strategy: broad role queries + city queries + SaaS/consulting-specific terms.
// Runs up to 16 queries × 3 pages = ~480 results per refresh cycle.
// ─────────────────────────────────────────────────────────────────────────────

function detectWorkType(job) {
  const title = (job.job_title       || "").toLowerCase();
  const desc  = (job.job_description || "").toLowerCase();
  if (job.job_is_remote) return "remote";
  if (
    title.includes("hybrid") || desc.includes("hybrid work") ||
    desc.includes("hybrid model") || desc.includes("wfh 2") ||
    desc.includes("2 days remote") || desc.includes("3 days remote")
  ) return "hybrid";
  return "onsite";
}

function extractExperience(job) {
  const title = (job.job_title       || "").toLowerCase();
  const desc  = (job.job_description || "").toLowerCase();
  if (
    title.includes("senior") || title.includes("sr.") ||
    desc.includes("5+ years") || desc.includes("6+ years") ||
    desc.includes("7+ years") || desc.includes("8+ years")
  ) return "senior";
  if (
    title.includes("principal") || title.includes("staff") ||
    title.includes("lead")      || title.includes("manager") ||
    title.includes("head of")   || title.includes("director")
  ) return "lead";
  if (
    title.includes("junior") || title.includes("jr.") ||
    desc.includes("0-2 years") || desc.includes("fresher") ||
    desc.includes("entry level") || desc.includes("entry-level")
  ) return "junior";
  if (
    desc.includes("2+ years") || desc.includes("3+ years") ||
    desc.includes("4+ years") || title.includes("mid")
  ) return "mid";
  return "any";
}

function extractSkillTags(job) {
  const text = ((job.job_title || "") + " " + (job.job_description || "")).toLowerCase();
  const SKILLS = [
    "salesforce", "sap", "oracle", "workday", "servicenow", "dynamics 365",
    "netsuite", "hubspot", "zendesk", "freshworks", "zoho",
    "react", "node", "python", "java", "javascript", "typescript", "sql", "aws",
    "azure", "gcp", "docker", "kubernetes", "mongodb", "postgresql",
    "machine learning", "data science", "analytics", "power bi", "tableau",
    "product management", "project management", "agile", "scrum",
    "consulting", "crm", "erp", "presales", "implementation",
    "figma", "ux", "ui", "devops", "go", "c#", "excel"
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
    return currency + " " + min + " – " + max + label;
  }
  return "Salary not disclosed";
}

function buildLocation(job) {
  const city  = (job.job_city  || "").trim();
  const state = (job.job_state || "").trim();
  if (city && state) return city + ", " + state;
  if (city)          return city;
  if (state)         return state;
  return "India";
}

// ── Query matrix ─────────────────────────────────────────────────────────────
// 16 queries covering SaaS consulting roles + general tech + city sweeps.
// 3 pages each × ~10 results/page = ~480 jobs per full refresh.

const SEARCH_QUERIES = [
  // ── SaaS & Consulting (priority) ──────────────────────────────────────────
  "SaaS consultant jobs India",
  "Salesforce consultant India",
  "SAP consultant jobs India",
  "ERP implementation consultant India",
  "CRM consultant India",
  "presales consultant SaaS India",
  "business analyst SaaS India",
  "implementation consultant software India",
  "customer success manager SaaS India",
  "solutions engineer India",

  // ── Broad tech ────────────────────────────────────────────────────────────
  "product manager jobs India",
  "software engineer jobs India",
  "data analyst jobs India",
  "full stack developer India",

  // ── City sweeps (catches location-indexed listings) ────────────────────────
  "jobs in Bangalore technology",
  "jobs in Hyderabad technology"
];

export const MIN_JOBS = 500; // target minimum live job count

export async function fetchJobs(customQuery, options) {
  const pages      = (options && options.pages)      ? options.pages      : 3;
  const datePosted = (options && options.datePosted) ? options.datePosted : "month";

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
        "query="       + encodeURIComponent(q),
        "num_pages="   + String(pages),
        "date_posted=" + datePosted,
        "country=in",
        "language=en",
        "employment_types=FULLTIME%2CPARTTIME%2CCONTRACTOR%2CINTERNSHIP"
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

      if (!res.ok) {
        console.warn("[fetchJobs] HTTP " + res.status + " for: " + q);
        continue;
      }

      const data = await res.json();
      if (!data || !Array.isArray(data.data)) continue;

      for (const job of data.data) {
        if (!job.job_id)             continue;
        if (seenIds.has(job.job_id)) continue;
        seenIds.add(job.job_id);

        allJobs.push({
          id:              job.job_id,
          role:            job.job_title        || "Unknown Role",
          company:         job.employer_name    || "Unknown Company",
          location:        buildLocation(job),
          description:     job.job_description  || "No description provided",
          posted:          job.job_posted_at_datetime_utc || new Date().toISOString(),
          salary:          formatSalary(job),
          link:            job.job_apply_link   || null,
          workType:        detectWorkType(job),
          experienceLevel: extractExperience(job),
          skills:          extractSkillTags(job),
          source:          job.job_publisher    || "Unknown",
          logo:            job.employer_logo    || null
        });
      }
    } catch (err) {
      console.warn("[fetchJobs] query failed — " + q + " — " + err.message);
    }
  }

  return allJobs;
}
