# @donswayo/pulumi-sveltekit-aws

A SvelteKit adapter and Pulumi library for deploying SvelteKit applications to AWS using Lambda, S3, and CloudFront.

## Features

- 🚀 Serverless deployment with AWS Lambda
- 🌍 Global CDN with CloudFront
- 📦 Static asset hosting with S3
- ⚡ Optimized for performance
- 🔧 Simple configuration
- 🏗️ Infrastructure as Code with Pulumi

## Installation

```bash
pnpm add @donswayo/pulumi-sveltekit-aws
```

## Usage

### 1. Configure the Adapter

In your `svelte.config.js`:

```javascript
import adapter from '@donswayo/pulumi-sveltekit-aws/adapter';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      out: '.svelte-kit-aws',
      precompress: false,
      polyfill: true,
    })
  }
};

export default config;
```

### 2. Build Your App

```bash
pnpm build
```

This will create a `.svelte-kit-aws` directory with:
- `server/` - Lambda function code
- `static/` - Static assets
- `prerendered/` - Prerendered pages
- `metadata.json` - Deployment metadata

### 3. Deploy with Pulumi

Create a Pulumi program:

```typescript
import * as pulumi from "@pulumi/pulumi";
import { SvelteKitAwsDeployment } from "@repo/pulumi-sveltekit-aws";

const app = new SvelteKitAwsDeployment("my-sveltekit-app", {
  buildPath: "./apps/web/.svelte-kit-aws",
  
  environment: {
    NODE_ENV: "production",
    PUBLIC_API_URL: "https://api.example.com",
  },
  
  lambda: {
    memory: 512,
    timeout: 30,
    architecture: "arm64",
  },
  
  domain: {
    name: "app.example.com",
    certificateArn: "arn:aws:acm:us-east-1:...:certificate/...",
  },
  
  priceClass: "PriceClass_100",
  
  tags: {
    Environment: "production",
    Team: "frontend",
  },
});

export const url = app.url;
export const distributionId = app.distributionId;
```

Deploy:

```bash
pulumi up
```

## Configuration

### Adapter Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `out` | `string` | `.svelte-kit-aws` | Output directory for build |
| `precompress` | `boolean` | `false` | Precompress static assets |
| `envPrefix` | `string` | `""` | Environment variable prefix filter |
| `polyfill` | `boolean` | `true` | Add Node.js polyfills |

### Deployment Options

| Option | Type | Description |
|--------|------|-------------|
| `buildPath` | `string` | Path to adapter build output |
| `environment` | `Record<string, string>` | Environment variables for Lambda |
| `domain` | `{ name, certificateArn }` | Custom domain configuration |
| `lambda` | `{ memory, timeout, architecture }` | Lambda configuration |
| `priceClass` | `string` | CloudFront price class |
| `tags` | `Record<string, string>` | AWS resource tags |

## Architecture

The deployment creates:

1. **Lambda Function** - Handles server-side rendering and API routes
2. **S3 Bucket** - Stores static assets and prerendered pages
3. **CloudFront Distribution** - Global CDN with intelligent routing
4. **IAM Roles** - Proper permissions for all services

### Request Flow

1. CloudFront receives request
2. Static assets (`_app/*`, `*.js`, `*.css`, etc.) are served from S3
3. Dynamic requests are forwarded to Lambda
4. Lambda renders the page and returns the response

## Advanced Usage

You can use individual components for custom deployments:

```typescript
import {
  createS3Bucket,
  createServerFunction,
  createCloudFrontDistribution,
} from "@repo/pulumi-sveltekit-aws";

// Custom deployment logic
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Type check
pnpm check-types
```

## License

MIT