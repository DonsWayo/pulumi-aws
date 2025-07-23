import { fileURLToPath } from 'url';
import { join, resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'fs';
import { readFile } from 'fs/promises';
import { build as esbuild } from 'esbuild';
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
  
  const relativePath = builder.getServerDirectory();
  
  // Generate handler with imports
  const handler = handlerContent
    .replace('__SERVER_DIR__', relativePath)
    .replace('__ENV_PREFIX__', envPrefix);

  writeFileSync(join(tmp, 'handler.js'), handler);

  builder.writeServer(tmp);

  writeFileSync(
    join(tmp, 'manifest.js'),
    `export const manifest = ${builder.generateManifest({ relativePath: '.' })};`
  );

  await esbuild({
    entryPoints: [join(tmp, 'handler.js')],
    outfile: join(serverDir, 'index.js'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    external: [],
  });

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