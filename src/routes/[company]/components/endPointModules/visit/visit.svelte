<script>
	import { onMount } from 'svelte';
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import { fetchForm } from '../../../../../apis/form.js';
	import { formatFieldNames } from '$lib/utils.js';
	import { updateForm } from '../../../../../apis/form.js';
	import Checkout from '../salesForm/salesForm.svelte';
	import Map from '$lib/map/map.svelte';
	import Details from '$lib/modals/details.svelte';
	import Planned from '../../../components/endPointModules/visit/planned.svelte';
	import Travel from '../../../components/endPointModules/visit/travel.svelte';
	import Unplanned from '../../../components/endPointModules/visit/unplanned.svelte';
	import UnplannedOrder from '../../../components/endPointModules/visit/unplannedOrder.svelte';
	import PlannedOrder from '../../../components/endPointModules/visit/plannedOrders.svelte';

	import Orders from '../../../components/endPointModules/visit/orders.svelte';
	import WarehouseStop from '../../../components/endPointModules/warehouse_stop/warehouse_stop.svelte';
	import Header from '../../header/header.svelte';
	import { hasPrivilege } from '$lib/role.js';
	import { roles } from '../../../../../stores/roleStore.js';

	let tabs = $state([]);
	let activeTab = $state('');
	let userRoles = $state({});

	let { onToggleSidebar } = $props();

	let sidebarToggle = true;

	// Function to toggle sidebar visibility
	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};

	onMount(() => {
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;

			if (hasPrivilege(userRoles['Finance'], 'C')) {
				tabs = ['Travel'];
				activeTab = 'Travel';
			} else if (hasPrivilege(userRoles['Sales'], 'D')) {
				tabs = ['Travel', 'Unplanned Visit'];
				activeTab = 'Travel';
			} 
			else if (hasPrivilege(userRoles['Order'], 'R')){
					tabs = ['Planned Visit', 'Unplanned Visit', 'Travel'];
				activeTab = 'Planned Visit';

			}
			else {
				tabs = ['Planned Visit', 'Unplanned Visit', 'Travel'];
				activeTab = 'Planned Visit';
			}

			const searchParams = new URLSearchParams(window.location.search);

			if (searchParams.get('routeschedule')) {
				activeTab = 'Warehouse Stop';
			}
		});
	}); 
</script>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
	<div class="mt-4">
		<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
			<div class="flex gap-2">
				{#each tabs as tab}
					<button
						type="button"
						onclick={() => (activeTab = tab)}
						class="px-2 lg:px-4 py-2 rounded-t-lg text-xs lg:text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeTab === tab
							? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
							: 'bg-white'}"
					>
						{#if hasPrivilege(userRoles['Sales'], 'D') && tab == 'Unplanned Visit'}
							Unplanned Requests
						{:else}
							{formatFieldNames(tab)}
						{/if}
					</button>
				{/each}
			</div>
		</div>


    {#if hasPrivilege(userRoles['Order'], 'R')}
    {#if activeTab === 'Unplanned Visit'}
    <UnplannedOrder 
     />
    {:else if activeTab === 'Planned Visit'}
    <PlannedOrder />
    {:else if activeTab === 'Travel'}
    <Travel />
    {/if}
    {:else}
        {#if activeTab === 'Unplanned Visit'}
            <Unplanned />
        {:else if activeTab === 'Planned Visit'}
            <Planned />
        {:else if activeTab === 'Travel'}
            <Travel />
        {/if}
    {/if} 


	</div>
</div>




<!-- 

<script>
    import { onMount } from 'svelte';
    import { formatFieldNames } from '$lib/utils.js';
    import Planned from '../../../components/endPointModules/visit/planned.svelte';
    import Travel from '../../../components/endPointModules/visit/travel.svelte';
    import Unplanned from '../../../components/endPointModules/visit/unplanned.svelte';
    import UnplannedOrder from '../../../components/endPointModules/visit/unplannedOrder.svelte';
    import PlannedOrder from '../../../components/endPointModules/visit/plannedOrders.svelte';
    import Header from '../../header/header.svelte';
    import { hasPrivilege } from '$lib/role.js';
    import { roles } from '../../../../../stores/roleStore.js';

    let tabs = $state([]);
    let activeTab = $state('');
    let activeSubTab = $state('Unplanned Sales Request'); 
    let userRoles = $state({});

    let { onToggleSidebar } = $props();
    let sidebarToggle = true;

    const toggleSidebar = () => {
        sidebarToggle = !sidebarToggle;
        onToggleSidebar();
    };

    onMount(() => {
        const unsubscribe = roles.subscribe((value) => {
            userRoles = value;

            // Define main tabs
            if (hasPrivilege(userRoles['Sales'], 'D')) {
                tabs = ['Planned Visit', 'Unplanned Request', 'Travel'];
            } else if (hasPrivilege(userRoles['Finance'], 'C')) {
                tabs = ['Travel'];
            } else {
                tabs = ['Planned Visit', 'Unplanned Request', 'Travel'];
            }

            if (tabs.length > 0 && !activeTab) {
                activeTab = tabs[0];
            }
        });

        return () => unsubscribe();
    });

    const handleMainTabChange = (tab) => {
        activeTab = tab;
        if (tab === 'Unplanned Request') {
            activeSubTab = 'Unplanned Sales Request'; // Default sub-tab
        }
    };
</script>

<div>
    <Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
    
    <div class="mt-4">
        <div class="border-b border-gray-200 dark:border-[#00527c] m-4">
            <div class="flex gap-2">
                {#each tabs as tab}
                    <button
                        type="button"
                        onclick={() => handleMainTabChange(tab)}
                        class="px-2 lg:px-4 py-2 rounded-t-lg text-xs lg:text-sm font-medium transition-colors duration-200 border border-b-0
                        {activeTab === tab
                            ? 'text-[#3393ce] bg-white dark:bg-[#003b5e] border-b-2 border-[#3393ce]'
                            : 'text-gray-700 bg-white dark:text-white dark:bg-[#002a47] hover:bg-gray-100'}"
                    >
                        {formatFieldNames(tab)}
                    </button>
                {/each}
            </div>
        </div>

        {#if activeTab === 'Unplanned Request'}
            <div class="flex justify-between items-center p-0 bg-gray-100 dark:bg-[#22273c] shadow-sm mx-4 rounded-t-lg overflow-hidden">
                <div class="flex">
                    <button 
                        onclick={() => activeSubTab = 'Unplanned Sales Request'}
                        class="px-4 py-2 text-sm font-medium transition-colors duration-200 border border-b-0
                        {activeSubTab === 'Unplanned Sales Request' 
                            ? 'text-[#3393ce] bg-white dark:bg-[#003b5e]' 
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]'}">
                        Unplanned Sales Request
                    </button>

                    {#if hasPrivilege(userRoles['Sales'], 'D') || hasPrivilege(userRoles['Order'], 'R')}
                        <button 
                            onclick={() => activeSubTab = 'Unplanned Order Request'}
                            class="px-4 py-2 text-sm font-medium transition-colors duration-200 border border-b-0
                            {activeSubTab === 'Unplanned Order Request' 
                                ? 'text-[#3393ce] bg-white dark:bg-[#003b5e]' 
                                : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]'}">
                            Unplanned Order Request
                        </button>
                    {/if}
                </div>
                
                <div class="px-4">
                    <button
                        class="btn btn-sm btn-circle btn-ghost text-red-500 border border-red-500"
                        onclick={() => activeTab = tabs[0]}
                    >✕</button>
                </div>
            </div>
        {/if}

        <div class="p-4">
            {#if activeTab === 'Unplanned Request'}
                {#if activeSubTab === 'Unplanned Sales Request'}
                    <Unplanned />
                {:else}
                    <UnplannedOrder />
                {/if}
            {:else if activeTab === 'Planned Visit'}
                {#if hasPrivilege(userRoles['Order'], 'R')}
                    <PlannedOrder />
                {:else}
                    <Planned />
                {/if}
            {:else if activeTab === 'Travel'}
                <Travel />
            {/if}
        </div>
    </div>
</div> -->