import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { Server } from './index.js';
import { manifest } from './manifest.js';

installPolyfills();

const server = new Server(manifest);
await server.init({ env: process.env });

const ENV_PREFIX = '__ENV_PREFIX__';

export const handler = async (event, context) => {
  const { rawPath, headers, queryStringParameters, body, isBase64Encoded, requestContext } = event;
  
  const host = headers.host || headers.Host || 'localhost';
  const scheme = headers['x-forwarded-proto'] || 'https';
  const url = new URL(`${scheme}://${host}${rawPath || '/'}`);
  
  if (queryStringParameters) {
    for (const [key, value] of Object.entries(queryStringParameters)) {
      if (value) url.searchParams.append(key, value);
    }
  }
  
  const requestHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value) requestHeaders.set(key, value);
  }
  
  // Handle both Lambda Function URL and API Gateway formats
  const method = requestContext?.http?.method || requestContext?.httpMethod || 'GET';
  
  const request = new Request(url.toString(), {
    method,
    headers: requestHeaders,
    body: body && method !== 'GET' && method !== 'HEAD'
      ? isBase64Encoded 
        ? Buffer.from(body, 'base64')
        : body
      : undefined,
  });
  
  const getClientAddress = () => {
    return headers['x-forwarded-for']?.split(',')[0].trim() || 
           requestContext?.http?.sourceIp || 
           requestContext?.identity?.sourceIp || 
           '127.0.0.1';
  };
  
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (ENV_PREFIX ? key.startsWith(ENV_PREFIX) : true) {
      env[key] = value;
    }
  }
  
  const response = await server.respond(request, {
    getClientAddress,
    platform: { env, context, event },
  });
  
  const responseHeaders = {};
  const cookies = [];
  
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      cookies.push(value);
    } else {
      responseHeaders[key] = value;
    }
  });
  
  const responseBody = await response.arrayBuffer();
  const isBase64 = !response.headers.get('content-type')?.includes('text');
  
  return {
    statusCode: response.status,
    headers: responseHeaders,
    cookies,
    body: isBase64 
      ? Buffer.from(responseBody).toString('base64')
      : new TextDecoder().decode(responseBody),
    isBase64Encoded: isBase64,
  };
};