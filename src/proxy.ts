import { NextRequest, NextResponse } from 'next/server';

// Proxy padrão em conformidade com as regras do Next 16 do projeto
export async function proxy(request: NextRequest) {
  return NextResponse.next();
}
