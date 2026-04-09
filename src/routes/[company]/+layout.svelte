<script>
	import 'tailwindcss/tailwind.css';	
	import { onMount} from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getAccessToken, setTokens } from '../../stores/tokenStore';
	//import { checkSessionActive } from '../../apis/api-utils.js';
	import { companyStore, getCompanyName, companyName } from '../../stores/companyStore.js';
	let active = $state(true);
	
	let cName= getCompanyName();
	let token = getAccessToken();
		
  
  function handleSignOut() {
		setTokens("","");
    goto(`/${$page.params.company}/signin`);
	}
</script>


<slot />
