import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index.js';

// Vercel serverless function handler
// This wraps the Express app to work with Vercel's serverless functions
export default function handler(req: VercelRequest, res: VercelResponse) {
    // The Express app can handle Vercel's request/response directly
    // @vercel/node automatically converts them to Express-compatible format
    return app(req as any, res as any);
}
