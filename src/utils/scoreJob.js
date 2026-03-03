export function scoreJob(job, resumeText=""){

  if(!resumeText || !job.description) return 0;

  const words = resumeText.toLowerCase().split(/\W+/);
  const jd = job.description.toLowerCase();

  let matches = 0;

  words.forEach(w=>{
    if(w.length>3 && jd.includes(w)) matches++;
  });

  const score = Math.min(100, Math.round((matches / words.length) * 400));
  return score;
}
