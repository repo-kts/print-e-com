// Type definitions for Cloudflare Workers runtime modules
declare module 'cloudflare:node' {
  import type { Express } from 'express';

  export function httpServerHandler(app: Express): (request: Request) => Promise<Response>;
}

