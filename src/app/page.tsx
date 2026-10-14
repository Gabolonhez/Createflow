import React from 'react';
import Dashboard from './Dashboard';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const connected = Boolean(resolvedParams.connected);
  const error = resolvedParams.error as string | undefined;

  // Os dados protegidos são carregados no Dashboard estritamente após a autenticação do usuário
  return (
    <Dashboard
      connectedParam={connected}
      errorParam={error}
    />
  );
}
