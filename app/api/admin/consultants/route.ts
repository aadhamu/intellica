import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization');

    const response = await axios.get(`${apiUrl}/api/admin/consultants`, {
      headers: { Authorization: token || '' },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Admin API GET Error:', error);
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'An error occurred' };
    return NextResponse.json(data, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id || !action) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    const body = await req.json();
    const url = `${apiUrl}/api/admin/consultants/${id}/${action}`;

    const response = await axios.post(url, body, {
      headers: { Authorization: token || '' },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Admin API POST Error:', error);
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'An error occurred' };
    return NextResponse.json(data, { status });
  }
}
