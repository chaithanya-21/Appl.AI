const API_KEY = import.meta.env.VITE_OPENAI_KEY;

export async function callAI(messages){

  if(!API_KEY){
    alert("Missing OpenAI key. Restart dev server.");
    return null;
  }

  try{
    const res = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${API_KEY}`
      },
      body:JSON.stringify({
        model:"gpt-4.1-mini",
        messages
      })
    });

    const data = await res.json();

    if(!data?.choices?.[0]?.message?.content){
      console.error(data);
      alert("AI returned empty response.");
      return null;
    }

    return data.choices[0].message.content;

  }catch(err){
    console.error(err);
    alert("Network/API error");
    return null;
  }
}