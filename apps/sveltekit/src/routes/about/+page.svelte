<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>About - SvelteKit</title>
  <meta name="description" content="Learn more about Pulu Web and our mission" />
</svelte:head>

<div class="container py-10">
  <div class="mx-auto max-w-[800px]">
    <h1 class="text-4xl font-bold mb-6">About Pulu Web</h1>
    
    <div class="prose prose-gray max-w-none">
      <p class="text-lg text-gray-600 mb-6">
        Pulu Web is a modern web application built with the latest web technologies,
        showcasing the power of SvelteKit and server-side rendering.
      </p>

      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Our Mission</h2>
        <p class="text-gray-600">
          We're dedicated to building fast, accessible, and user-friendly web applications
          that leverage the latest advancements in web technology. Our platform demonstrates
          best practices in modern web development.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Technology Stack</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-600">
          <li>SvelteKit with file-based routing</li>
          <li>Svelte 5 with runes</li>
          <li>TypeScript for type safety</li>
          <li>Tailwind CSS v4 for styling</li>
          <li>Pulumi for infrastructure as code</li>
          <li>AWS Lambda & CloudFront for hosting</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Features</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-2">Performance First</h3>
            <p class="text-sm text-gray-600">
              Built with performance in mind, utilizing server-side rendering,
              streaming, and edge computing.
            </p>
          </div>
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-2">SEO Optimized</h3>
            <p class="text-sm text-gray-600">
              Full SEO support with metadata management, sitemaps, and structured data.
            </p>
          </div>
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-2">Type Safe</h3>
            <p class="text-sm text-gray-600">
              End-to-end type safety with TypeScript throughout the stack.
            </p>
          </div>
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-2">Modern Architecture</h3>
            <p class="text-sm text-gray-600">
              Leveraging the latest Svelte features including runes
              and fine-grained reactivity.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Get Started</h2>
        <p class="text-gray-600">
          Ready to explore what we've built? Check out our{" "}
          <a href="/dashboard" class="text-blue-600 hover:underline">
            Dashboard
          </a>{" "}
          or browse our{" "}
          <a href="/products" class="text-blue-600 hover:underline">
            Products
          </a>.
        </p>
      </section>
    </div>
  </div>
</div>