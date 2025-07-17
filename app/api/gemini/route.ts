import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // Parse and validate body
    let prompt: string;
    try {
      const body = await req.json();
      prompt = body.prompt;
      if (!prompt || typeof prompt !== 'string') {
        return NextResponse.json(
          { error: 'Prompt must be a non-empty string' },
          { status: 400 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Call DeepSeek via OpenRouter API
    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Business Plan Generator'
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    // Handle non-200 responses
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      console.error('OpenRouter API Error:', errorData);
      return NextResponse.json(
        { error: errorData?.error?.message || 'Failed to fetch from OpenRouter' },
        { status: apiResponse.status }
      );
    }

    const responseData = await apiResponse.json();
    let rawContent = responseData?.choices?.[0]?.message?.content;

    // Debug raw output
    console.log("AI Raw Response:", rawContent);

    // Attempt to parse stringified JSON in markdown code block
    if (typeof rawContent === 'string') {
      try {
        const codeBlockMatch = rawContent.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          rawContent = codeBlockMatch[1]; // extract inside markdown
        }

        const parsedContent = JSON.parse(rawContent);
        return NextResponse.json(parsedContent);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        return NextResponse.json(
          {
            error: 'AI returned invalid JSON format',
            rawResponse: rawContent
          },
          { status: 422 }
        );
      }
    }

    // Return raw content if it's already an object
    return NextResponse.json(rawContent);

  } catch (error) {
    console.error('Unhandled Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
