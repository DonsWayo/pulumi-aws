import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    
    return json({
      success: true,
      received: body,
      timestamp: new Date().toISOString(),
      headers: {
        'content-type': request.headers.get('content-type'),
        'user-agent': request.headers.get('user-agent')
      }
    });
  } catch (error) {
    return json({
      success: false,
      error: 'Invalid JSON payload'
    }, { status: 400 });
  }
};

export const GET: RequestHandler = async () => {
  return json({
    message: 'This endpoint accepts POST requests with JSON data',
    example: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  });
};