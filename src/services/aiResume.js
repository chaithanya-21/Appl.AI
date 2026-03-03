export async function optimizeResume(resumeText, jobText){
  try{

    const res = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${import.meta.env.VITE_OPENAI_KEY}`
      },
      body:JSON.stringify({
        model:"gpt-4o-mini",
        messages:[
          {
            role:"system",
            content:"You are an expert resume optimizer. Rewrite resumes to match job descriptions while keeping facts true and ATS-friendly."
          },
          {
            role:"user",
            content:`Resume:\n${resumeText}\n\nJob Description:\n${jobText}\n\nRewrite the resume optimized for this job.`
          }
        ],
        temperature:0.4
      })
    });

    const data = await res.json();

    if(data.error){
      console.error(data.error);
      return "⚠️ OpenAI error: " + data.error.message;
    }

    return data.choices[0].message.content;

  }catch(err){
    console.error(err);
    return "⚠️ Network or API issue. Check console.";
  }
}
