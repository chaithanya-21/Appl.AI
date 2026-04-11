/**
 * Scores a job against resume text.
 * Returns a % match (0–100).
 * If no resume is uploaded, returns a neutral placeholder score
 * based on job metadata (not 0, which looks broken).
 */
export function scoreJob(job, resumeText = "") {

  // No resume — return a soft "pending" score based on job quality signals
  if (!resumeText || !resumeText.trim()) {
    let base = 50;
    if (job.priority) base += 10;
    if (job.workType === "remote") base += 5;
    if (job.salary && job.salary !== "Salary not disclosed") base += 5;
    return Math.min(70, base); // caps at 70 until resume is provided
  }

  if (!job.description) return 50;

  const resumeWords = resumeText
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3);

  const jdText = job.description.toLowerCase();
  const jobTitle = (job.role || "").toLowerCase();
  const jobSkills = (job.skills || []).join(" ").toLowerCase();

  // Count resume word matches in JD
  let matches = 0;
  const uniqueWords = new Set(resumeWords);

  for (const word of uniqueWords) {
    if (jdText.includes(word)) matches++;
  }

  // Boost for direct skill matches
  const skillBoost = (job.skills || []).filter(skill =>
    resumeText.toLowerCase().includes(skill.toLowerCase())
  ).length * 3;

  const rawScore = Math.round((matches / Math.max(uniqueWords.size, 1)) * 300) + skillBoost;
  const clamped = Math.min(98, Math.max(10, rawScore));

  return clamped;
}
