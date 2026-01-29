/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchRequestHandler, tsr } from '@ts-rest/serverless/fetch';
import { contract } from '@/lib/contract';
import { getORM, handleError } from '@/lib/db';
import { RequestContext } from '@mikro-orm/core';
import { getAuthRouter } from './auth';
import { getTodosRouter } from './todos';
import { getUsersRouter } from './users';
import { getHelloRouter } from './hello';

const implementation = tsr.router(contract, {
  auth: getAuthRouter(),
  todos: getTodosRouter(),
  users: getUsersRouter(),
  hello: getHelloRouter(),
});

const handler = handleError(async (request: Request, { params }: { params: Promise<any> }) => {
  await params;
  const orm = await getORM();

  // Create a clean Request object to avoid "Cannot read private member #state"
  // which happens when libraries try to access private fields on Next.js Request proxies.
  // We use arrayBuffer to safely clone the body if it exists.
  let body: any = null;
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > 0) {
      body = buffer;
    }
  }

  const req = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: body,
  });

  return await RequestContext.createAsync(orm.em, async () => {
    // Strictly follow instruction to fork at the start of every request
    orm.em.fork();

    return fetchRequestHandler({
      request: req,
      contract,
      router: implementation,
      options: {
        basePath: '/api',
      },
    });
  });
});

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
