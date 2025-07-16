import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // 1. Validate headers
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    // 2. Parse and validate body
    let prompt: string
    try {
      const body = await req.json()
      prompt = body.prompt
      if (!prompt || typeof prompt !== 'string') {
        return NextResponse.json(
          { error: 'Prompt must be a non-empty string' },
          { status: 400 }
        )
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    // 3. Call DeepSeek via OpenRouter with JSON response forced
    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Business Plan Generator'
      },
      body: JSON.stringify({
       model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{
          role: 'user',
          content: prompt
        }],
        response_format: { type: 'json_object' } // Force JSON response
      })
    })

    // 4. Handle API errors
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}))
      console.error('OpenRouter Error:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'API request failed' },
        { status: apiResponse.status }
      )
    }

    // 5. Process and validate the response
    const data = await apiResponse.json()
    let rawContent = data?.choices?.[0]?.message?.content
    console.log("AI Raw Response:", rawContent)

    // Handle cases where the response might be a stringified JSON
    if (typeof rawContent === 'string') {
      try {
        // Check if the response is wrapped in markdown code blocks
        const codeBlockMatch = rawContent.match(/```(?:json)?\n([\s\S]*?)\n```/)
        if (codeBlockMatch) {
          rawContent = codeBlockMatch[1]
        }
        
        // Parse the content to ensure it's valid JSON
        const parsedContent = JSON.parse(rawContent)
        return NextResponse.json(parsedContent)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        return NextResponse.json(
          { error: 'AI returned invalid JSON format', rawResponse: rawContent },
          { status: 422 }
        )
      }
    }

    // If we get here, it's already a JSON object
    return NextResponse.json(rawContent)

  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}