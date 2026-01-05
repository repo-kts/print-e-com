// Cloudflare Workers entry point
import { httpServerHandler } from 'cloudflare:node';
import app from './index.js';

// Export the handler for Cloudflare Workers
// The httpServerHandler wraps the Express app to work on Cloudflare Workers
export default httpServerHandler(app);

 