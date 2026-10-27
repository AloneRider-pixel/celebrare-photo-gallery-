# Understand it before recording

These are study notes, not a script claiming what you personally wrote or found difficult. The employer expects your own explanation. If you cannot explain a line, simplify or remove it before submission.

## Five-minute recording plan

- 0:00-1:10: Run the app. Show photos loading, type an author name, clear it, toggle a heart, and refresh to show it stays selected. Show the 4/2/1 layouts using browser resizing.
- 1:10-2:15: Open useFetchPhotos.js. Explain the request, returned state, failure message, and cleanup.
- 2:15-3:10: Open favourites.js and the useReducer/effect lines in Gallery.jsx. Explain the toggle action and persistence.
- 3:10-4:10: Explain useCallback and useMemo truthfully, including what happens without them.
- 4:10-5:00: Explain one difficulty you actually encountered while reviewing or modifying this work, and demonstrate your fix. Mention AI assistance accurately if asked.

## src/main.jsx and setup

createRoot mounts Gallery into the root element in index.html. The CSS import includes Tailwind utilities. The Vite config adds Tailwind's Vite plugin. This project uses standard React elements and an inline SVG heart, not a component library.

## useFetchPhotos.js

- photos starts as an empty array, loading starts true, error starts null.
- useEffect with [] starts the fetch when the hook mounts. Search changes do not run this effect.
- AbortController gives fetch a cancellation signal.
- fetch requests exactly the required endpoint. response.ok checks HTTP success: fetch does not reject automatically for a 500 response.
- response.json parses JSON. The array and field checks prevent malformed data from crashing author filtering.
- Successful data updates photos only if the effect has not been cancelled.
- catch sets an error message for network, HTTP, parsing or validation failures. It does not show an error for cleanup cancellation.
- finally finishes loading, unless the effect was cancelled.
- Cleanup calls abort to stop work when the component unmounts. This also avoids updating old component state after unmount.
- The hook returns an object containing photos, loading, error. Gallery does not fetch directly.

## favourites.js

STORAGE_KEY is the localStorage key. Favourites contain string photo IDs, not duplicate full photo objects.

favouritesReducer takes current state and an action. It handles one action, toggle. If the ID exists it returns a new array without that ID; otherwise it returns a new array with the ID. Unknown actions return the same state. It does not mutate the old array and does not perform storage side effects.

loadFavourites is the initializer. It parses saved JSON; missing data defaults to an empty array. It rejects non-array values, filters out non-string IDs and removes duplicate IDs with Set. It catches invalid JSON or denied storage access and returns an empty array.

filterPhotos trims and lowercases the query, then compares it to each lowercased author name. An empty string is contained in every author's name, so clearing search shows all photos.

## Gallery.jsx

useReducer is initialized lazily with loadFavourites so stored state is read during initialization, before the persistence effect can overwrite it. The effect writes JSON when favourites changes; a failed write gives a visible warning instead of crashing.

query is useState because it is a simple text value. Favourites use useReducer because the brief requires it and it separates the toggle transition from UI/persistence. For this small toggle, useState could also work technically; it would not meet this assignment's rule.

handleSearch uses useCallback with [] because the setter is stable and the handler uses no changing captured values. It gives the handler a stable function identity across renders. There is no memoized child here, so this is a modest benefit, not a major performance improvement.

filteredPhotos uses useMemo with [photos, query] so unrelated favourite changes do not repeat the author filter. For only 30 photos, filtering is already cheap. Removing useCallback or useMemo would not break correctness here; it would remove their caching benefit and fail the brief's explicit hook requirements. Do not claim they are necessary to avoid a crash.

Conditional rendering shows loading/error states before the photo grid. The grid uses grid-cols-1 sm:grid-cols-2 lg:grid-cols-4. Stable photo IDs are React keys. Each button dispatches a toggle with that photo's ID. aria-pressed describes the toggle state, and aria-label names the action and author. The image alt text identifies its author because the API has no description of the image subject. Native loading="lazy" delays below-the-fold images.

## Questions to answer yourself

- Why must response.ok be checked?
- Why is localStorage outside the reducer?
- Why use a lazy initializer rather than load storage in a later effect?
- Why does searching make no new API request?
- Why return a new favourites array rather than mutate the old one?
- What is actually cached by each performance hook?
- What happens if storage access is disabled?
- What did YOU find difficult while checking or modifying this implementation?

Do not invent a hardest-part experience. One technical area worth investigating is safe persistence initialization: understand why saving an empty default before reading storage can erase saved favourites. Only describe it as your hardest part if that honestly matches your experience.
