const parseUserAgent = require('../../utils/parseUserAgent');

describe('parseUserAgent', () => {
  it('returns defaults for missing user agent', () => {
    expect(parseUserAgent()).toEqual({
      device: 'unknown',
      browser: 'Other',
      os: 'Other'
    });
  });

  it('normalizes common desktop browser/OS', () => {
    const data = parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
    );

    expect(data.device).toBe('mobile');
    expect(data.browser).toBe('Safari');
    expect(data.os).toBe('iOS');
  });
});
