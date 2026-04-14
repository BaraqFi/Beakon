const hashIP = require('../../utils/hashIP');

describe('hashIP', () => {
  it('returns fallback hash for missing ip', () => {
    expect(hashIP()).toBe('unknown_ip_hash');
  });

  it('returns deterministic hash for same input', () => {
    const one = hashIP('127.0.0.1');
    const two = hashIP('127.0.0.1');
    expect(one).toEqual(two);
    expect(one).toMatch(/^[a-f0-9]{64}$/);
  });
});
