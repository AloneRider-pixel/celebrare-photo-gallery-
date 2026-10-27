import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import useFetchPhotos from './hooks/useFetchPhotos.js';
import { filterPhotos, favouritesReducer, loadFavourites, STORAGE_KEY } from './state/favourites.js';

export default function Gallery() {
  const { photos, loading, error } = useFetchPhotos();
  const [query, setQuery] = useState('');
  const [favourites, dispatch] = useReducer(favouritesReducer, undefined, loadFavourites);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [favourites]);

  const handleSearch = useCallback((event) => setQuery(event.target.value), []);
  const filteredPhotos = useMemo(() => filterPhotos(photos, query), [photos, query]);

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-5 py-10 text-stone-900 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-9">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">A collection of perspectives</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Photo Gallery</h1>
          <p className="mt-3 text-base text-stone-600">Find a photographer. Save a favourite.</p>
          <label htmlFor="author-search" className="mt-8 block text-sm font-medium">Search by author</label>
          <input id="author-search" type="search" value={query} onChange={handleSearch}
            placeholder="Try an author's name" autoComplete="off"
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none placeholder:text-stone-400 focus:border-stone-800 focus:ring-2 focus:ring-stone-800/15 sm:max-w-md" />
        </header>

        {storageError && <p role="alert" className="mb-5 text-sm text-amber-900">Favourites work for now, but this browser cannot save them after refresh.</p>}
        {loading && <div role="status" className="flex items-center gap-3 py-16 text-stone-600">
          <span aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800 motion-reduce:animate-none" />Loading photos...
        </div>}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">{error} Please refresh to try again.</p>}
        {!loading && !error && <>
          <p role="status" className="mb-4 text-sm text-stone-500">{filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}</p>
          {filteredPhotos.length === 0 && <p className="py-12 text-stone-600">No photos match that author. Try another name.</p>}
          <div data-testid="photo-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPhotos.map((photo) => {
              const favourite = favourites.includes(photo.id);
              return <article key={photo.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <img src={photo.download_url} alt={`Photograph by ${photo.author}`} loading="lazy" className="aspect-[4/3] w-full bg-stone-200 object-cover" />
                <div className="flex min-h-18 items-center justify-between gap-3 p-4">
                  <h2 className="text-sm font-medium">{photo.author}</h2>
                  <button type="button" aria-label={`${favourite ? 'Remove' : 'Add'} favourite: ${photo.author}`}
                    aria-pressed={favourite} onClick={() => dispatch({ type: 'toggle', id: photo.id })}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 text-xl text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill={favourite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                    </svg>
                  </button>
                </div>
              </article>;
            })}
          </div>
        </>}
      </div>
    </main>
  );
}
