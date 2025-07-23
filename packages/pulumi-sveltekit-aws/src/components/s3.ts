import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { lookup } from "mime-types";

export interface CreateS3BucketArgs {
  name: string;
  tags?: Record<string, string>;
}

export function createS3Bucket(
  args: CreateS3BucketArgs,
  opts?: pulumi.ComponentResourceOptions
) {
  const { name, tags = {} } = args;
  
  const bucket = new aws.s3.BucketV2(`${name}-assets`, {
    tags: {
      ...tags,
      Name: `${name}-assets`,
    },
  }, opts);
  
  const bucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock(
    `${name}-assets-pab`,
    {
      bucket: bucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    },
    opts
  );
  
  const bucketVersioning = new aws.s3.BucketVersioningV2(
    `${name}-assets-versioning`,
    {
      bucket: bucket.id,
      versioningConfiguration: {
        status: "Enabled",
      },
    },
    opts
  );
  
  const bucketEncryption = new aws.s3.BucketServerSideEncryptionConfigurationV2(
    `${name}-assets-encryption`,
    {
      bucket: bucket.id,
      rules: [{
        applyServerSideEncryptionByDefault: {
          sseAlgorithm: "AES256",
        },
      }],
    },
    opts
  );
  
  return {
    bucket,
    bucketName: bucket.id,
    bucketArn: bucket.arn,
    bucketRegionalDomainName: bucket.bucketRegionalDomainName,
  };
}

export interface UploadStaticAssetsArgs {
  name: string;
  bucket: aws.s3.BucketV2;
  staticPath: string;
  prerenderedPath: string;
  tags?: Record<string, string>;
}

export function uploadStaticAssets(
  args: UploadStaticAssetsArgs,
  opts?: pulumi.ComponentResourceOptions
) {
  const { name, bucket, staticPath, prerenderedPath, tags = {} } = args;
  const uploadedFiles: aws.s3.BucketObject[] = [];
  
  const uploadDirectory = (dir: string, prefix: string = "") => {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        uploadDirectory(filePath, join(prefix, file));
      } else {
        const key = join(prefix, file);
        const contentType = lookup(extname(file)) || "application/octet-stream";
        
        const bucketObject = new aws.s3.BucketObject(
          `${name}-static-${key.replace(/[^a-zA-Z0-9]/g, "-")}`,
          {
            bucket: bucket.id,
            key: `_app/${key}`,
            source: new pulumi.asset.FileAsset(filePath),
            contentType,
            etag: readFileSync(filePath, 'utf-8').length.toString(),
            tags,
          },
          opts
        );
        
        uploadedFiles.push(bucketObject);
      }
    }
  };
  
  uploadDirectory(staticPath);
  
  if (readdirSync(prerenderedPath).length > 0) {
    uploadDirectory(prerenderedPath, "");
  }
  
  return { uploadedFiles };
}