jest.mock('../../models/Link', () => ({
  findOne: jest.fn()
}));

const Link = require('../../models/Link');
const generateShortCode = require('../../utils/generateShortCode');

describe('generateShortCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a 6-char code when unique', async () => {
    Link.findOne.mockResolvedValueOnce(null);
    const code = await generateShortCode();

    expect(code).toHaveLength(6);
    expect(Link.findOne).toHaveBeenCalledTimes(1);
  });

  it('retries when collision is found', async () => {
    Link.findOne.mockResolvedValueOnce({ _id: 'existing' }).mockResolvedValueOnce(null);
    const code = await generateShortCode();

    expect(code).toHaveLength(6);
    expect(Link.findOne).toHaveBeenCalledTimes(2);
  });
});
