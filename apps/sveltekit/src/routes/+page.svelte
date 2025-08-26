<script lang="ts">
  import { onMount } from 'svelte';
  
  let serverData: { message: string; timestamp: string } | null = null;
  let loading = true;
  
  // Simulate async data fetching like Next.js Server Components
  async function getServerData() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { 
      message: "Hello from SvelteKit Server!", 
      timestamp: new Date().toISOString() 
    };
  }
  
  onMount(async () => {
    serverData = await getServerData();
    loading = false;
  });
</script>

<div class="container py-10 max-w-2xl mx-auto px-4">
  <h1 class="text-4xl font-bold mb-8">SvelteKit Features Demo</h1>
  
  <div class="space-y-6">
    <section>
      <h2 class="text-2xl font-semibold mb-4">Server-Side Rendering with Loading States</h2>
      {#if loading}
        <div class="animate-pulse">Loading...</div>
      {:else if serverData}
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold">Server Component</h3>
          <p class="text-sm text-gray-600">{serverData.message}</p>
          <p class="text-xs text-gray-500">Fetched at: {serverData.timestamp}</p>
        </div>
      {/if}
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Features</h2>
      <ul class="list-disc list-inside space-y-2 text-gray-600">
        <li>File-based routing with +page.svelte</li>
        <li>Server-side rendering by default</li>
        <li>Built-in loading states</li>
        <li>SEO with head management</li>
        <li>TypeScript support</li>
        <li>Tailwind CSS v4 styling</li>
      </ul>
    </section>
  </div>
</div>