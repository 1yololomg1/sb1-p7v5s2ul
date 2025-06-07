import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { processCurve } from '../../../src/utils/algorithms.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Validation-Token',
};

const RATE_LIMIT = 100; // requests per minute
const rateLimitMap = new Map<string, number[]>();

const isRateLimited = (clientId: string): boolean => {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientId) || [];
  
  // Remove timestamps older than 1 minute
  const recentTimestamps = timestamps.filter(ts => now - ts < 60000);
  rateLimitMap.set(clientId, recentTimestamps);
  
  return recentTimestamps.length >= RATE_LIMIT;
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = req.headers.get('Authorization') || 'anonymous';
    
    // Check rate limit
    if (isRateLimited(clientId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Validate request
    const validationToken = req.headers.get('X-Validation-Token');
    if (!validationToken) {
      throw new Error('Invalid request');
    }

    const { data, algorithms, timestamp, checksum } = await req.json();
    
    // Validate data integrity
    const expectedChecksum = btoa(data.reduce((acc: number, val: number) => acc + val, 0).toString());
    if (checksum !== expectedChecksum) {
      throw new Error('Data integrity check failed');
    }
    
    // Validate timestamp (prevent replay attacks)
    const requestTime = parseInt(atob(validationToken));
    if (Date.now() - requestTime > 300000) { // 5 minutes
      throw new Error('Request expired');
    }

    // Process the data
    const processedData = processCurve(data, algorithms);

    // Generate validation hash
    const validationHash = btoa(processedData.reduce((acc: number, val: number) => acc + val, 0).toString());

    // Update rate limit
    const timestamps = rateLimitMap.get(clientId) || [];
    timestamps.push(Date.now());
    rateLimitMap.set(clientId, timestamps);

    return new Response(
      JSON.stringify({ processedData, validationHash }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});