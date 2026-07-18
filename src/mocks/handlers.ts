import { http, HttpResponse } from 'msw';

import { createMockStatus } from '@testing/factories/status.factory';

export const handlers = [
  http.get('/api/status', () => {
    return HttpResponse.json(createMockStatus());
  }),
];
