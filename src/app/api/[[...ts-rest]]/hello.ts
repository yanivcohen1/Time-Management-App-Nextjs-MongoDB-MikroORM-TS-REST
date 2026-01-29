import { tsr } from '@ts-rest/serverless/fetch';
import { c } from '@/lib/init-ts-rest';
import { z } from 'zod';

// --- Get Hello ---
const getHello = {
  contract: {
    method: 'GET',
    path: '/hello',
    responses: {
      200: z.object({ message: z.string() }),
    },
    summary: 'Hello world endpoint',
  } as const,
  handler: async () => ({ status: 200 as const, body: { message: 'Hello World' } }),
};

export const helloContract = c.router({
  getHello: getHello.contract,
});

export const getHelloRouter = () => tsr.router(helloContract, {
  getHello: getHello.handler,
});
