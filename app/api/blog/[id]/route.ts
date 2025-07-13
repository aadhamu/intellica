import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const response = await fetch(`${process.env.LARAVEL_API_URL}/api/blogs/${id}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Optional: disables caching
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blog: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      data: {
        ...data,
        ratings_avg_rating: data.average_rating || 0,
        ratings_count: data.ratings_count || 0,
      },
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load blog' },
      { status: 500 }
    );
  }
}
