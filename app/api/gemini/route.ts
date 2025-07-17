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

    // 3. Call Groq API
    // const apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     // 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    //     'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     model: "llama3-70b-8192",
    //     messages: [{
    //       role: 'user',
    //       content: prompt
    //     }]
    //   })
    // })

     const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:3000', // required by OpenRouter
    'X-Title': 'Intellica'
  },
  body: JSON.stringify({
    model: 'deepseek/deepseek-chat-v3-0324', // or any OpenRouter-supported model
    max_tokens: 1000,
    messages: [
      { role: 'user', content: prompt }
    ]
  })
})


    // 4. Handle API errors
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}))
      console.error('Groq API Error:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'API request failed' },
        { status: apiResponse.status }
      )
    }

    // 5. Process and validate the response
    const data = await apiResponse.json()
    let rawContent = data?.choices?.[0]?.message?.content
    console.log("AI Raw Response:", rawContent)

    if (typeof rawContent === 'string') {
      try {
        const codeBlockMatch = rawContent.match(/```(?:json)?\n([\s\S]*?)\n```/)
        if (codeBlockMatch) {
          rawContent = codeBlockMatch[1]
        }

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

    return NextResponse.json(rawContent)

  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
