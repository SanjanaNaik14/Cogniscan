import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log("--- 🎙️ NEW AUDIO REQUEST STARTING ---");
  
  try {
    console.log("1. Checking API Key...");
    if (!process.env.GROQ_API_KEY) {
      console.log("❌ FATAL: GROQ_API_KEY is missing from .env.local!");
      return NextResponse.json({ error: "No API Key" }, { status: 500 });
    }

    console.log("2. Parsing FormData from browser...");
    const formData = await req.formData();
    
    const file = formData.get('file') as Blob;
    if (!file) {
      console.log("❌ FATAL: Frontend did not send a file!");
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }
    
    console.log(`3. File Received! Size: ${file.size} bytes, Type: ${file.type}`);

    // Force it into a standard format Groq accepts
    const audioFile = new File([file], 'audio.webm', { type: 'audio/webm' });
    const groqData = new FormData();
    groqData.append('file', audioFile);
    groqData.append('model', 'whisper-large-v3');

    console.log("4. Firing request to Groq servers...");
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: groqData
    });

    console.log(`5. Groq responded with status code: ${response.status}`);

    if (!response.ok) {
      const err = await response.text();
      console.log("❌ FATAL: Groq rejected the file. Reason:", err);
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ SUCCESS! Groq transcribed:", data.text);
    console.log("-----------------------------------------");
    
    return NextResponse.json({ transcript: data.text });

  } catch (error) {
    console.log("❌ CATASTROPHIC SERVER CRASH:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}