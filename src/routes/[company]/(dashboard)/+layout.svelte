<script>
	import { onMount} from 'svelte';
	import 'tailwindcss/tailwind.css';
	import Sidebar from '../components/sidebar/sidebar.svelte';
	import Header from '../components/header/header.svelte';
	import { redirect } from '@sveltejs/kit';
	import { host} from '../../../apis/config.js';
	import { fetchRoles } from '../../../stores/roleStore';
	import { getAccessToken, setTokens } from '../../../stores/tokenStore';
	import { goto } from '$app/navigation';
	import { companyStore, getCompanyName, companyName } from '../../../stores/companyStore.js';
	import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	let token = getAccessToken();
	
  const sidebarToggle = writable(true);
  setContext('message-context', sidebarToggle);
  
  let refreshPage = $state(false);
  
  let screenWidth = $state();
  let screenHeight = $state();

	onMount(async () => {
			// fetch roles on app initiation
     
     token = getAccessToken();
     
		 const roles = await fetchRoles(`${host}role/my-role`, token);
     screenWidth = window.innerWidth;
     screenHeight = window.innerHeight;
     
     
     if(screenWidth < 1024)
     {
         sidebarToggle.set(false);
     }
    
		 if(roles.succeed == false)
		 {
		  setTokens("","");
		  goto(`/${$page.params.company}/signin`);
		}
	});	


</script>
{#if token}
<main class="relative flex w-screen bg-[#171a2c] h-screen dark:bg-gray-400">
<!-- if signed in show the header and sidebar -->

	<!-- corrsponding Page content -->
	{#key refreshPage}
	
	{#if screenWidth < 1024}
	<div
		class={`absolute h-full flex-1 overflow-y-scroll w-fit bg-gray-100 dark:bg-[#171a2c] transition-all duration-300 ease-in-out ${sidebarToggle ? '' : 'ml-0'}`}
	>
	  <div class="w-screen">
	  
		<slot />
		
		</div>
		</div>
			{#if $sidebarToggle}
		    <div class="absolute z-50">
		      <Sidebar {sidebarToggle} refreshPage={() => {refreshPage = !refreshPage;}}/>
	      </div>
	    {/if}	
	{:else}
	
	
	{#if $sidebarToggle}
		    <div class="relative z-50">
		      <Sidebar {sidebarToggle} refreshPage={() => {refreshPage = !refreshPage;}}/>
	      </div>
	{/if}
   <div
		class={`relative flex-1 overflow-y-scroll w-fit bg-gray-100 dark:bg-[#171a2c] transition-all duration-300 ease-in-out ${sidebarToggle ? '' : 'ml-0'}`}
	>
		<slot />
		</div>
		
	
	{/if}
	
	
	
	{/key}


</main>
{/if}
