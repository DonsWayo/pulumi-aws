<script lang="ts">
  import { onMount } from 'svelte';
  
  let apiHealth = { status: 'checking...', timestamp: '' };
  let productCount = 0;
  let loading = true;
  
  async function fetchDashboardData() {
    loading = true;
    
    try {
      // Fetch health status
      const healthResponse = await fetch('/api/health');
      if (healthResponse.ok) {
        apiHealth = await healthResponse.json();
      }
      
      // Fetch product count
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const data = await productsResponse.json();
        productCount = data.total;
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      loading = false;
    }
  }
  
  onMount(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>Dashboard - SvelteKit</title>
  <meta name="description" content="System dashboard and monitoring" />
</svelte:head>

<div class="container py-10 max-w-6xl mx-auto px-4">
  <h1 class="text-4xl font-bold mb-8">Dashboard</h1>
  
  {#if loading}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each Array(4) as _}
        <div class="border rounded-lg p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-8 bg-gray-200 rounded"></div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- API Health Status -->
      <div class="border rounded-lg p-6">
        <h2 class="text-sm font-medium text-gray-600 mb-2">API Status</h2>
        <p class="text-2xl font-bold">
          <span class={apiHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
            {apiHealth.status === 'healthy' ? '✓ Healthy' : '✗ Unhealthy'}
          </span>
        </p>
        {#if apiHealth.timestamp}
          <p class="text-xs text-gray-500 mt-2">
            Last checked: {new Date(apiHealth.timestamp).toLocaleTimeString()}
          </p>
        {/if}
      </div>
      
      <!-- Product Count -->
      <div class="border rounded-lg p-6">
        <h2 class="text-sm font-medium text-gray-600 mb-2">Total Products</h2>
        <p class="text-2xl font-bold text-blue-600">{productCount}</p>
      </div>
      
      <!-- Environment -->
      <div class="border rounded-lg p-6">
        <h2 class="text-sm font-medium text-gray-600 mb-2">Environment</h2>
        <p class="text-2xl font-bold">{apiHealth.environment || 'development'}</p>
      </div>
      
      <!-- Uptime -->
      <div class="border rounded-lg p-6">
        <h2 class="text-sm font-medium text-gray-600 mb-2">Uptime</h2>
        <p class="text-2xl font-bold">
          {#if typeof apiHealth.uptime === 'number'}
            {Math.floor(apiHealth.uptime / 60)}m {Math.floor(apiHealth.uptime % 60)}s
          {:else}
            {apiHealth.uptime || 'N/A'}
          {/if}
        </p>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-2xl font-semibold mb-4">Quick Actions</h2>
      <div class="flex gap-4 flex-wrap">
        <a 
          href="/products" 
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Products
        </a>
        <a 
          href="/about" 
          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          About Us
        </a>
        <button 
          on:click={fetchDashboardData}
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  {/if}
</div>