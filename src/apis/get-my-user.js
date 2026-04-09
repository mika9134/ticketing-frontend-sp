// src/lib/api.js
import { currentUser } from '../stores/currentUser';
import { getHost, host } from '../apis/config.js'
import { getAccessToken } from '../stores/tokenStore';
import { token_refresh } from "../apis/api-utils.js";



export async function fetchCurrentUser() {
  const token = getAccessToken()

  if (!token) return;

  try {
    let api_address = host;
    const response = await fetch(`${api_address}account/get-my-user/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.status == 401) {
            if (await token_refresh())
            {
              return fetchCurrentUser();
            }
        }

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();

    currentUser.set(data); // update the store
  } catch (error) {
    console.error('Error fetching current user:', error);
    currentUser.set(null);
  }
}
