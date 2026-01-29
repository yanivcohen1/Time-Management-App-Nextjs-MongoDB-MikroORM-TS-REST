import { initClient } from '@ts-rest/core';
import { contract } from './contract';
import api from './axios';

export const apiClient = initClient(contract, {
  baseUrl: '',
  baseHeaders: {},
  api: async ({ path, method, headers, body }) => {
    try {
      const response = await api.request({
        url: path,
        method,
        headers,
        data: body,
      });
      return {
        status: response.status,
        body: response.data,
        headers: new Headers(response.headers as unknown as Record<string, string>),
      };
    } catch (error: unknown) {
      const e = error as { response?: { status: number; data: unknown; headers: unknown }; message: string };
      return {
        status: e.response?.status || 500,
        body: e.response?.data || { message: e.message },
        headers: new Headers((e.response?.headers as Record<string, string>) || {}),
      };
    }
  },
});
