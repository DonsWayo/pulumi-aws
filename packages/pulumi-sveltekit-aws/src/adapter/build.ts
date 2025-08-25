import { fileURLToPath } from 'url';
import { join } from 'path';
import { mkdirSync, writeFileSync, cpSync, rmSync } from 'fs';
import { readFile } from 'fs/promises';
import { execSync } from 'child_process';
import type { BuildOptions } from '../types/index.js';

export async function build({
  builder,
  out = '.svelte-kit-aws',
  precompress = false,
  envPrefix = '',
}: BuildOptions) {
  const tmp = builder.getBuildDirectory('adapter-sveltekit-aws');
  const serverDir = join(out, 'server');
  const staticDir = join(out, 'static');
  const prerenderedDir = join(out, 'prerendered');

  rmSync(out, { recursive: true, force: true });

  mkdirSync(serverDir, { recursive: true });
  mkdirSync(staticDir, { recursive: true });
  mkdirSync(prerenderedDir, { recursive: true });
  mkdirSync(tmp, { recursive: true });

  builder.writeClient(staticDir);
  builder.writePrerendered(prerenderedDir);

  const handlerPath = fileURLToPath(new URL('../templates/handler.js', import.meta.url));
  const handlerContent = await readFile(handlerPath, 'utf-8');
  
  // Generate handler with imports - use relative path to index.js
  const handler = handlerContent
    .replace('__ENV_PREFIX__', envPrefix);

  writeFileSync(join(tmp, 'handler.js'), handler);

  builder.writeServer(tmp);

  writeFileSync(
    join(tmp, 'manifest.js'),
    `export const manifest = ${builder.generateManifest({ relativePath: '.' })};`
  );

  // Create package.json with runtime dependencies in tmp first
  // SvelteKit server needs @sveltejs/kit at runtime for serverless environments
  const serverPackageJson = {
    type: 'module',
    dependencies: {
      '@sveltejs/kit': '^2.22.0'
    }
  };
  
  writeFileSync(
    join(tmp, 'package.json'),
    JSON.stringify(serverPackageJson, null, 2)
  );

  // Copy all files from tmp to serverDir
  cpSync(tmp, serverDir, { recursive: true });

  console.log('Created package.json with runtime dependencies');
  
  // Install production dependencies for Lambda runtime
  console.log('Installing production dependencies for Lambda runtime...');
  try {
    execSync('npm install --production --no-fund --no-audit', {
      cwd: serverDir,
      stdio: 'inherit'
    });
    console.log('Production dependencies installed successfully');
  } catch (error) {
    console.error('Failed to install dependencies:', error instanceof Error ? error.message : String(error));
    throw new Error('Dependency installation failed - this is required for Lambda runtime');
  }

  const metadata = {
    version: 1,
    timestamp: new Date().toISOString(),
    builder: '@repo/pulumi-sveltekit-aws',
    routes: builder.routes.map(route => ({
      id: route.id,
      type: route.page.methods.length > 0 ? 'page' : route.api.methods.length > 0 ? 'api' : 'unknown',
      pattern: route.pattern.toString(),
      methods: route.methods,
    })),
    prerendered: builder.prerendered.paths,
  };

  writeFileSync(join(out, 'metadata.json'), JSON.stringify(metadata, null, 2));

  if (precompress) {
    builder.compress(staticDir);
    builder.compress(prerenderedDir);
  }

  console.log(`Build completed in ${out}`);
}