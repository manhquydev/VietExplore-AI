// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check API key trước khi import
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('❌ GOOGLE_AI_API_KEY not configured');
      return NextResponse.json({
        error: 'Service configuration error',
        message: 'AI service is not properly configured. Please contact administrator.',
        code: 'MISSING_API_KEY'
      }, { status: 500 });
    }

    // Dynamic import để tránh lỗi khi initialize
    const { chatFlow } = await import('@/ai/flows/chat-flow');
    
    const body = await request.json();
    const { message, history = [] } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Valid message is required' },
        { status: 400 }
      );
    }
    
    console.log('🔄 Processing chat request...');
    
    const response = await chatFlow({
      message,
      history
    });
    
    console.log('✅ Chat request completed');
    
    return NextResponse.json({
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in AI chat route:', error);
    
    // Handle specific initialization errors
    if (error.message.includes('GOOGLE_AI_API_KEY')) {
      return NextResponse.json({
        error: 'Service configuration error',
        message: 'AI service is not properly configured',
        code: 'API_KEY_ERROR'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Unable to process your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
