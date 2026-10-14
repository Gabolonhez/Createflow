import { NextRequest } from 'next/server';
import { GET as callbackHandler } from '../../oauth/callback/route';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return callbackHandler(req);
}
