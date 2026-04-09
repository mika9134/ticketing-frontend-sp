<script>
    import { onMount } from 'svelte';
	import {getHost, host} from "../../../../apis/config";
	import { fetchRoles } from "../../../../stores/roleStore";
	import { getAccessToken, logout } from "../../../../stores/tokenStore";
	import { goto } from '$app/navigation';
	import { getCompanyName } from "../../../../stores/companyStore";
    

    // const apiEndpoint = `${host}role/my-role`;
    // console.log("host",host)
    const token = getAccessToken()
  
    export async function load({ cookies }) {
        getHost();
        const apiEndpoint = `${host}role/my-role`;
        const token = getAccessToken();
        
        try {
            // Use the host and token from config.js
            let roles = await fetchRoles(apiEndpoint, token);
                      

            if (!roles.permissions.administrative) {
                throw redirect(302, '/unauthorized'); // Redirect to an unauthorized page
            }

            return { roles };
        } catch (error) {
            if (error.message === 'UNAUTHORIZED') {
                // Handle unauthorized access
                logout(); // Clear the tokens
                const company_code = getCompanyName();
                if (company_code !== "provider") {
                    goto(`/${company_code}/signin`);
                } else {
                    goto('/signin');
                }
            }
            throw error; // Re-throw other errors
        }
    }

    onMount(async () => {
	    // fetch roles on app initiation
        let roles = await fetchRoles(`${host}role/my-role`, token);
        
    });


</script>
<slot/>
