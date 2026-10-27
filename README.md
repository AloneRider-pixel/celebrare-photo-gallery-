# Celebrare photo gallery

React photo-gallery preparation for a Frontend React Internship pre-screening assignment.

## Status and authorship

This implementation was prepared with AI assistance. It was written for this brief, not copied from an internet solution. The employer allows AI tools, but requires the candidate to understand and explain every line. Review, change anything you do not understand, and run the app yourself before submitting. Do not claim this was unaided work.

The app and automated checks are prepared. This repository is not a claim of assessment submission or candidate review. The mandatory candidate video is not included. No hosting is required by the brief.

## Run

Use Node.js 22 (tested with 22.23.4) and npm.

```sh
npm ci
npm run dev
```

Open the local URL Vite prints. Internet access to Picsum is needed for photos.

```sh
npm test
npm run build
npm run preview
```

The lockfile pins installed dependencies. No API key or paid service is needed. Only React is a runtime dependency; Tailwind handles styling, with no UI component library.

## What is included

- React + Vite + Tailwind.
- 30 photos fetched once on mount from https://picsum.photos/v2/list?limit=30.
- Loading spinner, HTTP/network/data errors, and empty-search state.
- Four columns at >=1024px, two at >=640px, one below 640px.
- Photo, author, and accessible heart toggle on each card.
- Real-time, case-insensitive author search on fetched data only.
- Favourites managed with useReducer and persisted as IDs in localStorage.
- useFetchPhotos returning photos, loading, error.
- useCallback for the search handler; useMemo for the filtered list.

No routing, pagination, authentication, sorting, theme switcher, or extra gallery features.

## Source map

- src/main.jsx: React entry point and Tailwind CSS import.
- src/Gallery.jsx: UI, search, favourites persistence, and responsive grid.
- src/hooks/useFetchPhotos.js: remote request and loading/error lifecycle.
- src/state/favourites.js: pure reducer, safe storage initialization and author filter.
- tests/state.test.js: 11 Node unit tests.
- tests/browser.mjs: 15 browser checks, including a separate live API load.
- tests/fixtures/photos.json: real Picsum JSON saved during verification, used for predictable tests only. The running app fetches the actual API, never this file.

## Browser checks

Requires a local Chrome installation. The script defaults to /usr/bin/google-chrome. On another machine, set CHROME_PATH to your Chrome executable. Screenshots/results go to test-results by default (or TEST_OUTPUT_DIR). The browser suite needs network access for real images and its final unmocked fetch.

```sh
node tests/browser.mjs
```

Verified on October 27, 2026: production build; 11 unit tests; 15 browser checks; desktop/mobile screenshot inspection. Automated verification is not a substitute for the candidate understanding the code.

## Known limits

- Image URLs are the original download_url values supplied by Picsum. Photos are lazy-loaded, but source images may be large.
- When localStorage is blocked, the app warns that favourites cannot survive refresh. Favourites still toggle in the current session.
- Favourites are local to this browser and origin; there is no account or cross-device sync.
- The brief does not specify breakpoints, so conventional 640px/1024px breakpoints are used.

## Before submission

1. Read EXPLANATION.md and every source file; change anything you cannot explain.
2. Run locally and demonstrate loading, author search, toggling and refresh persistence.
3. Review this public repository and the exact source version you will discuss.
4. Record your own five-minute screen recording. Do not substitute an AI voice or a generated candidate video.
5. Put the video on Drive with view access or YouTube unlisted.
6. Use your real experience to write the hardest-part line. Do not repeat a made-up personal story.
7. Submit the repo, video and hardest-part line via the employer form yourself.

