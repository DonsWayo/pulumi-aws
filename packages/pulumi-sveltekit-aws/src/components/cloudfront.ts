import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export interface CreateCloudFrontDistributionArgs {
  name: string;
  serverFunctionUrl: pulumi.Output<string>;
  bucketRegionalDomainName: pulumi.Output<string>;
  bucketId: pulumi.Output<string>;
  domain?: {
    name: string;
    certificateArn?: pulumi.Input<string>;
  };
  priceClass?: string;
  tags?: Record<string, string>;
}

export function createCloudFrontDistribution(
  args: CreateCloudFrontDistributionArgs,
  opts?: pulumi.ComponentResourceOptions
) {
  const {
    name,
    serverFunctionUrl,
    bucketRegionalDomainName,
    bucketId,
    domain,
    priceClass = "PriceClass_100",
    tags = {},
  } = args;
  
  // Create Origin Access Identity for S3
  const oai = new aws.cloudfront.OriginAccessIdentity(
    `${name}-oai`,
    {
      comment: `OAI for ${name} SvelteKit app`,
    },
    opts
  );
  
  // Create bucket policy for CloudFront access
  const bucketPolicy = new aws.s3.BucketPolicy(
    `${name}-assets-policy`,
    {
      bucket: bucketId,
      policy: pulumi.all([bucketId, oai.iamArn]).apply(([bucket, oaiArn]) =>
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                AWS: oaiArn,
              },
              Action: "s3:GetObject",
              Resource: `arn:aws:s3:::${bucket}/*`,
            },
          ],
        })
      ),
    },
    opts
  );
  
  // Create cache behaviors
  const staticCacheBehavior = {
    targetOriginId: "s3-origin",
    viewerProtocolPolicy: "redirect-to-https",
    allowedMethods: ["GET", "HEAD", "OPTIONS"],
    cachedMethods: ["GET", "HEAD", "OPTIONS"],
    compress: true,
    defaultTtl: 86400,
    maxTtl: 31536000,
    minTtl: 0,
    forwardedValues: {
      queryString: false,
      cookies: {
        forward: "none",
      },
    },
  };
  
  const distribution = new aws.cloudfront.Distribution(
    `${name}-distribution`,
    {
      enabled: true,
      isIpv6Enabled: true,
      comment: `CloudFront distribution for ${name} SvelteKit app`,
      priceClass,
      
      origins: [
        {
          // S3 origin for static assets
          originId: "s3-origin",
          domainName: bucketRegionalDomainName,
          s3OriginConfig: {
            originAccessIdentity: oai.cloudfrontAccessIdentityPath,
          },
        },
        {
          // Lambda function URL origin for dynamic content
          originId: "server-origin",
          domainName: serverFunctionUrl.apply(url => new URL(url).hostname),
          originPath: "",
          customHeaders: [
            {
              name: "x-forwarded-host",
              value: serverFunctionUrl.apply(url => new URL(url).hostname),
            },
          ],
          customOriginConfig: {
            httpPort: 80,
            httpsPort: 443,
            originProtocolPolicy: "https-only",
            originSslProtocols: ["TLSv1.2"],
            originReadTimeout: 30,
            originKeepaliveTimeout: 5,
          },
        },
      ],
      
      defaultRootObject: "",
      
      defaultCacheBehavior: {
        targetOriginId: "server-origin",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
        cachedMethods: ["GET", "HEAD"],
        compress: true,
        defaultTtl: 0,
        maxTtl: 86400,
        minTtl: 0,
        forwardedValues: {
          queryString: true,
          headers: ["*"],
          cookies: {
            forward: "all",
          },
        },
      },
      
      orderedCacheBehaviors: [
        {
          pathPattern: "_app/*",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.js",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.css",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.ico",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.svg",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.png",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.jpg",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.jpeg",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.webp",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.woff",
          ...staticCacheBehavior,
        },
        {
          pathPattern: "*.woff2",
          ...staticCacheBehavior,
        },
      ],
      
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      
      viewerCertificate: domain
        ? {
            acmCertificateArn: domain.certificateArn,
            sslSupportMethod: "sni-only",
            minimumProtocolVersion: "TLSv1.2_2021",
          }
        : {
            cloudfrontDefaultCertificate: true,
          },
      
      aliases: domain ? [domain.name] : [],
      
      tags: {
        ...tags,
        Name: `${name}-distribution`,
      },
    },
    { dependsOn: [bucketPolicy], ...opts }
  );
  
  return {
    distribution,
    distributionId: distribution.id,
    distributionDomainName: distribution.domainName,
    url: pulumi.interpolate`https://${distribution.domainName}`,
  };
}