<script>
    import { goto } from '$app/navigation';
    import { roles } from '../../../../../../src/stores/roleStore';
	import { hasPrivilege } from '$lib/role.js';
    import Details from '$lib/modals/details.svelte';
    import { page } from '$app/stores';
    import Header from '../../header/header.svelte';


    // Define the props for the component
    let { 
        tabs = ['Customer'],             // The array of items to loop through
        activeTab = $bindable(),// The currently selected tab (bindable)
        formatLabel,           // The function to format the tab names
        routeSchedule = null,  // Optional: The schedule ID for the warehouse link
        companyName = "",       // Optional: Needed for the warehouse URL
        onToggleSidebar
    } = $props();

	let userRoles = $state($roles);
	let sidebarToggle = true;

	// Function to toggle sidebar visibilitysidebarToggle
	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<!-- <Header onToggleSidebar={toggleSidebar} {sidebarToggle} /> -->
<div class="mt-0 px-4 py-2 border-b dark:border-[#00527c] m-1">
    <div class="flex gap-2">

        {#each tabs as tab}
            <button
                type="button"
                onclick={() => activeTab = tab}
                class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                border border-b-0
                text-gray-700 hover:bg-gray-100
                dark:text-white dark:bg-[#002a47] dark:border-[#00527c] dark:hover:bg-[#003b5e]
                {activeTab === tab
                    ? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
                    : 'bg-white'}"
            >
                {formatLabel(tab)}
            </button>
        {/each}

        {#if !hasPrivilege(userRoles['Order'], 'R') }

            {#if routeSchedule}
                <button
                    type="button"
                    onclick={() => goto(`/${companyName}/warehouse-stop?routeschedule=${routeSchedule}`)}
                    class="flex gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                    border border-b-0
                    text-gray-700 hover:bg-gray-100
                    dark:text-white dark:bg-[#002a47] dark:border-[#00527c] dark:hover:bg-[#003b5e] bg-white"
                >
                    <img src="/svgs/warehouse.svg" alt="Warehouse" width="16" height="16" />
                </button>
            {/if}
         {/if}            
    </div>
</div>