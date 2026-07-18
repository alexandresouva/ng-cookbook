export interface StatusInfo {
  status: string;
  uptime: number;
}

export function createMockStatus(overrides?: Partial<StatusInfo>): StatusInfo {
  return {
    status: 'UP',
    uptime: 12345,
    ...overrides,
  };
}
