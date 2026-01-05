// Netlify serverless function handler
import 'dotenv/config';
import serverless from 'serverless-http';
import app from '../../src/index.js';

// Wrap Express app with serverless-http for Netlify Functions
export const handler = serverless(app);

