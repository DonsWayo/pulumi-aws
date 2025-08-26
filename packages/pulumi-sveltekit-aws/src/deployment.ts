import * as pulumi from "@pulumi/pulumi";
import * as path from "path";
import { existsSync } from "fs";
import type { SvelteKitAwsDeploymentArgs } from "./types/index.js";
import { createS3Bucket, uploadStaticAssets } from "./components/s3.js";
import { createServerRole } from "./components/iam.js";
import { createServerFunction } from "./components/lambda.js";
import { createCloudFrontDistribution } from "./components/cloudfront.js";

export class SvelteKitAwsDeployment extends pulumi.ComponentResource {
  public readonly url: pulumi.Output<string>;
  public readonly distributionId: pulumi.Output<string>;
  public readonly bucketName: pulumi.Output<string>;
  
  constructor(
    name: string,
    args: SvelteKitAwsDeploymentArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("pulumi-sveltekit-aws:index:SvelteKitAwsDeployment", name, {}, opts);
    
    const defaultOptions = { parent: this };
    
    const {
      buildPath,
      environment = {},
      domain,
      lambda = {},
      priceClass = "PriceClass_100",
      tags = {},
    } = args;
    
    const serverPath = path.join(buildPath, "server");
    const staticPath = path.join(buildPath, "static");
    const prerenderedPath = path.join(buildPath, "prerendered");
    
    if (!existsSync(serverPath)) {
      throw new Error(`Server build not found at ${serverPath}. Did you run the SvelteKit adapter?`);
    }
    
    const s3 = createS3Bucket({ name, tags }, defaultOptions);
    
    uploadStaticAssets({
      name,
      bucket: s3.bucket,
      staticPath,
      prerenderedPath,
      tags,
    }, defaultOptions);
    
    const serverRole = createServerRole({
      name,
      bucketArn: s3.bucketArn,
      tags,
    }, defaultOptions);
    
    const serverFunction = createServerFunction({
      name,
      serverPath,
      roleArn: serverRole.roleArn,
      environment,
      memory: lambda.memory,
      timeout: lambda.timeout,
      architecture: lambda.architecture,
      tags,
    }, { ...defaultOptions, dependsOn: [serverRole.role] });
    
    const cloudfront = createCloudFrontDistribution({
      name,
      serverFunctionUrl: serverFunction.functionUrl.functionUrl,
      bucketRegionalDomainName: s3.bucketRegionalDomainName,
      bucketId: s3.bucketName,
      domain,
      priceClass,
      tags,
    }, defaultOptions);
    
    this.url = cloudfront.url;
    this.distributionId = cloudfront.distributionId;
    this.bucketName = s3.bucketName;
    
    this.registerOutputs({
      url: this.url,
      distributionId: this.distributionId,
      bucketName: this.bucketName,
    });
  }
}