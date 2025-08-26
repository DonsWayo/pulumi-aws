import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export interface CreateServerRoleArgs {
  name: string;
  bucketArn: pulumi.Output<string>;
  tags?: Record<string, string>;
}

export function createServerRole(
  args: CreateServerRoleArgs,
  opts?: pulumi.ComponentResourceOptions
) {
  const { name, bucketArn, tags = {} } = args;
  
  const role = new aws.iam.Role(
    `${name}-server-role`,
    {
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "lambda.amazonaws.com",
      }),
      managedPolicyArns: [
        aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
      ],
      tags: {
        ...tags,
        Name: `${name}-server-role`,
      },
    },
    opts
  );
  
  const policy = new aws.iam.RolePolicy(
    `${name}-server-policy`,
    {
      role: role.id,
      policy: pulumi.all([bucketArn]).apply(([bucket]) =>
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "s3:GetObject",
                "s3:ListBucket",
              ],
              Resource: [
                bucket,
                `${bucket}/*`,
              ],
            },
          ],
        })
      ),
    },
    opts
  );
  
  return {
    role,
    roleArn: role.arn,
  };
}