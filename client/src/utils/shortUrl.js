import api from '../services/api';

const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

const stripApiSuffix = (value) => value.replace(/\/api\/?$/i, '');

export const getShortLinkBaseUrl = () => {
  const explicitPublicBase = process.env.REACT_APP_PUBLIC_BASE_URL;
  if (explicitPublicBase && explicitPublicBase.trim()) {
    return stripTrailingSlash(explicitPublicBase.trim());
  }

  const apiBase = api?.defaults?.baseURL;
  if (typeof apiBase === 'string' && apiBase.trim()) {
    const cleaned = stripTrailingSlash(apiBase.trim());
    return stripApiSuffix(cleaned);
  }

  return stripTrailingSlash(window.location.origin);
};

export const buildShortUrl = (shortCode) => {
  if (!shortCode) return '';
  return `${getShortLinkBaseUrl()}/${shortCode}`;
};
