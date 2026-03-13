const ALLOWED_ORIGINS = [
  'https://belegpilot.predivo.ch',
  'http://localhost:5173',
]

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

// Legacy static export for backwards compatibility
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://belegpilot.predivo.ch',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
