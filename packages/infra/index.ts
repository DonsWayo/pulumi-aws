import * as pulumi from "@pulumi/pulumi";
import { Next } from "@donswayo/pulumi-nextjs-aws";
import { SvelteKitAwsDeployment } from "@donswayo/pulumi-sveltekit-aws";

const config = new pulumi.Config();
const stack = pulumi.getStack();
const environment = config.get("environment") || "development";
const isProduction = environment === "production";

const commonTags = {
  Project: "pulu-front",
  Environment: environment,
  ManagedBy: "pulumi",
  Stack: stack,
};

// Stack configurations
const stackConfigs = {
  docs: {
    appPath: "../../apps/docs",
    appName: "Pulu Docs",
    lambda: {
      server: { memory: 512, timeout: 30 },
      image: { memory: 1024, timeout: 25 },
    },
  },
  web: {
    appPath: "../../apps/web",
    appName: "Pulu Web",
    lambda: {
      server: {
        memory: 1024,
        timeout: 30,
        provisionedConcurrency: isProduction ? 2 : 0,
      },
      image: { memory: 1536, timeout: 25 },
      warmer: {
        memory: 128,
        timeout: 60,
        concurrency: 10,
        schedule: "rate(5 minutes)",
      },
    },
  },
  sveltekit: {
    appPath: "../../apps/sveltekit",
    appName: "SvelteKit App",
    buildPath: "../../apps/sveltekit/.svelte-kit-aws",
    lambda: {
      memory: 512,
      timeout: 30,
      architecture: 'arm64' as const,
    },
  },
};

if (!stackConfigs.hasOwnProperty(stack)) {
  throw new Error(`Unknown stack: ${stack}. Use 'docs', 'web' or 'sveltekit'`);
}

const stackConfig = stackConfigs[stack as keyof typeof stackConfigs];

// SvelteKit deployment
if (stack === 'sveltekit') {
  const app = new SvelteKitAwsDeployment(stack, {
    buildPath: (stackConfig as any).buildPath,
    environment: {
      NODE_ENV: "production",
      PUBLIC_APP_NAME: stackConfig.appName,
    },
    lambda: (stackConfig as any).lambda,
    priceClass: isProduction ? "PriceClass_All" : "PriceClass_100",
    tags: {
      ...commonTags,
      Application: stack,
    },
  });
  
  exports.url = app.url;
  exports.distributionId = app.distributionId;
  exports.bucketName = app.bucketName;
} else {
  // Next.js deployments
  const app = new Next(stack, {
    appPath: stackConfig.appPath,
    openNextPath: ".open-next",
    streaming: true,
    environment: {
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_NAME: stackConfig.appName,
    },
    lambda: (stackConfig as any).lambda,
    priceClass: stack === "web" && isProduction ? "PriceClass_All" : "PriceClass_100",
    tags: {
      ...commonTags,
      Application: stack,
    },
  });
  
  exports.url = app.url;
  exports.distributionId = app.distributionId;
  exports.bucketName = app.bucketName;
}