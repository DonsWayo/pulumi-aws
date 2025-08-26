<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
  }
  
  let product: Product | null = null;
  let loading = true;
  let error: string | null = null;
  
  async function fetchProduct(id: string) {
    loading = true;
    error = null;
    
    try {
      // Fetch single product from API
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product');
      }
      
      product = data;
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }
  
  onMount(() => {
    fetchProduct($page.params.id);
  });
</script>

<svelte:head>
  <title>{product ? product.name : 'Product'} - SvelteKit</title>
  <meta name="description" content={product ? `View details for ${product.name}` : 'Product details'} />
</svelte:head>

<div class="container py-10 max-w-4xl mx-auto px-4">
  {#if loading}
    <div class="animate-pulse">
      <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div class="h-32 bg-gray-200 rounded mb-6"></div>
      <div class="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  {:else if error}
    <div class="text-center py-10">
      <h1 class="text-2xl font-bold text-red-600 mb-4">Error</h1>
      <p class="text-gray-600 mb-6">{error}</p>
      <a 
        href="/products" 
        class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Products
      </a>
    </div>
  {:else if product}
    <div>
      <!-- Breadcrumb -->
      <nav class="mb-6 text-sm">
        <ol class="flex items-center space-x-2">
          <li>
            <a href="/" class="text-gray-500 hover:text-gray-700">Home</a>
          </li>
          <li class="text-gray-400">/</li>
          <li>
            <a href="/products" class="text-gray-500 hover:text-gray-700">Products</a>
          </li>
          <li class="text-gray-400">/</li>
          <li class="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      <!-- Product Details -->
      <div class="bg-white border rounded-lg p-8">
        <div class="mb-4">
          <span class="inline-block px-3 py-1 text-sm bg-gray-100 rounded-full">
            {product.category}
          </span>
        </div>
        
        <h1 class="text-3xl font-bold mb-4">{product.name}</h1>
        
        <div class="mb-6">
          <span class="text-4xl font-bold text-blue-600">${product.price}</span>
          <span class="text-gray-500 ml-2">USD</span>
        </div>
        
        <div class="prose prose-gray max-w-none mb-8">
          <h2 class="text-xl font-semibold mb-3">Product Description</h2>
          <p class="text-gray-600">
            {#if product.id === 1}
              Next.js Enterprise is a comprehensive framework solution for building large-scale applications. 
              It includes advanced features like ISR, middleware, and edge runtime support.
            {:else if product.id === 2}
              React Server Components revolutionize how we build React applications by enabling 
              server-side rendering at the component level with zero client-side JavaScript.
            {:else if product.id === 3}
              Turbo Build System is a high-performance build tool that makes your development 
              workflow faster with intelligent caching and parallel execution.
            {:else if product.id === 4}
              Vercel Analytics provides real-time insights into your application's performance, 
              user behavior, and Core Web Vitals metrics.
            {:else if product.id === 5}
              Edge Runtime enables you to run your application code at the edge, closer to your users, 
              for improved performance and reduced latency.
            {:else}
              This product offers cutting-edge technology solutions for modern web development.
            {/if}
          </p>
        </div>
        
        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold mb-3">Key Features</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-600">
            <li>Enterprise-ready solution</li>
            <li>Scalable architecture</li>
            <li>Premium support included</li>
            <li>Regular updates and maintenance</li>
            <li>Comprehensive documentation</li>
          </ul>
        </div>
        
        <div class="flex gap-4 mt-8">
          <button 
            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>
          <a 
            href="/products" 
            class="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Products
          </a>
        </div>
      </div>
      
      <!-- Related Products -->
      <div class="mt-12">
        <h2 class="text-2xl font-semibold mb-6">Related Products</h2>
        <div class="text-gray-600">
          <p>Check out other products in the <strong>{product.category}</strong> category.</p>
          <a href="/products?category={encodeURIComponent(product.category)}" class="text-blue-600 hover:underline mt-2 inline-block">
            View all {product.category} products →
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>