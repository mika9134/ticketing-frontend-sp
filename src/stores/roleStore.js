import { writable } from 'svelte/store';
import { browser } from '$app/environment';


export const roles = writable({}); // Store to hold the roles

// Function to fetch roles from the backend
export async function fetchRoles(apiEndpoint, token) {
    if (!browser) return; // Skip if SSR

        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });


        if (!response.ok) {
            return {'succeed': false, 'error': response.error};
           // throw new Error('Failed to fetch roles');
        }

        let data = await response.json();
        
        
        if(!data.succeed)
        {
           return {'succeed': false, 'error': response.error};
        }
        
               
        let roles_data = data.data;

        // Filter out roles with empty strings
        const filteredRoles = Object.fromEntries(
            Object.entries(roles_data).filter(([key, value]) => value && value !== "deny")
        );

        roles.set(filteredRoles); // Update the store with the filtered roles

        return data;

}
