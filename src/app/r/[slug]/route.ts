import { NextRequest, NextResponse } from 'next/server';
import { recordLinkClick } from '@/lib/db';

interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }

  const destinationUrl = await recordLinkClick(slug);

  if (!destinationUrl) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }

  return NextResponse.redirect(destinationUrl, { status: 302 });
}
