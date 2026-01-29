import { generateOpenApi } from '@ts-rest/open-api';
import { contract } from '@/lib/contract';
import { NextResponse } from 'next/server';

export async function GET() {
  const openApiDocument = generateOpenApi(contract, {
    info: {
      title: 'Todo App API',
      version: '1.0.0',
    },
  });

  return NextResponse.json(openApiDocument);
}
