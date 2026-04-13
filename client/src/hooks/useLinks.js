import { useState, useCallback } from 'react';
import mockLinks from '../data/mockLinks';

export default function useLinks() {
  const [links, setLinks] = useState(mockLinks);

  const addLink = useCallback((newLink) => {
    setLinks((prev) => [
      {
        id: String(Date.now()),
        totalClicks: 0,
        uniqueVisitors: 0,
        ctr: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        sparklineData: new Array(30).fill(0),
        ...newLink,
      },
      ...prev,
    ]);
  }, []);

  const deleteLink = useCallback((id) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }, []);

  const toggleStatus = useCallback((id) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id
          ? { ...link, status: link.status === 'active' ? 'paused' : 'active' }
          : link
      )
    );
  }, []);

  const findByShortCode = useCallback(
    (shortCode) => links.find((l) => l.shortCode === shortCode) || null,
    [links]
  );

  return { links, addLink, deleteLink, toggleStatus, findByShortCode };
}
