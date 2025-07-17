import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('[START] Incoming request');

    // 1. Validate headers
    const contentType = req.headers.get('content-type');
    console.log('[DEBUG] content-type:', contentType);

    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // 2. Parse JSON body
    let prompt: string;
    try {
      const body = await req.json();
      console.log('[DEBUG] Request body:', body);
      prompt = body.prompt;

      if (!prompt || typeof prompt !== 'string') {
        return NextResponse.json(
          { error: 'Prompt must be a non-empty string' },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error('[ERROR] Invalid JSON:', e);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // 3. Call OpenRouter API
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      console.error('[ERROR] Missing OPENROUTER_API_KEY');
      return NextResponse.json(
        { error: 'Missing OpenRouter API Key' },
        { status: 500 }
      );
    }

    const payload = {
      model: 'deepseek-ai/deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    };

    console.log('[DEBUG] Sending payload to OpenRouter:', payload);

    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Business Plan Generator'
      },
      body: JSON.stringify(payload)
    });

    console.log('[DEBUG] OpenRouter response status:', apiResponse.status);

    // 4. Handle errors from OpenRouter
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      console.error('[ERROR] OpenRouter returned error:', errorData);
      return NextResponse.json(
        { error: errorData?.error?.message || 'Failed to fetch from OpenRouter' },
        { status: apiResponse.status }
      );
    }

    // 5. Read response JSON
    const data = await apiResponse.json();
    console.log('[DEBUG] OpenRouter API response:', data);

    let rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error('[ERROR] No content in AI response');
      return NextResponse.json(
        { error: 'AI returned no content' },
        { status: 500 }
      );
    }

    // 6. Try to extract and parse JSON inside markdown code block
    if (typeof rawContent === 'string') {
      const match = rawContent.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (match) {
        rawContent = match[1];
      }

      try {
        const parsed = JSON.parse(rawContent);
        return NextResponse.json(parsed);
      } catch (err) {
        console.error('[ERROR] Failed to parse JSON string:', rawContent, err);
        return NextResponse.json(
          {
            error: 'AI returned invalid JSON format',
            rawResponse: rawContent
          },
          { status: 422 }
        );
      }
    }

    // 7. Already JSON
    return NextResponse.json(rawContent);

  } catch (error) {
    console.error('[FATAL ERROR] Server crash:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
