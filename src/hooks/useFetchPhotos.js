import { useEffect, useState } from 'react';

export default function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPhotos() {
      try {
        const response = await fetch('https://picsum.photos/v2/list?limit=30', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('The photo service is unavailable.');
        const data = await response.json();
        if (!Array.isArray(data) || data.some((photo) =>
          typeof photo.id !== 'string' || typeof photo.author !== 'string' ||
          typeof photo.download_url !== 'string'
        )) throw new Error('The photo service returned unexpected data.');
        if (!controller.signal.aborted) setPhotos(data);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message || 'Could not load photos.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchPhotos();
    return () => controller.abort();
  }, []);

  return { photos, loading, error };
}
