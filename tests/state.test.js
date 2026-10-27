import test from 'node:test';
import assert from 'node:assert/strict';
import { favouritesReducer, filterPhotos, loadFavourites, STORAGE_KEY } from '../src/state/favourites.js';

test('adds a favourite without changing existing state', () => {
  const state = ['1'];
  assert.deepEqual(favouritesReducer(state, { type: 'toggle', id: '2' }), ['1', '2']);
  assert.deepEqual(state, ['1']);
});
test('removes an existing favourite', () => assert.deepEqual(favouritesReducer(['1', '2'], { type: 'toggle', id: '1' }), ['2']));
test('ignores unknown actions', () => {
  const state = ['1'];
  assert.equal(favouritesReducer(state, { type: 'other', id: '1' }), state);
});
const photos = [{ id: '1', author: 'Alice Smith' }, { id: '2', author: 'Bob Jones' }];
test('filters author case-insensitively', () => assert.deepEqual(filterPhotos(photos, 'ALICE'), [photos[0]]));
test('trims the query', () => assert.deepEqual(filterPhotos(photos, '  bob '), [photos[1]]));
test('empty search returns all photos', () => assert.deepEqual(filterPhotos(photos, ''), photos));
test('unmatched search returns no photos', () => assert.deepEqual(filterPhotos(photos, 'xyz'), []));
test('loads and sanitizes saved IDs', () => {
  global.localStorage = { getItem(key) { assert.equal(key, STORAGE_KEY); return '["1","1",3,"2"]'; } };
  assert.deepEqual(loadFavourites(), ['1', '2']);
});
test('handles malformed JSON', () => {
  global.localStorage = { getItem() { return '{bad'; } };
  assert.deepEqual(loadFavourites(), []);
});
test('handles unavailable storage', () => {
  global.localStorage = { getItem() { throw new Error('blocked'); } };
  assert.deepEqual(loadFavourites(), []);
});
test('handles saved non-array data', () => {
  global.localStorage = { getItem() { return '{}'; } };
  assert.deepEqual(loadFavourites(), []);
});
