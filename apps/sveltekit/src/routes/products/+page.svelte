<script lang="ts">
  import { onMount } from 'svelte';
  
  interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
  }
  
  let products: Product[] = [];
  let loading = true;
  let error: string | null = null;
  let selectedCategory = '';
  
  async function fetchProducts(category?: string) {
    loading = true;
    error = null;
    
    try {
      const url = category 
        ? `/api/products?category=${encodeURIComponent(category)}`
        : '/api/products';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      products = data.products;
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }
  
  function handleCategoryChange() {
    fetchProducts(selectedCategory);
  }
  
  onMount(() => {
    fetchProducts();
  });
</script>

<svelte:head>
  <title>Products - SvelteKit</title>
  <meta name="description" content="Browse our product catalog" />
</svelte:head>

<div class="container py-10 max-w-6xl mx-auto px-4">
  <h1 class="text-4xl font-bold mb-8">Products</h1>
  
  <div class="mb-6">
    <label for="category" class="block text-sm font-medium mb-2">
      Filter by Category:
    </label>
    <select 
      id="category"
      bind:value={selectedCategory}
      on:change={handleCategoryChange}
      class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Categories</option>
      <option value="Framework">Framework</option>
      <option value="Library">Library</option>
      <option value="Tool">Tool</option>
      <option value="Service">Service</option>
      <option value="Infrastructure">Infrastructure</option>
    </select>
  </div>
  
  {#if loading}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each Array(6) as _}
        <div class="border rounded-lg p-6 animate-pulse">
          <div class="h-6 bg-gray-200 rounded mb-4"></div>
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      {/each}
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      Error: {error}
    </div>
  {:else if products.length === 0}
    <div class="text-center py-10 text-gray-500">
      No products found.
    </div>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each products as product}
        <a 
          href="/products/{product.id}"
          class="border rounded-lg p-6 hover:shadow-lg transition-shadow block"
        >
          <h2 class="text-xl font-semibold mb-2">{product.name}</h2>
          <p class="text-gray-600 mb-4">
            <span class="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
              {product.category}
            </span>
          </p>
          <div class="flex items-center justify-between">
            <p class="text-2xl font-bold text-blue-600">
              ${product.price}
            </p>
            <span class="text-blue-600 text-sm hover:underline">
              View Details →
            </span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>