
// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { chatFlow } from '@/ai/flows/chat-flow';

export async function POST(request: NextRequest) {
  try {
    console.log('=== AI Chat API Called ===');
    
    const body = await request.json();
    const { message, history = [] } = body;
    
    console.log('Request:', { message: message.substring(0, 100), historyLength: history.length });
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Valid message is required' },
        { status: 400 }
      );
    }
    
    // Call chat flow với timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30s timeout
    });
    
    const response = await Promise.race([
      chatFlow({ message, history: history.map(h => ({ content: h.text, role: h.role})) }),
      timeoutPromise
    ]);
    
    console.log('✅ Chat flow completed successfully');
    
    return NextResponse.json({
      response,
      model: 'gemini-2.5-pro', // Indicate which model was used
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in AI chat route:', error);
    
    // Handle specific errors
    if (error.name === 'GenkitError') {
      return NextResponse.json({
        error: 'AI model error',
        details: 'Unable to process your request with the AI model',
        code: 'MODEL_ERROR'
      }, { status: 503 });
    }
    
    if (error.message === 'Request timeout') {
      return NextResponse.json({
        error: 'Request timeout',
        details: 'The AI model took too long to respond',
        code: 'TIMEOUT'
      }, { status: 504 });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
