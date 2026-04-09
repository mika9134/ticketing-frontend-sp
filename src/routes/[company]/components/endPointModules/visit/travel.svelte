<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import Sales from '../sales/sales.svelte';
	import Checkout from '../salesForm/salesForm.svelte';
	import Map from '$lib/map/map.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import { getLocation } from '$lib/location.js';
	import Details from '$lib/modals/details-component.svelte';
	import TabulatedDetails from '$lib/modals/tabulated-details.svelte';
	// import DetailsCompnent from '$lib/modals/details-component.svelte';

	const tableEndpoint = `${host}travel/get-travel`;
	const exportEndpoint = `${host}travel/export-travel`;
	const tableEndpointById = `${host}travel/get-travel`;
	const searchEndpoint = `${host}travel/search`;
	const formEndpoint = `${host}travel/travel-form`;
	const submitUrl = undefined;
	const updateUrl = undefined;
	const deleteUrl = undefined;
	const table_name = 'Travel';
	const summerizEndpoint = `${host}travel/travel-summary/`;
	const filterEndpoint = `${host}travel/travel/all-filters`;



	let refreshToken = $state(false);
	let visitStarted = $state(false);
	let activeType = $state('Planned Visit');

	let button_names = [];
	let button_callbacks = [];
	let myDialog = $state();
	let selected_point_of_sale = $state(null);
	let isOpen = $state(false);
	let title = $state('Visit Options');
	let result_detail = $state(null);

	let detailsEndpointById = $state(`${host}route/get-point-of-sales-visit-by-travel/`);
	let totaldistance = $state(`${host}travel/get-total-distance`);
	let totalProductivity = $state(`${host}travel/get-total-productivity`);
	// let detailsEndpointById = $state(`${host}travel/get-travel-details/`);
	let detailsOpen = $state(false);
	let detailsTitle = $state('');
	let distance_title = 'Total Distance Traveled ';
	let distance_svg =
		'<svg height="36px" width="36px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.001 512.001" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle style="fill:#b4d8f5;" cx="117.329" cy="163.959" r="43.015"></circle> <g> <path style="fill:#286692;" d="M117.333,220.772c-31.326,0-56.812-25.486-56.812-56.812s25.486-56.812,56.812-56.812 s56.812,25.486,56.812,56.812S148.659,220.772,117.333,220.772z M117.333,134.748c-16.108,0-29.212,13.105-29.212,29.212 s13.105,29.212,29.212,29.212s29.212-13.105,29.212-29.212S133.44,134.748,117.333,134.748z"></path> <path style="fill:#286692;" d="M117.333,356.553c-3.349,0-6.699-1.213-9.339-3.64C103.585,348.86,0,252.627,0,163.585 c0-12.456,1.946-24.726,5.782-36.468c2.367-7.245,10.161-11.199,17.403-8.831c7.245,2.367,11.199,10.158,8.831,17.403 c-2.931,8.97-4.417,18.356-4.417,27.896c0,62.659,65.101,134.794,89.763,159.869c4.119-4.165,9.356-9.628,15.205-16.12 c5.101-5.664,13.826-6.12,19.49-1.016c5.662,5.102,6.118,13.828,1.016,19.49c-14.93,16.573-25.962,26.702-26.424,27.126 C124.012,355.347,120.672,356.553,117.333,356.553z"></path> <path style="fill:#286692;" d="M181.788,280.871c-2.652,0-5.334-0.763-7.699-2.357c-6.32-4.259-7.993-12.835-3.733-19.156 c24.359-36.149,36.71-68.371,36.71-95.773c0-49.479-40.254-89.733-89.733-89.733c-19.25,0-37.597,6.002-53.056,17.358 c-6.142,4.511-14.78,3.192-19.291-2.953c-4.513-6.142-3.191-14.779,2.953-19.291c20.231-14.859,44.227-22.712,69.395-22.712 c64.698,0,117.333,52.635,117.333,117.333c0,32.996-13.935,70.408-41.421,111.196C190.58,278.736,186.223,280.871,181.788,280.871z "></path> </g> <circle style="fill:#b4d8f5;" cx="394.67" cy="163.959" r="43.015"></circle> <g> <path style="fill:#286692;" d="M394.667,220.772c-31.326,0-56.812-25.486-56.812-56.812s25.486-56.812,56.812-56.812 s56.812,25.486,56.812,56.812S425.993,220.772,394.667,220.772z M394.667,134.748c-16.108,0-29.212,13.105-29.212,29.212 s13.105,29.212,29.212,29.212c16.107,0,29.212-13.105,29.212-29.212S410.775,134.748,394.667,134.748z"></path> <path style="fill:#286692;" d="M394.667,356.553c-3.349,0-6.699-1.213-9.339-3.64c-4.409-4.053-107.994-100.286-107.994-189.328 c0-12.456,1.946-24.726,5.782-36.468c2.367-7.245,10.16-11.199,17.403-8.831c7.244,2.368,11.199,10.158,8.831,17.403 c-2.931,8.97-4.417,18.356-4.417,27.896c0,62.659,65.101,134.794,89.763,159.869c4.119-4.165,9.357-9.628,15.205-16.12 c5.103-5.662,13.829-6.116,19.49-1.016c5.664,5.102,6.118,13.828,1.016,19.49c-14.932,16.573-25.964,26.702-26.426,27.126 C401.346,355.347,398.007,356.553,394.667,356.553z"></path> <path style="fill:#286692;" d="M459.122,280.871c-2.652,0-5.334-0.763-7.699-2.357c-6.32-4.259-7.993-12.835-3.733-19.156 c24.359-36.149,36.71-68.371,36.71-95.773c0-49.479-40.254-89.733-89.733-89.733c-19.25,0-37.597,6.002-53.056,17.358 c-6.142,4.51-14.78,3.192-19.291-2.953c-4.513-6.142-3.191-14.78,2.953-19.291c20.23-14.859,44.225-22.712,69.395-22.712 c64.698,0,117.333,52.635,117.333,117.333c0,32.996-13.935,70.408-41.421,111.196C467.914,278.736,463.557,280.871,459.122,280.871 z"></path> </g> <g> <circle style="fill:#b4d8f5;" cx="117.329" cy="426.41" r="25.543"></circle> <circle style="fill:#b4d8f5;" cx="394.67" cy="426.41" r="25.543"></circle> </g> <g> <path style="fill:#286692;" d="M275.326,412.604H154.171c-5.603-14.906-19.999-25.543-36.838-25.543 c-21.694,0-39.343,17.649-39.343,39.343c0,21.694,17.649,39.343,39.343,39.343c16.839,0,31.235-10.637,36.838-25.543h121.155 c7.622,0,13.8-6.178,13.8-13.8S282.948,412.604,275.326,412.604z M117.333,438.147c-6.475,0-11.743-5.267-11.743-11.743 c0-6.475,5.268-11.743,11.743-11.743s11.743,5.267,11.743,11.743C129.075,432.879,123.808,438.147,117.333,438.147z"></path> <path style="fill:#286692;" d="M394.667,387.063c-16.839,0-31.235,10.637-36.838,25.543h-22.246c-7.622,0-13.8,6.178-13.8,13.8 s6.178,13.8,13.8,13.8h22.246c5.603,14.905,19.999,25.543,36.838,25.543c21.694,0,39.343-17.649,39.343-39.343 C434.01,404.712,416.361,387.063,394.667,387.063z M394.667,438.147c-6.475,0-11.743-5.267-11.743-11.743 c0-6.475,5.267-11.743,11.743-11.743c6.475,0,11.743,5.267,11.743,11.743C406.41,432.879,401.142,438.147,394.667,438.147z"></path> </g> </g></svg>';
	let pin_svg =
		'<svg width="18px" height="18px" viewBox="-3 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>pin_sharp_circle [#624]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-223.000000, -5439.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M176,5286.219 C176,5287.324 175.105,5288.219 174,5288.219 C172.895,5288.219 172,5287.324 172,5286.219 C172,5285.114 172.895,5284.219 174,5284.219 C175.105,5284.219 176,5285.114 176,5286.219 M174,5296 C174,5296 169,5289 169,5286 C169,5283.243 171.243,5281 174,5281 C176.757,5281 179,5283.243 179,5286 C179,5289 174,5296 174,5296 M174,5279 C170.134,5279 167,5282.134 167,5286 C167,5289.866 174,5299 174,5299 C174,5299 181,5289.866 181,5286 C181,5282.134 177.866,5279 174,5279" id="pin_sharp_circle-[#624]"> </path> </g> </g> </g> </g></svg>';

	let transactions = $state({});

	async function rowClicked(row) {
		try {
			selected_point_of_sale = row.id;
			console.log(row);

			const data = await fetchTable(`${detailsEndpointById}${row.route_schedule_id}`, token);
			const distance = await fetchTable(`${totaldistance}/${row.route_schedule_id}`, token);
			const productivityData = await fetchTable(
				`${totalProductivity}/${row.route_schedule_id}`,
				token
			);

			if (distance?.succeed === true && data?.succeed === true) {
				const distance_data = distance.data;
				const productivity = productivityData.data.productivity;

				const distanceDisplay = `${distance_title} = ${distance_data} KM`;
				const productivityDisplay = `Productivity = ${productivity}`;
				const infoDisplay = `
					<div class="flex flex-col text-sm leading-tight">
						<span>${distanceDisplay}</span>
						<span>${productivityDisplay}</span>
					</div>
				`;
				detailsTitle = `<div class="flex items-center justify-center gap-x-4">🧭 Travel Information${'\u200B'.repeat(500)} ${distance_svg} ${infoDisplay}</div>`;
				transactions = data.data ?? {};
				detailsOpen = true;

				if (myDialog) {
					myDialog.showModal();
				}
			} else if (data?.succeed === true) {
				const productivity = productivityData.data.productivity;

				const productivityDisplay = `| Productivity = ${productivity}`;
				detailsTitle = `🧭 Travel Information ${productivityDisplay}`;
				transactions = data.data ?? {};
				detailsOpen = true;

				if (myDialog) {
					myDialog.showModal();
				}
			}
		} catch (error) {
			console.log(error);
		}
	}
</script>

<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
	<div class="flex gap-2">
		<button
			type="button"
			onclick={() => {
				activeType = 'Planned Visit';
				refreshToken = !refreshToken;
			}}
			class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Planned Visit'
				? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
				: 'bg-white'}"
		>
			Planned Visit
		</button>

		<button
			type="button"
			onclick={() => {
				activeType = 'Unplanned Visit';
				refreshToken = !refreshToken;
			}}
			class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Unplanned Visit'
				? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
				: 'bg-white'}"
		>
			Unplanned Visit
		</button>
	</div>
</div>
<div class="mt-4">
	{#key refreshToken}
		<dialog bind:this={myDialog}>
			<TabulatedDetails
				bind:title={detailsTitle}
				bind:dataMap={transactions}
				handleClose={() => {
					detailsOpen = false;
					myDialog.close();
				}}
			/>
		</dialog>
		<Table
			get_table_endpoint={tableEndpoint}
			get_export_endpoint={exportEndpoint}
			search_endpoint={searchEndpoint}
			filter_endpoint={filterEndpoint}
			summerize_endpoint={summerizEndpoint}
			get_table_endpoint_by_id={tableEndpointById}
			get_form_endpoint={formEndpoint}
			create_entry_url={submitUrl}
			update_entry_url={updateUrl}
			delete_entry_url={deleteUrl}
			{token}
			{table_name}
			module="Sales"
			get_id_bool={true}
			buttons_names={button_names}
			buttons_callbacks={button_callbacks}
			buttons_show={undefined}
			row_clicked={rowClicked}
			additional_param={{ visit_type: activeType }}
		/>
	{/key}
</div>
<!--  
<script>
    import { onMount } from 'svelte';
    import { host, token } from '../../../../../apis/config';
    import Table from '../../tables/table.svelte';
    import { fetchTable } from '../../../../../apis/table';
    import TabulatedDetails from '$lib/modals/tabulated-details.svelte';

    const tableEndpoint = `${host}travel/get-travel`;
    const exportEndpoint = `${host}travel/export-travel`;
    const tableEndpointById = `${host}travel/get-travel`;
    const searchEndpoint = `${host}travel/search`;
    const formEndpoint = `${host}travel/travel-form`;
    const summerizEndpoint = `${host}travel/travel-summary/`;
    const filterEndpoint = `${host}travel/travel/all-filters`;

    // State for double-level tabs
    let activeCategory = $state('Sales Visit'); // Level 1: Sales vs Order
    let activeType = $state('Planned');         // Level 2: Planned vs Unplanned
    
    let refreshToken = $state(false);
    let myDialog = $state();
    let transactions = $state({});
    let detailsTitle = $state('');
    let detailsOpen = $state(false);

    const submitUrl = undefined;
    const updateUrl = undefined;
    const deleteUrl = undefined;
    const table_name = 'Travel';

    // SVG assets from your original code
    let distance_svg = `<svg ... >...</svg>`; // (Keeping your SVGs)

    async function rowClicked(row) {
        // ... (Your existing rowClicked logic remains the same)
        // Ensure it uses the existing endpoints and token logic
    }

    // Helper to refresh table when tabs change
    function updateFilters(cat, type) {
        activeCategory = cat;
        activeType = type;
        refreshToken = !refreshToken;
    }
</script>

<div class="mt-2">
    <div class="border-b border-gray-200 dark:border-[#00527c] mx-4 mb-2">
        <div class="flex gap-2">
            {#each ['Sales Visit', 'Order Visit'] as cat}
                <button
                    type="button"
                    onclick={() => updateFilters(cat, activeType)}
                    class="px-6 py-2 rounded-t-lg text-sm font-bold transition-all duration-200 border border-b-0
                    {activeCategory === cat
                        ? 'text-[#3393ce] bg-white dark:bg-[#003b5e] border-b-2 border-[#3393ce]'
                        : 'text-gray-500 bg-gray-50 dark:text-white dark:bg-[#002a47] hover:bg-gray-100'}"
                >
                    {cat}
                </button>
            {/each}
        </div>
    </div>

    <div class="flex justify-between items-center p-0 bg-gray-100 dark:bg-[#22273c] shadow-sm mx-4 rounded-t-lg overflow-hidden border-b dark:border-[#00527c]">
        <div class="flex">
            {#each ['Planned', 'Unplanned'] as type}
                <button
                    type="button"
                    onclick={() => updateFilters(activeCategory, type)}
                    class="px-6 py-3 text-sm font-medium transition-colors duration-200 border-r dark:border-[#00527c]
                    {activeType === type
                        ? 'text-[#3393ce] bg-white dark:bg-[#003b5e] font-bold'
                        : 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-[#002a47] hover:bg-white dark:hover:bg-[#003b5e]'}"
                >
                    {type} {activeCategory.split(' ')[0]}
                </button>
            {/each}
        </div>

        <div class="px-4 text-xs font-mono text-gray-400">
            Viewing: {activeCategory} > {activeType}
        </div>
    </div>

    <div class="mt-2">
        {#key refreshToken}
            <dialog bind:this={myDialog}>
                <TabulatedDetails
                    bind:title={detailsTitle}
                    bind:dataMap={transactions}
                    handleClose={() => {
                        detailsOpen = false;
                        myDialog.close();
                    }}
                />
            </dialog>

            <Table
                get_table_endpoint={tableEndpoint}
                get_export_endpoint={exportEndpoint}
                search_endpoint={searchEndpoint}
                filter_endpoint={filterEndpoint}
                summerize_endpoint={summerizEndpoint}
                get_table_endpoint_by_id={tableEndpointById}
                get_form_endpoint={formEndpoint}
                {token}
                {table_name}
                module="Sales"
                get_id_bool={true}
                row_clicked={rowClicked}
                additional_param={{ 
                    visittype: activeType,
                    category: activeCategory 
                }}
            />
        {/key}
    </div>
</div>
 -->
