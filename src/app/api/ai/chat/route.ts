import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatInputSchema } from '@/ai/flows/chat-flow';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

export async function POST(request: NextRequest) {
  // Optional: You can protect this endpoint so only logged-in users can use it.
  // For now, we will allow guests to use the chat.
  /*
  const authResult = await verifyAuthToken(request);
  if (!authResult.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  */

  try {
    const body = await request.json();
    const validatedInput = ChatInputSchema.safeParse(body);

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedInput.error.format() },
        { status: 400 }
      );
    }

    const output = await chat(validatedInput.data);

    return NextResponse.json(output);
  } catch (error: any) {
    console.error('Error in AI chat route:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
