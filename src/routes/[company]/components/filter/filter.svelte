<script>
	import FilterButton from '../buttons/filter-button.svelte';
	import RefreshButton from '../buttons/refresh-button.svelte';
	import { host } from '../../../../apis/config';
	import { createEventDispatcher, onMount } from 'svelte';
	import { getAccessToken } from '../../../../stores/tokenStore';
	import { fetchTable } from '../../../../apis/table';

	const dispatch = createEventDispatcher();

	export let timeline = 'Daily'; // Default timeline
	export let span = 7; // Default span
	export let region;
	export let territory;
	export let route;
	export let point_of_sale;
	export let employee;

	export let disable_point_of_sale = false;

	let activeTimeline = 'Daily';
	let token = '';

	$: setFilter(timeline, span)

	import { roles } from '../../../../stores/roleStore.js';
	import { hasPrivilege } from '$lib/role.js';
	let userRoles = {};

	let outlet_type = null;

	let isFinance = false;
	let organization;

	onMount(() => {
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;

			if (!(Object.keys(userRoles).length === 0 && userRoles.constructor === Object)) {
				if (hasPrivilege(userRoles['Finance'], 'D')) {
					isFinance = true;
				}
			}
		});
	});

	const regionUrl = `${host}region/get-my-region/`;
	const territoryUrl = `${host}region/get-territory-by-region/`;
	const routeUrl = `${host}route/get-by-territory-id/`;
	const routePointUrl = `${host}route/get-point-of-sales`;
	const employeeUrl = `${host}performance-employee/get-sales-team`;
	const organizationsUrl = `${host}organization/get-organizations-filter`;	

	onMount(async () => {
		getOrganizations();
		getEmployees();
	});

	function setFilter(newTimeline, newSpan) {
		timeline = newTimeline;
		span = newSpan;
		activeTimeline = newTimeline;

		// Dispatch an event to notify parent components of the change
		dispatch('filterChange', { timeline, span, region, territory, route, point_of_sale, employee });
	}

	function handleFilterChange(event) {
		dispatch('filterChange', { timeline, span, region, territory, route, point_of_sale, employee });
	}
	let territories = [];
	let regions = [];
	let organizations = [];

	async function getOrganizations() {
		if (token == null || token == '') {
			token = getAccessToken();
		}
		try {
			let data = await fetchTable(organizationsUrl, token);
			if (data.succeed == true) {
				organizations = data.data;
			}
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}

	async function getRegions(org) {
		if(!organization)
			return;
		if (token == null || token == '') {
			token = getAccessToken();
		}
		try {
			let region = await fetchTable(`${regionUrl}${organization}`, token);
			if (region.succeed == true) {
				regions = region.data;
			}
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}

	async function getTerritories() {
		if(!region) return;
		if (token == null || token == '') {
			token = getAccessToken();
		}
		try {
			let territory = await fetchTable(`${territoryUrl}${region}`, token);
			if (territory.succeed == true) {
				// territory = territory.data.id;
				territories = territory.data;
			}
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}

	let employees = [];

	async function getEmployees() {
		if (token == null || token == '') {
			token = getAccessToken();
		}
		try {
			let employee = await fetchTable(employeeUrl, token);
			if (employee.succeed == true) {
				employees = employee.data;
			}
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}

	let routes = [];

	async function getRoutesByTerritory(territoryId) {
		try {
			if (token == null || token == '') {
				token = getAccessToken();
			}

			routes = await fetchTable(`${routeUrl}${territoryId}`, token);

			if (routes.succeed == true) {
				routes = routes.data;
			} else {
				throw new Error('No data');
			}
		} catch (error) {
			routes = [];
			locations = [];
			route = '';
			console.error('Error fetching table data:', error);
		}
	}


	$: getRegions(organization);
    $: getTerritories(region);
	$: updateRoutes(territory);

	function updateRoutes(territory) {
		if (territory) {
			getRoutesByTerritory(territory);
		}
	}

	let locations = [];

	async function getRoutePoint(routeId, o_type) {
		if (!route) {
			return;
		}
		let routePoints;
		try {
			if (token == null || token == '') {
				token = getAccessToken();
			}

			locations = [];
			// Fetch Route Points
			routePoints = await fetchTable(routePointUrl, token, 1, 10, '', '', {'id': routeId, 'outlet_type': outlet_type == "None" ? null : outlet_type });

			if (routePoints.succeed == true && routePoints.data) {
				routePoints = routePoints.data.items;
			} else {
				return;
				console.log('No point of sales part of this route');
			}

			for (const point of routePoints) {
				//  Push posId and location to locations
				locations = [
					...locations,
					{
						id: point.id,
						name: point.name
					}
				];
			}
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}

	$: getRoutePoint(route, outlet_type);
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 text-gray-700">
    <div class="ml-2 w-full flex gap-2">
        <div class="ml-2 h-fit flex gap-2">
            <button
                class={activeTimeline == 'Daily' ? "btn btn-outline dark:btn-soft text-gray-100 sm:btn-xs md:btn-md bg-[#42A5F5]" : "btn btn-outline dark:btn-soft dark:bg-[#002a47] dark:text-gray-100 sm:btn-xs md:btn-md"}
                on:click={() => { setFilter('Daily', 90); activeTimeline = 'Daily'; }}
            > Daily </button>
            <button
                class={activeTimeline == 'Weekly' ? "btn btn-outline dark:btn-soft text-gray-100 sm:btn-xs md:btn-md bg-[#42A5F5]" : "btn btn-outline dark:btn-soft dark:bg-[#002a47] dark:text-gray-100 sm:btn-xs md:btn-md"}
                on:click={() => { setFilter('Weekly', 52); activeTimeline = 'Weekly'; }}
            > Weekly </button>
            <button
                class={activeTimeline == 'Monthly' ? "btn btn-outline dark:btn-soft text-gray-100 sm:btn-xs md:btn-md bg-[#42A5F5]" : "btn btn-outline dark:btn-soft dark:bg-[#002a47] dark:text-gray-100 sm:btn-xs md:btn-md"}
                on:click={() => { setFilter('Monthly', 12); activeTimeline = 'Monthly'; }}
            > Monthly </button>
            <button
                class={activeTimeline == 'Yearly' ? "btn btn-outline dark:btn-soft text-gray-100 sm:btn-xs md:btn-md bg-[#42A5F5]" : "btn btn-outline dark:btn-soft dark:bg-[#002a47] dark:text-gray-100 sm:btn-xs md:btn-md"}
                on:click={() => { setFilter('Yearly', 3); activeTimeline = 'Yearly'; }}
            > Annually </button>
        </div>

        <div class="dropdown dropdown-start">
            <div tabindex="0" role="button" class="btn bg-gray-100 dark:bg-[#0f1727] border-none px-2">
                <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7ZM6 12C6 11.4477 6.44772 11 7 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H7C6.44772 13 6 12.5523 6 12ZM9 17C9 16.4477 9.44772 16 10 16H14C14.5523 16 15 16.4477 15 17C15 17.5523 14.5523 18 14 18H10C9.44772 18 9 17.5523 9 17Z" fill="#42A5F5"></path>
                </svg>
            </div>
            
            <div tabindex="0" class="dropdown-content z-[999] p-4 shadow-2xl bg-gray-100 dark:bg-[#0f1727] border border-gray-300 dark:border-gray-800 rounded-xl w-[400px] mt-2">
                
                <div class="flex justify-between items-center mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">
                    <span class="font-bold text-sm dark:text-gray-100 uppercase tracking-tight">Filters</span>
                    <button 
                        on:click={() => { territory = ''; route = ''; point_of_sale = ''; employee = ''; region = ''; organization = ''; outlet_type = null;}}
                        class="text-xs font-semibold text-red-500 hover:text-red-400 cursor-pointer"
                    >
                        Clear All
                    </button>
                </div>

                <div class="grid grid-cols-2 gap-4">

                <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Organization</label>
                        <select
                            bind:value={organization}
                            on:change={handleFilterChange}
                            class="select select-sm w-full bg-white dark:bg-[#002a47] dark:text-white border-gray-300 dark:border-gray-800"
                        >
                            <option value="">None</option>
                            {#if organizations && organizations.length}
                                {#each organizations as t}
                                    <option value={t.id}>{@html t.name}</option>
                                {/each}
                            {/if}
                        </select>
                 </div>

                 <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Demarcation</label>
                        <select
                            bind:value={region}
                            on:change={handleFilterChange}
                            class="select select-sm w-full bg-white dark:bg-[#002a47] dark:text-white border-gray-300 dark:border-gray-800"
                        >
                            <option value="">None</option>
                            {#if regions && regions.length}
                                {#each regions as t}
                                    <option value={t.id}>{@html t.name}</option>
                                {/each}
                            {/if}
                        </select>
                    </div>
                    
                    <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Territory</label>
                        <select
                            bind:value={territory}
                            on:change={handleFilterChange}
                            class="select select-sm w-full bg-white dark:bg-[#002a47] dark:text-white border-gray-300 dark:border-gray-800"
                        >
                            <option value="">None</option>
                            {#if territories && territories.length}
                                {#each territories as t}
                                    <option value={t.id}>{t.name}</option>
                                {/each}
                            {/if}
                        </select>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Route</label>
                        <select
                            bind:value={route}
                            on:change={handleFilterChange}
                            class="select select-sm w-full bg-white dark:bg-[#002a47] dark:text-white border-gray-300 dark:border-gray-800"
                        >
                            <option value="">None</option>
                            {#each routes as r}
                                <option value={r.id}>{r.name}</option>
                            {/each}
                        </select>
                    </div>

                    {#if !disable_point_of_sale}
                    <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Outlet Type</label>
                        <select
                            bind:value={outlet_type}
                            on:change={handleFilterChange}
                            class="select select-sm w-full bg-white dark:bg-[#002a47] dark:text-white border-gray-300 dark:border-gray-800"
                        >
                            <option value={null}>None</option>
                            <option value="Outlet">Outlet</option>
                            <option value="Subagent">Subagent</option>
                            <option value="Walk In Customer">Walk In Customer</option>
                        </select>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Outlet</label>
                        <select
                            bind:value={point_of_sale}
                            on:change={handleFilterChange}
                            class="select select-sm w-full bg-white dark:bg-[#002a47] dark:text-white border-gray-300 dark:border-gray-800"
                        >
                            <option value="">None</option>
                            {#each locations as pos}
                                <option value={pos.id}>{pos.name}</option>
                            {/each}
                        </select>
                    </div>
                    {/if}

                    <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Employee</label>
                        <select
                            bind:value={employee}
                            on:change={handleFilterChange}
                            class="select select-sm w-full bg-white dark:bg-[#002a47] dark:text-white border-gray-300 dark:border-gray-800"
                        >
                            <option value="">None</option>
                            {#each employees as emp}
                                <option value={emp.id}>{emp.full_name}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="flex justify-end p-2">
        <RefreshButton />
    </div>
</div>
<style>
	.active-button {
		background-color: #3498db; /* Change this to your preferred active button color */
		color: white;
	}
</style>
