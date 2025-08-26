import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Mock product data (same as parent route)
const products = [
  { id: 1, name: "Next.js Enterprise", price: 299, category: "Framework" },
  { id: 2, name: "React Server Components", price: 199, category: "Library" },
  { id: 3, name: "Turbo Build System", price: 399, category: "Tool" },
  { id: 4, name: "Vercel Analytics", price: 99, category: "Service" },
  { id: 5, name: "Edge Runtime", price: 249, category: "Infrastructure" },
];

// GET /api/products/[id]
export const GET: RequestHandler = async ({ params }) => {
  try {
    const id = parseInt(params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return json(product);
  } catch (error) {
    return json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
};

// PUT /api/products/[id]
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const id = parseInt(params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Update product (in-memory only for demo)
    products[productIndex] = {
      ...products[productIndex],
      ...body,
      id // Ensure ID doesn't change
    };
    
    return json(products[productIndex]);
  } catch (error) {
    return json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
};

// DELETE /api/products/[id]
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const id = parseInt(params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Remove product (in-memory only for demo)
    const deleted = products.splice(productIndex, 1)[0];
    
    return json({
      message: 'Product deleted successfully',
      product: deleted
    });
  } catch (error) {
    return json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
};