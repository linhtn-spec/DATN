/**
 * Persists a state object to localStorage under the given key.
 *
 * @param {object} state - The state to serialize and save.
 * @param {string} key - The localStorage key to save under.
 * @returns {object} The same state object (for use inside reducers).
 */
export const updateLocalStorage = (state, key) => {
    localStorage.setItem(key, JSON.stringify(state));
    return state;
};
