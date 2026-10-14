import { NextRequest } from 'next/server';
import { GET as connectHandler } from '../../oauth/instagram/route';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return connectHandler(req);
}
