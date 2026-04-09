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

	const tabs = ['History', 'Map', 'List', 'Details'];
	let activeTab = $state('History');
	let token = getAccessToken();

	const tableHistoryEndpoint = `${host}complaint/get-complaints`;
	const searchHistoryEndpoint = `${host}complaint/search`;
	const formHistoryEndpoint = `${host}complaint/complaints-form`;
	const summerizeEndpoint = $state(`${host}complaint/get-complaint/summary`);
	const exportEndpoint = `${host}complaint/export-complaints`;
	const filterEndpoint = `${host}complaint/all-filters`;

	const tableEndpoint = `${host}complaint/get-complaint-items`;
	const searchEndpoint = `${host}complaint/search-complaint-items`;
	const formEndpoint = `${host}complaint/complaint-items-form`;
	const table_id_data = `${host}complaint/get-complaint-item/`;

	let submitUrl = $state(`${host}complaint/create-complaint-item`);
	const updateUrl = `${host}complaint/update-complaint-item`;
	const deleteUrl = `${host}complaint/delete-complaint-item`;
	const table_name = 'Complaints';

	let button_names = [];
	let button_callbacks = [];
	let myDialog = $state();
	let point_of_sale_id = $state('');
	let point_of_sale_name = $state('');
	let point_of_sales = $state([]);

	let territory_id = $state('');
	let route_id = $state('');

	let transactions = $state({});
	let detailsOpen = $state(false);
	let showList = $state(false);
	let detailsTitle = $state('Complaints Items');
	let detailsEndpointById = $state('');

	function handleMarkerClicked(body) {
		point_of_sale_id = body['id'];
		point_of_sale_name = body['name'];
		submitUrl = `${host}complaint/create-complaint-item/${point_of_sale_id}`;
		activeTab = 'Details';
	}

	async function submitAll() {
		// if (territory_id != '' && route_id != '' && point_of_sale_id != '') {
		if (point_of_sale_id != '') {
			let response = await fetch(`${host}complaint/create-complaint-link/${point_of_sale_id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					'from_offline': false
				})
			});
		}
	}

	onDestroy(() => {
		submitAll();
	});

	async function rowClicked(row) {
		console.log('Clicked ' + row?.id);
		console.log(`${host}get-items-by-complaint/${row.id}`);
		try {
			const data = await fetchTable(`${host}complaint/get-items-by-complaint/${row.id}`, token);
			if (data.succeed === true) {
				transactions = data.data != null ? data.data : 'None';
				showList = data.data != null ? false : true;
				detailsOpen = true;
				if (myDialog) {
					myDialog.showModal();
				}
			}
		} catch (error) {
			console.log(error);
		}
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
		<Table
			get_table_endpoint={tableHistoryEndpoint}
			search_endpoint={searchHistoryEndpoint}
			get_export_endpoint={exportEndpoint}
			summerize_endpoint={summerizeEndpoint}
			filter_endpoint={filterEndpoint}
			get_table_endpoint_by_id={null}
			get_form_endpoint={null}
			create_entry_url={null}
			update_entry_url={undefined}
			delete_entry_url={undefined}
			{token}
			{table_name}
			module="Trade Marketing"
			get_id_bool={false}
			add_callback={() => {
				activeTab = 'Map';
			}}
			row_clicked={rowClicked}
		/>
		<dialog bind:this={myDialog}>
			<Details
				isOpen={true}
				title={detailsTitle}
				bind:data={transactions}
				handleClose={() => {
					detailsOpen = false;
					myDialog.close();
				}}
				isRemark={showList}
			/>
		</dialog>
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
					class="max-w-lg w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left text-gray-700 dark:text-gray-300 m-4"
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
			get_table_endpoint={tableEndpoint + '/' + point_of_sale_id}
			search_endpoint={searchEndpoint}
			get_form_endpoint={formEndpoint}
			create_entry_url={submitUrl}
			get_table_endpoint_by_id={table_id_data}
			update_entry_url={updateUrl}
			delete_entry_url={deleteUrl}
			{token}
			{table_name}
			module="Trade Marketing"
			get_id_bool={true}
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
