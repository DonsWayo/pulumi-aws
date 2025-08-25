import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Mock user data
const users = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com' }
];

export const GET: RequestHandler = async ({ params }) => {
  const user = users.find(u => u.id === params.id);
  
  if (user) {
    return json({
      success: true,
      user,
      timestamp: new Date().toISOString()
    });
  }
  
  return json({
    success: false,
    error: `User with id ${params.id} not found`
  }, { status: 404 });
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const updates = await request.json();
    const userIndex = users.findIndex(u => u.id === params.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      return json({
        success: true,
        message: `User ${params.id} updated`,
        user: users[userIndex]
      });
    }
    
    return json({
      success: false,
      error: `User with id ${params.id} not found`
    }, { status: 404 });
  } catch (error) {
    return json({
      success: false,
      error: 'Invalid JSON payload'
    }, { status: 400 });
  }
};