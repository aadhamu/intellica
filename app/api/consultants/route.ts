import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { Readable } from 'stream';


export async function POST(req: NextRequest) {
  try {
    // Get raw body (required for multipart)
    const contentType = req.headers.get('content-type') || '';
    const bodyBuffer = await req.arrayBuffer();
    const body = Buffer.from(bodyBuffer);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/consultants`,
      body,
      {
        headers: {
          'Content-Type': contentType,
          // Forward other headers (like Authorization, etc)
          ...(req.headers.has('authorization') && {
            Authorization: req.headers.get('authorization')!,
          }),
        },
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('API Error:', error);
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'An error occurred' };
    return NextResponse.json(data, { status });
  }
}
