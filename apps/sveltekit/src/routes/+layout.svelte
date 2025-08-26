<script>
  import '../app.css';
  import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-white">
  <!-- Navigation -->
  <nav class="border-b">
    <div class="container mx-auto px-4">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center gap-6">
          <a href="/" class="text-xl font-bold">
            Pulu Web
          </a>
          <div class="hidden md:flex items-center gap-4">
            <a 
              href="/" 
              class="px-3 py-2 text-sm font-medium {$page.url.pathname === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}"
            >
              Home
            </a>
            <a 
              href="/about" 
              class="px-3 py-2 text-sm font-medium {$page.url.pathname === '/about' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}"
            >
              About
            </a>
            <a 
              href="/products" 
              class="px-3 py-2 text-sm font-medium {$page.url.pathname === '/products' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}"
            >
              Products
            </a>
            <a 
              href="/dashboard" 
              class="px-3 py-2 text-sm font-medium {$page.url.pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}"
            >
              Dashboard
            </a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
            SvelteKit
          </span>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main>
    <slot />
  </main>

  <!-- Footer -->
  <footer class="border-t mt-auto">
    <div class="container mx-auto px-4 py-6">
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">
          © 2024 Pulu Web. Built with SvelteKit.
        </p>
        <div class="flex items-center gap-4">
          <a href="/api/health" class="text-sm text-gray-600 hover:text-gray-900">
            API Health
          </a>
          <a href="/api/products" class="text-sm text-gray-600 hover:text-gray-900">
            API Products
          </a>
        </div>
      </div>
    </div>
  </footer>
</div>