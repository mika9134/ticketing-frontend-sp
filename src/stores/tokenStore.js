// stores/tokenStore.js
// @ts-nocheck
import { get, writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';

const createWritableStore = (key, startValue) => {
  const { subscribe, set } = writable(startValue);

   isBrowser &&
      window.localStorage.storable &&
      set(JSON.parse(window.localStorage.storable));

  
    return {
      subscribe,
      set: n => {
         isBrowser && (window.localStorage.storable = JSON.stringify(n));
         set(n);
      },
      update: cb => {
         const updatedStore = cb(get(store));

         isBrowser && (window.localStorage.storable = JSON.stringify(updatedStore));
         set(updatedStore);
      }
   };
}


export const tokens = createWritableStore("bstokens", {
  accessToken: null,
  refreshToken: null,
});


export function getAccessToken() {
  return get(tokens).accessToken;
}

export function getRefreshToken() {
  return get(tokens).refreshToken;
}
/**
 * Method to update the tokens in the store
 * @param {string} accessToken - The access token
 * @param {string} refreshToken - The refresh token
 * 
 */
export function setTokens(access, refresh) {


    // Log whether the access token is found or not
    if (get(tokens).accessToken) {
      console.log('Access token is found.');
     // tokens.update({accessToken: access, refreshToken: refresh});
     tokens.set({accessToken: access, refreshToken: refresh});
    } else {
      console.log('Access token is not found.');
      tokens.set({accessToken: access, refreshToken: refresh});
    }

}

export function logout() {
  console.log('Logging out...');
  tokens.set({
    accessToken: null,
    refreshToken: null,
  });

  if (isBrowser) {
    localStorage.removeItem('storable'); // Clear the token from localStorage
  }
}
