export const STORAGE_KEY = 'celebrare-gallery-favourites';

// Store photo IDs rather than entire API objects.
export function favouritesReducer(state, action) {
  if (action.type !== 'toggle') return state;
  return state.includes(action.id)
    ? state.filter((id) => id !== action.id)
    : [...state, action.id];
}

export function loadFavourites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved)
      ? [...new Set(saved.filter((id) => typeof id === 'string'))]
      : [];
  } catch {
    // Invalid JSON or unavailable storage should not stop the gallery.
    return [];
  }
}

export function filterPhotos(photos, query) {
  const search = query.trim().toLowerCase();
  return photos.filter((photo) => photo.author.toLowerCase().includes(search));
}
