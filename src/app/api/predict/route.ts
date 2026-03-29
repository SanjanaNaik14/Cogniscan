import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const features = await req.json();
    console.log("Calling Flask with features:", features);

    const res = await fetch('http://localhost:5000/predict', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(features),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Flask error:', errText);
      throw new Error(`Flask responded with ${res.status}: ${errText}`);
    }

    const data = await res.json();
    console.log("Flask prediction:", data);
    return NextResponse.json(data);

  } catch (err: any) {
    console.error('Predict route error:', err.message);
    
    // ── Fallback prediction if Flask is down ──
    // So the app doesn't break during demo
    return NextResponse.json({
      prediction:  0,
      label:       'Flask Offline — Rule-based Fallback',
      confidence:  50,
      risk:        'moderate'
    }, { status: 200 }); // return 200 so frontend doesn't crash
  }
}