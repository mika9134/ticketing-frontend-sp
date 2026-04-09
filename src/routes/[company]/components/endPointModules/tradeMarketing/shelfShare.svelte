<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { getCompanyName } from '../../../../../stores/companyStore.js';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import { host } from '../../../../../apis/config';
	import { fetchTable } from '../../../../../apis/table';
	import { fetchForm } from '../../../../../apis/form.js';
	import { formatFieldNames } from '$lib/utils.js';
	import Map from '$lib/map/map.svelte';
	import Header from '../../header/header.svelte';
	import Table from '../../tables/table.svelte';
	import Details from '$lib/modals/details-component.svelte';
	import TabulatedDetails from '$lib/modals/tabulated-details.svelte';

	const tabs = ['History', 'Map', 'List', 'Details'];
	const market_tabs = ['Shelf Share', 'Brand Availability'];
	let activeTab = $state('History');
	let active_market_tab = $state('Shelf Share');
	let refresh_table = $state(false);
	let row_clicked_callback = $state(rowClicked);

	let token = getAccessToken();
	let territory_id = $state('');
	let route_id = $state('');

	// Shelf Share Parents
	let shelfShareHistoryEndpoint = $state(`${host}shelf-share/get-all-of-shelf-share-products`);
	let shelfShareHistorySearchEndpoint = $state(`${host}shelf-share/search-history`);
	let shelfShareSummeriizeEndpoint = $state(`${host}shelf-share/get-shelf-share/summary`);
	let shelfShareExportEndpoint = $state(`${host}shelf-share/export-shelf-share`);
	let shelfShareDeleteHistoryEndpoint = $state(`${host}shelf-share/delete-shelf-share`);
	let shelfShareSubmitHistoryEndpoint = $state(`${host}shelf-share/create-shelf-share-product`);
	const filterEndpoint = `${host}shelf-share/all-filters`;

	// Brand Availability Parents
	let brandAvailabilityHistoryEndpoint = $state(
		`${host}brand-availability/get-all-of-brand-availability-products`
	);
	let brandAvailabilityHistorySearchEndpoint = $state(`${host}brand-availability/search-history`);
	let brandAvailabilitySummeriizeEndpoint = $state(
		`${host}brand-availability/get-brand-availability/summary`
	);
	let brandAvailabilityExportEndpoint = $state(
		`${host}brand-availability/export-brand-availability`
	);
	let brandAvailabilityDeleteHistoryEndpoint = $state(
		`${host}brand-availability/delete-brand-availability`
	);

	// Shelf Share Items
	let shelfShareTableEndpoint = $state(`${host}shelf-share/get-shelf-shares`);
	let shelfShareSearchEndpoint = $state(`${host}shelf-share/search`);
	let shelfShareFormEndpoint = $state(`${host}shelf-share/shelf-share-form`);
	let shelfShareIDEndpoint = $state(`${host}shelf-share/get-shelf-share/`);

	let shelfShareSubmitEndpoint = $state(`${host}shelf-share/create-shelf-share`);
	let shelfShareUpdateEndpoint = $state(`${host}shelf-share/update-shelf-share`);
	let shelfShareDeleteEndpoint = $state(`${host}shelf-share/delete-shelf-share-product`);

	// Brand Availability Items
	let brandAvailabilityTableEndpoint = $state(`${host}brand-availability/get-brand-availabilitys`);
	let brandAvailabilitySearchEndpoint = $state(`${host}brand-availability/search`);
	let brandAvailabilityFormEndpoint = $state(`${host}brand-availability/brand-availability-form`);
	let brandAvailabilityIDEndpoint = $state(`${host}brand-availability/get-brand-availability/`);
	let brandAvailabilitySubmitHistoryEndpoint = $state(
		`${host}brand-availability/create-brand-availability-product`
	);

	let brandAvailabilitySubmitEndpoint = $state(
		`${host}brand-availability/create-brand-availability`
	);
	let brandAvailabilityUpdateEndpoint = $state(
		`${host}brand-availability/update-brand-availability`
	);
	let brandAvailabilityDeleteEndpoint = $state(
		`${host}brand-availability/delete-brand-availability-product`
	);
	let table_name = $state('Shelf Share');

	// Endpoint States
	let tableEndpoint = $state('');
	let searchEndpoint = $state('');
	let summerizeEndpoint = $state('');
	let exportEndpoint = $state('');
	let deleteUrl = $state('');
	let submitUrl = $state('');

	let getItemEndpoint = $state('');
	let searchItemEndpoint = $state('');
	let formItemEndpoint = $state('');
	let getSingleEndpoint = $state('');

	let createSingleEndpoint = $state('');
	let updateSingleEndpoint = $state('');
	let deleteSingleEndpoint = $state('');

	let button_names = [];
	let button_callbacks = [];
	let point_of_sale_id = $state('');
	let point_of_sale_name = $state('');
	let point_of_sales = $state([]);

	let transactions = $state({});
	let full_data = $state({});
	let detailsOpen = $state(false);
	let detailsTitle = $state(false);
	let showList = $state(false);

	let tabulatedDetailsOpen = $state(false);
	let tabulatedDetailsTitle = $state('Shelf Share Information');
	let tabulatedTransactions = $state({});
	let tabulatedMyDialog = $state();

	onDestroy(() => {
		table_name = 'Shelf Share';
		tableEndpoint = shelfShareHistoryEndpoint;
		searchEndpoint = shelfShareHistorySearchEndpoint;
		summerizeEndpoint = shelfShareSummeriizeEndpoint;
		exportEndpoint = shelfShareExportEndpoint;
		deleteUrl = shelfShareDeleteHistoryEndpoint;
		submitUrl = shelfShareSubmitHistoryEndpoint;

		getItemEndpoint = shelfShareTableEndpoint;
		searchItemEndpoint = shelfShareSearchEndpoint;
		formItemEndpoint = shelfShareFormEndpoint;
		getSingleEndpoint = shelfShareIDEndpoint;

		createSingleEndpoint = shelfShareSubmitEndpoint;
		updateSingleEndpoint = shelfShareUpdateEndpoint;
		deleteSingleEndpoint = shelfShareDeleteEndpoint;
		submitAll();
	});

	onMount(() => {
		table_name = 'Shelf Share';
		tableEndpoint = shelfShareHistoryEndpoint;
		searchEndpoint = shelfShareHistorySearchEndpoint;
		summerizeEndpoint = shelfShareSummeriizeEndpoint;
		exportEndpoint = shelfShareExportEndpoint;
		deleteUrl = shelfShareDeleteHistoryEndpoint;
		submitUrl = shelfShareSubmitHistoryEndpoint;

		getItemEndpoint = shelfShareTableEndpoint;
		searchItemEndpoint = shelfShareSearchEndpoint;
		formItemEndpoint = shelfShareFormEndpoint;
		getSingleEndpoint = shelfShareIDEndpoint;

		createSingleEndpoint = shelfShareSubmitEndpoint;
		updateSingleEndpoint = shelfShareUpdateEndpoint;
		deleteSingleEndpoint = shelfShareDeleteEndpoint;

		console.log('searchEndpoint = ' + searchEndpoint);
	});

	function handleMarkerClicked(body) {
		point_of_sale_id = body['id'];
		point_of_sale_name = body['name'];
		if (active_market_tab == 'Shelf Share')
			createSingleEndpoint = `${shelfShareSubmitEndpoint}/${point_of_sale_id}`;
		else createSingleEndpoint = `${brandAvailabilitySubmitEndpoint}/${point_of_sale_id}`;
		activeTab = 'Details';
	}

	async function submitAll() {
		if (territory_id != '' && route_id != '' && point_of_sale_id != '') {
			let response = await fetch(`${submitUrl}/${territory_id}/${route_id}/${point_of_sale_id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					from_offline: false
				})
			});
		}
	}

	async function rowClicked(row) {
		try {
			const data = await fetchTable(`${host}shelf-share/get-shelf-share-products-items/${row.id}`, token);
			if (data.succeed === true) {
				const detailsHtml = `
					<div class="flex flex-col justify-center p-4 bg-gray-50 dark:bg-gray-900 border border-gray-400 rounded-lg">
						<p class="text-sm text-gray-700 dark:text-gray-300">
							<span class="font-semibold">Outlet Name:</span>
							${row?.outlet_name ?? '-'}
						</p>

						<p class="text-xs text-gray-500 mt-1">
							${row?.date ?? ''}
						</p>

					</div>
				`;

				tabulatedDetailsTitle = detailsHtml;
				tabulatedTransactions = data.data != null ? data.data : 'None';
				tabulatedDetailsOpen = true;
				if (tabulatedMyDialog) {
					tabulatedMyDialog.showModal();
				}
				return data;
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function rowClickedBrandAvailability(row) {
		try {
			const data = await fetchTable(
				`${host}brand-availability/get-brand-availability/details/${row.id}`,
				token
			);
			if (data.succeed === true) {
				const detailsHtml = `
					<div class="flex flex-col justify-center p-4 bg-gray-50 dark:bg-gray-900 border border-gray-400 rounded-lg">
						<p class="text-sm text-gray-700 dark:text-gray-300">
							<span class="font-semibold">Outlet Name:</span>
							${row?.outlet_name ?? '-'}
						</p>

						<p class="text-xs text-gray-500 mt-1">
							${row?.date ?? ''}
						</p>

					</div>
				`;

				detailsTitle = detailsHtml;
				transactions = data.data != null ? data.data : 'None';
				full_data = data;
				showList = data.data != null ? false : true;
				detailsOpen = true;
			}
		} catch (error) {
			console.log(error);
		}
	}

	function toggle_market_tabs() {
		if (active_market_tab === 'Shelf Share') {
			activeTab = 'History';
			table_name = 'Shelf Share';
			tableEndpoint = shelfShareHistoryEndpoint;
			searchEndpoint = shelfShareHistorySearchEndpoint;
			summerizeEndpoint = shelfShareSummeriizeEndpoint;
			exportEndpoint = shelfShareExportEndpoint;
			deleteUrl = shelfShareDeleteHistoryEndpoint;
			submitUrl = shelfShareSubmitHistoryEndpoint;

			getItemEndpoint = shelfShareTableEndpoint;
			searchItemEndpoint = shelfShareSearchEndpoint;
			formItemEndpoint = shelfShareFormEndpoint;
			getSingleEndpoint = shelfShareIDEndpoint;

			createSingleEndpoint = shelfShareSubmitEndpoint;
			updateSingleEndpoint = shelfShareUpdateEndpoint;
			deleteSingleEndpoint = shelfShareDeleteEndpoint;

			row_clicked_callback = rowClicked;
			submitAll();
			refresh_table = !refresh_table;
		} else {
			activeTab = 'History';
			table_name = 'Shelf Share';
			tableEndpoint = brandAvailabilityHistoryEndpoint;
			searchEndpoint = brandAvailabilityHistorySearchEndpoint;
			summerizeEndpoint = brandAvailabilitySummeriizeEndpoint;
			exportEndpoint = brandAvailabilityExportEndpoint;
			deleteUrl = brandAvailabilityDeleteHistoryEndpoint;
			submitUrl = brandAvailabilitySubmitHistoryEndpoint;

			getItemEndpoint = brandAvailabilityTableEndpoint;
			searchItemEndpoint = brandAvailabilitySearchEndpoint;
			formItemEndpoint = brandAvailabilityFormEndpoint;
			getSingleEndpoint = brandAvailabilityIDEndpoint;

			createSingleEndpoint = brandAvailabilitySubmitEndpoint;
			updateSingleEndpoint = brandAvailabilityUpdateEndpoint;
			deleteSingleEndpoint = brandAvailabilityDeleteEndpoint;

			row_clicked_callback = rowClickedBrandAvailability;
			submitAll();
			refresh_table = !refresh_table;
		}
	}

	function fields_show(k, v, f) {
		// if (active_market_tab === 'Brand Availability') {
		// 	let brand_available_index = k.indexOf('brand_available');
		// 	let brand_available = v[brand_available_index];

		// 	if (brand_available != 'Yes' && (f == 'category' || f == 'product' || f == 'SKU' || f == 'quantity' || f == 'amount' || f == 'image')) {
		// 		return false;
		// 	}
		// 	return true;
		// }
		return true;
	}

	let searchQuery = $state('');

	// Filter point of sales by search query (case-insensitive)
	let filteredPoS = $derived(
		point_of_sales.filter((pos) => pos.name?.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<div>
	<Header />
	<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
		<div class="flex gap-2">
			{#each market_tabs as tab}
				<button
					type="button"
					onclick={() => {
						active_market_tab = tab;
						toggle_market_tabs();
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							text-gray-700 hover:bg-gray-100
							dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
							{active_market_tab === tab
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					{formatFieldNames(tab)}
				</button>
			{/each}
		</div>
	</div>

	<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
		<div class="flex gap-2">
			{#each tabs as tab}
				{#if (activeTab == 'History' && tab == 'History') || activeTab != 'History'}
					<button
						type="button"
						onclick={() => {
							activeTab = tab;
							submitAll();
						}}
						class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
            {activeTab === tab
							? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
							: 'bg-white'}"
					>
						{formatFieldNames(tab)}
					</button>
				{/if}
			{/each}
		</div>
	</div>

	{#if activeTab == 'History'}
		{#key refresh_table}
			<Table
				bind:get_table_endpoint={tableEndpoint}
				bind:search_endpoint={searchEndpoint}
				bind:summerize_endpoint={summerizeEndpoint}
				bind:get_export_endpoint={exportEndpoint}
				filter_endpoint={filterEndpoint}
				get_table_endpoint_by_id={undefined}
				get_form_endpoint={undefined}
				create_entry_url={null}
				update_entry_url={undefined}
				bind:delete_entry_url={deleteUrl}
				{token}
				{table_name}
				module="Trade Marketing"
				get_id_bool={false}
				row_clicked={row_clicked_callback}
				add_callback={() => {
					toggle_market_tabs();
					activeTab = 'Map';
				}}
			/>
		{/key}
		<dialog bind:this={tabulatedMyDialog}>
			{#if tabulatedDetailsOpen}
				<TabulatedDetails
					title={tabulatedDetailsTitle}
					dataMap={tabulatedTransactions}
					handleClose={() => {
						tabulatedDetailsOpen = false;
						tabulatedMyDialog?.close();
					}}
				/>
			{/if}
		</dialog>
		<Details
			isOpen={detailsOpen}
			title={detailsTitle}
			bind:data={transactions}
			handleClose={() => {
				detailsOpen = false;
			}}
			isRemark={showList}
			full_data={full_data}
		/>
	{:else if activeTab == 'Map'}
		<Map
			on:handleMarkerClicked={(event) => {
				handleMarkerClicked(event.detail);
			}}
			on:updatePointOfSales={(event) => {
				point_of_sales = event.detail;
			}}
			on:selected={(event) => {
				console.log(event.detail);
				territory_id = event.detail.territory;
				route_id = event.detail.route;
			}}
		/>
	{:else if activeTab == 'List'}
		<div class="flex flex-col items-center w-full">
			<div class="w-full max-w-lg mt-4">
				<input
					type="text"
					placeholder="Search Point of Sale..."
					bind:value={searchQuery}
					class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
							bg-white dark:bg-[#1f2937] text-gray-900 dark:text-gray-100
							placeholder-gray-400 focus:outline-none focus:ring-2
							focus:ring-[#2371ac] transition duration-150"
				/>
			</div>

			<div class="flex justify-center w-full overflow-y-auto mt-4">
				<table
					class="max-w-lg w-full divide-y divide-gray-200 dark:divide-gray-700
				   				text-sm text-left text-gray-700 dark:text-gray-300 m-4"
				>
					<thead
						class="bg-gray-200 dark:bg-[#326b92] text-xs text-gray-900 dark:text-gray-100 h-14"
					>
						<tr>
							<th scope="col" class="px-4 py-2">Point of Sale</th>
						</tr>
					</thead>

					<tbody>
						{#each filteredPoS as pos, i}
							<tr
								class={`bg-white dark:bg-[#22273c] hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200`}
							>
								<td class="px-4 py-2 border-b border-primary-500 dark:border-gray-600">
									<div class="flex justify-between items-center h-14 gap-4">
										<div
											class="flex items-center gap-4 cursor-pointer"
											onclick={() => {
												handleMarkerClicked({ id: pos.id, name: pos.name });
											}}
										>
											<div class="p-2 bg-[#e0effa] rounded-md">
												<svg
													fill="#286692"
													width="28px"
													height="28px"
													viewBox="0 0 20 20"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2 1.31 0 2.393-.764 2.552-1.75zM10 9c1.42 0 2.571-.896 2.571-2 0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875c-.002.041-.004.082-.004.125 0 1.104 1.151 2 2.571 2zm5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046zM18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9 17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5z"
													></path>
												</svg>
											</div>

											<div class="flex flex-col justify-center gap-y-1">
												<p class="text-md text-gray-900 dark:text-gray-100">{pos.name}</p>
												<p class="text-sm text-gray-600 dark:text-gray-300">{pos.landmark}</p>
											</div>
										</div>

										<div
											class="flex items-center gap-2 cursor-pointer"
											onclick={() =>
												window.open(
													`http://maps.google.com/maps?z=12&t=m&q=loc:${pos.location[0]},${pos.location[1]}`
												)}
										>
											<svg
												fill="#758CA3"
												width="16px"
												height="16px"
												viewBox="0 0 32 32"
												xmlns="http://www.w3.org/2000/svg"
												stroke="#758CA3"
											>
												<path
													d="M16.114-0.011c-6.559 0-12.114 5.587-12.114 12.204 0 6.93 6.439 14.017 10.77 18.998 0.017 0.020 0.717 0.797 1.579 0.797h0.076c0.863 0 1.558-0.777 1.575-0.797 4.064-4.672 10-12.377 10-18.998 0-6.618-4.333-12.204-11.886-12.204zM16.515 29.849c-0.035 0.035-0.086 0.074-0.131 0.107-0.046-0.032-0.096-0.072-0.133-0.107l-0.523-0.602c-4.106-4.71-9.729-11.161-9.729-17.055 0-5.532 4.632-10.205 10.114-10.205 6.829 0 9.886 5.125 9.886 10.205 0 4.474-3.192 10.416-9.485 17.657zM16.035 6.044c-3.313 0-6 2.686-6 6s2.687 6 6 6 6-2.687 6-6-2.686-6-6-6zM16.035 16.044c-2.206 0-4.046-1.838-4.046-4.044s1.794-4 4-4c2.207 0 4 1.794 4 4 0.001 2.206-1.747 4.044-3.954 4.044z"
												></path>
											</svg>
											<span class="text-sm font-normal">View Location</span>
										</div>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else if point_of_sale_name}
		<p
			class="ml-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]"
		>
			{point_of_sale_name}
		</p>
		<Table
			get_table_endpoint={getItemEndpoint + '/' + point_of_sale_id}
			bind:search_endpoint={searchItemEndpoint}
			bind:get_form_endpoint={formItemEndpoint}
			bind:get_table_endpoint_by_id={getSingleEndpoint}
			bind:create_entry_url={createSingleEndpoint}
			bind:update_entry_url={updateSingleEndpoint}
			bind:delete_entry_url={deleteSingleEndpoint}
			{token}
			{table_name}
			module="Trade Marketing"
			get_id_bool={true}
			fields_show={fields_show}
		/>
	{:else}
		<p
			class="ml-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]"
		>
			Please select a marketing location
		</p>
	{/if}
</div>
