import { useState, useCallback, useContext, useEffect } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { buildShortUrl } from '../utils/shortUrl';

export default function useLinks() {
  const getGuestShortCodes = useCallback(() => {
    try {
      const raw = localStorage.getItem('beakon_guest_links');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((link) => link?.shortCode)
        .filter((code) => typeof code === 'string' && code.trim().length > 0);
    } catch {
      return [];
    }
  }, []);

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(AuthContext);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      if (isLoggedIn) {
        const { data } = await api.get('/api/links');
        setLinks(data.data || data);
      } else {
        // Attempt to load guest links if you want from local storage or do nothing server side
        // Guest links usually stored in session cache or tracked via fingerprint
        setLinks([]);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = useCallback(async (newLinkData) => {
    try {
      const endpoint = isLoggedIn ? '/api/links' : '/api/links/guest';
      const { data } = await api.post(endpoint, newLinkData);
      const raw = data.link || data;
      const createdLink = raw.shortUrl
        ? raw
        : {
            id: raw._id || raw.id,
            shortCode: raw.shortCode,
            shortUrl: buildShortUrl(raw.shortCode),
            destinationUrl: raw.originalUrl || raw.destinationUrl,
            title: raw.title || raw.originalUrl,
            tags: raw.tags || [],
            status: raw.isActive === false ? 'paused' : 'active',
            createdAt: raw.createdAt || new Date().toISOString().split('T')[0],
            totalClicks: raw.totalClicks || 0,
            uniqueVisitors: raw.uniqueVisitors || 0,
            ctr: raw.ctr || 0
          };
      setLinks((prev) => [createdLink, ...prev]);
      return createdLink;
    } catch (error) {
      console.error('Failed to create link', error);
      throw error;
    }
  }, [isLoggedIn]);

  const claimGuestLinks = useCallback(async () => {
    try {
      if (!isLoggedIn) return;
      const shortCodes = getGuestShortCodes();
      if (shortCodes.length === 0) return;
      await api.post('/api/links/claim', { shortCodes });
      localStorage.removeItem('beakon_guest_links');
      await fetchLinks();
    } catch (error) {
      console.error('Failed to claim guest links', error);
    }
  }, [isLoggedIn, fetchLinks, getGuestShortCodes]);

  const deleteLink = useCallback(async (id) => {
    try {
      await api.delete(`/api/links/${id}`);
      setLinks((prev) => prev.filter((link) => link._id !== id && link.id !== id));
    } catch (error) {
      console.error('Failed to delete link:', error);
      throw error;
    }
  }, []);

  const toggleStatus = useCallback(async (id) => {
    try {
      const linkToToggle = links.find(l => l._id === id || l.id === id);
      if (!linkToToggle) return;
      
      const isCurrentlyActive = linkToToggle.status === 'active';
      const nextIsActive = !isCurrentlyActive;
      await api.patch(`/api/links/${id}`, { isActive: nextIsActive });
      
      setLinks((prev) =>
        prev.map((link) =>
          (link._id === id || link.id === id)
            ? { ...link, status: nextIsActive ? 'active' : 'paused' }
            : link
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  }, [links]);

  const findByShortCode = useCallback(
    (shortCode) => links.find((l) => l.shortCode === shortCode) || null,
    [links]
  );

  return { links, loading, setLinks, addLink, deleteLink, toggleStatus, findByShortCode, fetchLinks, claimGuestLinks };
}
