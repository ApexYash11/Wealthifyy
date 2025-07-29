import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    console.log('🔍 DEBUG: Frontend received message:', message);
    
    // Get JWT from Authorization header or cookies
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    console.log('🔍 DEBUG: Token exists:', !!token);
    
    if (!token) {
      console.log('❌ DEBUG: No token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000/feedback';
    console.log('🔍 DEBUG: Sending to backend URL:', backendUrl);
    console.log('🔍 DEBUG: Sending message as:', message);
    
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message: message }), // Send message in proper format
    });
    
    console.log('🔍 DEBUG: Backend response status:', res.status);
    const data = await res.json();
    console.log('🔍 DEBUG: Backend response data:', data);
    
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('❌ DEBUG: Feedback API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 