import type { Adapter } from '@sveltejs/kit';
import { build } from './build.js';
import type { AdapterOptions } from '../types/index.js';

export default function adapter(options: AdapterOptions = {}): Adapter {
  const {
    out = '.svelte-kit-aws',
    precompress = false,
    envPrefix = '',
    polyfill = true,
  } = options;

  return {
    name: '@repo/pulumi-sveltekit-aws',
    
    async adapt(builder) {
      await build({
        builder,
        out,
        precompress,
        envPrefix,
        polyfill,
      });
    },
  };
}