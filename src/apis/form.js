import { isLoading, errorMessage } from '../stores/uiStores.js';
import { host, host_super,token } from './config.js';
import { setTokens, getRefreshToken, getAccessToken } from "../stores/tokenStore.js";
import { goto } from '$app/navigation';
import { token_refresh } from "../apis/api-utils.js";



export async function fetchForm(get_form_endpoint, token = null) {
    try {
        isLoading.set(true); // Start loading
        errorMessage.set(null); // Clear previous errors
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Encoding': 'gzip',
        };
        const response = await fetch(get_form_endpoint, {
            method: 'GET',
            headers
        });
        if (response.status == 401) {
            if (await token_refresh())
            {
              return fetchForm(get_form_endpoint, getAccessToken());
            }
        }
        if (!response.ok) {
            const errorDetails = await response.json();
            errorMessage.set(errorDetails.detail || `Error fetching form: ${response.statusText}`);
            return errorDetails;
        }
        const formData = await response.json();
        return formData;
    } catch (error) {
        return {"error": error}
    } finally {
        isLoading.set(false); //stop loading
    }

}

export async function addForm(create_entry_url, data, token=null) {
    try {
        isLoading.set(true); // Start loading
        errorMessage.set(null); // Clear previous errors
        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Content-Encoding': 'gzip',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(create_entry_url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        
        if (response.status == 401) {
                if (await token_refresh())
                {
                      return addForm(create_entry_url, data, getAccessToken());
                }
            }

        if (!response.ok) {
            const errorDetails = await response.json(); // Get error details from the server
            console.error('Server response:', errorDetails);
            return errorDetails
        }
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return {"succeed": false, "error": error, "data": null}
    } finally {
        isLoading.set(false);
    }
}

export async function updateForm(update_entry_url, data, token) {
    try {
        isLoading.set(true); // Start loading
        errorMessage.set(null); // Clear previous errors
        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Content-Encoding': 'gzip',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(update_entry_url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        if (response.status == 401) {
            if (await token_refresh())
            {
                     return updateForm(update_entry_url, data, getAccessToken());
            }
        }
        if (!response.ok) {
            const errorDetails = await response.json(); // Get error details from the server
            console.error('Server response:', errorDetails);
            return errorDetails
        }
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return {"error": error}
    } finally {
        isLoading.set(false);
    }
}

export async function deleteItem(delete_entry_url, token, data={}) {
    try {
        isLoading.set(true); // Start loading
        errorMessage.set(null); // Clear previous errors
        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Content-Encoding': 'gzip',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(delete_entry_url, {
            method: 'DELETE',
            headers,
            body: JSON.stringify(data)
        });
        
        if (response.status == 401) {
                if (await token_refresh())
                {
                       return deleteItem(delete_entry_url, getAccessToken(), data);
                }
            }

        if (!response.ok) {
            const errorDetails = await response.json(); // Get error details from the server
            console.error('Server response:', errorDetails);
            return errorDetails
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error in deleteItem:', error);
        throw error;
    } finally {
        isLoading.set(false);
    }
}

export async function signUp(formData) {
    // const apiUrl = `${api_address}auth/register-superadmin`;
    try {
        const response = await fetch(`${host_super}provider/create-superadmin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json',
              'Content-Encoding': 'gzip',
            },
            body: JSON.stringify(formData),
        });
        
            
        if (!response.ok) {
            // Handle HTTP errors (e.g., 400, 500)
            let errorMessage = 'Failed to sign up.';
            if (response.headers.get('Content-Type')?.includes('application/json')) {
              try {
                const errorData = await response.json();
                if (errorData.detail) {
                  errorMessage += ` ${errorData.detail}`;
                }
              } catch (jsonError) {
                console.error("Error parsing JSON error response", jsonError);
              }
            }      throw new Error(errorMessage);
        }
    
        const data = await response.json();
        return data;

    } catch (error) {
        return {"error": error}
        throw error;
      }

}
