import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { join } from "path";

export interface CreateServerFunctionArgs {
  name: string;
  serverPath: string;
  roleArn: pulumi.Output<string>;
  environment?: pulumi.Input<Record<string, pulumi.Input<string>>>;
  memory?: number;
  timeout?: number;
  architecture?: 'x86_64' | 'arm64';
  tags?: Record<string, string>;
}

function createLambdaPackage(serverPath: string): pulumi.asset.AssetArchive {
  // Create AssetArchive with the SvelteKit server bundle and package.json for ES modules
  return new pulumi.asset.AssetArchive({
    "index.js": new pulumi.asset.FileAsset(join(serverPath, 'index.js')),
    "package.json": new pulumi.asset.StringAsset(JSON.stringify({
      "type": "module"
    }))
  });
}

export function createServerFunction(
  args: CreateServerFunctionArgs,
  opts?: pulumi.ComponentResourceOptions
) {
  const {
    name,
    serverPath,
    roleArn,
    environment = {},
    memory = 512,
    timeout = 30,
    architecture = 'arm64',
    tags = {},
  } = args;
  
  const lambdaPackage = createLambdaPackage(serverPath);
  
  const lambda = new aws.lambda.Function(
    `${name}-server`,
    {
      runtime: "nodejs20.x",
      handler: "index.handler",
      role: roleArn,
      memorySize: memory,
      timeout,
      architectures: [architecture],
      code: lambdaPackage,
      environment: {
        variables: environment,
      },
      tags: {
        ...tags,
        Name: `${name}-server`,
      },
    },
    opts
  );
  
  const functionUrl = new aws.lambda.FunctionUrl(
    `${name}-server-url`,
    {
      functionName: lambda.name,
      authorizationType: "NONE",
      cors: {
        allowCredentials: true,
        allowOrigins: ["*"],
        allowMethods: ["*"],
        allowHeaders: ["*"],
        maxAge: 86400,
      },
    },
    opts
  );
  
  return {
    function: lambda,
    functionUrl,
    functionArn: lambda.arn,
  };
}